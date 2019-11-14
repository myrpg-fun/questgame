function MapMarker(point, image, rotate, opacity, size) {
    // Initialize all properties.
    this.point_ = point;
    this.image_ = Array.isArray(image)?image:[image];
    this.rotate_ = rotate;
    this.opacity_ = opacity;
    this.size_ = size;
    this.click_ = function(){};
    this.drag_ = function(){};
    this.icontimer_ = null;
    this.draggable_ = false;

    this.overlay_ = null;
    this.mt_ = null;
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
        //this.img_.src = image;
        this.img_.innerHTML = '';
        this.image_.forEach(function(icon){
/*            var img = document.createElement('img');
            img.src = im.get('url');*/
            var img = document.createElement('div');
            if (!(icon instanceof admin.MapMarkerIcon)){
                return;
            }
            
            img.style.backgroundImage = 'url('+icon.get('url')+')';
            img.style.backgroundPosition = '0px 0px';
            img.style.backgroundSize = '100% '+Math.floor(icon.get('height')*100/icon.get('width'))+'%';
            img.style.top = '0px';
            img.style.left = '0px';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.position = 'absolute';
            
            if (this.icontimer_){
                window.clearInterval(this.icontimer_);
            }

            this.icontimer_ = icon.startAnimation($(img));

            this.img_.appendChild(img);
        }, this);
    }
};

MapMarker.prototype.setOpacity = function(opacity) {
    this.opacity_ = opacity;
    if (this.mt_){
        this.img_.style.opacity = opacity;
    }
};

MapMarker.prototype.setPosition = function(point) {
    this.point_ = point;
    if (this.overlay_){
        var _p = this.overlay_.getProjection();
        if (_p){
            var sw = _p.fromLatLngToDivPixel(this.point_);

            var div = this.mt_;
            div.style.left = sw.x + 'px';
            div.style.top = sw.y + 'px';
//            div.style.zIndex = Math.round(sw.y);

            var div = this.img_;
            div.style.left = sw.x + 'px';
            div.style.top = sw.y + 'px';
//            div.style.zIndex = Math.round(sw.y);
        }
    }
};

MapMarker.prototype.onClick = function(click) {
    if (click){
        this.mt_.style.display = 'block';
        this.click_ = click;
    }else{
        this.mt_.style.display = 'none';
    }
};

MapMarker.prototype.onDrag = function(drag) {
    this.drag_ = drag;
};

MapMarker.prototype.setSize = function(size) {
    this.size_ = size;
    
    if (this.overlay_ !== null){
        var div = this.mt_;
        div.style.width = this.size_+'px';
        div.style.height = this.size_+'px';
        div.style.marginTop = -this.size_/2+'px';
        div.style.marginLeft = -this.size_/2+'px';
        div.style.borderRadius = this.size_+'px';
        
        var imgdiv = this.img_;
        imgdiv.style.width = this.size_+'px';
        imgdiv.style.height = this.size_+'px';
        imgdiv.style.marginTop = -this.size_/2+'px';
        imgdiv.style.marginLeft = -this.size_/2+'px';
        
    }    
};

MapMarker.prototype.setZIndex = function(zi) {
    if (this.img_){
        this.img_.style.zIndex = zi;
        this.mt_.style.zIndex = zi;
    }
};

MapMarker.prototype.setDraggable = function(zi) {
    this.draggable_ = zi;
};

MapMarker.prototype.setOptions = function(opt) {};

MapMarker.prototype.setOverlay = function(overlay) {
    if (this.overlay_ !== null){
        this.overlay_.removeMarker(this);
        
        if (this.icontimer_){
            window.clearInterval(this.icontimer_);
        }

        $(this.img_).unbind('click');
        this.mt_ = null;
        this.img_ = null;
    }
    
    if (overlay !== null){
        this.overlay_ = overlay;
        
        // Create click element
        var div = document.createElement('div');
        div.style.width = this.size_+'px';
        div.style.height = this.size_+'px';
        div.style.marginTop = -this.size_/2+'px';
        div.style.marginLeft = -this.size_/2+'px';
        div.style.position = 'absolute';
        div.style.cursor = 'pointer';
        div.style.borderRadius = this.size_+'px';
        div.style.display = 'none';
        
        this.mt_ = div;

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
        this.img_ = imgdiv;

        this.setImage(this.image_);
        
        overlay.addMarker(this);
        
        google.maps.event.addDomListener(div, 'click', function(ev) {
            this.click_();
            
            ev.stopPropagation();
        }.bind(this));
        
        //draggable
        var dragstart = null, or = null;
        google.maps.event.addDomListener(div, 'mousedown', function(origin) {
            if (this.draggable_){
                this.overlay_.map_.set('draggable', false);
                
                var _p = this.overlay_.getProjection();
                or = _p.fromLatLngToDivPixel(this.point_);
                dragstart = origin;
            }
        }.bind(this));

        google.maps.event.addDomListener(document, 'mousemove', function(origin) {
            if (dragstart){
                var _p = this.overlay_.getProjection();
                var pos = _p.fromDivPixelToLatLng(new google.maps.Point(or.x + origin.clientX - dragstart.clientX, or.y + origin.clientY - dragstart.clientY));
                
                this.setPosition(pos);
            }
        }.bind(this));
        
        google.maps.event.addDomListener(document, 'mouseup', function(ev) {
            if (dragstart){
                this.overlay_.map_.set('draggable', true);

                dragstart = null;
                
                this.drag_(this.point_);
                
                ev.stopPropagation();
            }
        }.bind(this));
    }
};

MapMarker.prototype.draw = function(overlayProjection) {
    var p = overlayProjection.fromLatLngToDivPixel(this.point_);
    
    var div = this.img_;
    div.style.top = p.y+'px';
    div.style.left = p.x+'px';
//    div.style.zIndex = Math.round(p.y);
    
    var div = this.mt_;
    div.style.top = p.y+'px';
    div.style.left = p.x+'px';
//    div.style.zIndex = Math.round(p.y);
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
            
            if (marker.mt_){
                this.mt_.appendChild(marker.mt_);
            }
            
            marker.draw(this.getProjection());
        }
    }
};

MarkerOverlay.prototype.removeMarker = function(marker) {
    var key = this.markers_.indexOf(marker);
    if (key !== -1){
        this.markers_.splice(key, 1);

        if (this.div_){
            if (marker.img_){
                this.div_.removeChild(marker.img_);
            }
            if (marker.mt_){
                this.mt_.removeChild(marker.mt_);
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
        if (marker.mt_){
            mt.appendChild(marker.mt_);
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
        if (marker.mt_){
            this.mt_.removeChild(marker.mt_);
        }
    }, this);

    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;

    this.mt_.parentNode.removeChild(this.mt_);
    this.mt_ = null;
};

