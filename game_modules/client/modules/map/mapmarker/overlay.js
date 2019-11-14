function hexToRgba(hex, opacity) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 'rgba('+parseInt(result[1], 16)+','+parseInt(result[2], 16)+','+parseInt(result[3], 16)+','+opacity+')': null;
}

var MapMarkerTextOverlay = zz.Class.extend({
    initialize: function(point, options) {
        // Initialize all properties.
        this.point_ = point;
        this.opt_ = options;
        this.opacity_ = 0;

        this.overlay_ = null;
        this.img_ = null;
        this.div_ = null;
    },
    setText: function(text) {
        this.opt_.textview = text;
        if (this.img_){
            this.img_.innerHTML = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>");
            this.img_.style.marginLeft = -this.img_.clientWidth/2+'px';

            this.setupTimer();
        }
    },
    setPosition: function(point) {
        this.point_ = point;
        if (this.overlay_){
            var sw = this.overlay_.getProjection().fromLatLngToDivPixel(this.point_);

            var div = this.img_;
            div.style.left = sw.x + 'px';
            div.style.top = sw.y + 'px';
            div.style.zIndex = Math.round(sw.y)+100;
        }
    },
    _toMs: function(time){
        var spl = time.split(':');
        if (!spl[2]){
            spl[2] = 0;
        }

        return Date.UTC(1970,0,1,spl[0]*1,spl[1]*1,spl[2]*1);
    },
    fillZero: function(n){
        if (n < 10){
            return '0'+n;
        }
        return n;
    },
    _toTime: function(time){
        time = new Date(time);

        return this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds());
    },
    setupTimer: function(){
        setTimeout(function(){
            if (this.timer_){
                clearInterval(this.timer_);
                this.timer_ = null;
            }

            if (this.img_){
                var timers = $(this.img_).find('.timer');
                var self = this;
                if (timers.length){
                    timers.each(function(){
                        var timeout = $(this).data('timeout')*1;
                        $(this).html(self._toTime(timeout - Date.now() - client.serverTimeOffset));
                        self.img_.style.marginLeft = -self.img_.clientWidth/2+'px';
                    });
                    this.timer_ = setInterval(function(){
                        timers.each(function(){
                            var time = self._toMs($(this).html()) - 1000;

                            if (time < 0){
                                time = 0;
                            }

                            $(this).html(self._toTime(time));
                            self.img_.style.marginLeft = -self.img_.clientWidth/2+'px';
                        });
                    }, 1000);
                }
            }
        }.bind(this), 0);
    },
    setOpacity: function(opacity) {
        this.opacity_ = opacity;
        if (this.img_){
            this.img_.style.opacity = opacity;
        }
    },
    setOverlay: function(overlay) {
        if (this.overlay_ !== null){
            this.overlay_.removeMarker(this);

            this.img_ = null;
            this.div_ = null;
            this.overlay_ = null;

            if (this.timer_){
                clearInterval(this.timer_);
                this.timer_ = null;
            }
        }

        if (overlay !== null){
            this.overlay_ = overlay;

            var div = document.createElement('div');
            div.style.marginTop = (this.opt_.y - 6 - this.opt_.size*1.5)+'px';
            div.style.fontSize = (10 + this.opt_.size*3)+'px';
            div.style.fontWeight = this.opt_.size>0?'bold':'normal';
            div.className = "mapmarkeroverlay";
            div.innerHTML = this.opt_.textview.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>");
            div.style.color = hexToRgba(this.opt_.textColor, this.opt_.textOpacity);
            div.style.borderColor = hexToRgba(this.opt_.strokeColor, this.opt_.strokeOpacity);
            div.style.backgroundColor = hexToRgba(this.opt_.fillColor, this.opt_.fillOpacity);
            div.style.textShadow = '1px 1px 0px '+hexToRgba(this.opt_.shadowColor, this.opt_.shadowOpacity);
            div.style.borderRadius = this.opt_.strokeRadius+'px';
            if (this.opt_.align === 'left'){
                div.style.marginLeft = '-24px';
            }else if (this.opt_.align === 'right'){
                div.style.marginLeft = (24-div.clientWidth)+'px';
            }else{
                div.style.marginLeft = (-div.clientWidth/2)+'px';
            }
            div.style.opacity = this.opacity_;

            this.img_ = div;    

            overlay.addMarker(this);

            this.setupTimer();
        }
    },
    draw: function(overlayProjection) {
        var p = overlayProjection.fromLatLngToDivPixel(this.point_);

        var div = this.img_;
        div.style.top = p.y+'px';
        div.style.left = p.x+'px';
        div.style.zIndex = Math.round(p.y)+100;
        if (this.opt_.align === 'left'){
            div.style.marginLeft = '-24px';
        }else if (this.opt_.align === 'right'){
            div.style.marginLeft = (24-div.clientWidth)+'px';
        }else{
            div.style.marginLeft = (-div.clientWidth/2)+'px';
        }
    },    
});

