var zz = require('../../zz');

module.exports = function (server){
    server.PlayerWatcher = server.SyncedData.extend({
        className: 'PlayerWatcher',
        socket: null,
        _serializeTimeout: {},
        getPing: function(){
            return this.socket.__ping;
        },
        listenSocket: function(event, fn){
            if (!this._socketListeners[event]){
                this._socketListeners[event] = [];
            }
            
            this._socketListeners[event].push(fn);
            
            if (this.socket && fn){
                this.socket.on(event, function(msg){
                    if (this.time < msg.time){
                        this.time = msg.time;
                        
                        this.watcher.getItem('Session').timeRunStart();
                        this.watcher.getItem('Session').catch(function(msg){
                            fn.apply(this, msg);
                        }.bind(this, arguments));
                        this.watcher.getItem('Session').timeRunEnd();
                    }
                }.bind(this));
            }
        },
        unlistenSocket: function(event, fn){
            if (this._socketListeners[event]){
                if (fn){
                    var k = this._socketListeners[event].indexOf(fn);
                    if (k !== -1){
                        if (this.socket){
                            this.socket.removeListener(event, fn);
                        }
                        this._socketListeners[event].splice(k, 1);
                        return true;
                    }
                }else{
                    if (this.socket){
                        this.socket.removeAllListeners(event);
                    }
                    delete this._socketListeners[event];
                }
            }
            
            return false;
        },
        send: function(event, msg){
            if (this.socket){
                console.log('send', event, JSON.stringify(msg));
            
                this.socket.emit(event, msg);
            }
        },
        sendWithPack: function(event, msg){
            this.eventBuffer.push({
                event: event, msg: msg
            });
            
            this.syncSetTimer();
        },
        syncSetTimer: function(){
            if (this.sendTimer !== null){
                clearTimeout(this.sendTimer);
            }
            
            this.sendTimer = setTimeout(function(){
                this.sendTimer = null;

                if (Object.keys(this.removeBuffer).length > 0){
                    this.dtimer++;
                    
                    var send = [];
                    var items = this.removeBuffer;
                    for (var i in items){
                        if (items[i]){
                            send.push({
                                id: items[i].id,
                                time: this.watchsetup[items[i].id].time++
                            });
                        }
                    }

                    this.send('session_delete', {l: send, t: this.dtimer});

//                    this.removeBuffer = {};
                }

                if (Object.keys(this.sendBuffer).length > 0){
                    this.ltimer++;
                    
                    var send = [];
                    var items = this.sendBuffer;
                    for (var i in items){
                        if (items[i]){
                            send.push({
                                id: items[i].id,
                                name: items[i].className,
                                json: items[i].serialize(),
                                time: this.watchsetup[items[i].id].time++
                            });
                        }
                    }
                    this.send('session_load', {l: send, t: this.ltimer});

//                    this.sendBuffer = {};
                }
                
                this.eventBuffer.forEach(function(ev){
                    this.send(ev.event, ev.msg);
                }, this);
                
                this.eventBuffer = [];
            }.bind(this), 0);
        },
        syncLoad: function(items){
            for (var i in items){
                this.sendBuffer[i] = items[i];
                delete this.removeBuffer[i];
            }
            
            this.syncSetTimer();
        },
        syncUpdate: function(item){
            this.sendBuffer[item.id] = item;
            delete this.removeBuffer[item.id];
            
            this.syncSetTimer();
        },
        syncDelete: function(items){
            for (var i in items){
                this.removeBuffer[i] = items[i];
                delete this.sendBuffer[i];
            }
            
            this.syncSetTimer();
        },
        connected: function(socket){
            if (this.socket){
                this.socket.disconnect();
            }
            
            this.socket = socket;
            this.time = 0;

            socket.on('disconnect', function(){
                this.socket = null;
            }.bind(this));

            this.ltimer = 0;
            this.dtimer = 0;

            socket.on('session_load_complete', function(msg){
                if (msg.t === this.ltimer){
                    this.sendBuffer = {};
                    this.ltimer++;
                }
            }.bind(this));
            socket.on('session_delete_complete', function(msg){
                if (msg.t === this.dtimer){
                    this.removeBuffer = {};
                    this.dtimer++;
                }
            }.bind(this));

            for (var event in this._socketListeners){
                this._socketListeners[event].forEach(function(fn){
                    socket.on(event, fn);
                });
            }
            
            this.syncLoad( this.items.getAttributes() );
        },
        _watch: function(item){
            if (!this.watchsetup[item.id]){
                this.watchsetup[item.id] = {
                    watch: false,
                    time: 1
                };
            }
            
            if (!this.watchsetup[item.id].watch){
                //console.log('watch', this.player.get('userid'), item.className, item.id);

                var savefn = function(ev){
                    this.syncUpdate( item );
                }.bind(this);

                item.getWatchedEvents().forEach(function(event){
                    item.on(event, savefn, this);
                }, this);

                item.on('unwatch-player', function(ev){
                    if (ev.watcher === this){
                        item.getWatchedEvents().forEach(function(event){
                            item.off(event, savefn, this);
                        }, this);
                    }
                }, this);

                item.callEventListener('watch-player', {target: item, watcher: this, player: this.player});
                this.watchsetup[item.id].watch = true;
            }
        },
        watch: function(arrItems, dontCount){
            if (!(arrItems instanceof Array)){
                arrItems = [arrItems];
            }
            
            var send = {};
            var goSend = false;
            arrItems.forEach(function(item){
                if (item && !item.wbpSent){
                    console.log('watch test fail', item.className, item.id);
                }
                
                if (item instanceof server.SyncedData && item.wbpSent){
                    if (this.items.get(item.id)){
                        if (!dontCount && !this.dontCount){
                            var cnt = this.count.get(item.id)*1+1;
//                            console.log('Watch add count', item.id, item.className, cnt);
                            this.count.setAttribute(item.id, cnt);
                        }else{
//                            console.log('Watch dont count', item.id, dontCount, this.dontCount);
                        }
                    }else{
//                        console.log('watch', item.id, item.className);
                        
                        this._watch(item);
                        this.items.setAttribute(item.id, item);
                        this.count.setAttribute(item.id, 1);
                        send[item.id] = item;
                        goSend = true;
                    }
                }
            }, this);
            
            if (goSend){
                this.syncLoad( send );
            }
        },
        isWatched: function(item){
            return item?(this.watchsetup[item.id]?this.watchsetup[item.id].watch:false):null;
        },
        unwatch: function(arrItems, all){
            if (!(arrItems instanceof Array)){
                arrItems = [arrItems];
            }

            var send = {};
            var goSend = false;
            arrItems.forEach(function(item){
                if (!(item instanceof server.SyncedData)){
                    return;
                }
                
                if (!this.watchsetup[item.id]){
                    this.watchsetup[item.id] = {
                        watch: false,
                        time: 1
                    };
                }
                
                if (this.items.get(item.id)){
                    var cnt = this.count.get(item.id)*1-1;
                    if (all || cnt <= 0){
//                        console.log('unwatch', item.id, item.className);

                        item.callEventListener('unwatch-player', {target: item, watcher: this, player: this.player});

                        this.watchsetup[item.id].watch = false;
                        send[item.id] = item;
                        goSend = true;
                        this.items.removeAttribute(item.id);
                        this.count.removeAttribute(item.id);
                    }else{
//                        console.log('Watch sub count', item.id, item.className, cnt);
                        this.count.setAttribute(item.id, cnt);
                    }
                }
            }, this);
            
            if (goSend){
                this.syncDelete( send );
            }
        },
        createAttrs: function(project){
            this.set({
                player: this.player,
                watch: project.watch(new server.SyncedData),
                count: project.watch(new server.SyncedData)
            });
        },
        init: function(){
            this.player = this.get('player');
            this.dontCount = false;
            
            this.on('set:watch', function(){
                var items = this.get('watch').getAttributes();
                
                //console.log('set watch', Object.keys(items).length);

                this.dontCount = true;
                for (var i in items){
                    if (items[i]){
                        this._watch(items[i]);
                    }else{
                        console.error('watch null item', i);
                    }
                }
                
                console.log('end set watch');
                
                this.dontCount = false;
            }, this);
            
            this.watcher.on('delete', function(ev){
                this.unwatch([ev.item], true);
            }, this);
            
            this.count = this.get('count');
            this.items = this.get('watch');
            this.watchsetup = {};
            this.items.afterSync(function(){
                var items = this.items.getAttributes();
                for (var id in items){
                    this.watchsetup[id] = {
                        watch: false,
                        time: 1
                    };
                }
            }.bind(this));
            
            this.sendBuffer = {};
            this.removeBuffer = {};
            this.eventBuffer = [];
            this.sendTimer = null;
        },
        initialize: function(player){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            this.player = player;
            this.time = 0;
            
            this._socketListeners = {};
            
            this.on('destroy', function(ev){
                if (this.socket){
                    this.socket.disconnect();
                }
            }, this);
        }
    });
};