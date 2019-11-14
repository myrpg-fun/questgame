client.MapArea = ActionClass.extend({
    className: 'MapArea',
    getMapArea: function(){
        return this.mapArea;
    },
    getPath: function(){
        var result = [];
        var points = this.get('points');
        
        for (var i=0; i<points.length; i=i+2){
            result.push(new google.maps.LatLng(points[i], points[i+1]));
        }
        
        return result;
    },
    createMapArea: function(map){
        map.afterSync(function(){
            this.mapArea = new google.maps.Polygon({
                paths: this.getPath(),
                editable: false,
                draggable: false,
                strokeColor: this.get('strokeColor'),
                strokeOpacity: 0,
                strokeWeight: this.get('strokeWeight'),
                fillColor: this.get('fillColor'),
                fillOpacity: 0,
                map: map.getMap()
            });

            var opacity = 0;
            
            this.on('set:strokeColor', function(ev){
                this.mapArea.setOptions({strokeColor: ev.value});
            }, this);
            
            this.on('set:strokeOpacity', function(ev){
                if (this.get('invisible') === 0){
                    this.mapArea.setOptions({strokeOpacity: ev.value*opacity});
                }
            }, this);
            
            this.on('set:strokeWeight', function(ev){
                this.mapArea.setOptions({strokeWeight: ev.value});
            }, this);
            
            this.on('set:fillColor', function(ev){
                this.mapArea.setOptions({fillColor: ev.value});
            }, this);
            
            this.on('set:fillOpacity', function(ev){
                if (this.get('invisible') === 0){
                    this.mapArea.setOptions({fillOpacity: ev.value*opacity});
                }
            }, this);

            this.on('set:invisible', function(ev){
                if (ev.value){
                    this.mapArea.setOptions({
                        strokeOpacity: 0, 
                        fillOpacity: 0
                    });
                }else{
                    this.mapArea.setOptions({
                        strokeOpacity: this.get('strokeOpacity'), 
                        fillOpacity: this.get('fillOpacity')
                    });
                }
            }, this);

            this.on('set:points', function(ev){
                this.mapArea.setPaths(this.getPath());
            });            
            
            var timer = 10;
            var speed = 0.05;
            var anint = window.setInterval(function(){
                opacity += speed;
                if (opacity >= 1){
                    opacity = 1;
                    window.clearInterval(anint);
                }
                
                if (this.get('invisible') === 0){
                    this.mapArea.setOptions({
                        strokeOpacity: opacity * this.get('strokeOpacity'), 
                        fillOpacity: opacity * this.get('fillOpacity')
                    });
                }
            }.bind(this), timer);

            this.on('destroy', function(){
                var opacity = 1;
                window.clearInterval(anint);
                var anint = window.setInterval(function(){
                    opacity -= speed;
                    if (opacity <= 0){
                        this.mapArea.setMap(null);
                        window.clearInterval(anint);
                        opacity = 0;
                    }
                
                    if (this.get('invisible') === 0){
                        this.mapArea.setOptions({
                            strokeOpacity: opacity * this.get('strokeOpacity'), 
                            fillOpacity: opacity * this.get('fillOpacity')
                        });
                    }
                }.bind(this), timer);
            });
        }.bind(this));
    },
    init: function(player){
        this.on('set:map', function(){
            this.createMapArea( this.get('map') );
        }, this);
        
        /*this.get('triggerList').afterSync(function(){
            this.get('triggerList').mount({mapmarker: this});
        }.bind(this));*/
    }
});

client.MapCircleArea = ActionClass.extend({
    className: 'MapCircleArea',
    getMapArea: function(){
        return this.mapArea;
    },
    createMapArea: function(map){
        map.afterSync(function(){
            this.mapArea = new google.maps.Circle({
                center: {lat: this.get('lat'), lng: this.get('lng')},
                radius: this.get('radius'),
                editable: false,
                draggable: false,
                strokeColor: this.get('strokeColor'),
                strokeOpacity: 0,
                strokeWeight: this.get('strokeWeight'),
                fillColor: this.get('fillColor'),
                fillOpacity: 0,
                map: map.getMap()
            });

            var opacity = 0;
            
            this.on('set:strokeColor', function(ev){
                this.mapArea.setOptions({strokeColor: ev.value});
            }, this);
            
            this.on('set:strokeOpacity', function(ev){
                if (this.get('invisible') === 0){
                    this.mapArea.setOptions({strokeOpacity: ev.value*opacity});
                }
            }, this);
            
            this.on('set:strokeWeight', function(ev){
                this.mapArea.setOptions({strokeWeight: ev.value});
            }, this);
            
            this.on('set:fillColor', function(ev){
                this.mapArea.setOptions({fillColor: ev.value});
            }, this);
            
            this.on('set:fillOpacity', function(ev){
                if (this.get('invisible') === 0){
                    this.mapArea.setOptions({fillOpacity: ev.value*opacity});
                }
            }, this);

            this.on('set:invisible', function(ev){
                if (ev.value){
                    this.mapArea.setOptions({
                        strokeOpacity: 0, 
                        fillOpacity: 0
                    });
                }else{
                    this.mapArea.setOptions({
                        strokeOpacity: this.get('strokeOpacity'), 
                        fillOpacity: this.get('fillOpacity')
                    });
                }
            }, this);

            this.addEventListener('set:lat', function(event){
                this.mapArea.setCenter(
                    new google.maps.LatLng(event.value, this.get('lng')*1)
                );
            }.bind(this));

            this.addEventListener('set:lng', function(event){
                this.mapArea.setCenter(
                    new google.maps.LatLng(this.get('lat')*1, event.value)
                );
            }.bind(this));
            
            this.addEventListener('set:radius', function(event){
                this.mapArea.setRadius(
                    event.value
                );
            }.bind(this));
            
            var timer = 10;
            var speed = 0.05;
            var anint = window.setInterval(function(){
                opacity += speed;
                if (opacity >= 1){
                    opacity = 1;
                    window.clearInterval(anint);
                }
                
                if (this.get('invisible') === 0){
                    this.mapArea.setOptions({
                        strokeOpacity: opacity * this.get('strokeOpacity'), 
                        fillOpacity: opacity * this.get('fillOpacity')
                    });
                }
            }.bind(this), timer);

            this.on('destroy', function(){
                var opacity = 1;
                window.clearInterval(anint);
                var anint = window.setInterval(function(){
                    opacity -= speed;
                    if (opacity <= 0){
                        this.mapArea.setMap(null);
                        window.clearInterval(anint);
                        opacity = 0;
                    }
                
                    if (this.get('invisible') === 0){
                        this.mapArea.setOptions({
                            strokeOpacity: opacity * this.get('strokeOpacity'), 
                            fillOpacity: opacity * this.get('fillOpacity')
                        });
                    }
                }.bind(this), timer);
            });
        }.bind(this));
    },
    init: function(player){
        this.on('set:map', function(){
            this.createMapArea( this.get('map') );
        }, this);
        
        /*this.get('triggerList').afterSync(function(){
            this.get('triggerList').mount({mapmarker: this});
        }.bind(this));*/
    }
});