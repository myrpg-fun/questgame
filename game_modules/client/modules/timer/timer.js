client.Timer = ActionClass.extend({
    className: 'Timer',
    createSchemeField: function(){
        return new SchemeField('#Timer')
            .linkTextValue('.blk-timer-inside', this, 'timerreal');
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
    init: function(){
        var intTimer = null;
        
        this.on('set:outTime', function(ev){
            if (this.get('started')){
                this.set({timerreal: this._toTime(this.get('outTime') - Date.now() - client.serverTimeOffset)});
            }else{
                this.set({timerreal: this.get('timer')});
            }
        });
        
        this.on('set:started', function(ev){
            if (ev.value){
                if (intTimer){
                    clearInterval(intTimer);
                }

                this.set({timerreal: this._toTime(this.get('outTime') - Date.now() - client.serverTimeOffset)});
                intTimer = setInterval(function(){
                    var time = this._toMs(this.get('timerreal')) - 1000;
                    
                    if (time < 0){
                        time = 0;
                    }
                    
                    this.set({
                        timerreal: this._toTime(time)
                    });
                }.bind(this), 1000);
            }else{
                this.set({timerreal: this.get('timer')});
                
                if (intTimer){
                    clearInterval(intTimer);
                    intTimer = null;
                }
            }
        }, this);
    }
});
