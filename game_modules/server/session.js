var zlib = require('zlib');
var zz = require('./zz');
var shortid = require('shortid');
var recursivedir = require('recursive-readdir');
var path = require('path');
var async = require('async');

var server = {};//server modules

function loadmodules(pth){
    recursivedir(pth, [
        function(file, stats) {
            if (stats.isDirectory()){
                return false;
            }

            return (path.extname(file) !== '.js');
        }
    ], function(err, files){
        files.sort();

        files.forEach(function(file){
            require(file)(server);
        });
    });
}

loadmodules( path.join(__dirname, 'core') );
loadmodules( path.join(__dirname, 'modules') );

module.exports = function(io, sql){
    var Session = zz.data.extend({
        timeS: 1800000, //time save project
        timeW: 60000, //time close after player leave
        emit: function(name, msg){
            this.sockets.forEach(function(socket){
                socket.emit(name, msg);
            }, this);
        },
        initSession: function(items, callback){
            var chunk = 300;
            
            var i=0, len = items.length;
            
            this.emit('session-progress', {progress: 0});
            
            var compfn = function(){
                items.forEach(function(it){
                    if (it.item){
                        this.watcher.lazyLoadInit(
                            it.item,
                            it.json,
                            'sql'
                        );
                    }
                }, this);

                this.emit('session-progress', {progress: 100});

                if (callback){
                    callback(null);
                }
            }.bind(this);
            
            var timefn = function(){
                items.slice(i,i+chunk).forEach(function(it){
                    var item = this.watcher.create( it.name );

                    if (item){
                        this.watcher.lazyLoadSync(
                            it.id,
                            item,
                            'sql'
                        );

                        it.item = item;
                    }
                }, this);

                this.emit('session-progress', {progress: Math.round(i*100/len)});
                i += chunk;

                if (i < len){
                    setTimeout(timefn, 0);
                }else{
                    i = 0;
                    compfn(null);
                }
            }.bind(this);
            
            timefn();
        },
        setupSession: function(cback){
            if (this.storeTimer){
                clearInterval(this.storeTimer);
            }

            this.storeTimer = setInterval(function(){
                this.storeSession();
            }.bind(this), this.timeS);

            this.watcher.waitItem('Session', function(session){
                session.on('log', function(ev){
                    sql.query('INSERT INTO `session_logs` (`project_id`, `session_hashid`, `type`, `data`) VALUES (?, ?, ?, ?)', [session.get('projectId'), this.id, ev.type, JSON.stringify(ev.log)]);
                }.bind(this));

                session.on('share', function(ev){
                    if (!session.isTest()){
                        sql.query('INSERT INTO `session_waitplayers` (`id`, `project_id`, `name`, `info`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = ?, `info` = ?', [this.id, session.get('projectId'), session.get('name'), session.get('info'), session.get('name'), session.get('info')]);
                    }
                }.bind(this));

                session.on('unshare', function(ev){
                    if (!session.isTest()){
                        sql.query('DELETE FROM `session_waitplayers` where `id` = ?', [this.id]);
                    }
                }.bind(this));

                session.on('close', function(){
                    this.closeSession();
                }.bind(this));

                session.on('store-close', function(){
                    this.storeSession(function(){
                        this.closeSession();
                    }.bind(this));
                }.bind(this));

                session.on('end-session', function(){
                    if (!session.isTest()){
                        sql.query('DELETE FROM `session_waitplayers` where `id` = ?', [this.id]);
                        sql.query('DELETE FROM `users_session` where `session_id` = ?', [this.id]);
                    }
                }.bind(this));

                this.watcher.waitItem('AllPlayers', function(players){
                    players.on('new-player-session', function(ev){
                        if (!session.isTest()){
                            sql.query('INSERT INTO `users_session` (`session_id`, `project_id`, `user_id`) VALUES (?, ?, ?)', [this.id, session.get('projectId'), ev.player.get('userid')]);
                        }
                    }.bind(this));

                    players.on('remove-player-session', function(ev){
                        if (!session.isTest()){
                            sql.query('DELETE FROM `users_session` where `session_id` = ? AND `user_id` = ?', [this.id, ev.player.get('userid')]);
                        }
                    }.bind(this));

                    cback(null, session);
                }.bind(this));
            }.bind(this));
        },
        loadProject: function(projectId, cback){
            async.waterfall([
                function(callback){
                    sql.query('SELECT `id`, `name`, `image`, `info`, `modules`, `version`, `author_id`, `authors`, `hashid`, `hashlink`, `hashurl`, `genre`, `location`, `gametype`, `difficulty`, `lengthinfo`, `release_id` FROM `projects` WHERE `id` = ? AND `type` in ("open", "shared", "editing") LIMIT 1', projectId, callback);
                },
                function(rows, fields, callback){
                    if (rows.length === 1){
                        sql.query('SELECT `object_id` as `id`, `object_name` as `name`, `object_json` as `json` FROM `project_objects` WHERE `project_id` = ?', projectId, function(e,a,b){
                            callback(e, a, b, rows[0]);
                        });
                    }else{
                        if (cback){
                            cback('No Project');
                        }
                    }
                },
                function(rows, fields, project, callback) {
                    if (rows.length === 0){
                        if (cback){
                            cback('No Project');
                            return;
                        }
                    }

                    var items = [{
                        id: 'project',
                        name: 'Project',
                        json: project
                    }];

                    for (var i in rows) {
                        items.push({
                            id: rows[i].id,
                            name: rows[i].name,
                            json: JSON.parse(rows[i].json)
                        });
                    }

                    this.initSession(items, function(){
                        if (cback){
                            cback(null, project);
                        }
                    });
                }.bind(this)
            ], cback);
        },
        loadSession: function(id, cback){
            this.id = id;
            console.log('load session', id);
            
            sql.query('SELECT `json`, `id` FROM `session_store` WHERE `session_id` = ? ORDER BY `id` DESC LIMIT 1', id, function(err, rows, fields) {
                if (rows[0]){
                    console.log('unzip');
                    
                    try{
                        rows[0].json = zlib.inflateSync(rows[0].json);
                    }catch(e){
                        console.log('Is not zipped:', e.message);
                    }
                    
                    console.log('loaded', rows[0].id);
                    var items = JSON.parse(rows[0].json);

                    this.initSession(items, function(){
                        this.setupSession(function(err){
                            if (cback){
                                cback(err);
                            }
                        });
                        
                        this.complete = true;
                        this.callEventListener('load');
                    }.bind(this));
                }else{
                    console.log('no session', id);
                    this.emit('session-alert', {
                        header: 'Ошибка',
                        message: 'Сессии '+id+' не существует',
                        close: 'Закрыть',
                        color: 'red'
                    });
                    
                    sql.query('DELETE FROM `session_waitplayers` where `id` = ?', [id]);
                    sql.query('DELETE FROM `users_session` where `session_id` = ?', [id]);
                    
                    cback("No Session");
                    return;
                }
            }.bind(this));
        },
        createNewSession: function(projectId, isTest, callback){
            this.id = shortid.generate();
            var id = this.id;
            this.watcher.id = id;
            console.log('create new session', id);
            
            this.loadProject(projectId, function(err, project){
                if (err === null){
                    this.setupSession(function(err, session){
                        session.set({
                            id: id,
                            isTest: isTest,
                            projectId: project.hashid,
                            authorId: project.author_id
                        });

                        session.afterSync(function(){
                            setTimeout(session.start.bind(session), 0);
                        });
                    }.bind(this));

                    if (callback){
                        callback(null, this);
                    }
                    
                    this.complete = true;
                    this.callEventListener('load');
                }else{
                    if (callback){
                        callback(err);
                    }
                }
            }.bind(this));
        },
        storeSession: function(callback){
            if (!this.complete){
                if (callback){
                    callback('no Session');
                }
                return;
            }
            
            var watcher = this.watcher;
            
            if (watcher.getItem('project')){
                var items = watcher.serialize();
                var id = this.id;
                var prjId = watcher.getItem('project').getRealId();

                console.log('store session', id);

                var buf = JSON.stringify(items);
                
                buf = zlib.deflateSync(buf);

                sql.query('INSERT INTO `session_store` (`session_id`, `project_id`, `json`, `create_date`) VALUES (?, ?, ?, NOW())', [id, prjId, buf], function(err, rows, fields) {
                    console.log('store complete', id);
                    if (callback){
                        callback(err);
                    }
                }.bind(this));
            }
        },
        closeSession: function(){
            if (this.storeTimer){
                clearInterval(this.storeTimer);
                delete this.storeTimer;
            }

            if (this.closeTimer){
                clearTimeout(this.closeTimer);
                delete this.closeTimer;
            }

            this.watcher.removeAllItems();
            
            this.sockets.forEach(function(socket){
                socket.disconnect();
            });
            this.sockets = [];
            
            this.callEventListener('close', {session: this, id: this.id});
        },
        disconnect: function(socket){
            var k = this.sockets.indexOf(socket);
            if (k !== -1){
                this.sockets.splice(k, 1);
            }
            
            if (this.complete){
                console.log('players', this.sockets.length, this.id);
                
                if (this.sockets.length === 0){
                    console.log(Math.round(this.timeW/1000)+' sec to close session', this.id);
                    if (this.closeTimer){
                        clearTimeout(this.closeTimer);
                    }

                    this.closeTimer = setTimeout(function(){
                        console.log('close session');
                        if (this.watcher.getItem('Session')){
                            this.watcher.getItem('Session').close();
                        }else{
                            this.closeSession();
                        }
                    }.bind(this), this.timeW);
                }
            }
        },
        onLoad: function(socket, callback){
            if (this.closeTimer){
                clearTimeout(this.closeTimer);
                delete this.closeTimer;
            }
            
            socket.on('disconnect', function(){
                this.disconnect(socket);
            }.bind(this));
            
            this.sockets.push(socket);
            console.log('players', this.sockets.length, this.id);
                
            if (this.complete){
                callback(null, this);
            }else{
                this.on('load', function(){
                    callback(null, this);
                }.bind(this));
            }
        },        
        initialize: function(){
            zz.data.prototype.initialize.apply(this, arguments);

            this.watcher = new server.WatchersCollection;
            this.id = null;
            this.complete = false;
            this.closeTimer = null;
            this.storeTimer = null;
            this.sockets = [];
        }        
    });
    
    var sessions = zz.data.extend({
        startUpdateProject: function(id){
            if (!this.updatingPrj[id]){
                this.updatingPrj[id] = [];
            }
        },
        endUpdateProject: function(id){
            if (this.updatingPrj[id]){
                this.updatingPrj[id].forEach(function(fn){
                    fn();
                });
                
                delete this.updatingPrj[id];
            }
        },
        updateProjectTest:function(id, fn){
            if (this.updatingPrj[id]){
                this.updatingPrj[id].push(fn);
            }else{
                fn();
            }
        },
        closePrjSessions: function(pid, callback){
            var sess = [];
            for (var id in this.sessions){
                if (this.sessions[id].watcher.getItem('project').getRealId() === pid){
                    sess.push(this.sessions[id]);
                }
            }
            
            async.map(sess, function(sess, cb){
                sess.storeSession(function(){
                    sess.closeSession();
                    cb(null);
                });
            }.bind(this), function(err){
                callback(null);
            });
        },
        createNewSession: function(projectId, isTest, callback){
            this.updateProjectTest(projectId, function(){
                var sess = new Session;
                console.log('create session');
                
                sess.createNewSession(projectId, isTest);
                this.sessions[sess.id] = sess;
                sess.on('close', function(){
                    delete this.sessions[sess.id];
                }.bind(this));
                
                callback(null, sess);
            }.bind(this));
        },
        removeAllSessions: function(prjId){
            sql.query('DELETE FROM `session_store` WHERE `project_id` = ?', [prjId], function(err, rows, fields) {
                console.log('remove all sessions complete');
                if (callback){
                    callback(err);
                }
            }.bind(this));
        },
        openSession: function(id, socket){
            if (!this.sessions[id]){
                var sess = this.sessions[id] = new Session;
                sess.on('close', function(){
                    delete this.sessions[id];
                }.bind(this));
                
                console.log('open session', id);

                //project test
                sql.query('SELECT `project_id` as `pid`, `id` FROM `session_store` WHERE `session_id` = ? ORDER BY `id` DESC LIMIT 1', id, function(err, rows, fields){
                    if (rows[0]){
                        this.updateProjectTest(rows[0].pid, function(){
                            sess.loadSession(id);
                        }.bind(this));
                    }else{
                        console.log('no session', id);
                        socket.emit('session-alert', {
                            header: 'Ошибка',
                            message: 'Сессии '+id+' не существует',
                            close: 'Закрыть',
                            color: 'red'
                        });
                        
                        sql.query('DELETE FROM `session_waitplayers` where `id` = ?', [id]);
                        sql.query('DELETE FROM `users_session` where `session_id` = ?', [id]);
                    
                        this.sessions[id].closeSession();
                    }
                }.bind(this));
            }
                
            var sess = this.sessions[id];
            
            sess.onLoad(socket, function(err, sess){
                if (err === null){
                    var user = socket.authorization;
                    if (user){
                        console.log('connected user'+user.get('id'));

                        sess.watcher.waitItem('AllPlayers', function(allpl){
                            setTimeout(function(){
                                allpl.connectPlayer(user, socket);
                            }.bind(this), 0);
                        });
                    }
                }
            });
        },
        initialize: function(){
            zz.data.prototype.initialize.apply(this, arguments);
            
            this.sessions = {};
            this.updatingPrj = {};
            
            io.on('connection', function(socket){
                socket.on('js-error', function(msg){
                    console.error(msg.error);
                });
                
                socket.on('error', function(msg){
                    console.error(msg);
                });
                
                socket.on('session_init', function(msg){
                    if (socket.authorization){
                        this.openSession(msg.id, socket);
                    }
                }.bind(this));
            }.bind(this));
        },
        exitHandler: function(options, err) {
            if (err){ 
                console.error(err);
            }

            if (options.cleanup){
                console.log('exit');
            }
            
            if (options.exit){
                console.log('cleanup');
                console.error('server closed (need restart)');

                var keys = Object.keys(this.sessions);
                if (keys.length > 0){
                    async.map(keys, function(id, callback){
                        console.log('save and close session', id);
                        this.sessions[id].storeSession(function(err){
                            this.sessions[id].closeSession();
                            callback(err);
                        }.bind(this));
                    }.bind(this), function(err){
                        if (err){ 
                            console.error(err);
                        }

                        process.exit();
                    });
                }else{
                    process.exit();
                }
            }
        }
    });
    
    var se = new sessions;
    
    process.stdin.resume();//so the program will not close instantly

    //do something when app is closing
    process.on('exit', se.exitHandler.bind(se,{cleanup:true}));

    //catches ctrl+c event
    process.on('SIGINT', se.exitHandler.bind(se, {exit:true}));

    //catches uncaught exceptions
    process.on('uncaughtException', se.exitHandler.bind(se, {exit:true}));    

    return se;
};
