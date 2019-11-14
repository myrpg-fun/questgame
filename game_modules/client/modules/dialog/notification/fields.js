NotificationFieldAnimated = ActionClass.extend({});

client.NotificationFieldText = NotificationFieldAnimated.extend({
    className: 'NotificationFieldText',
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
    createSchemeField: function(){
        var vars = (new zz.data).set({
            text: this.get('text').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>"),
            style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('center')?'center':'')+' '+(this.get('italic')?'italic':''),
            colorstyle: 'color: '+(this.get('color')?this.get('color'):'#FFFFFF')
        });
        
        this.on('set', function(){
            vars.set({
                text: this.get('text').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>"),
                style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('center')?'center':'')+' '+(this.get('italic')?'italic':''),
                colorstyle: 'color: '+(this.get('color')?this.get('color'):'#FFFFFF')
            });
        });
        
        var timer = null;
        var self = this;
        return new SchemeField('#NotificationFieldText')
            .init(null, function(DOMel){
                setTimeout(function(){
                    var timers = DOMel.find('.timer');
                    if (timers.length){
                        timers.each(function(){
                            var timeout = $(this).data('timeout')*1;
                            $(this).html(self._toTime(timeout - Date.now() - client.serverTimeOffset));
                        });
                        timer = setInterval(function(){
                            timers.each(function(){
                                var time = self._toMs($(this).html()) - 1000;

                                if (time < 0){
                                    time = 0;
                                }

                                $(this).html(self._toTime(time));
                            });
                        }, 1000);
                    }
                }, 0);
            }, function(){
                if (timer){
                    clearInterval(timer);
                }
            })
            .linkHtmlValue('.blk-text', vars, 'text')
            .linkAttributeValue('.blk-text', 'class', vars, 'style')
            .linkAttributeValue('.blk-text', 'style', vars, 'colorstyle');
    }
});


client.NotificationFieldImage = NotificationFieldAnimated.extend({
    className: 'NotificationFieldImage',
    createSchemeField: function(){
        var vars = (new zz.data);
        vars.set({
            image: this.get('image').replace(/upload\/([\w.-]+)$/gi, "resize/1024/$1")
        });

        return new SchemeField('#NotificationFieldImage')
            .linkAttributeValue('.blk-image', 'src', vars, 'image');
    }
});

client.NotificationFieldAudio = NotificationFieldAnimated.extend({
    className: 'NotificationFieldAudio',
    createSchemeField: function(){
        var audio = new Audio(this.get('url'));
        
        return this.destrLsnTimer(new SchemeField('#BlkListTpl'))
            .init(null, function(){
                audio.currentTime = 0;
                audio.play();
            }, function(){
                audio.pause();
            });
    }
});

client.NotificationCloseButton = NotificationFieldAnimated.extend({
    className: 'NotificationCloseButton',
    blockTimeout: true,
    createSchemeField: function(){
        var vars = (new zz.data);
        vars.set({
            text: this.get('text')
        });

        return new SchemeField('#NotificationCloseButton')
            .linkTextValue('.link-button', vars, 'text')
            /*.click('.link-button', function(){
                client.notify.clearModal();
            }.bind(this))*/;
    }
});

client.NotificationFieldSeparator = NotificationFieldAnimated.extend({
    className: 'NotificationFieldSeparator',
    createSchemeField: function(){
        return new SchemeField('#NotificationFieldSeparator');
    }
});

client.NotificationInventoryItem = NotificationFieldAnimated.extend({
    className: 'NotificationInventoryItem',
    createSchemeField: function(){
        var vars = (new zz.data);
        vars.set({
            style: 'position: relative;display: inline-block;width:'+this.get('x')*InventoryItemWidth+'%;padding-top: '+this.get('y')*InventoryItemWidth+'%',
//            icon: this.get('icon'),
            count: this.get('count'),
            countstyle: (parseInt(this.get('count')) === 1)?'display: none':'display: block'
        });
        
        var icontimer = [];

        return new SchemeField('#NotificationInventoryItem')
//            .linkAttributeValue('.blki-icon', 'src', vars, 'icon')
            .init('.blki-icon', function(DOMel){
                var resize = 192*this.get('x');
                
                this.get('icon').forEach(function(icon){
                    DOMel.css({
                        backgroundImage: 'url('+icon.get('url').replace(/upload\/([\w.-]+)$/gi, "resize/"+(resize)+"/$1")+')',
                        backgroundPosition: '0px 0px',
                        backgroundSize: '100% '+Math.floor(icon.get('height')*100/icon.get('width'))+'%'
                    });

                    icontimer.push(
                        icon.startAnimation(DOMel)
                    );
                }.bind(this));
            }.bind(this), function(){
                icontimer.forEach(function(i){
                    window.clearInterval(i);
                });
            }.bind(this))
            .linkAttributeValue('.blki-count', 'style', vars, 'countstyle')
            .linkTextValue('.blki-count', vars, 'count')
            .linkAttributeValue('.blk-iconbox', 'style', vars, 'style');
    },
    init: function(){
    }
});

client.NotificationFieldTimer = NotificationFieldAnimated.extend({
    className: 'NotificationFieldTimer',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')
        });
        
        this.on('set', function(){
            vars.set({
                style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')
            });
        });
        
        var intTimer = null;
        var started = this.get('started');
        
        var time = this._toMs(this.get('timerview'));
        var fillZero = function(n){
            if (n < 10){
                return '0'+n;
            }
            return n;
        };
        var toTime = function(time){
            time = new Date(time);

            return fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+fillZero(time.getUTCMinutes())+':'+fillZero(time.getUTCSeconds());
        };

        if (time < 0){
            time = 0;
        }

        vars.set({
            timer: toTime(time)
        });
        
        if (started){
            intTimer = setInterval(function(){
                time = time - 1000;

                if (time < 0){
                    time = 0;
                }

                vars.set({
                    timer: toTime(time)
                });
            }, 1000);
        }

        return new SchemeField('#NotificationFieldTimer')
            .linkTextValue('.blk-timer-inside', vars, 'timer')
            .linkAttributeValue('.blk-text', 'class', vars, 'style')
            .init(null, function(){
                if (started && intTimer === null){
                    intTimer = setInterval(function(){
                        time = time - 1000;

                        if (time < 0){
                            time = 0;
                        }

                        vars.set({
                            timer: toTime(time)
                        });
                    }, 1000);
                }
            },function(){
                clearInterval(intTimer);
                intTimer = null;
            });
    },
    _toMs: function(time){
        var spl = time.split(':');
        if (!spl[2]){
            spl[2] = 0;
        }
            
        return Date.UTC(1970,0,1,spl[0]*1,spl[1]*1,spl[2]*1);
    },
    init: function(){}
});
