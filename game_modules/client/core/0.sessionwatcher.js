var WatcherRelation = zz.Class.extend({
    serialize: function(){
        return {id: this.id, type: 'rel'};
    },
    getItem: function(){
        return this.wc.getItem(this.id);
    },
    issetItem: function(){
        return this.wc.issetItem(this.id);
    },
    waitItem: function(fn){
        return this.wc.waitItem(this.id, fn);
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
    issetItem: function(id){
        return this.items[id]?true:false;
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
        for (var i=syncedArr.length-1;i>=0;i--){
            fn = function(as, f){
                as.afterSync(f);
            }.bind(this, syncedArr[i], fn);
        }
        fn();
    },
    create: function(classname){
        if (!client[classname]){
            console.error('client.'+classname+' not found');
        }

        return new client[classname];
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
        item._startSync(this, id);
        
        client.setTimeout(function(){
            if (item){
//                console.log('init', id);
                item.initSync(args, silence);
            }
        }.bind(this), 0);
        
        item.on('destroy', function(){
            this.unwatch(item, silence);
            item = null;
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
                event.item.afterSync(function(event){
                    this.waiters[event.id].forEach(function(fn){
                        fn(event.item);
                    }, this);

                    delete this.waiters[event.id];
                }.bind(this, event));
            }
        };
        
        this.on('create', wfn, this);
        this.on('load', wfn, this);
    }
});

var SocketWatcher = zz.data.extend({
    watcher: function(watcherCol){
        this.watcherCol = watcherCol;
        
        return this;
    },
    emit: function(ev, msg){
        msg.time = this._time;
        
        this.socket.emit(ev, msg);
        this._time++;
    },
    wait: function(ev, fn){
        this.socket.on(ev, function(){
            try{
                fn();
            }catch(e){
                console.error(e);
            }
        });
    },
    unwait: function(ev){
        this.socket.off(ev);
    },
    reconnect: function(){
        this.socket.emit('session_init', {id: this.id});
    },
    startReceiveSocket: function(socket, id){
        var firstInit = true;
        this.socket = socket;
        this.id = id;
        this.time = {};
        
        socket.on('connect', function(){
            //this.removeAllItems();
            socket.emit('session_init', {id: id});

            firstInit = true;
            
            this._time = 1;
        }.bind(this));

        socket.on('disconnect', function(){
            this.watcherCol.removeAllItems();
            this.time = {};
        }.bind(this));

        socket.on('session_delete', function(msg){
            console.log('session_delete', msg);

            msg.l.forEach(function(obj){
                if (!this.time[obj.id]){
                    this.time[obj.id] = 0;
                }
                
                if (this.time[obj.id] < obj.time){
                    this.time[obj.id] = obj.time;
//                    console.log('destroy', obj.id);
                    this.watcherCol.destroy(obj.id, 'sync');
                }
            }, this);
            
            socket.emit('session_delete_complete', {t: msg.t});
        }.bind(this));

        var showprog = false;
        socket.on('session_load', function(msg){
            console.log('session_load', msg);

            /*if (showprog){
                client.modal.clearModal();
            }*/
            showprog = false;
            
            msg.l.forEach(function(obj){
                if (!this.time[obj.id]){
                    this.time[obj.id] = 0;
                }
                
                if (this.time[obj.id] < obj.time){
                    this.time[obj.id] = obj.time;
                    
                    var item = this.watcherCol.getItem(obj.id);
                    
                    if (item){
//                        console.log('set', obj.id);
                        
                        client.setTimeout(function(){
//                            console.log('update', obj.id);
                            item.updateSync(obj.json, 'sync');
                        }, 0);
                    }else{
//                        console.log('load', obj.id);
                        
                        this.watcherCol.load(
                            obj.id,
                            this.watcherCol.create( obj.name ),
                            obj.json,
                            'sync'
                        );
                    }
                }
            }, this);

            if (firstInit){
                firstInit = false;

                this.watcherCol.callEventListener('start', {watcher: this.watcherCol});
            }
            
            socket.emit('session_load_complete', {t: msg.t});
        }.bind(this));

        var init = (new zz.data()).set({
            progress: '0 %',
            width: 'width: 0%'
        });

        var progressFld = new SchemeField('#InitProgress')
            .linkTextValue('.level-name', init, 'progress')
            .linkAttributeValue('.level-up', 'style', init, 'width');

        socket.on('session-progress', function(msg){
            if (!showprog){
                client.modal.showModal(progressFld);
                showprog = true;
            }
            
            init.set({
                progress: msg.progress+' %',
                width: 'width: '+msg.progress+'%'
            });
        });

        socket.on('session-alert', function(msg){
            client.alert(msg.header, msg.message, msg.close, msg.color);
        });
/*        socket.on('session_update', function(msg){
            console.log('session_update', msg);

            msg.forEach(function(obj){
                var item = this.watcherCol.getItem(obj.id);
                if (item){
                    client.setTimeout(function(){
                        item.updateSync(obj.json, 'sync');
                    }, 0);
                }else{
                    console.error('No item', id);
                }
            }, this);
        }.bind(this));*/

        client.socket = this;
        
        return this;
    },
    initialize: function(){
        zz.data.prototype.initialize.apply(this, arguments);
        
        this._time = 1;
    }
});

var client = {global:{}, fields:{}, watcher: new WatchersCollection};
