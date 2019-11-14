function MapMarker(point, image, rotate, opacity, size) {
    // Initialize all properties.
    this.point_ = point;
    this.image_ = Array.isArray(image)?image:[image];
    this.rotate_ = rotate;
    this.opacity_ = opacity;
    this.size_ = size;
    this.icontimer_ = [];
    this.click_ = function(){};

    this.overlay_ = null;
    this.div_ = null;
    this.img_ = null;
};

MapMarker.prototype.setRotate = function(deg) {
    this.rotate_ = deg;
    if (this.img_){
        var img = this.img_;
        img.style.webkitTransform = 'rotate('+deg+'deg)'; 
        img.style.mozTransform    = 'rotate('+deg+'deg)'; 
        img.style.msTransform     = 'rotate('+deg+'deg)'; 
        img.style.oTransform      = 'rotate('+deg+'deg)'; 
        img.style.transform       = 'rotate('+deg+'deg)';   
    }
};

MapMarker.prototype.setImage = function(image) {
    this.image_ = Array.isArray(image)?image:[image];
    if (this.img_){
        this.icontimer_.forEach(function(r){
            window.clearInterval(r);
        });
        this.icontimer_ = [];
        
        //this.img_.src = image;
        this.img_.innerHTML = '';
        this.image_.forEach(function(icon){
/*            var img = document.createElement('img');
            img.src = im.replace(/upload\/([\w.-]+)$/gi, (this.size_ <= 48)?"resize/96/$1":"resize/192/$1");*/
            var img = document.createElement('div');
            if (icon instanceof client.MapMarkerIcon){
                img.style.backgroundImage = 'url('+icon.get('url').replace(/upload\/([\w.-]+)$/gi, (this.size_ <= 48)?"resize/96/$1":"resize/192/$1")+')';
                img.style.backgroundPosition = '0px 0px';
                img.style.backgroundSize = '100% '+Math.floor(icon.get('height')*100/icon.get('width'))+'%';
            }else{
                console.error('no icon for mapmarker');
                return;
            }
            img.style.top = '0px';
            img.style.left = '0px';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.position = 'absolute';
            
            this.icontimer_.push(icon.startAnimation($(img)));

            this.img_.appendChild(img);
        }, this);
    }
};

MapMarker.prototype.setOpacity = function(opacity) {
    this.opacity_ = opacity;
    if (this.div_){
        this.img_.style.opacity = opacity;
    }
};

MapMarker.prototype.setPosition = function(point) {
    this.point_ = point;
    if (this.overlay_){
        var _p = this.overlay_.getProjection();
        if (_p){
            var sw = _p.fromLatLngToDivPixel(this.point_);

            var div = this.div_;
            if (div){
                div.style.left = sw.x + 'px';
                div.style.top = sw.y + 'px';
                div.style.zIndex = Math.round(sw.y);
            }

            var div = this.img_;
            if (div){
                div.style.left = sw.x + 'px';
                div.style.top = sw.y + 'px';
                div.style.zIndex = Math.round(sw.y);
            }
        }
    }
};

MapMarker.prototype.onClick = function(click) {
    if (click){
        this.div_.style.display = 'block';
        this.click_ = click;
    }else{
        this.div_.style.display = 'none';
    }
};

MapMarker.prototype.setOverlay = function(overlay) {
    if (this.overlay_ !== null){
        this.overlay_.removeMarker(this);
        
        $(this.img_).unbind('click');
        this.div_ = null;
        this.img_ = null;
        
        this.icontimer_.forEach(function(r){
            window.clearInterval(r);
        });
        this.icontimer_ = [];
    }
    
    if (overlay !== null){
        this.overlay_ = overlay;
        
        var div = document.createElement('div');
        div.style.width = this.size_+'px';
        div.style.height = this.size_+'px';
        div.style.marginTop = -this.size_/2+'px';
        div.style.marginLeft = -this.size_/2+'px';
        div.style.position = 'absolute';
        div.style.cursor = 'pointer';
        div.style.borderRadius = this.size_+'px';
        div.style.display = 'none';

        // Create the img element and attach it to the div.
        var deg = this.rotate_;
        var imgdiv = document.createElement('div');
        imgdiv.style.opacity = this.opacity_;
        imgdiv.style.width = this.size_+'px';
        imgdiv.style.height = this.size_+'px';
        imgdiv.style.marginTop = -this.size_/2+'px';
        imgdiv.style.marginLeft = -this.size_/2+'px';
        imgdiv.style.position = 'absolute';
        imgdiv.style.webkitTransform = 'rotate('+deg+'deg)';
        imgdiv.style.mozTransform    = 'rotate('+deg+'deg)';
        imgdiv.style.msTransform     = 'rotate('+deg+'deg)';
        imgdiv.style.oTransform      = 'rotate('+deg+'deg)';
        imgdiv.style.transform       = 'rotate('+deg+'deg)';
        
        this.div_ = div;
        this.img_ = imgdiv;

        this.setImage(this.image_);
        
        overlay.addMarker(this);
        
        google.maps.event.addDomListener(div, 'click', function() {
            this.click_();
        }.bind(this));
    }
};

