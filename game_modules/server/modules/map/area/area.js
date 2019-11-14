var earcut = require('earcut');

module.exports = function (server){
    server.MapArea = server.SyncedData.extend({
        className: 'MapArea',
        wbpSent: true,
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
        setRadius: function( radius ){
            if (radius === 0){
                radius = 0.0001;
            }
            
            var points = this.get('points');
            var lat = 0, lng = 0;
            for (var i = 0; i < points.length; i+=2){
                lat += points[i];
                lng += points[i+1];
            }
            
            lat = lat * 2 / points.length;
            lng = lng * 2 / points.length;

            var max = 0;
            for (var i = 0; i < points.length; i+=2){
                max = Math.max(max, this.calculateTheDistance(points[i], points[i+1], lat, lng));
            }
            
            max = radius / max;
            
            for (var i = 0; i < points.length; i+=2){
                points[i] = (points[i] - lat)*max+lat;
                points[i+1] = (points[i+1] - lng)*max+lng;
            }

            this.callEventListener('set', {lastValue: points, value: points});
            this.callEventListener('set:points', {lastValue: points, value: points});
        },
        _checkLine: function(lat, lng, lat1, lng1, lat2, lng2){
            if ((lat1 <= lat && lat < lat2) || (lat1 >= lat && lat > lat2)){
                if ((lng1 > lng && lng2 > lng) || 
                    (((lng1 <= lng && lng <= lng2) || 
                      (lng1 >= lng && lng >= lng2)) && 
                       (lat-lat1)*(lng2-lng1)/(lat2-lat1)+lng1 > lng)){
                    return 1;
                }
            }
            return 0;
        },
        isPointInside: function(lat, lng) {
            var count = 0;
            var points = this.get('points');
            for (var i = 0; i<points.length-2; i+=2){
                count = count ^ this._checkLine(lat, lng, points[i], points[i+1], points[i+2], points[i+3]);
            }
            count = count ^ this._checkLine(lat, lng, points[0], points[1], points[i], points[i+1]);
            
            return count?true:false;
        },
        setCenter: function(lat0, lng0){
            var points = this.get('points');
            var lat = 0, lng = 0;
            for (var i = 0; i < points.length; i+=2){
                lat += points[i];
                lng += points[i+1];
            }
            
            lat0 -= lat * 2 / points.length;
            lng0 -= lng * 2 / points.length;
            
            for (var i = 0; i < points.length; i+=2){
                points[i] += lat0;
                points[i+1] += lng0;
            }
            
            this.callEventListener('set', {lastValue: points, value: points});
            this.callEventListener('set:points', {lastValue: points, value: points});
        },
        _getRandomCoord3: function(lat1, lng1, lat2, lng2, lat3, lng3){
            var u = Math.random(), v = Math.random();
            
            if (v > 1-u){
                u = 1-u;
                v = 1-v;
            }
            
            return {
                lat: lat1 + u*(lat2 - lat1) + v*(lat3 - lat1),
                lng: lng1 + u*(lng2 - lng1) + v*(lng3 - lng1)
            };
        },
        getRandomLatLng: function(){
            var p = this.get('points');
            var trs = earcut( p );
            
            var sum = 0;
            var idx = [];
            for (var i = 0; i < trs.length; i+=3){
                var ax = p[trs[i]*2];
                var ay = p[trs[i]*2+1];
                var bx = p[trs[i+1]*2];
                var by = p[trs[i+1]*2+1];
                var cx = p[trs[i+2]*2];
                var cy = p[trs[i+2]*2+1];
                sum += (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
                idx.push(sum);
            }
            
            var u = Math.random()*sum;
            
            console.log(idx, u, sum);
            
            for (var i = 0; i < idx.length; i++){
                if (u <= idx[i]){
                    return this._getRandomCoord3(
                        p[trs[i*3]*2], p[trs[i*3]*2+1],
                        p[trs[i*3+1]*2], p[trs[i*3+1]*2+1],
                        p[trs[i*3+2]*2], p[trs[i*3+2]*2+1]
                    );
                }
            }
            
            return null;
        },
        setActive: function(active){
            this.set({
                active: active?1:0
            });
        },
        isActive: function(){
            return this.get('active');
        },
        addFlag: function(flag){
            var flagList = this.get('flagList');
            
            if (flag instanceof server.FlagGroupClass && !flagList.has(flag)){
                flagList.add([flag]);
                flag.add([this]);
            }
        },
        removeFlag: function(flag){
            this.get('flagList').remove(flag);
            flag.remove(this);
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            this.on('set:triggerList', function(ev){
                var tl = this.get('triggerList');
                tl.mount({target: this});
            }, this);
            
            this.on('set:active', function(ev){
                if (typeof ev.lastValue !== 'undefined'){
                    this.callEventListener('activate', {target: this, active: ev.value});
                    
                    if (!ev.value){
                        console.log('hide marker');
                        this.watcher.getItem('AllPlayers').unwatch(this, true);
                    }
                }
            }, this);
            
            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new server.FlagCollectionList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);
        }
    });    
    
    server.MapCircleArea = server.MapArea.extend({
        className: 'MapCircleArea',
        wbpSent: true,
        isPointInside: function(lat, lng) {
            var dist = this.calculateTheDistance(lat, lng, this.get('lat'), this.get('lng'));
            
            return (dist <= this.get('radius'))?true:false;
        },
        setRadius: function(radius){
            this.set({
                radius: radius
            });
        },
        setCenter: function(lat0, lng0){
            this.set({
                lat: lat0,
                lng: lng0
            });
        },
        getRandomLatLng: function() {
            var lat = this.get('lat'), lng = this.get('lng'), max = this.get('radius');
            
            var dLat = 180/(this.EarthRadius*Math.PI);
            var dLon = 180/(this.EarthRadius*Math.PI*Math.cos(this.deg2rad(lat)));
            
            var radius = Math.random()*(max);
            var ang = Math.random()*Math.PI*2;
            
            return {
                lat: radius*Math.cos(ang)*dLat+lat,
                lng: radius*Math.sin(ang)*dLon+lng
            };
        }        
  });    
};