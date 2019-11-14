client.Map = ActionClass.extend({
    className: 'Map',
    getSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapWindow'))
            .init('.map-window', function(DOMel){
                DOMel.append(this.mapInstance);
                google.maps.event.trigger(this.map, "resize");
                if (this.style){
                    this.style.onEffects(this.mapInstance);
                }
            }.bind(this), function(){
                if (this.style){
                    this.style.offEffects(this.mapInstance);
                }
            }.bind(this));
    },
    resize: function(){
        google.maps.event.trigger(this.map, "resize");
        
        return this;
    },
    setPlayerCenter: function(){
        this.callEventListener('set-player-center');
    },
    getMap: function(){
        return this.map;
    },
    getMarkerOverlay: function(){
        return this.markeroverlay;
    },
    setStyle: function(style){
        this.style = style;
        this.map.setOptions({styles: style.styles(), mapTypeId: style.maptype()});
        style.onEffects(this.mapInstance);
    },
    init: function(project){
        this.emptyDiv = $('<div></div>');
        this.style = null;
        
        var b = this.get('bounds');
        
        this.map = new google.maps.Map(this.emptyDiv[0], {
            zoom: 18,//this.get('zoom'),
            center: new google.maps.LatLng((b[0]+b[2])/2, (b[1]+b[3])/2),
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            styles: [
                {
                    "featureType": "poi",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                }
            ]
        });
        
        this.markeroverlay = new MarkerOverlay(this.map);
        
        this.mapInstance = this.emptyDiv.children();
        
        $(document).keyup(function(event){
            if(event.key === '-'){
                this.map.setZoom(this.map.getZoom()-1);
            }
        }.bind(this));
    }
});