MapMarker.prototype.draw = function(overlayProjection) {
    var p = overlayProjection.fromLatLngToDivPixel(this.point_);
    
    var div = this.img_;
    div.style.top = p.y+'px';
    div.style.left = p.x+'px';
    div.style.zIndex = Math.round(p.y);
    
    var div = this.div_;
    div.style.top = p.y+'px';
    div.style.left = p.x+'px';
    div.style.zIndex = Math.round(p.y);
};

function MarkerOverlay(map) {
    this.map_ = map;

    this.div_ = null;
    this.mt_ = null;
    this.point_ = new google.maps.LatLng(0, 0);
    
    this.markers_ = [];

    // Explicitly call setMap on this overlay.
    this.setMap(map);
};

MarkerOverlay.prototype = new google.maps.OverlayView();

MarkerOverlay.prototype.addMarker = function(marker) {
    if (this.markers_.indexOf(marker) === -1){
        this.markers_.push(marker);

        if (this.div_){
            if (marker.img_){
                this.div_.appendChild(marker.img_);
            }
            if (marker.div_){
                this.mt_.appendChild(marker.div_);
            }
            marker.draw(this.getProjection());
        }
    }
    
    console.log('addmarker', this.markers_.length);
};

MarkerOverlay.prototype.removeMarker = function(marker) {
    var key = this.markers_.indexOf(marker);
    if (key !== -1){
        this.markers_.splice(key, 1);

        if (this.div_){
            if (marker.img_){
                this.div_.removeChild(marker.img_);
            }
            if (marker.div_){
                this.mt_.removeChild(marker.div_);
            }
        }
    }
    
    console.log('removemarker', this.markers_.length);
};

MarkerOverlay.prototype.onAdd = function() {
    var div = document.createElement('div');
    div.style.border = 'none';
    div.style.zIndex = 50;
    div.style.position = 'absolute';
    div.style.left = '0px';
    div.style.top = '0px';

    this.div_ = div;
    
    var mt = document.createElement('div');
    mt.style.border = 'none';
    mt.style.zIndex = 50;
    mt.style.position = 'absolute';
    mt.style.left = '0px';
    mt.style.top = '0px';

    this.mt_ = mt;
    
    var overlayProjection = this.getProjection();

    this.markers_.forEach(function(marker){
        if (marker.img_){
            div.appendChild(marker.img_);
        }
        if (marker.div_){
            mt.appendChild(marker.div_);
        }
        marker.draw(overlayProjection);
    }, this);

    var panes = this.getPanes();
    panes.markerLayer.appendChild(div);
    panes.overlayMouseTarget.appendChild(mt);
};

MarkerOverlay.prototype.draw = function() {
    var overlayProjection = this.getProjection();

    this.markers_.forEach(function(marker){
        marker.draw(overlayProjection);
    }, this);
};

MarkerOverlay.prototype.onRemove = function() {
    this.markers_.forEach(function(marker){
        if (marker.img_){
            this.div_.removeChild(marker.img_);
        }
        if (marker.div_){
            this.mt_.removeChild(marker.div_);
        }
    }, this);

    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;

    this.mt_.parentNode.removeChild(this.mt_);
    this.mt_ = null;
};

var MapMarkerStep = 3;

