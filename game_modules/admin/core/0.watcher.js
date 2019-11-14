var WatcherRelation = zz.Class.extend({
    serialize: function(){
        return {id: this.id, type: 'rel'};
    },
    getItem: function(){
        return this.wc.getItem(this.id);
    },
    initialize: function(watcherCol, id){
        this.id = id;
        this.wc = watcherCol;
    }
});

var WatchersCollection = zz.data.extend({
    getItem: function(id){
        if (this.items[id]){
            return this.items[id];
        }
        
        return null;
    },
    afterSyncItem: function(id, fn){
        this.waitItem(id, function(item){
            item.afterSync(function(){
                fn(item);
            });
        });
    },
    waitItem: function(id, fn){
        if (this.items[id]){
            fn(this.items[id]);
        }else{
            if (!this.waiters[id]){
                this.waiters[id] = [];
            }
            
            this.waiters[id].push(fn);
        }
    },
    afterSync: function(syncedArr, fn){
        if (typeof syncedArr === 'function'){
            fn = syncedArr;
            if (this.synced <= 0){
                fn();
            }else{
                this.on('after-sync', fn);
            }
        }else{
            for (var i=syncedArr.length-1;i>=0;i--){
                fn = function(as, f){
                    if (as){
                        as.afterSync(f);
                    }else{
                        f();
                    }
                }.bind(this, syncedArr[i], fn);
            }
            fn();
        }
    },
    create: function(classname){
        if (!admin[classname]){
            console.error('admin.'+classname+' not found');
            return null;
        }

        return new admin[classname];
    },
    load: function(id, item, args, silence){
        if (this.items[id]){
            return this.items[id];
        }

        //already watched?
        for(var testid in this.items){
            if (this.items[testid] === item){
                return item;
            }
        }

        this.items[id] = item;
        this.synced++;
        item._startSync(this, id);
        window.setTimeout(function(){
            item.initSync(args, silence);
            this.synced--;
            if (this.synced <= 0){
                window.setTimeout(function(){
                    this.callEventListener('after-sync', {});
                    this.off('after-sync');
                }.bind(this), 0);
            }
        }.bind(this), 0);
        item.on('destroy', function(){
            this.unwatch(item, silence);
        }, this);
        this.callEventListener('load', {id: id, item: item}, silence);
        
        return item;
    },
    watchByID: function(id, fnCreate, silence){
        if (this.items[id]){
            return this.getItem(id);
        }else if (fnCreate){
            return this.watch(fnCreate(this), id, silence);
        }
    },
    watch: function(item, id, silence){
        if (!id){
            //generate new unique id
            do {
                id = shortid.generate();
            }while(this.items[id]);
        }

        //already watched?
        for(var testid in this.items){
            if (this.items[testid] === item){
                return item;
            }
        }

        this.items[id] = item;
        item._startSync(this, id);
        item.createSync(silence);
        item.on('destroy', function(){
            this.unwatch(item, silence);
        }, this);
        this.callEventListener('create', {id: id, item: item}, silence);
        
        return item;
    },
    clone: function(item, attrs, silence){
        //already watched?
        for(var testid in this.items){
            if (this.items[testid] === item){
                return item;
            }
        }

        var id;
        do {
            id = shortid.generate();
        }while(this.items[id]);
        
        this.items[id] = item;
        item._startSync(this, id);
        item.initSync(attrs, silence);
        item.on('destroy', function(){
            this.unwatch(item, silence);
        }, this);
        this.callEventListener('create', {id: id, item: item}, silence);
        
        return item;
    },
    unwatch: function(item, silence){
        for(var id in this.items){
            if (this.items[id] === item){
                this.callEventListener('delete', {id: id, item: item}, silence);
                delete this.items[id];
                
                return;
            }
        }
    },
    destroy: function(id, silence){
        if (this.items[id]){
            this.items[id].destroy();
        }
    },
    removeAllItems: function(silence){
        for (var x in this.items){
            this.destroy(x, silence);
        }
        
        this.items = {};
    },
    getRel: function(id){
        if (!this.rels[id]){
            this.rels[id] = new WatcherRelation(this, id);
        }
        
        return this.rels[id];
    },
    initialize: function(){
        zz.data.prototype.initialize.apply(this, arguments);
        
        this.items = {};
        this.rels = {};
        this.waiters = {};
        
        var wfn = function(event){
            if (this.waiters[event.id]){
                this.waiters[event.id].forEach(function(fn){
                    fn(event.item);
                }, this);
                
                delete this.waiters[event.id];
            }
        };
        
        this.synced = 0;
        
        this.on('create', wfn, this);
        this.on('load', wfn, this);
    }
});

