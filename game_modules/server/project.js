var zz = require('./zz');
var async = require('async');
var shortid = require('shortid');

module.exports = function (io, sql, sessions){
    var projectClass = zz.data.extend({
        emit: function(name, msg, ignoreSocket){
            this.usersSockets.forEach(function(socket){
                if (ignoreSocket !== socket){
                    socket.emit(name, msg);
                }
            }, this);
        },
        connect: function(socket){
            console.log('connect to project');
            
            this.usersSockets.add([socket]);
            
            socket.on('disconnect', function(){
                console.log('disconnect');
                this.usersSockets.remove(socket);
                
                if (this.usersSockets.count() === 0){
                    this.projectList.delete(this.id);
                    this.items = {};
                }
            }.bind(this));

            socket.on('project_release', function(msg){
                var user = socket.authorization;
                if (user){
                    removeLeaks();
                    
                    if (this.on_release){
                        return;
                    }
                    this.on_release = true;
                    
                    var old_id = this.release_id;
                    if (msg.shared === 'merge'){
                        var p = this.project;
                        var prj0 = null;
                        var prjd = [];//del
                        var prjn = [];//new
                        var prjcn = [];//change new / set
                        var prjcd = [];//change delete
                        async.waterfall([
                            function(callback) {
                                console.log('merge 1');
                                sql.query('SELECT `type` FROM `projects` WHERE `id`=?', [this.release_id], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                if (rows[0]){
                                    msg.shared = rows[0].type;
                                    callback(null);
                                }else{
                                    callback(new Error('Project unreleased'));
                                }
                            }.bind(this),
                            function(callback) {
                                console.log('merge 2');
                                sql.query('UPDATE `projects` SET `type` = "old" WHERE `id`=?', [this.release_id]);
                                
                                var type = 'open';
                                switch (msg.shared){
                                    case 'open': type = 'open';break;
                                    case 'shared': type = 'shared';break;
                                    case 'private': type = 'private';break;
                                    default: callback(new Error('wrong type'));
                                        return;
                                }

                                sql.query('INSERT INTO `projects` \n\
                                    (`name`, `image`, `info`, `modules`, `version`, `author_id`, `type`, `authors`, `genre`, `location`, `lat`, `lng`, `gametype`, `difficulty`, `lengthinfo`, `hashid`, `hashlink`, `hashurl`, `release_id`, `create_date`, `release_date`, `trash`) \n\
                                    VALUES \n\
                                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW(), 0)', 
                                [p.name, p.image, p.info, p.modules, msg.version, user.get('id'), type, p.authors, p.genre, p.location, p.lat, p.lng, p.gametype, p.difficulty, p.lengthinfo, p.hashid, p.hashlink, p.hashurl], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                console.log('merge 3');
                                sql.query('SELECT LAST_INSERT_ID() as `id`', callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                console.log('merge 4');
                                this.release_id = rows[0].id;

                                sql.query('UPDATE `projects` SET `release_id` = ?, `version` = ?, `release_date` = NOW() WHERE `id`=?', [this.release_id, msg.version, this.id]);

                                sql.query('INSERT INTO `project_objects` (`project_id`, `object_id`, `object_name`, `object_json`) \n\
                                    SELECT ?, `object_id`, `object_name`, `object_json` FROM `project_objects` WHERE `project_id` = ?', 
                                [this.release_id, this.id], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                console.log('merge 5');
                                //get projects diff
                                sql.query('SELECT `object_id` as `id`, `object_name` as `name`, `object_json` as `json` FROM `project_objects` WHERE `project_id` = ?', [old_id], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                console.log('merge 6');
                                //old project
                                prj0 = {};
                                for (var i in rows){
                                    prj0[rows[i].id] = rows[i];
                                }

                                sql.query('SELECT `object_id` as `id`, `object_name` as `name`, `object_json` as `json` FROM `project_objects` WHERE `project_id` = ?', [this.id], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                console.log('merge 7');
                                var prj1 = {};
                                for (var i in rows){
                                    prj1[rows[i].id] = rows[i];
                                }
                                //new project
                                prjn = [];
                                for (var i in prj1){
                                    if (prj0[i] === undefined){
                                        //create new
                                        prjn.push(prj1[i]);
                                    }else if (prj0[i].json !== prj1[i].json){
                                        //change item
                                        var p0js = JSON.parse(prj0[i].json);
                                        var p1js = JSON.parse(prj1[i].json);
                                        for (var v in p1js){
                                            if (p0js[v] === undefined){
                                                //new vars
                                                prjcn.push({
                                                    id: prj1[i].id,
                                                    name: v,
                                                    val: p1js[v]
                                                });
                                            }else if (JSON.stringify(p0js[v]) !== JSON.stringify(p1js[v])){
                                                //change var
                                                prjcn.push({
                                                    id: prj1[i].id,
                                                    name: v,
                                                    val: p1js[v]
                                                });
                                            }
                                        }
                                        for (var v in p0js){
                                            if (p1js[v] === undefined){
                                                //remove var
                                                prjcd.push({
                                                    id: prj1[i].id,
                                                    name: v
                                                });
                                            }
                                        }
                                    }
                                }
                                for (var i in prj0){
                                    if (prj1[i] === undefined){
                                        //remove
                                        prjd.push(prj0[i]);
                                    }
                                }
                                
                                //dont forget `project` real `id` change
                                prjcn.push({
                                    id: 'project',
                                    name: 'id',
                                    val: this.release_id
                                });
                                
                                console.log('create');
                                console.log(prjn);
                                console.log('delete');
                                console.log(prjd);
                                console.log('change set');
                                console.log(prjcn);
                                console.log('change delete');
                                console.log(prjcd);
                                
                                //save and close sessions
                                sessions.startUpdateProject(old_id);
                                //wait while closed
                                sessions.closePrjSessions(old_id, callback);
                            }.bind(this),
                            function(callback) {
                                console.log('merge 8');
                                //sql load id`s of project sessions
                                sql.query('SELECT max(`id`) as `id` FROM `session_store` WHERE `project_id` = ? AND `create_date` > NOW() - INTERVAL 2 WEEK GROUP BY `session_id`', [old_id], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                console.log('merge 9');
                                //update all selected sessions
                                var map = [];
                                for (var i in rows){
                                    map.push(rows[i].id);
                                }
                                
                                async.map(map, function(id, cb){
                                    async.waterfall([function(callback){
                                        console.log('merge session', id);
                                        sql.query('SELECT `json`, `session_id` FROM `session_store` WHERE `id` = ? LIMIT 1', [id], callback);
                                    },
                                    function(rows, fields, callback){
                                        if (rows[0]){
                                            var json = JSON.parse(rows[0].json);
                                            var obj = {};
                                            json.forEach(function(item){
                                                obj[item.id] = item;
                                            });
                                            
                                            json = [];
                                            
                                            console.log('change');
                                            //create
                                            prjn.forEach(function(item){
                                                item.json = JSON.parse(item.json);
                                                obj[item.id] = item;
                                            });                                            
                                            
                                            //delete
                                            prjd.forEach(function(item){
                                                delete obj[item.id];
                                            });                                            
                                            
                                            //new
                                            prjcn.forEach(function(item){
                                                obj[item.id].json[item.name] = item.val;
                                            });                                            
                                            //delete
                                            prjcd.forEach(function(item){
                                                delete obj[item.id].json[item.name];
                                            });                                            
                                            
                                            console.log('store', rows[0].session_id);
                                            
                                            for (var i in obj){
                                                json.push(obj[i]);
                                            }
                                            
                                            sql.query('INSERT INTO `session_store` (`session_id`, `project_id`, `json`, `create_date`) VALUES (?, ?, ?, NOW() + INTERVAL 1 SECOND)', [rows[0].session_id, this.release_id, JSON.stringify(json)], cb);
                                        }
                                    }.bind(this)], cb);
                                }.bind(this), callback);
                            }.bind(this),
                            function(results, callback) {
                                sessions.endUpdateProject(old_id);
                                
                                socket.emit('project_release', {complete: true, id: this.release_id});
                            }.bind(this)
                        ], function(err){
                            console.error(err);
                        });                        
                    }else{
                        sql.query('UPDATE `projects` SET `type` = "old" WHERE `id`=?', [this.release_id]);

                        var p = this.project;
                        async.waterfall([
                            function(callback) {
                                var type = 'open';
                                switch (msg.shared){
                                    case 'open': type = 'open';break;
                                    case 'shared': type = 'shared';break;
                                    case 'private': type = 'private';break;
                                    default: callback(new Error('wrong type'));
                                        return;
                                }

                                sql.query('INSERT INTO `projects` \n\
                                    (`name`, `image`, `info`, `modules`, `version`, `author_id`, `type`, `authors`, `genre`, `location`, `lat`, `lng`, `gametype`, `difficulty`, `lengthinfo`, `hashid`, `hashlink`, `hashurl`, `release_id`, `create_date`, `release_date`, `trash`) \n\
                                    VALUES \n\
                                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW(), 0)', 
                                [p.name, p.image, p.info, p.modules, msg.version, user.get('id'), type, p.authors, p.genre, p.location, p.lat, p.lng, p.gametype, p.difficulty, p.lengthinfo, p.hashid, p.hashlink, p.hashurl], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                sql.query('SELECT LAST_INSERT_ID() as `id`', callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                this.release_id = rows[0].id;

                                sql.query('UPDATE `projects` SET `release_id` = ?, `version` = ?, `release_date` = NOW() WHERE `id`=?', [this.release_id, msg.version, this.id]);

                                sql.query('INSERT INTO `project_objects` (`project_id`, `object_id`, `object_name`, `object_json`) \n\
                                    SELECT ?, `object_id`, `object_name`, `object_json` FROM `project_objects` WHERE `project_id` = ?', 
                                [this.release_id, this.id], callback);
                            }.bind(this),
                            function(rows, fields, callback) {
                                socket.emit('project_release', {complete: true, id: this.release_id});
                            }.bind(this)
                        ], function(err){
                            console.error(err);
                        });                        
                    }
                    this.on_release = false;
                }
            }.bind(this));

            socket.on('project_save', function(msg){
                var json = JSON.stringify(msg.json);
                if (msg.id === 'project'){
                    if (json !== this.project.json && msg.time > this.project.time){
                        console.log('update', msg.id, json, msg.time);
                        
                        var prj = msg.json;
                        this.project.json = json;
                        this.project.time = msg.time;
                        sql.query('UPDATE `projects` SET `name` = ?, `image` = ?, `modules` = ?, `info` = ?, `authors` = ?, `genre` = ?, `location` = ?, `lat` = ?, `lng` = ?, `gametype` = ?, `difficulty` = ?, `lengthinfo` = ? WHERE `id`=?', 
                        [prj.name, prj.image, prj.modules, prj.info, prj.authors, prj.genre, prj.location, prj.lat, prj.lng, prj.gametype, prj.difficulty, prj.lengthinfo, this.id]);

                        ['name', 'image', 'info', 'modules', 'authors', 'genre', 'location', 'lat', 'lng', 'gametype', 'difficulty', 'lengthinfo'].forEach(function(index){
                            this.project[index] = prj[index];
                        }, this);

                        this.emit('project_load', [msg], socket);
                        return;
                    }
                }else{
                    if (this.items[msg.id]){
                        if (!this.items[msg.id].removed && this.items[msg.id].json !== json && this.items[msg.id].time < msg.time){
                            console.log('update', msg.id, json, msg.time);

                            sql.query('UPDATE `project_objects` SET `object_json` = ? WHERE `project_id`=? AND `object_id`=?', [json, this.id, msg.id]);

                            this.items[msg.id].json = json;
                            this.items[msg.id].attrs = msg.json;
                            this.items[msg.id].time = msg.time;

                            this.emit('project_load', [msg], socket);
                        }
                    }else{
                        console.log('create', msg.id, json);

                        sql.query('INSERT INTO `project_objects` (`project_id`, `object_id`, `object_name`, `object_json`) VALUES (?, ?, ?, ?)', [this.id, msg.id, msg.name, json]);

                        this.items[msg.id] = {
                            id: msg.id,
                            name: msg.name,
                            json: json,
                            attrs: msg.json,
                            removed: false,
                            time: 0
                        };

                        this.emit('project_load', [msg], socket);
                    }
                }
            }.bind(this));

            socket.on('project_removed', function(msg){
                var user = socket.authorization;
                if (user){
                    async.waterfall([
                        function(callback) {
                            user.testPassword(msg.password, callback);
                        }.bind(this),
                        function(test, callback) {
                            if (test){
                                console.log('password true')
                                callback(null);
                            }else{
                                socket.emit('project_removed', {complete: false, msg: 'Wrong password'});
                            }
                        }.bind(this),
/*                        function(callback) {
                            console.log('close all sessions release');
                            sessions.closePrjSessions(this.release_id, callback);
                        }.bind(this),
                        function(callback) {
                            console.log('remove all sessions release');
                            sessions.removeAllSessions(this.release_id);
                            
                        }.bind(this),
                        function(callback) {
                            console.log('close all sessions');
                            sessions.closePrjSessions(this.id, callback);
                        }.bind(this),
                        function(callback) {
                            console.log('remove all sessions');
                            sessions.removeAllSessions(this.id, callback);
                        }.bind(this),*/
                        function(callback) {
                            console.log('trash project');
                            sql.query('UPDATE `projects` SET `type` = "trash" WHERE `id` = ?', [this.id]);
                            if (this.release_id){
                                sql.query('UPDATE `projects` SET `type` = "trash" WHERE `id` = ?', [this.release_id]);
                            }
                            
                            socket.emit('project_removed', {complete: true, id: this.id});
                        }.bind(this)
                    ], function(err){
                        console.error(err);
                    });
                }
            }.bind(this));

            /*socket.on('project_create', function(msg){
                if (!this.items[msg.id]){
                    var json = JSON.stringify(msg.json);
                    
                    sql.query('INSERT INTO `project_objects` (`project_id`, `object_id`, `object_name`, `object_json`) VALUES (?, ?, ?, ?)', [this.id, msg.id, msg.name, json]);

                    this.emit('project_load', [msg], socket);
                    
                    this.items[msg.id] = {
                        id: msg.id,
                        name: msg.name,
                        json: json,
                        attrs: msg.json
                    };
                }
            }.bind(this));*/

            var usedItems = {};
            var testDeletedAttrs = function(attrs, i){
                if (attrs[i] instanceof Array){
                    for (var index = attrs[i].length-1;index>=0;index--){
                        testDeletedAttrs(attrs[i], index);
                    };
                }

                if (attrs[i] && typeof attrs[i] === 'object' && attrs[i].type && attrs[i].type === 'rel' && attrs[i].id){
                    testDeletedLoop(attrs[i].id);
                }
            }.bind(this);
            
            var testDeletedLoop = function(id){
                if (!usedItems[id]){
                    usedItems[id] = true;
                    if (this.items[id] && !this.items[id].removed){
                        for (var i in this.items[id].attrs){
                            testDeletedAttrs(this.items[id].attrs, i);
                        }
                    }
                }
            }.bind(this);
            
            var removeLeaks = function(){
                usedItems = {};

                if (this.items['root']){
                    testDeletedLoop('root');
                }/*else{
                    for(var id in this.items){
                        if (!(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id))){
                            //if global item
                            testDeletedLoop(id);
                        }
                    }
                }*/

                for (var id in this.items){
                    if (!this.items[id].removed && !usedItems[id]){
                        deleteItem(id);
                    }
                }
            }.bind(this);
            
            var deleteItem = function(id, sock){
                if (this.items[id]){
                    console.log('delete', id);
                        
                    sql.query('DELETE FROM `project_objects` WHERE `project_id` = ? AND `object_id` = ?', [this.id, id]);

                    this.emit('project_delete', id, sock);
                    
                    this.items[id].removed = true;
                }
            }.bind(this);

            socket.on('project_delete', function(id){
                deleteItem(id, socket);
                removeLeaks();
            });
            
            if (this.project_ready){
                var send = [{id: 'project', name: 'Project', json: this.project, time: this.project.time}];
                for (var i in this.items) {
                    if (!this.items[i].removed){
                        send.push({
                            id: this.items[i].id,
                            name: this.items[i].name,
                            json: this.items[i].attrs,
                            time: this.items[i].time
                        });
                    }
                }
                socket.emit('project_load', send);
            }
        },
        initialize: function(id, projectList){
            zz.data.prototype.initialize.apply(this, arguments);
            
            this.id = id;
            this.project = {};
            this.objectLastId = 1;
            this.projectList = projectList;
            this.usersSockets = new zz.collection([]);
            this.items = {};
            this.on_release = false;
            
            this.project_ready = false;
            
            async.waterfall([
                function(callback){
                    sql.query('SELECT `id`, `name`, `image`, `info`, `modules`, `version`, `author_id`, `authors`, `hashid`, `hashlink`, `hashurl`, `genre`, `location`, `gametype`, `difficulty`, `lengthinfo`, `release_id`, `lat`, `lng` FROM `projects` WHERE `id` = ? AND `type` = "editing" LIMIT 1', this.id, callback);
                }.bind(this),
                function(rows, fields, callback) {
                    if (rows[0]){
                        this.project = {
                            id: rows[0].id,
                            name: rows[0].name,
                            image: rows[0].image,
                            info: rows[0].info,
                            modules: rows[0].modules,
                            version: rows[0].version,
                            author_id: rows[0].author_id,
                            authors: rows[0].authors,
                            hashid: rows[0].hashid,
                            hashlink: rows[0].hashlink,
                            hashurl: rows[0].hashurl,
                            genre: rows[0].genre,
                            location: rows[0].location,
                            lat: rows[0].lat,
                            lng: rows[0].lng,
                            gametype: rows[0].gametype,
                            difficulty: rows[0].difficulty,
                            lengthinfo: rows[0].lengthinfo,
                            time: 0,
                            json: ""
                        };
                        this.release_id = rows[0].release_id;
                        
                        sql.query('SELECT `object_id` as `id`, `object_name` as `name`, `object_json` as `json` FROM `project_objects` WHERE `project_id` = ?', this.id, callback);
                    }else{
                        callback(new Error('No project'));
                    }
                }.bind(this),
                function(rows, fields, callback) {
                    for (var i in rows) {
                        this.items[rows[i].id] = {
                            id: rows[i].id,
                            name: rows[i].name,
                            json: rows[i].json,
                            attrs: JSON.parse(rows[i].json),
                            removed: false,
                            time: 0
                        };
                    };
                    
                    this.project_ready = true;
                    
                    var send = [{id: 'project', name: 'Project', json: this.project, time: this.project.time}];
                    for (var i in this.items) {
                        send.push({
                            id: this.items[i].id,
                            name: this.items[i].name,
                            json: this.items[i].attrs,
                            time: this.items[i].time
                        });
                    }
                    this.emit('project_load', send, null);
                    
                    callback(null);
                }.bind(this)
            ], function(err){
                if (err){
                    console.error(err);
                    
                    return;
                }
            });            
        }
    });

    var ProjectListClass = zz.data.extend({
        initialize: function(){
            var projects = {};
            var initModules = 'common,HighLoad100';

            this.getProject = function(id){
                return projects[id];
            };
            
            this.delete = function(id){
                console.log('quit project', id);
                delete projects[id];
            };

            this.userTest = function(user, msg_id, access, callback){
                if (user.isAdmin()){
                    callback(null);
                    return;
                }
                
                sql.query('SELECT `id` FROM `projects` WHERE `id` = ? AND `type` = "editing"', [msg_id], function(err, rows, fields) {
                    if (err){
                        console.error(err);
                        callback(err);

                        return;
                    }

                    if (rows.length === 0){
                        callback(new Error("У вас нет доступа к проекту"));

                        console.log('Wrong user project', user.get('id'), msg_id);
                    }else{
                        sql.query('SELECT * FROM `users_projects` WHERE FIND_IN_SET(?, `access`) > 0 AND `user_id` = ? AND `project_id` = ?', [access, user.get('id'), msg_id], function(err, rows, fields) {
                            if (err){
                                console.error(err);
                                callback(err);

                                return;
                            }

                            if (rows.length === 0){
                                callback(new Error("У вас нет доступа к проекту"));

                                console.log('Wrong user project', user.get('id'), msg_id);
                            }else{
                                callback(null);
                            }
                        });
                    }
                });
            };

            this.createNew = function(user, create_callback){
                var id = null;
                async.waterfall([
                    function(callback) {
                        sql.query('INSERT INTO `projects` (`name`, `image`, `info`, `modules`, `version`, `author_id`, `type`, `authors`, `genre`, `location`, `gametype`, `difficulty`, `lengthinfo`, `hashid`, `hashlink`, `hashurl`, `release_id`, `create_date`, `release_date`, `trash`) VALUES ("", "/admin/project.jpg", "", ?, "1.0", ?, "editing", "", "", "", "", "", "", 0, "", "", 0, NOW(), NOW(), 0)', 
                        [initModules, user.get('id')], callback);
                    },
                    function(rows, fields, callback) {
                        sql.query('SELECT LAST_INSERT_ID() as `id`', callback);
                    },
                    function(rows, fields, callback) {
                        id = rows[0].id;
                        
                        sql.query('UPDATE `projects` SET `name` = ?, `hashid` = ?, `hashlink` = ?, `hashurl` = ? WHERE `id` = ?', ['Игра '+id, id, shortid.generate(), id, id]);
                        
                        sql.query('INSERT INTO `users_projects` (`user_id`, `project_id`, `access`) VALUES (?, ?, "creator,writer,tester")', 
                        [user.get('id'), id], callback);
                    },
                    function(rows, fields, callback) {
                        create_callback(null, id);
                    }
                ], function(err){
                    console.error(err);
                });
            };

            io.on('connection', function (socket) {
                socket.on('project_connected', function(msg){
                    var user = socket.authorization;
                    if (user){
                        this.userTest(user, msg.id, 'writer', function(err) {
                            if (err === null){
                                if (!projects[msg.id]){
                                    projects[msg.id] = new projectClass(msg.id, this);
                                }

                                projects[msg.id].connect(socket);
                            }else{
                                socket.emit('project_alert', {
                                    header: 'Ошибка',
                                    message: err.toString()
                                });
                            }
                        }.bind(this));
                    }else{
                        socket.emit('project_alert', {
                            header: 'Ошибка авторизации',
                            message: 'Вам необходимо войти в систему',
                        });
                    }
                }.bind(this));
            }.bind(this));
        }
    });

    return new ProjectListClass;
};