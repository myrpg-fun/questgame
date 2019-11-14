var zz = require('./../../../zz');

module.exports = function (server){
    server.MapMarkerTriggerClickListener = server.SyncedData.extend({
        className: 'MapMarkerTriggerClickListener',
        wbpSent: true,
        createAttrs: function(){
            this.set(this._init);
        },
        watch: function(ev){
            var player = ev.player;
            var mapmarker = this.get('target');

            player.watch(this, true);
            player.playerWatch().listenSocket('player_click:'+mapmarker.id, function(player, msg){
                this.callEventListener('click', {player: player, msg: msg});
            }.bind(this, player));
        },
        unwatch: function(ev){
            console.log('unwatch clicker');
            var mapmarker = this.get('target');

            ev.watcher.unwatch(this, true);
            ev.watcher.unlistenSocket('player_click:'+mapmarker.id);
        },
        init: function(){
            var mapmarker = this.get('target');
            
            mapmarker.on('watch-player', this.watch, this);
            mapmarker.on('unwatch-player', this.unwatch, this);
            mapmarker.watcher.getItem('AllPlayers').eachWatchedPlayers(mapmarker, function(player){
                this.watch({player: player});
            }.bind(this));
        },
        initialize: function(mapmarker){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = {target: mapmarker};
        }
    });
    
    var ClickMount = zz.Class.extend({
        clickFn: function(ev){
            var player = ev.player, msg = ev.msg;
            console.log('player click', msg);

/*            if (this.args.class){
                this.args.class.setupArg('classArg', this.args.object);
            }
*/            
            this.trigger.setupArg('arg', player);
            this.trigger.setupArg('target', this.listener.get('target'));
            this.trigger.get('list').run(this.args);
        },
        initialize: function(args, listener, trigger){
            this.listener = listener;
            this.args = args;
            this.trigger = trigger;
            
            listener.on('click', this.clickFn, this);
        },
        off: function(){
            this.listener.off('click', this.clickFn, this);
        }
    });
    
    server.MapMarkerTriggerClick = server.TriggerClass.extend({
        className: 'MapMarkerTriggerClick',
        _mount: function(mapmarker, args){
            console.log('mount click to ', mapmarker.get('name'));
            
            var listener = mapmarker.get('_TriggerClick');
            if (!listener){
                listener = this.watcher.watch(new server.MapMarkerTriggerClickListener(mapmarker));
                mapmarker.setAttribute('_TriggerClick', listener);
            }

            return new ClickMount(args, listener, this);
        },
        _unmount: function(mapmarker, clickMount){
            console.log('unmount click', mapmarker.get('name'));
            clickMount.off();
        }
    });
    
    server.MapMarkerTriggerNear = server.TriggerClass.extend({
        className: 'MapMarkerTriggerNear',
        EarthRadius: 6372795,
        deg2rad: function(deg) {
            return deg * (Math.PI/180);
        },
        calculateTheDistance: function(lat1, lng1, lat2, lng2) {
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lng2-lng1); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ; 
            return this.EarthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Distance in m
        },
        _mount: function(mapmarker, args){
            console.log('mount near to ', mapmarker.get('name'));
            
            var near = this.get('players').get(mapmarker.id);
            if (!near){
                near = this.watcher.watch(new server.SyncedData);
                this.get('players').setAttribute(mapmarker.id, near);
            }

            var fn = function(ev){
                if (!mapmarker.isActive()){
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
                
                var dist = this.calculateTheDistance(ev.lat, ev.lng, mapmarker.get('lat'), mapmarker.get('lng'));

                var ng = near.get(player.id);

//                console.log('distance', dist, this.get('radius'), ng);

                if (ng !== true && dist <= this.get('radius')){
                    near.setAttribute(player.id, true);

                    console.log('distance near');

//                    this.setupClass( args );
                    this.setupArg('target', mapmarker);
                    this.setupArg('arg', player);

                    this.get('near').run(args);
                }

                if (dist > this.get('radius')){
                    //near.setAttribute(player.id, false);
                    if (ng !== undefined){
                        near.removeAttribute(player.id);
                    }

                    if (ng === true){
                        console.log('distance far');

//                        this.setupClass( args );
                        this.setupArg('target', mapmarker);
                        this.setupArg('arg', player);

                        this.get('far').run(args);
                    }
                }
            }.bind(this);

            mapmarker.on('set:active', function(ev){
                if (ev.value){
                    this.get('flagList').forEach(function(flag){
                        flag.forEach(function(player){
                            gps = player.get('GPSInterface');
                            if (gps){
                                fn(gps);
                            }
                        });
                    });
/*                    
                    if (this.watcher.getItem('AllPlayers')){
                        this.watcher.getItem('AllPlayers').forEach(function(player){
                            gps = player.get('GPSInterface');
                            if (gps){
                                fn(gps);
                            }
                        }, this);
                    }*/
                }else{
                    var players = near.getAttributes();
                    for (var id in players){
                        near.removeAttribute(id);
                    }
                }
            }, this);

            mapmarker.on('marker-move', function(){
                this.get('flagList').forEach(function(flag){
                    flag.forEach(function(player){
                        gps = player.get('GPSInterface');
                        if (gps){
                            fn(gps);
                        }
                    });
                });
/*                    
                if (this.watcher.getItem('AllPlayers')){
                    this.watcher.getItem('AllPlayers').forEach(function(player){
                        gps = player.get('GPSInterface');
                        if (gps){
                            fn(gps);
                        }
                    }, this);
                }*/
            }, this);

            this.watcher.getItem('AllPlayers').on('player-move', fn, this);
            
            return fn;
        },
        _unmount: function(mapmarker, fn){
            if (this.watcher.getItem('AllPlayers')){
                this.watcher.getItem('AllPlayers').off('player-move', fn);
            }
            this.get('players').removeAttribute(mapmarker.id);
            mapmarker.off('set:active', null, this);
            mapmarker.off('marker-move', null, this);
        },
        init: function(){
            if (!this.get('players')){
                this.set({
                    players: this.watcher.watch(new server.SyncedData)
                });
            }
        }
    });    
    
    server.MapMarkerTriggerNearMapMarker = server.TriggerClass.extend({
        className: 'MapMarkerTriggerNearMapMarker',
        EarthRadius: 6372795,
        deg2rad: function(deg) {
            return deg * (Math.PI/180);
        },
        calculateTheDistance: function(lat1, lng1, lat2, lng2) {
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lng2-lng1); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ; 
            return this.EarthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Distance in m
        },
        _mount: function(mapmarker, args){
            console.log('mount near to ', mapmarker.get('name'));
            
            var near = this.get('markers').get(mapmarker.id);
            if (!near){
                near = this.watcher.watch(new server.SyncedData);
                this.get('markers').setAttribute(mapmarker.id, near);
            }

            var fn = function(ev){
                if (!mapmarker.isActive()){
                    return;
                }

                var marker = ev.marker;
                if (!marker){
                    return;
                }

                if (mapmarker === marker){
                    return;
                }

                var has = false;
                this.get('flagList').forEach(function(flag){
                    if (flag.has(marker)){
                        has = true;
                        return true;
                    }
                });
                
                if (!has){
                    return;
                }
                
                var dist = this.calculateTheDistance(ev.moveto.lat, ev.moveto.lng, mapmarker.get('lat'), mapmarker.get('lng'));

                var ng = near.get(marker.id);

                console.log('distance', dist, ng, mapmarker.get('name'), marker.get('name'));

                if (ng !== true && dist <= this.get('radius')){
                    near.setAttribute(marker.id, true);

                    console.log('distance near');

//                    this.setupClass( args );
                    this.setupArg('target', mapmarker);
                    this.setupArg('arg', marker);

                    this.get('near').run(args);
                }

                if (dist > this.get('radius')){
                    //near.setAttribute(marker.id, false);
                    if (ng !== undefined){
                        near.removeAttribute(marker.id);
                    }

                    if (ng === true){
                        console.log('distance far');

//                        this.setupClass( args );
                        this.setupArg('target', mapmarker);
                        this.setupArg('arg', marker);

                        this.get('far').run(args);
                    }
                }
            }.bind(this);

            mapmarker.on('set:active', function(ev){
                if (ev.value){
                    this.get('flagList').forEach(function(flag){
                        flag.forEach(function(marker){
                            if (marker){
                                fn({
                                    marker: marker,
                                    moveto: {lat: marker.get('lat'), lng: marker.get('lng')}
                                });
                            }
                        });
                    });
                }else{
                    var markers = near.getAttributes();
                    for (var id in markers){
                        near.removeAttribute(id);
                    }
                }
            }, this);

            mapmarker.on('marker-move', function(){
                this.get('flagList').forEach(function(flag){
                    flag.forEach(function(marker){
                        if (marker){
                            fn({
                                marker: marker,
                                moveto: {lat: marker.get('lat'), lng: marker.get('lng')}
                            });
                        }
                    });
                });
            }, this);

            this.watcher.getItem('Session').on('marker-move', fn, this);
            
            return fn;
        },
        _unmount: function(mapmarker, fn){
            this.get('markers').removeAttribute(mapmarker.id);
            mapmarker.off('set:active', null, this);
            mapmarker.off('marker-move', null, this);
            if (this.watcher.getItem('Session')){
                this.watcher.getItem('Session').off('marker-move', fn);
            }
        },
        init: function(){
            if (!this.get('markers')){
                this.set({
                    markers: this.watcher.watch(new server.SyncedData)
                });
            }
        }
    });
    
    server.MapMarkerTriggerActive = server.TriggerClass.extend({
        className: 'MapMarkerTriggerActive',
        _mount: function(mapmarker, args){
            var fn = function(ev){
                if ((this.get('active')?true:false) === (ev.active?true:false)){
                    console.log('activate trigger');

//                    this.setupClass( args );
                    this.setupArg('target', mapmarker);

                    this.get('list').run(args);
                }
            };
            
            mapmarker.on('activate', fn, this);
            
            return fn;
        },
        _unmount: function(mapmarker, fn){
            mapmarker.off('activate', fn, this);
        }
    });    
    
    server.MapMarkerTriggerMove = server.TriggerClass.extend({
        className: 'MapMarkerTriggerMove',
        _mount: function(mapmarker, args){
            console.log('mount move end ', mapmarker.get('name'));
            
            var fn = function(ev){
                //console.log('move end trigger');

//                this.setupClass( args );
                this.setupArg('target', mapmarker);

                this.get('list').run(args);
            };
            
            mapmarker.on('marker-move:end', fn, this);
            
            return fn;
        },
        _unmount: function(mapmarker, fn){
            mapmarker.off('marker-move:end', fn, this);
        }
    });    
};