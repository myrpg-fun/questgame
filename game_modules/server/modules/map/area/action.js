module.exports = function (server){
    server.MapAreaSetVisibilityAction = server.ActionClass.extend({
        className: 'MapAreaSetVisibilityAction',
        run: function(){
            console.log('set maparea vision', this.get('visibility'));
            
            if (this.get('visibility') && this.get('maparea').isActive()){
                this.get('player').watch(this.get('maparea'), true);
            }else{
                this.get('player').unwatch(this.get('maparea'), true);
            }
        }
    });
    
    server.MapAreaSetActiveAction = server.ActionClass.extend({
        className: 'MapAreaSetActiveAction',
        run: function(){
            console.log('set maparea active', this.get('active'));
            
            this.get('maparea').setActive(this.get('active'));
        }
    });
    
    server.MapAreaSetCenterAction = server.ActionClass.extend({
        className: 'MapAreaSetCenterAction',
        run: function(){
            console.log('set maparea center');
            
            var coord = this.get('coord');
            
            if (coord instanceof server.MapMarker || coord instanceof server.MapMarkerCoord){
                coord = [coord.get('lat')*1, coord.get('lng')*1];
            }
            if (coord instanceof server.PlayerObject && coord.get('GPSLatLng')){
                coord = [coord.get('GPSLatLng').get('lat')*1, coord.get('GPSLatLng').get('lng')*1];
            }
            
            this.get('maparea').setCenter(coord[0], coord[1]);
        }
    });
    
    server.MapAreaSetRadiusAction = server.ActionClass.extend({
        className: 'MapAreaSetRadiusAction',
        run: function(){
            console.log('set maparea radius');
            
            var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('radius')*1;
            }
            
            this.get('maparea').setRadius( count );
        }
    });
    
    server.MapAreaSetColorAction = server.ActionClass.extend({
        className: 'MapAreaSetColorAction',
        run: function(){
            console.log('set maparea color');
            
            this.get('maparea').set({
                strokeColor: this.get('strokeColor'),
                strokeOpacity: this.get('strokeOpacity'),
                strokeWeight: this.get('strokeWeight'),
                fillColor: this.get('fillColor'),
                fillOpacity: this.get('fillOpacity'),
                invisible: this.get('invisible')
            });
        }
    });
    
    server.MapAreaSelectAction = server.ActionClass.extend({
        className: 'MapAreaSelectAction',
        run: function(){
            console.log('maparea select action');
            
            var args = Object.assign({}, args);
            
            var maparea = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                    if (player instanceof server.MapArea && maparea.indexOf(player) === -1){
                        maparea.push(player);
                    }
                }, this);
            }, this);
            
            maparea.forEach(function(player){
                this.setupArg('arg', player);
                
                this.get('action').run();
            }, this);
        }
    });
    
    server.MapAreaRandomSelectAction = server.ActionClass.extend({
        className: 'MapAreaRandomSelectAction',
        run: function(){
            console.log('maparea random select action');
            
            var args = Object.assign({}, args);
            
            var maparea = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                    if (player instanceof server.MapArea && maparea.indexOf(player) === -1){
                        maparea.push(player);
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
            }else if (countObject === null){
                count = this.get('count')*1;
            }else if (countObject === false){
                maparea.forEach(function(area){
                    this.setupArg('arg', area);

                    this.get('action').run();
                }, this);
                
                return;
            }
                
            if (count <= 0){
                count = 0;
            }
            
            if (count > maparea.length){
                count = maparea.length;
            }

            console.log(count, maparea.length);
            
            for (var i = 0; i<count; i++){
                this.setupArg('arg', maparea.splice(Math.floor(Math.random()*maparea.length), 1)[0]);
                
                this.get('action').run();
            }
        }
    });
    
    server.MapAreaTestCollectionAction = server.ActionClass.extend({
        className: 'MapAreaTestCollectionAction',
        run: function(){
            console.log('maparea test collection action');
            
            var maparea = this.get('maparea');
            var test = false;
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                if (flag.has(maparea)){
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
    
    server.MapAreaAddCollectionAction = server.ActionClass.extend({
        className: 'MapAreaAddCollectionAction',
        run: function(){
            console.log('maparea add collection action');
            
            var maparea = this.get('maparea');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                maparea.addFlag(flag);
            }, this);
        }
    });
    
    server.MapAreaRemoveCollectionAction = server.ActionClass.extend({
        className: 'MapAreaRemoveCollectionAction',
        run: function(){
            console.log('maparea add collection action');
            
            var maparea = this.get('maparea');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }

                maparea.removeFlag(flag);
            }, this);
        }
    });    
  
    server.MapAreaMarkerSelectAction = server.ActionClass.extend({
        className: 'MapAreaMarkerSelectAction',
        run: function(){
            console.log('maparea marker select action');
            
            var maparea = this.get('maparea');
            
            var mapmarker = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                    if (player instanceof server.MapMarker && mapmarker.indexOf(player) === -1){
                        if (maparea.isPointInside(player.get('lat'), player.get('lng'))){
                            mapmarker.push(player);
                        }
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
            }else if (countObject === null){
                count = this.get('count')*1;
            }else if (countObject === false){
                mapmarker.forEach(function(marker){
                    this.setupArg('arg', marker);

                    this.get('action').run();
                }, this);
                
                return;
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
    
    server.MapAreaRandomLatLngAction = server.ActionClass.extend({
        className: 'MapAreaRandomLatLngAction',
        run: function(){
            var maparea = this.get('maparea');
            
            var coord = maparea.getRandomLatLng();
            
            if (coord){
                this.get('coord').setup(coord.lat, coord.lng);
            }
            
            this.setupArg('arg', this.get('coord'));
        },
        init: function(){
            if (!this.get('coord')){
                this.set({coord: this.watcher.watch(new server.MapMarkerCoord(0, 0))});
            }
            
            this.on('destroy', function(){
                this.get('coord').destroy();
            }, this);
        }
    });
};