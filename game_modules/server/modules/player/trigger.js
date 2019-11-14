module.exports = function (server){
    server.PlayerTriggerNew = server.TriggerClass.extend({
        className: 'PlayerTriggerNew',
        _mount: function(player, args){
            var fn = function(args, ev){
                this.setupArg('classArg', player);
                
                this.get('list').run(args);
            }.bind(this, args);
                
            player.on('new-player', fn, this);
            
            return fn;
        },
        _unmount: function(player, fn){
            player.off('new-player', fn);
        },
    });

    server.PlayerTriggerJoin = server.TriggerClass.extend({
        className: 'PlayerTriggerJoin',
        _mount: function(player, args){
            var fn = function(args, ev){
                this.setupArg('classArg', player);
                
                this.get('list').run(args);
            }.bind(this, args);
                
            player.on('join-player', fn, this);
            
            return fn;
        },
        _unmount: function(player, fn){
            player.off('join-player', fn);
        },
    });

    server.PlayerTriggerQuit = server.TriggerClass.extend({
        className: 'PlayerTriggerQuit',
        _mount: function(player, args){
            var fn = function(args, ev){
                this.setupArg('classArg', player);
                
                this.get('list').run(args);
            }.bind(this, args);
                
            player.on('quit-player', fn, this);
            
            return fn;
        },
        _unmount: function(player, fn){
            player.off('quit-player', fn);
        },
    });

    server.PlayerTriggerMove = server.TriggerClass.extend({
        className: 'PlayerTriggerMove',
        _mount: function(player, args){
            console.log('mount player move');
            var fn = function(args, ev){
                console.log('trigger player move');
                
                this.setupArg('classArg', player);
                
                this.get('list').run(args);
            }.bind(this, args);
                
            player.on('player-move', fn, this);
            
            return fn;
        },
        _unmount: function(player, fn){
            player.off('player-move', fn);
        },
    });
};