var MapMarkerBarOverlay = MapMarkerTextOverlay.extend({
    w_: 48,
    setOverlay: function(overlay) {
        if (this.overlay_ !== null){
            this.overlay_.removeMarker(this);

            this.img_ = null;
            this.div_ = null;
            this.overlay_ = null;

            if (this.timer_){
                clearInterval(this.timer_);
                this.timer_ = null;
            }
        }

        if (overlay !== null){
            this.overlay_ = overlay;

            var div = document.createElement('div');
            div.style.marginTop = (this.opt_.y - 4)+'px';
            div.className = "mapmarkeroverlay";
            div.style.width = this.w_+"px";
            div.style.height = "6px";
            div.style.padding = "1px";
            div.style.borderColor = hexToRgba(this.opt_.strokeColor, this.opt_.strokeOpacity);
            div.style.backgroundColor = hexToRgba(this.opt_.fillColor, this.opt_.fillOpacity);
            div.style.borderRadius = this.opt_.strokeRadius+'px';
            div.style.marginLeft = -div.clientWidth/2+'px';
            div.style.opacity = this.opacity_;

            var inner = document.createElement('div');
            inner.className = "mapmarkerbaroverlay";
            
            var w = this.opt_.value / this.opt_.maxvalue;
            
            if (w < 0){
                inner.className = "mapmarkerbaroverlay right";
                w = -w;
            }
            
            if (w > 1){
                w = 1;
            }
            
            inner.style.width = this.w_*(w)+"px";
            inner.style.backgroundColor = hexToRgba(this.opt_.barColor, this.opt_.barOpacity);
            this.bar_ = inner;
            
            div.appendChild(inner);
            
            this.img_ = div;    

            overlay.addMarker(this);
        }
    },
    setValue: function(value) {
        this.opt_.value = value;
        if (this.img_){
            var w = this.opt_.value / this.opt_.maxvalue;
            
            if (w < 0){
                this.bar_.className = "mapmarkerbaroverlay right";
                w = -w;
            }
            
            if (w > 1){
                w = 1;
            }
            
            this.bar_.style.width = this.w_*(w)+"px";

            this.img_.style.marginLeft = -this.img_.clientWidth/2+'px';
        }
    },
    setMax: function(value) {
        this.opt_.maxvalue = value;
        if (this.img_){
            var w = this.opt_.value / this.opt_.maxvalue;
            
            if (w < 0){
                this.bar_.className = "mapmarkerbaroverlay right";
                w = -w;
            }
            
            if (w > 1){
                w = 1;
            }
            
            this.bar_.style.width = this.w_*(w)+"px";
            this.img_.style.marginLeft = -this.img_.clientWidth/2+'px';
        }
    },
    initialize: function(point, options) {
        // Initialize all properties.
        this.point_ = point;
        this.opt_ = options;
        this.opacity_ = 0;

        this.overlay_ = null;
        this.img_ = null;
        this.div_ = null;
        this.bar_ = null;
    }
});

client.MapMarkerOverlayTextView = ActionClass.extend({
    className: 'MapMarkerOverlayTextView',
    init: function(project){
        this.mapMarker = null;
        
        this.on('set:mapmarker', function(ev){
            if (this.__destroyed__){
                 return;
            }
                
            var mapmarker = ev.value;
            mapmarker.get('map').afterSync(function(map){
                this.mapMarker = new MapMarkerTextOverlay(
                    new google.maps.LatLng(mapmarker.get('lat')*1, mapmarker.get('lng')*1),
                    this.getAttributes()
                );

                this.mapMarker.setOverlay(map.getMarkerOverlay());

                mapmarker.addEventListener('markermove', function(event){
                    this.mapMarker.setPosition(
                        event.coord
                    );
                }.bind(this));

                var opacity = 0;
                var timer = 10;
                var speed = 0.05;
                var anint = window.setInterval(function(){
                    opacity += speed;
                    if (opacity >= 1){
                        this.mapMarker.setOpacity(1);
                        window.clearInterval(anint);
                    }else{
                        this.mapMarker.setOpacity(opacity);
                    }
                }.bind(this), timer);

                this.on('destroy', function(){
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
            }.bind(this));
        }, this);
        
        this.on('set:textview', function(ev){
            if (this.mapMarker){
                this.mapMarker.setText(ev.value);
            }
        });
    }
});

client.MapMarkerOverlayBarView = ActionClass.extend({
    className: 'MapMarkerOverlayBarView',
    init: function(project){
        this.mapMarker = null;
        
        this.on('set:mapmarker', function(ev){
            if (this.__destroyed__){
                 return;
            }
                
            var mapmarker = ev.value;
            mapmarker.get('map').afterSync(function(map){
                this.mapMarker = new MapMarkerBarOverlay(
                    new google.maps.LatLng(mapmarker.get('lat')*1, mapmarker.get('lng')*1),
                    this.getAttributes()
                );

                this.mapMarker.setOverlay(map.getMarkerOverlay());

                mapmarker.addEventListener('markermove', function(event){
                    this.mapMarker.setPosition(
                        event.coord
                    );
                }.bind(this));

                var opacity = 0;
                var timer = 10;
                var speed = 0.05;
                var anint = window.setInterval(function(){
                    opacity += speed;
                    if (opacity >= 1){
                        this.mapMarker.setOpacity(1);
                        window.clearInterval(anint);
                    }else{
                        this.mapMarker.setOpacity(opacity);
                    }
                }.bind(this), timer);

                this.on('destroy', function(){
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
            }.bind(this));
        }, this);
        
        this.on('set:value', function(ev){
            if (this.mapMarker){
                this.mapMarker.setValue(ev.value);
            }
        });
        
        this.on('set:maxvalue', function(ev){
            if (this.mapMarker){
                this.mapMarker.setMax(ev.value);
            }
        });
    }
});