var SocketWatcher = zz.data.extend({
    _unserializeDataSync: function(attrs, i, recurse){
        if (attrs[i] instanceof Array){
            for (var index = attrs[i].length-1;index>=0;index--){
                if (!this._unserializeDataSync(attrs[i], index, recurse))
                    return false;
            };
        }

        if (attrs[i] && typeof attrs[i] === 'object'){ 
            if (attrs[i].type && attrs[i].type === 'rel' && attrs[i].id){
                var id = attrs[i].id;
                var item = this.watcherCol.getItem(id);
                if (!item){
                    if (recurse && this.needResolve[id]){
                        if (!this.needResolve[id].rec){
                            if (this.resolvedTest(id) === false){
                                return false;
                            }
                        }
                    }else{
                        return false;
                    }
                }
            }                
        }
        return true;
    },
    corruptionTest: function(attrs, recurse){
        for (var i in attrs){
            if (!this._unserializeDataSync(attrs, i, recurse))
                return false;
        }

        return true;
    },
    resolvedTest: function(id){
        if (this.needResolve[id].test !== null){
            return this.needResolve[id].test;
        }
        
        if (this.needResolve[id].rec){
            return null;
        }
        
        this.needResolve[id].test = null;
        this.needResolve[id].rec = true;
        if (!this.corruptionTest(this.needResolve[id].msg.json, true)){
            this.needResolve[id].rec = false;
            this.needResolve[id].test = false;
            return false;
        }
        this.needResolve[id].rec = false;
        this.needResolve[id].test = true;
        return true;
    },
    resolveCorrupted: function(){
        for (var i in this.needResolve){
            this.needResolve[i].test = null;
            this.needResolve[i].rec = false;
        }        
        
        for (var i in this.needResolve){
            var test = this.resolvedTest(i);
            if (test === true){
                var msg = this.needResolve[i].msg;
                var item = this.watcherCol.getItem(i);
                if (item){
                    if (this.time[i].server < msg.time){
                        var item = this.watcherCol.getItem(i);
                        if (item){
                            this.time[i].local = msg.time;
                            this.time[i].server = msg.time;

                            window.setTimeout(function(){
                                item.updateSync(msg.json, 'sync');
                            }, 0);
                        }
                    }
                }else{
                    var item = this.watcherCol.create( msg.name );

                    if (item){
                        this.time[msg.id] = {
                            local: msg.time,
                            server: msg.time
                        };

                        this.watcherCol.load(
                            msg.id,
                            item,
                            msg.json,
                            'sync'
                        );
                    }
                }

                delete this.needResolve[i];
            }
        }
        
        //console.log('unresolved', Object.keys(this.needResolve).length);
    },
    watcher: function(watcherCol){
        this.watcherCol = watcherCol;
        
        var eventsFn = function(item, id, create){
            var _serializeTimeout = true;
            var savefn = function(ev){
//                console.log('admin_save', item.className, id, ev.attribute);

                if (_serializeTimeout && this.socket){
                    setTimeout(function(){
                        var s = item.serialize();
                
                        if (this.socket){
                            this.time[id].local++;
                            console.log('admin_saving', item.className, s);
                            
                            this.socket.emit('project_save', {
                                id: id,
                                name: item.className, 
                                json: s,
                                time: this.time[id].local
                            });
                        }
                        _serializeTimeout = true;
                    }.bind(this), 0);
                    _serializeTimeout = false;
                }
            }.bind(this);
            
            item.getWatchedEvents().forEach(function(event){
                item.on(event, savefn, this, ['sync']);
            }, this);
            
            item.on('delete-sync', function(event){
                console.log('admin_save', id);
                
                if (this.socket){
                    this.socket.emit('project_delete', id);
                }
            }, this, ['sync']);
            
            if (create){
                savefn({});
            }
        }.bind(this);
        
        watcherCol.on('load', function(ev){
            var item = ev.item;
            var id = ev.id;
            
            eventsFn(item, id, false);
        }, this, ['watch-socket']);
            
        watcherCol.on('create', function(ev){
            var item = ev.item;
            var id = ev.id;
            
            console.log('admin_create', id, item.className);

            this.time[id] = {
                local: 0,
                server: 0
            };

            eventsFn(item, id, true);
            
            /*this.socket.emit('project_save', {
                id: id,
                name: item.className, 
                json: item.serialize(),
                time: 0
            });*/
        }, this, ['watch-socket']);
        
        return this;
    },
    startReceiveSocket: function(socket, id, isSession){
        var firstInit = true;
        this.id = id;
        
        socket.on('connect', function(){
            //this.removeAllItems();
            firstInit = true;
            console.log('connect');
            this.callEventListener('loading');
            
            if (isSession){
                socket.emit('session_admin', {id: id});
            }else{
                socket.emit('project_connected', {id: id});
            }

            this.socket = socket;
        }.bind(this));

        socket.on('disconnect', function(){
            console.log('disconnect');
            
            this.socket = null;
            
            this.watcherCol.callEventListener('disconnect', {watcher: this.watcherCol});
            this.watcherCol.removeAllItems();
        }.bind(this));

        socket.on('project_delete', function(msg){
            console.log('project_delete', msg);

            delete this.time[msg.id];

            this.watcherCol.destroy(msg.id, 'sync');
        }.bind(this));

        socket.on('project_load', function(msg){
            //console.log('project_load', JSON.stringify(msg));

            if (firstInit){
                console.log('create');
                msg.forEach(function(m){
                    var item = this.watcherCol.create( m.name );

                    if (item){
                        this.time[m.id] = {
                            local: m.time,
                            server: m.time
                        };

                        m.item = item;
                    }
                }, this);
                
                window.setTimeout(function(){
                    console.log('init');
                    msg.forEach(function(m){
                        if (m.item){
                            this.watcherCol.load(
                                m.id,
                                m.item,
                                m.json,
                                'sync'
                            );
                        }
                    }, this);

                    firstInit = false;

                    console.log('complete');
                    this.callEventListener('load-complete');
                    this.watcherCol.callEventListener('start', {watcher: this.watcherCol});
                }.bind(this), 0);
            }else{
                msg.forEach(function(m){
                    var i = this.watcherCol.getItem(m.id);
                    if (i){
                        if (this.time[m.id].server < m.time){
                            if (this.corruptionTest(m.json)){
                                this.time[m.id].local = m.time;
                                this.time[m.id].server = m.time;

                                window.setTimeout(function(){
                                    i.updateSync(m.json, 'sync');
                                }, 0);
                            }else{
                                this.needResolve[m.id] = {
                                    msg: m,
                                    rec: false,
                                    test: null
                                };
                            }
                        }
                    }else{
                        if (this.corruptionTest(m.json)){
                            var item = this.watcherCol.create( m.name );

                            if (item){
                                this.time[m.id] = {
                                    local: m.time,
                                    server: m.time
                                };

                                this.watcherCol.load(
                                    m.id,
                                    item,
                                    m.json,
                                    'sync'
                                );
                            }
                        }else{
                            this.needResolve[m.id] = {
                                msg: m,
                                rec: false,
                                test: null
                            };
                        }
                    }
                }, this);

                this.resolveCorrupted();
            }
        }.bind(this));        

        socket.on('project_release', function(msg){
            if (msg.complete){
                admin.alert('Опубликовать проект','Проект успешно опубликован','Ок');
            }
        }.bind(this));
        
        socket.on('project_alert', function(msg){
            admin.alert(msg.header, msg.message, 'Ок');
        }.bind(this));
        
        return this;
    },
    initialize: function(){
        zz.data.prototype.initialize.apply(this, arguments);
        
        this.socket = null;
        this.needResolve = {};
        this.time = {};
    }
});

var admin = {global:{}, fields:{}, module:{}, watcher: new WatchersCollection};
