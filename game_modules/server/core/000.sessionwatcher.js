var zz = require('../zz');
var shortid = require('shortid');

module.exports = function (server){
    var AdminWatcher;
    
    server.catchSynced = function(fn, item){
        try{ fn(); }catch(e){ 
            console.error(e);
            item.watcher.getItem('Session').log('error', {
                error: e.toString(),
                stack: e.stack
            });
        }
    };
    
    server.WatcherRelation = zz.Class.extend({
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

    server.WatchersCollection = zz.data.extend({
        serialize: function(){
            var ser = [];
            
            this.removeLeaks();
            
            for (var id in this.items){
                ser.push({
                    id: id,
                    name: this.items[id].className,
                    json: this.items[id].serialize()
                });
            }
            
            return ser;
        },
        getItem: function(id){
            if (this.items[id]){
                return this.items[id];
            }

            return null;
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
                        as.afterSync(f);
                    }.bind(this, syncedArr[i], fn);
                }
                fn();
            }
        },
        create: function(classname){
            if (!server[classname]){
                console.error('server.'+classname+' not found');
                return null;
            }

            return new server[classname];
        },
        lazyLoadSync: function(id, item, silence){
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
            item.on('destroy', function(){
                this.unwatch(item, silence);
            }, this);

            return item;
        },
        lazyLoadInit: function(item, args, silence){
            server.catchSynced(function(){
                item.initSync(args, silence);
            }, item);
            this.synced--;
            if (this.synced <= 0){
                server.setTimeout(function(){
                    this.callEventListener('after-sync', {});
                    this.off('after-sync');
                }.bind(this), 0);
            }
            this.callEventListener('load', {id: item.id, item: item}, silence);
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
            setTimeout(function(){
                server.catchSynced(function(){
                    item.initSync(args, silence);
                }, item);
                this.synced--;
                if (this.synced <= 0){
                    server.setTimeout(function(){
                        this.callEventListener('after-sync', {});
                        this.off('after-sync');
                    }.bind(this), 0);
                }
                this.callEventListener('load', {id: id, item: item}, silence);
            }.bind(this), 0);
            item.on('destroy', function(){
                this.unwatch(item, silence);
            }, this);

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
            server.catchSynced(function(){
                item.createSync(silence);
            }, item);
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
            server.catchSynced(function(){
                item.initSync(attrs, silence);
            }, item);
            item.on('destroy', function(){
                this.unwatch(item, silence);
            }, this);
            this.callEventListener('create', {id: id, item: item}, silence);

            return item;
        },
        unwatch: function(item, silence){
            for(var id in this.items){
                if (this.items[id] === item){
                    //console.log('delete', id);
                    
                    this.callEventListener('delete', {id: id, item: item}, silence);
                    delete this.items[id];

                    if (!this.removingLeaks){
                        this.removingLeaks = true;
                        setTimeout(function(){
                            this.removingLeaks = false;
                            this.removeLeaks();
                        }.bind(this), 0);
                    }

                    return;
                }
            }
        },
        destroy: function(id, silence){
            if (this.items[id]){
                server.catchSynced(function(){
                    this.items[id].destroy();
                }.bind(this), this.items[id]);
            }
        },
        removeAllItems: function(silence){
            this.removingLeaks = true;
            
            for (var x in this.items){
                this.destroy(x, silence);
            }

            this.removingLeaks = false;
            this.items = {};
        },
        getAllItems: function(silence){
            return this.items;
        },
        root: function(items){
            this.getItem('root').add(items);
        },
        unroot: function(item){
            this.getItem('root').remove(item);
        },
        adminConnected: function(socket){
            if (this.synced > 0){
                this.on('after-sync', function(){
                    if (!this.admin){
                        this.admin = new AdminWatcher(this);
                    }

                    this.admin.connect(socket);
                }, this);
            }else{
                if (!this.admin){
                    this.admin = new AdminWatcher(this);
                }

                this.admin.connect(socket);
            }
        },
        adminOffline: function(){
            console.log('admin offline');
            this.admin = null;
        },
        initialize: function(){
            zz.data.prototype.initialize.apply(this, arguments);

            this.items = {};
            this.waiters = {};

            this.admin = null;

            var wfn = function(event){
                if (this.waiters[event.id]){
                    event.item.afterSync(function(event){
                        this.waiters[event.id].forEach(function(fn){
                            fn(event.item);
                        }, this);

                        delete this.waiters[event.id];
                    }.bind(this, event));
                }
            };

            var unusedItems = {};
            this.removingLeaks = false;
            var testDeletedAttrs = function(attrs, i){
                if (attrs[i] instanceof Array){
                    var result = false;
                    for (var index = attrs[i].length-1;index>=0;index--){
                        result = result | testDeletedAttrs(attrs[i], index);
                    };
                    return result;
                }

                if (attrs[i] instanceof server.SyncedData){
                    if (this.items[attrs[i].id]){
                        testDeletedLoop(attrs[i].id);
                    }else{
                        //console.log('nulling object', attrs[i].id);
                        attrs[i] = null;//remove destroyed object
                        return true;
                    }
                }
                
                return false;
            }.bind(this);
            
            var testDeletedLoop = function(id){
                if (!unusedItems[id]){
                    unusedItems[id] = true;
                    if (this.items[id]){
                        for (var name in this.items[id].attributes){
                            var item = this.items[id];
                            var last = item.attributes[name];
                            if (testDeletedAttrs(item.attributes, name)){
                                //if removed to null, call listener
                                item.callEventListener('set', {
                                    attribute: name, value: null, lastValue: last, target: item
                                });
                                item.callEventListener('set:'+name, {
                                    attribute: name, value: null, lastValue: last, target: item
                                });
                            }
                        }
                    }
                }
            }.bind(this);
            
            this.removeLeaks = function(){
                if (this.removingLeaks){
                    return;
                }
                
                unusedItems = {};
                this.removingLeaks = true;

                if (this.items['root']){
                    testDeletedLoop('root');
                    
                    for(var id in this.items){
                        if (!unusedItems[id]){
                            //console.log('removed leaks', id, this.items[id].className);
                            this.destroy(id);
                        }
                    }
                }else{
                    console.error('Cannot find `root` object');
                }
                
                this.removingLeaks = false;
            }.bind(this);

            this.synced = 0;

            this.on('create', wfn, this);
            this.on('load', wfn, this);
        }
    });
    
    var AdminWatcher = zz.data.extend({
        emit: function(name, msg, ignoreSocket){
            this.usersSockets.forEach(function(socket){
                if (ignoreSocket !== socket){
                    socket.emit(name, msg);
                }
            }, this);
        },
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
                    var item = this.session.getItem(id);
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
                    if (this.items[msg.id]){
                        if (!this.items[msg.id].removed && this.items[msg.id].time < msg.time){
//                            console.warn('admin_update', msg.id, msg.json, msg.time);
                            this.items[msg.id].time = msg.time;
                            this.items[msg.id].json = msg.json;
                            var json = msg.json;

                            var item = this.session.getItem(msg.id);
                            if (item){
                                setTimeout(function(){
                                    item.updateSync(json);
                                }.bind(this), 0);
                            }
                        }
                    }else{
//                        console.warn('admin_create', msg.id, msg.name, msg.json);
                        var item = this.session.create(msg.name);
                        if (item){
                            this.session.load(
                                msg.id, item, msg.json
                            );
                        }
                    }

                    delete this.needResolve[i];
                }
            }