client.MapMarker = ActionClass.extend({
    className: 'MapMarker',
    getMapMarker: function(){
        return this.mapMarker;
    },
    setRotate: function(){
        var rotate = Math.floor(1*this.get('rotate')) % 360;
        
        if (rotate !== this.rotateTo){
            if (rotate - 180 > this.rotateTo){
                this.rotateTo += 360;
            }
            
            if (rotate < this.rotateTo - 180){
                this.rotateTo -= 360;
            }
            
            if (rotate < this.rotateTo){
                this.rotateTo -= MapMarkerStep;
            }
            
            if (rotate > this.rotateTo){
                this.rotateTo += MapMarkerStep;
            }
            
            if (Math.abs(rotate - this.rotateTo) < MapMarkerStep){
                this.rotateTo = rotate;
            }
            
            this.rotateTo = Math.floor(this.rotateTo);
            
            this.mapMarker.setRotate(this.rotateTo);
            
            client.setTimeout(this.setRotate.bind(this), 10);
        }
    },
    createMapMarker: function(map){
        var timer = 10;
        var speed = 0.05;
        
        map.afterSync(function(){
            if (this.__destroyed__){
                return;
            }
            
            console.log('init mapmarker');
            this.mapMarker = new MapMarker(
                new google.maps.LatLng(this.get('lat')*1, this.get('lng')*1),
                this.get('icon'),
                this.get('rotate'),
                0,
                this.get('size')
            );
    
            this.mapMarker.setOverlay(map.getMarkerOverlay());

            this.addEventListener('set:icon', function(ev){
                this.mapMarker.setImage(ev.value);
            }, this);
            
            this.addEventListener('set:rotate', this.setRotate.bind(this), this);
            
            this.addEventListener('set:lat', function(event){
                var latlng = new google.maps.LatLng(event.value*1, this.get('lng')*1);
                this.mapMarker.setPosition(
                    latlng
                );
                this.callEventListener('markermove', {coord: latlng});
            }.bind(this));

            this.addEventListener('set:lng', function(event){
                var latlng = new google.maps.LatLng(this.get('lat')*1, event.value*1);
                this.mapMarker.setPosition(
                    latlng
                );
                this.callEventListener('markermove', {coord: latlng});
            }.bind(this));

            var opacity = 0;
            var anint = window.setInterval(function(){
                opacity += speed;
                if (opacity >= 1){
                    this.mapMarker.setOpacity(1);
                    window.clearInterval(anint);
                }else{
                    this.mapMarker.setOpacity(opacity);
                }
            }.bind(this), timer);
        }.bind(this));
        
        this.on('destroy', function(){
            console.log('destroyed mapmarker');
            if (!this.mapMarker){
                return;
            }
            
            var opacity = 1;
            var anint = window.setInterval(function(){
                opacity -= speed;
                if (opacity <= 0){
                    this.mapMarker.setOverlay(null);
                    window.clearInterval(anint);
                }
                this.mapMarker.setOpacity(opacity);
            }.bind(this), timer);
        });
    },
    init: function(player){
        this.mapMarker = null;
        
        if (this.get('rotate') === undefined){
            this.set({rotate: 0});
        }
        
        //this._anglePng = new Array(360);
        this.rotateTo = this.get('rotate');
        
        this.on('set:map', function(){
            this.createMapMarker( this.get('map') );
        });
        
        var timermove = null;
        this.on('set:lat', function(){
            if (timermove){
                clearInterval(timermove);
            }
            timermove = null;
        }, this);
        
        this.on('destroy', function(){
            if (timermove){
                clearInterval(timermove);
            }
            timermove = null;
        }, this);
        
        this.on('set:moveto', function(){
            var timeend = this.get('movetimeend') - client.serverTimeOffset;
            var dtime = this.get('movetime');
            var movecoord = this.get('moveto');
            
            if (timermove){
                clearInterval(timermove)
            }

            timermove = setInterval(function(){
                var latlng = new google.maps.LatLng(
                    movecoord[0] - (movecoord[0] - this.get('lat'))*(timeend - Date.now())/dtime, 
                    movecoord[1] - (movecoord[1] - this.get('lng'))*(timeend - Date.now())/dtime
                )
                
                if (this.mapMarker){
                    this.mapMarker.setPosition(
                        latlng
                    );
                }
                this.callEventListener('markermove', {coord: latlng});
            }.bind(this), 30);
        }, this);
    }
});