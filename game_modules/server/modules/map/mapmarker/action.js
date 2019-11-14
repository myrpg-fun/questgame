var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var googleMapsPolyline = require('@mapbox/polyline');

/*var googleMaps = require('@google/maps').createClient({
  key: config.googleserverkey
});*/

const https = require('https');

function getDirection(options, cb){
    var lng0 = options.origin.lat;
    var lat0 = options.origin.lng;
    var lng1 = options.destination.lat;
    var lat1 = options.destination.lng;
    var mode = options.mode?options.mode:'driving-car';
    
    var url = 'https://api.openrouteservice.org/directions?api_key=58d904a497c67e00015b45fc65873126f9ab41b387df9d46bb23dcd5&coordinates='+lat0+'%2C'+lng0+'%7C'+lat1+'%2C'+lng1+'&profile='+mode;//&geometry_format=polyline';

    https.get(url, (res) => {
        var data = '';
        res.on('data', (d) => {
            data += d;
          //process.stdout.write(d);
        });

        if (res.statusCode === 200){
            res.on('end', () => {
                var routes = JSON.parse(data);
            /*          console.log(routes);
                console.log();*/

                var points = googleMapsPolyline.decode(routes.routes[0].geometry);

                cb(null, points);
              //process.stdout.write(d);
            });
        }else{
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            res.on('end', () => {
                console.log(url);
                process.stdout.write(data);
            });
        }
    }).on('error', (e) => {
        console.warn(url, data);
        console.error(e);
        cb(e);
    });
}

/*getDirection({
    origin: {lat:56.00519563048683, lng: 37.21264743174913},
    destination: {lat: 55.99780454698597, lng: 37.23292493190172}
});*/