//            console.warn('unresolved', Object.keys(this.needResolve).length);
        },        
        connect: function(socket){
            console.log('connect to session');
            
            this.usersSockets.add([socket]);
            
            socket.on('disconnect', function(){
                console.log('disconnect');
                this.usersSockets.remove(socket);
                
                if (this.usersSockets.count() === 0){
                    this.session.adminOffline();
                    this.destroy();
                    this.items = {};
                }
            }.bind(this));

            socket.on('project_save', function(msg){
                //var json = JSON.stringify(msg.json);
                if (msg.id === 'project'){
                    
                }else{
                    if (this.items[msg.id]){
                        if (!this.items[msg.id].removed && this.items[msg.id].time < msg.time){
                            if (this.corruptionTest(msg.json)){
//                                console.warn('admin_update', msg.id, msg.json, msg.time);
                                this.items[msg.id].time = msg.time;
                                this.items[msg.id].json = msg.json;
                                var id = msg.id;
                                var json = msg.json;

                                var i = this.session.getItem(id);
                                if (i){
                                    setTimeout(function(){
                                        i.updateSync(json);
                                    }.bind(this), 0);
                                }
                            }else{
                                this.needResolve[msg.id] = {
                                    msg: msg,
                                    rec: false,
                                    test: null
                                };
                            }
                        }
                    }else{
                        if (this.corruptionTest(msg.json)){
//                            console.warn('admin_create', msg.id, msg.name, msg.json);
                            var item = this.session.create(msg.name);
                            if (item){
                                this.session.load(
                                    msg.id, item, msg.json
                                );
                            }
                    
                            this.resolveCorrupted();
                        }else{
                            this.needResolve[msg.id] = {
                                msg: msg,
                                rec: false,
                                test: null
                            };
                        }
                    }
                }
            }.bind(this));

            socket.on('project_delete', function(id){
//                console.warn('admin_delete', id);

                this.session.destroy(id);
            });
            
            var send = [];
            for (var i in this.items) {
                if (!this.items[i].removed){
                    send.push({
                        id: this.items[i].id,
                        name: this.items[i].name,
                        json: this.items[i].json,
                        time: this.items[i].time
                    });
/*                    
                    console.log('send json', this.items[i].id);
                    console.log('send json', this.items[i].name);
                    console.log('send json', JSON.stringify(this.items[i].json));*/
                }
            }
            
            socket.emit('project_load', send);
            
            console.log('session load complete');
        },
        destroy: function(){
            this.session.off('create', null, this);
            this.session.off('load', null, this);
            this.session.off('delete', null, this);
            
            var items = this.session.getAllItems();
            for (var id in items){
                items[id].getWatchedEvents().forEach(function(event){
                    items[id].off(event, null, this);
                }, this);
            }
        },
        initialize: function(watcher){
            zz.data.prototype.initialize.apply(this, arguments);
            this.addcounter = 0;
            this.project = {};
            this.session = watcher;
            this.usersSockets = new zz.collection([]);
            this.items = {};
            this.needResolve = {};
            
            this.session.on('delete', function(ev){
                if (this.items[ev.id] && !this.items[ev.id].removed){
                    this.emit('project_delete', ev.id);

                    ev.item.getWatchedEvents().forEach(function(event){
                        ev.item.off(event, null, this);
                    }, this);

                    this.items[ev.id].removed = true;
                }
            }.bind(this), this);
            
            var updateFn = function(item, id){
                var it = {
                    id: id,
                    name: item.className,
                    json: item.serialize(),
                    removed: false,
                    time: 0
                };
                
                var _serializeTimeout = true;
                var savefn = function(ev){
                    if (_serializeTimeout){
                        setTimeout(function(){
                            if (!it.removed){
//                                console.error('session_update', it.name, id, JSON.stringify(it.json));
                
                                it.time++;
                                it.json = item.serialize();

                                this.emit('project_load', [{
                                    id: id,
                                    name: it.name, 
                                    json: it.json,
                                    time: it.time
                                }]);
                            }
                            _serializeTimeout = true;
                        }.bind(this), 0);
                        _serializeTimeout = false;
                    }
                }.bind(this);

                item.getWatchedEvents().forEach(function(event){
                    item.on(event, savefn, this);
                }, this);
                
                //console.error('session_load', it.name, id, JSON.stringify(it.json));
                
                this.emit('project_load', [{
                    id: id,
                    name: it.name, 
                    json: it.json,
                    time: it.time
                }]);
                
                return it;
            }.bind(this);            

            this.session.on('create', function(msg){
                msg.item.afterSync(function(){
                    this.items[msg.id] = updateFn(msg.item, msg.id);
                }.bind(this));
            }.bind(this), this);
            
            this.session.on('load', function(msg){
                msg.item.afterSync(function(){
                    this.items[msg.id] = updateFn(msg.item, msg.id);
                }.bind(this));
            }.bind(this), this);
            
            var items = this.session.getAllItems();
            for (var id in items){
                this.items[id] = updateFn(items[id], id);
            }
        }
    });
};