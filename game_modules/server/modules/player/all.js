var zz = require('../../zz');

module.exports = function (server){
    server.AllPlayers = server.SyncedList.extend({
        className: 'AllPlayers',
        unwatch: function(item, flag){
            this.forEach(function(player){
                player.unwatch(item, flag);
            }, this);
        },
        eachWatchedPlayers: function(item, fn){
            this.watcher.afterSync(function(){
                this.forEach(function(player){
                    if (player.isWatched(item)){
                        fn(player);
                    }
                }, this);
            }.bind(this));
        },
        findPlayerByUID: function(uid){
            var collection = this.getCollection();
            
            for (var i=0; i<collection.length; i++){
                if (collection[i].get('userid') === uid){
                    return collection[i];
                }
            }
            
            return null;
        },
        registerPlayer: function(player){
            var uid = player.get('userid');
            if (this.spectator[uid]){
                this.watcher.getItem('root').remove(this.spectator[uid]);

                delete this.spectator[uid];
            }
            
            this.add([player]);
            this.callEventListener('quit-spectator', {player: player});
            player.callEventListener('quit-spectator', {player: player});
            this.callEventListener('new-player-session', {player: player});
            this.callEventListener('new-player', {player: player});
            player.callEventListener('new-player', {player: player});
            this.callEventListener('join-player', {player: player});
            player.callEventListener('join-player', {player: player});
        },
        connectPlayer: function(user, socket){
            this.playerCounter++;
            
            var userid = user.get('id');
            
            var pingInterval = setInterval(function(){
                socket.emit('ping-start', Date.now());
            }, 5000);
            socket.on('ping-pong', function(time){
                var ping = Date.now()-time;
                socket.emit('ping-end', ping);
                socket.__ping = ping;
            });
            socket.__ping = null;
            socket.emit('ping-start', Date.now());
            
            socket.on('disconnect', function(userid){
                clearInterval(pingInterval);
                
                var player = this.findPlayerByUID(userid);
                if (player){
                    this.callEventListener('quit-player', {player: player});
                    player.callEventListener('quit-player', {player: player});
                    
                    this.playerCounter--;
                }else if (this.spectator[userid]){
                    player = this.spectator[userid];
                    
                    this.callEventListener('quit-spectator', {player: player});

                    this.spectator[userid].destroy();

                    this.watcher.getItem('root').remove(player);
                    delete this.spectator[userid];
                    this.playerCounter--;
                }
            }.bind(this, userid));
            
            //is player
            var player = this.findPlayerByUID(userid);
            if (player){
                this.callEventListener('join-player', {player: player});
                player.callEventListener('join-player', {player: player});
                
                player.playerWatch().connected(socket);
                
                return;
            }
            
            //is new spectator?
            player = this.spectator[userid] = this.watcher.getItem('PlayerTemplate').create(user);

            this.watcher.getItem('root').add([player]);

            this.callEventListener('join-spectator', {player: player});

            player.playerWatch().connected(socket);
        },
        initialize:function(){
            server.SyncedList.prototype.initialize.apply(this, arguments);
            
            this.spectator = {};
            this.playerCounter = 0;
        }        
    });    
};