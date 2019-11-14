var zz = require('./../../../zz');

module.exports = function (server){
    server.MapAreaTriggerClickListener = server.SyncedData.extend({
        className: 'MapAreaTriggerClickListener',
        wbpSent: true,
        createAttrs: function(){
            this.set(this._init);
        },
        initialize: function(maparea){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = {target: maparea};
        }            
    });
    
    var ClickMount = zz.Class.extend({
        clickFn: function(player, msg){
            console.log('player click', msg);

/*            this.args.player = player;
            this.args.carealatlng = this.list.watcher.watch( new server.MapMarkerCoord(msg.lat, msg.lng) );*/

            this.trigger.setupArg('playerarg', player);
            this.trigger.setupArg('target', this.listener.get('target'));
            var latlng = this.trigger.watcher.watch( new server.MapMarkerCoord(msg.lat, msg.lng) );
            this.trigger.setupArg('latlngarg', latlng );

            this.trigger.get('list').run(this.args);
            
            latlng.destroy();
        },
        watch: function(ev){
            var player = ev.player;

            player.watch(this.listener, true);
            player.playerWatch().listenSocket('player_click:'+this.maparea.id, this.clickFn.bind(this, player));
        },
        unwatch: function(ev){
            console.log('unwatch clicker');

            ev.watcher.unwatch(this.listener, true);
            ev.watcher.unlistenSocket('player_click:'+this.maparea.id);
        },
        initialize: function(args, maparea, listener, trigger){
            this.maparea = maparea;
            this.listener = listener;
            this.args = args;
            this.trigger = trigger;
            
            maparea.on('watch-player', this.watch, this);
            maparea.on('unwatch-player', this.unwatch, this);
        },
        off: function(){
            this.maparea.off('watch-player', null, this);
            this.maparea.off('unwatch-player', null, this);
        }
    });
    
    server.MapAreaTriggerClick = server.TriggerClass.extend({
        className: 'MapAreaTriggerClick',
        _mount: function(maparea, args){
            var listener = maparea.get('_TriggerClick');
            if (!listener){
                listener = this.watcher.watch(new server.MapAreaTriggerClickListener(maparea));
                maparea.setAttribute('_TriggerClick', listener);
            }

            return new ClickMount(args, maparea, listener, this);
        },
        _unmount: function(maparea, clickMount){
            clickMount.off();
        }
    });
    
    server.MapAreaTriggerNear = server.TriggerClass.extend({
        className: 'MapAreaTriggerNear',
        _mount: function(maparea, args){
            var near = this.get('players').get(maparea.id);
            if (!near){
                near = this.watcher.watch(new server.SyncedData);
                this.get('players').setAttribute(maparea.id, near);
            }

            var fn = function(ev){
                if (!maparea.isActive()){
                    return;
                }

                if (!ev.player){
                    return;
                }

                var player = ev.player;
                var has = false;
                this.get('flagList').forEach(function(flag){
                    if (flag.has(player)){
                        has = true;
                        return true;
                    }
                });
                
                if (!has){
                    return;
                }
                
                var isInside = maparea.isPointInside(ev.lat, ev.lng);

                var ng = near.get(player.id);

                console.log('is inside?', isInside, ng);

                if (ng !== true && isInside){
                    near.setAttribute(player.id, true);

                    console.log('inside area');

                    this.setupArg('target', maparea);
                    this.setupArg('arg', player);

                    this.get('near').run(args);
                }

                if (!isInside){
                    //near.setAttribute(player.id, false);
                    if (ng !== undefined){
                        near.removeAttribute(player.id);
                    }

                    if (ng === true){
                        console.log('outside area');

                        this.setupArg('target', maparea);
                        this.setupArg('arg', player);

                        this.get('far').run(args);
                    }
                }
            }.bind(this);

            maparea.on('set:active', function(ev){
                if (ev.value){
                    /*var players = near.getAttributes();
                    for (var id in players){
                        var gps = this.watcher.getItem(id);
                            if (gps){
                    if (this.watcher.getItem('AllPlayers')){
                        this.watcher.getItem('AllPlayers').forEach(function(player){
                            gps = player.get('GPSInterface');
                            if (gps){
                                this._mounted[maparea.id](gps);
                            }
                        }, this);
                    }*/
                    this.get('flagList').forEach(function(flag){
                        flag.forEach(function(player){
                            gps = player.get('GPSInterface');
                            if (gps){
                                fn(gps);
                            }
                        });
                    });
                }else{
                    var players = near.getAttributes();
                    for (var id in players){
                        //near.setAttribute(id, false);
                        near.removeAttribute(id);
                    }
                }
            }, this);            

            this.watcher.getItem('AllPlayers').on('player-move', fn, this);
            return fn;
        },
        _unmount: function(maparea, fn){
            this.get('players').removeAttribute(maparea.id);
            if (this.watcher.getItem('AllPlayers')){
                this.watcher.getItem('AllPlayers').off('player-move', fn);
            }
        },
        init: function(){
            if (!this.get('players')){
                this.set({
                    players: this.watcher.watch(new server.SyncedData)
                });
            }
        }
    });    
    
    server.MapAreaTriggerActive = server.TriggerClass.extend({
        className: 'MapAreaTriggerActive',
        _mount: function(maparea, args){
            var fn = function(ev){
                if ((this.get('active')?true:false) === (ev.active?true:false)){
                    console.log('activate trigger');
                    
                    this.setupArg('target', maparea);

                    this.get('list').run(args);
                }
            };
            
            maparea.on('activate', fn, this);
            
            return fn;
        },
        _unmount: function(maparea, fn){
            maparea.off('activate', fn, this);
        }
    });    
};