module.exports = function (server){
    server.MapMarkerSetVisibilityAction = server.ActionClass.extend({
        className: 'MapMarkerSetVisibilityAction',
        run: function(){
            console.log('set mapmarker vision', this.get('visibility'), this.get('mapmarker').get('name'));
            
            if (this.get('visibility') && this.get('mapmarker').isActive()){
                this.get('player').watch(this.get('mapmarker'), true);
            }else{
                this.get('player').unwatch(this.get('mapmarker'), true);
            }
        }
    });
    
    server.MapMarkerSetActiveAction = server.ActionClass.extend({
        className: 'MapMarkerSetActiveAction',
        run: function(){
            console.log('set mapmarker active', this.get('active'));
            
            this.get('mapmarker').setActive(this.get('active'));
        }
    });
    
    server.MapMarkerSetIconAction = server.ActionClass.extend({
        className: 'MapMarkerSetIconAction',
        run: function(){
            var icon = this.get('icon');
            
            if (this.get('add')){
                console.log('set mapmarker add icon');
                this.get('mapmarker').addIcon(icon);
            }else{
                console.log('set mapmarker set icon');
                this.get('mapmarker').setIcon(icon);
            }
        }
    });
    
    server.MapMarkerRemoveIconAction = server.ActionClass.extend({
        className: 'MapMarkerRemoveIconAction',
        run: function(){
            var icon = this.get('icon');
            
            console.log('remove mapmarker icon');
            this.get('mapmarker').removeIcon(icon);
        }
    });
    
    server.MapMarkerSelectAction = server.ActionClass.extend({
        className: 'MapMarkerSelectAction',
        run: function(){
            console.log('mapmarker select action');
            
            var mapmarker = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                    if (player instanceof server.MapMarker && mapmarker.indexOf(player) === -1){
                        mapmarker.push(player);
                    }
                }, this);
            }, this);
            
            mapmarker.forEach(function(player){
                this.setupArg('arg', player);
                
                this.get('action').run();
            }, this);
        }
    });
    
    server.MapMarkerRandomSelectAction = server.ActionClass.extend({
        className: 'MapMarkerRandomSelectAction',
        run: function(){
            console.log('mapmarker random select action');
            
            var mapmarker = [];
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(player){
                    if (player instanceof server.MapMarker && mapmarker.indexOf(player) === -1){
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
    
    server.MapMarkerTestCollectionAction = server.ActionClass.extend({
        className: 'MapMarkerTestCollectionAction',
        run: function(){
            console.log('mapmarker test collection action');
            
            var mapmarker = this.get('mapmarker');
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
    
    server.MapMarkerAddCollectionAction = server.ActionClass.extend({
        className: 'MapMarkerAddCollectionAction',
        run: function(args){
            console.log('mapmarker add collection action');
            
            var mapmarker = this.get('mapmarker');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                mapmarker.addFlag(flag);
            }, this);
        }
    });
    
    server.MapMarkerRemoveCollectionAction = server.ActionClass.extend({
        className: 'MapMarkerRemoveCollectionAction',
        run: function(){
            console.log('mapmarker remove collection action');
            
            var mapmarker = this.get('mapmarker');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }

                mapmarker.removeFlag(flag);
            }, this);
        }
    });

    server.MapMarkerMoveAction = server.ActionClass.extend({
        className: 'MapMarkerMoveAction',
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
        moveDirections: function(mapmarker, lat, lng, distance, time, rotate, mode){
            if (!this.__cache){
                this.__cache = {};
            }

            var update = false;
            if (!this.__cache[mapmarker.id]){
                this.__cache[mapmarker.id] = {
//                    timeout: Date.now() - 1,
                    points: [],
                    to: [lat, lng],
                    last: [lat, lng]
                };
                update = true;
            }
            
            this.__cache[mapmarker.id].last[0] = lat;
            this.__cache[mapmarker.id].last[1] = lng;
            
            var d = this.calculateTheDistance(lat, lng, this.__cache[mapmarker.id].to[0], this.__cache[mapmarker.id].to[1]);
            
            if (d > 50 || update){
                this.__cache[mapmarker.id].to = [lat, lng];
                
                console.warn('maps update directions', d, update);
                    
                getDirection({
                    origin: {
                      "lat" : mapmarker.get('lat')*1,
                      "lng" : mapmarker.get('lng')*1
                    },
                    destination: {
                      "lat" : lat,
                      "lng" : lng
                    },
                    mode: mode.toLowerCase()
                }, function(err, points) {
                    if (err === null){
                        this.__cache[mapmarker.id].points = points;
                
                        //this.__cache[mapmarker.id].points.shift();
                        this.__cache[mapmarker.id].points.push(this.__cache[mapmarker.id].last);
                        
//                        console.log(this.__cache[mapmarker.id].points);
                        
                        mapmarker.startMove(this.__cache[mapmarker.id].points[0][0], this.__cache[mapmarker.id].points[0][1], distance, time, rotate);
                    }
                }.bind(this));
            }else{
                if (this.__cache[mapmarker.id].points.length === 0){
                    this.__cache[mapmarker.id].points.push( this.__cache[mapmarker.id].last );
                    this.__cache[mapmarker.id].to = [lat, lng];
                }
                
                if (mapmarker.get('lat') === this.__cache[mapmarker.id].points[0][0] && mapmarker.get('lng') === this.__cache[mapmarker.id].points[0][1]){
                    this.__cache[mapmarker.id].points.shift();
                }

                if (this.__cache[mapmarker.id].points.length > 0){
                    mapmarker.startMove(this.__cache[mapmarker.id].points[0][0], this.__cache[mapmarker.id].points[0][1], distance, time, rotate);
                }
            }
        },
        run: function(){
            console.log('mapmarker move action');

//            this.watcher.getItem('Session').timeStatStart('move action');

            var mapmarker = this.get('mapmarker');
            var coord = this.get('coord');
            
            if (coord instanceof server.MapMarker || coord instanceof server.MapMarkerCoord){
                coord = [coord.get('lat')*1, coord.get('lng')*1];
            }
            if (coord instanceof server.PlayerObject && coord.get('GPSLatLng')){
                coord = [coord.get('GPSLatLng').get('lat')*1, coord.get('GPSLatLng').get('lng')*1];
            }
            
            var time = this.get('time')*1000;
            var distance = 0;
            var fdistObject = this.get('fdistance');
            
            if (fdistObject){
                if (fdistObject instanceof server.Counter){
                    distance = fdistObject.getCount();
                }
            }else{
                distance = this.get('distance')*1;
            }
        
            if (this.get('mode') === 'direct'){
                mapmarker.startMove(coord[0], coord[1], distance, time, this.get('rotate'));
            }else{
                this.moveDirections(mapmarker, coord[0], coord[1], distance, time, this.get('rotate'), this.get('mode'));
            }
//            this.watcher.getItem('Session').timeStatEnd();
        }
    });
    
    server.MapMarkerRotateAction = server.ActionClass.extend({
        className: 'MapMarkerRotateAction',
        run: function(){
            console.log('mapmarker rotate action');
            
            var mapmarker = this.get('mapmarker');
            var coord = this.get('coord');
            
            if (coord instanceof server.MapMarker || coord instanceof server.MapMarkerCoord){
                coord = [coord.get('lat')*1, coord.get('lng')*1];
            }
            if (coord instanceof server.PlayerObject && coord.get('GPSLatLng')){
                coord = [coord.get('GPSLatLng').get('lat')*1, coord.get('GPSLatLng').get('lng')*1];
            }
            
            mapmarker.rotateTo(coord[0], coord[1]);
        }
    });
    
    server.MapMarkerDistanceAction = server.ActionClass.extend({
        className: 'MapMarkerDistanceAction',
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
        run: function(){
            console.log('mapmarker distance action');
  
            var mapmarker = this.get('mapmarker');
            if (mapmarker instanceof server.MapMarker || mapmarker instanceof server.MapMarkerCoord){
                mapmarker = [mapmarker.get('lat')*1, mapmarker.get('lng')*1];
            }
            if (mapmarker instanceof server.PlayerObject && mapmarker.get('GPSLatLng')){
                mapmarker = [mapmarker.get('GPSLatLng').get('lat')*1, mapmarker.get('GPSLatLng').get('lng')*1];
            }
            
            var coord = this.get('coord');
            
            if (coord instanceof server.MapMarker || coord instanceof server.MapMarkerCoord){
                coord = [coord.get('lat')*1, coord.get('lng')*1];
            }
            if (coord instanceof server.PlayerObject && coord.get('GPSLatLng')){
                coord = [coord.get('GPSLatLng').get('lat')*1, coord.get('GPSLatLng').get('lng')*1];
            }
            
            var distance = this.calculateTheDistance(mapmarker[0], mapmarker[1], coord[0], coord[1]);
            
            var tmpCounter = this.get('distance');
            if (!tmpCounter){
                tmpCounter = this.watcher.watch(new server.Counter(distance));
                this.set('distance', tmpCounter);
            }else{
                tmpCounter.setup(distance);
            }
            
            this.setupArg('arg', tmpCounter);
        }
    });
    
    server.MapMarkerGetRadiusCoordAction = server.ActionClass.extend({
        className: 'MapMarkerGetRadiusCoordAction',
        EarthRadius: 6372795,
        deg2rad: function(deg) {
            return deg * (Math.PI/180);
        },
        calculateRandom: function(lat, lng, min, max) {
            var dLat = 180/(this.EarthRadius*Math.PI);
            var dLon = 180/(this.EarthRadius*Math.PI*Math.cos(this.deg2rad(lat)));
            
            var radius = Math.random()*(max-min)+min;
            var ang = Math.random()*Math.PI*2;
            
            //console.log(radius*Math.cos(ang)*dLat, radius*Math.sin(ang)*dLon);
            
            return [
                radius*Math.cos(ang)*dLat+lat,
                radius*Math.sin(ang)*dLon+lng
            ];
        },
        run: function(){
//            console.log('mapmarker get random radius coord action');
            var mapmarker = this.get('mapmarker');
            if (mapmarker instanceof server.MapMarker || mapmarker instanceof server.MapMarkerCoord){
                mapmarker = [mapmarker.get('lat')*1, mapmarker.get('lng')*1];
            }
            if (mapmarker instanceof server.PlayerObject && mapmarker.get('GPSLatLng')){
                mapmarker = [mapmarker.get('GPSLatLng').get('lat')*1, mapmarker.get('GPSLatLng').get('lng')*1];
            }
            
            var countObject = this.get('maxObject'), max, min;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    max = countObject.getCount();
                }
            }else{
                max = this.get('max')*1;
            }
            
            var countObject = this.get('minObject');
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    min = countObject.getCount();
                }
            }else{
                min = this.get('min')*1;
            }
            
            var coord = this.calculateRandom(mapmarker[0], mapmarker[1], min, max);
            
            this.get('coord').setup(coord[0], coord[1]);
            
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
    
    server.MapMarkerGetRadiusMarkerAction = server.ActionClass.extend({
        className: 'MapMarkerGetRadiusMarkerAction',
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
        run: function(){
            console.log('mapmarker get radius action');
            
            var markers = [];
            
            var mapmarker = this.get('mapmarker');
            var selfmarker = mapmarker;
            if (mapmarker instanceof server.MapMarker || mapmarker instanceof server.MapMarkerCoord){
                mapmarker = [mapmarker.get('lat')*1, mapmarker.get('lng')*1];
            }
            if (mapmarker instanceof server.PlayerObject && mapmarker.get('GPSLatLng')){
                mapmarker = [mapmarker.get('GPSLatLng').get('lat')*1, mapmarker.get('GPSLatLng').get('lng')*1];
            }
            
            var countObject = this.get('maxObject'), radius;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    radius = countObject.getCount();
                }
            }else{
                radius = this.get('max')*1;
            }
            
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                flag.getCollection().forEach(function(mm){
                    if (mm instanceof server.MapMarker && mm !== selfmarker && markers.indexOf(mm) === -1){
                        var dist = this.calculateTheDistance(mapmarker[0], mapmarker[1], mm.get('lat'), mm.get('lng'));
                        if (dist <= radius){
                            markers.push(mm);
                        }
                    }
                }, this);
            }, this);
            
            markers.forEach(function(mm){
                this.setupArg('arg', mm);
                
                this.get('action').run();
            }, this);
        }
    });
};