client.MapStyle = SyncedData.extend({
    className: 'MapStyle',
    styles: function(){
        var json;
        try{
            json = JSON.parse(this.get('style'));
        }catch(e){
            json = [
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
            ];
        }
        
        return json;
    },
    maptype: function(){
        return this.get('maptype');
    },
    onEffects: function(map){
        if (this.get('effectsList')){
            this.get('effectsList').forEach(function(effect){
                effect.glitchOn(map);
            });
        }
    },
    offEffects: function(map){
        if (this.get('effectsList')){
            this.get('effectsList').forEach(function(effect){
                effect.glitchOff(map);
            });
        }
    }
});    

client.MapStyleDefault = client.MapStyle.extend({
    className: 'MapStyleDefault'
});

client.MapStyleEffectsList = SyncedList.extend({
    className: 'MapStyleEffectsList',
});    

client.MapStyleEffectGlitchBlur = SyncedData.extend({
    className: 'MapStyleEffectGlitchBlur',
    glitchOn: function(map){
        this.on = true;
        
        map = map[0];
        
        var x;
        var unglitch = function(){
            if (!this.on){
                map.style.filter = "blur(0px)";
                return;
            }
            
            x -= this.get('speed');
            if (x<0){
                x=0;
            }else{
                setTimeout(unglitch, 20);
            }

            map.style.filter = "blur("+x+"px)";
        }.bind(this);

        var glitch = function(){
            if (!this.on){
                map.style.filter = "blur(0px)";
                return;
            }
            
            x = Math.random()*this.get('max');

            map.style.filter = "blur("+(x)+"px)";

            setTimeout(unglitch, 20);

            setTimeout(glitch, Math.random()*this.get('period')+300);
        }.bind(this);
        
        glitch();
    },
    glitchOff: function(map){
        this.on = false;
    }
});    

client.MapStyleEffectGlitch = SyncedData.extend({
    className: 'MapStyleEffectGlitch',
    glitchOn: function(map){
        this.on = true;
        
        var c;
        var unglitch = function(){
            if (c){
                c.remove();
            }
        }.bind(this);

        var glitch = function(){
            if (c){
                c.remove();
            }
            
            if (!this.on){
                return;
            }
            
            c = map.clone();
            c.appendTo(map.parent());
            var w = c.width()-20;
            var h = c.height();

            c[0].style.clip = "rect("+Math.floor(Math.random()*h)+"px, "+w+"px, "+Math.floor(Math.random()*h)+"px, 0px)";
            c[0].style.left = Math.round(Math.random()*this.get('max')-this.get('max')/2)+"px";
            c[0].style.opacity = Math.random()*0.4+0.3;
            c[0].style.filter = "hue-rotate("+Math.random()*180+90+"deg)";
            c[0].style.pointerEvents = "none";

            setTimeout(unglitch, 100);

            setTimeout(glitch, Math.random()*this.get('period')+100);
        }.bind(this);
        
        glitch();
    },
    glitchOff: function(map){
        this.on = false;
    }
});    

client.MapStyleEffectBlur = SyncedData.extend({
    className: 'MapStyleEffectBlur',
    glitchOn: function(map){
        map = map[0];
        map.style.filter = "blur("+(this.get('max'))+"px)";
    },
    glitchOff: function(map){
        map = map[0];
        map.style.filter = "blur(0px)";
    }
});

client.MapStyleEffectImageBlend = SyncedData.extend({
    className: 'MapStyleEffectImageBlend',
    glitchOn: function(map){
        var c = $('<div></div>');
        var x = 0;
        
        this.on = true;
        var unglitch = function(){
            if (!this.on){
                c.remove();
                return;
            }
            
            x += this.get('speed');
            c.css({
                backgroundPosition: Math.round(x)+'px 0px'
            });            
            
            setTimeout(unglitch, 50);
        }.bind(this);

        if (c){
            c.remove();
        }

        c = $('<div></div>');
        c.css({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            zIndex: 100,
            opacity: this.get('opacity'),
            pointerEvents: "none",
            backgroundImage: "url("+this.get('image')+")",
            backgroundRepeat: 'repeat',
            backgroundPosition: '0px 0px',
            mixBlendMode: this.get('mix')
        });
        c.appendTo(map.parent());

        unglitch();
    },
    glitchOff: function(map){
        this.on = false;
    }
});

