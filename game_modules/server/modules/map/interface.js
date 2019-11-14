module.exports = function (server){
    server.MapCoordinates = server.SyncedData.extend({
        className: 'MapCoordinates',
        wbpSent: true,
        getWatchedEvents: function(){
            return [];
        },
        init: function(){
            this.player = null;
            this.lat = null;
            this.lng = null;

            this.on('watch-player', function(ev){
                var player = ev.player;
                var watcher = player.playerWatch();
                
                watcher.listenSocket('player_coord', function(msg){
                    if (this.get('isTest') || msg.isTest === 0){
                        console.log('player move', msg);

                        msg.player = player;
                        
                        this.player = player;
                        this.lat = msg.lat;
                        this.lng = msg.lng;
                        
                        var set = {
                            lat: msg.lat,
                            lng: msg.lng,
                            isTest: msg.isTest,
                            coordAccur: msg.coordAccur,
                            timestamp: Date.now(),
                            online: 1
                        };
                        
                        var coord = player.get('GPSLatLng');
                        coord.onlineTimer = null;
                        coord.set(set);

                        set.user = player.get('userid');
                        set.ping = player.playerWatch().getPing();

                        this.watcher.getItem('Session').log('gps', set);

                        if (coord.onlineTimer){
                            clearTimeout(coord.onlineTimer);
                        }

                        coord.onlineTimer = setTimeout(function(){
                            coord.set({online: 0});
                            coord.onlineTimer = null;
                        }, 30000);
                        
                        player.callEventListener('player-move', msg);
                        this.watcher.getItem('AllPlayers').callEventListener('player-move', msg);
                    }
                }.bind(this));
            }, this);
            this.on('unwatch-player', function(ev){
                var player = ev.player;
                var watcher = player.playerWatch();
                
                this.player = null;
                this.lat = null;
                this.lng = null;
                
                watcher.unlistenSocket('player_coord');
            });
        }
    });    

    server.PlayerMapInterface = server.ActionClass.extend({
        className: 'PlayerMapInterface',
        wbpSent: true,
        mount: function(args){
            args.object.watch(this.get('map'), true);
            args.object.watch(this, true);
            args.object.watch(this.get('style'), true);
        },
        unmount: function(args){
            args.object.unwatch(this, true);
            args.object.unwatch(this.get('style'), true);
        }
    });

    server.PlayerGPSLatLng = server.SyncedData.extend({
        className: 'PlayerGPSLatLng',
        wbpSent: false,
        init: function(){
            this.set({
                lat: 0,
                lng: 0,
                timestamp: Date.now(),
                online: 0
            });
        }
    });
    
    server.PlayerGPSInterface = server.ActionClass.extend({
        className: 'PlayerGPSInterface',
        wbpSent: false,
        mount: function(args){
            if (!args.object.get('GPSInterface')){
                var GPS = this.watcher.watch(new server.MapCoordinates);
                GPS.set({isTest: args.object.isAdmin() | this.watcher.getItem('Session').isTest()});
                args.object.set({
                    GPSInterface: GPS,
                    GPSLatLng: this.watcher.watch(new server.PlayerGPSLatLng).set({player: args.object})
                });
                args.object.watch(GPS);
            }
        },
        unmount: function(args){
            if (args.object.get('GPSInterface')){
                args.object.unwatch(
                    args.object.get('GPSInterface')
                );
                args.object.set({
                    GPSInterface: null,
                    GPSLatLng: null
                });
            }
        }
    });
};