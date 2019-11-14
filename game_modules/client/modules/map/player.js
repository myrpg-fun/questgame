client.MapCoordinates = SyncedData.extend({
    className: 'MapCoordinates',
    sendPosition: function(isTest, position){
        if (!isTest){
            client.p.a = Math.round(position.coords.accuracy*100)/100;
        }
        
        client.socket.emit('player_coord', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isTest: isTest?1:0,
            coordAccur: position.coords.accuracy,
            alt: position.coords.altitude,
            altAccur: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
        });
    },
    geoError: function(error){
        switch(error.code) {
            case error.PERMISSION_DENIED:
                client.alert("Закрыт доступ к модулю GPS", "Чтобы играть в эту игру с GPS позиционированием на местности, необходимо разрешить доступ к GPS данным.", "Закрыть", "red");
                break;
            case error.POSITION_UNAVAILABLE:
                client.alert("Ошибка модуля GPS", "Информация о позиции недоступна", "Закрыть", "red");
                break;
            case error.TIMEOUT:
                client.alert("Ошибка модуля GPS", "Время ожидания ответа от модуля истекло", "Закрыть", "red");
                break;
            case error.UNKNOWN_ERROR:
                client.alert("Ошибка модуля GPS", "Неизвестная ошибка", "Закрыть", "red");
                break;
        }
    },
    init: function(session){
        var start = true;
        session.waitItem('Map', function(map){
            map.afterSync(function(){
                var center = map.getMap().getCenter();
                var test = this.get('isTest')?true:false;

                var mapMarker = new google.maps.Marker({
                    map: map.getMap(),
                    draggable: test,
                    zIndex: 1000,
                    icon: {
                        url: test?'/admin/gpslocadm.png':'/admin/gpsloc.png',
                        scaledSize: new google.maps.Size(20, 20),
                        anchor: new google.maps.Point(10, 10)
                    },
                    shape: {
                        coords: [10, 10, 10],
                        type: 'circle'
                    },
                    position: {lat: center.lat(), lng: center.lng()}
                });

                var mapCircle = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 0,
                    fillColor: test?'#FF0000':'#0000FF',
                    fillOpacity: 0.1,
                    map: map.getMap(),
                    zIndex: 0,
                    center: {lat: center.lat(), lng: center.lng()},
                    radius: 0
                });

                if (test){
                    mapMarker.addListener('dragend', function(event) {
                        center = {lat: event.latLng.lat(), lng: event.latLng.lng()};
                        mapCircle.setCenter(center);
                        this.sendPosition(true, {
                            coords:{
                                latitude: event.latLng.lat(),
                                longitude: event.latLng.lng(),
                                accuracy: 0,
                                altitude: 0,
                                altitudeAccuracy: 0,
                                heading: 0,
                                speed: 0
                            },
                            timestamp: Date.now()
                        });
                    }.bind(this));

                    this.sendPosition(true, {
                        coords:{
                            latitude: center.lat(),
                            longitude: center.lng(),
                            accuracy: 0,
                            altitude: 0,
                            altitudeAccuracy: 0,
                            heading: 0,
                            speed: 0
                        },
                        timestamp: Date.now()
                    });
                }
                
                var watchID = null;
                if (navigator.geolocation) {
                    watchID = navigator.geolocation.watchPosition(function(position){
                        center = {lat: position.coords.latitude, lng: position.coords.longitude};
                        
                        if (position.coords.accuracy < 10){
                            mapCircle.setCenter(center);
                            mapCircle.setRadius(position.coords.accuracy);
                        }else{
                            mapCircle.setCenter(center);
                            mapCircle.setRadius(0);
                        }
                        
                        mapMarker.setPosition(center);
                        if (start){
                            start = false;
                            map.getMap().setCenter(center);
                        }
                        this.sendPosition(false, position);
                    }.bind(this), this.geoError.bind(this), {
                        enableHighAccuracy: true,
                        maximumAge: 30000,
                        timeout: 27000
                    });
                }
                
                map.on('set-player-center', function(){
                    map.getMap().setCenter(center);
                }, this);

                this.on('destroy', function(){
                    mapMarker.setMap(null);
                    
                    if (navigator.geolocation && watchID){
                        navigator.geolocation.clearWatch(watchID);
                    }
                });            
            }.bind(this));
        }.bind(this));
    }
});
