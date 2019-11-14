module.exports = function (server){
    server.PlayerSelectAction = server.ActionClass.extend({
        className: 'PlayerSelectAction',
        run: function(){
            console.log('player select action');
            
            var players = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                    if (player instanceof server.PlayerObject && players.indexOf(player) === -1){
                        players.push(player);
                    }
                }, this);
            }, this);
            
            players.forEach(function(player){
                this.setupArg('arg', player);
                
                this.get('action').run();
            }, this);
        }
    });
    
    server.PlayerRandomSelectAction = server.ActionClass.extend({
        className: 'PlayerRandomSelectAction',
        run: function(){
            console.log('player random select action');
            
            var mapmarker = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                        if (player instanceof server.PlayerObject && mapmarker.indexOf(player) === -1){
                        mapmarker.push(player);
                    }
                }, this);
            }, this);
            
            var countObject = this.get('countObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('count')*1;
            }
            
            if (count <= 0){
                count = 0;
            }
            
            if (count > mapmarker.length){
                count = mapmarker.length;
            }

            console.log(count, mapmarker.length);
            
            for (var i = 0; i<count; i++){
                this.setupArg('arg', mapmarker.splice(Math.floor(Math.random()*mapmarker.length), 1)[0]);
                
                this.get('action').run();
            }
        }
    });
    
    server.PlayerTestCollectionAction = server.ActionClass.extend({
        className: 'PlayerTestCollectionAction',
        run: function(){
            console.log('player test collection action');
            
            var mapmarker = this.get('player');
            var test = false;
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                if (flag.has(mapmarker)){
                    test = true;
                    return true;
                }
            }, this);
            
            if (test){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });
    
    server.PlayerAddCollectionAction = server.ActionClass.extend({
        className: 'PlayerAddCollectionAction',
        run: function(){
            console.log('player add collection action');
            
            var mapmarker = this.get('player');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                mapmarker.addFlag(flag);
            }, this);
        }
    });
    
    server.PlayerRemoveCollectionAction = server.ActionClass.extend({
        className: 'PlayerRemoveCollectionAction',
        run: function(){
            console.log('player add collection action');
            
            var mapmarker = this.get('player');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }

                mapmarker.removeFlag(flag);
            }, this);
        }
    });    
};