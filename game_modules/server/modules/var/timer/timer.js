module.exports = function (server){
    server.SessionTime = server.SyncedData.extend({
        className: 'SessionTime',
        currentTime: null,
        startTimer: false,
        now: function(){
            return this.currentTime?this.currentTime:Date.now();
        },
        timeOut: function(){
            this.startTimer = false;
            
            var timer = this.timers.shift();
            if (timer){
                this.currentTime = timer.timeend;

                timer.fn();

                this.currentTime = null;
                
                if (!this.startTimer){
                    this.startTimer = true;
                    
                    server.setTimeout(this.timeOut.bind(this), 0);
                }
            }
        },
        setTimeout: function(fn, timeout){
            var now = Date.now();
            
            var timer = {
                timer: null,
                fn: fn,
                timeend: this.now() + timeout
            };

//            console.log('set timeout', timer.timeend, Date.now() - this.now());
            
            var tout = timer.timeend - now;
            
            if (tout < 0){
                if (!this.startTimer){
                    this.startTimer = true;
                    
                    server.setTimeout(this.timeOut.bind(this), 0);
                }

                for (var i=0; i<this.timers.length; i++){
                    if (this.timers[i].timeend > timer.timeend){
                        this.timers.splice(i, 0, timer);
                        return timer;
                    }
                }

                this.timers.push(timer);
                return timer;
            }else{
                timer.timer = server.setTimeout(function(){
                    this.watcher.getItem('Session').timeRunStart();
                    this.watcher.getItem('Session').catch(function(msg){
                        fn.apply(this, msg);
                    }.bind(this, arguments));
                    this.watcher.getItem('Session').timeRunEnd();
                }.bind(this), tout);
                return timer;
            }
        },
        endTimeout: function(fn, endtime){
            var timer = {
                timer: null,
                fn: fn,
                timeend: endtime
            };

//            console.log('end timeout', timer.timeend, Date.now() - endtime);
            
            var tout = timer.timeend - Date.now();
            
            if (tout < 0){
                if (!this.startTimer){
                    this.startTimer = true;
                    
                    server.setTimeout(this.timeOut.bind(this), 0);
                }

                for (var i=0; i<this.timers.length; i++){
                    if (this.timers[i].timeend > timer.timeend){
                        this.timers.splice(i, 0, timer);
                        return timer;
                    }
                }

                this.timers.push(timer);
                return timer;
            }else{
                timer.timer = server.setTimeout(function(){
                    this.watcher.getItem('Session').timeRunStart();
                    this.watcher.getItem('Session').catch(function(msg){
                        fn.apply(this, msg);
                    }.bind(this, arguments));
                    this.watcher.getItem('Session').timeRunEnd();
                }.bind(this), tout);
                return timer;
            }
        },
        clearTimeout: function(timer){
            if (timer.timer !== null){
                //stop timer
                clearTimeout(timer.timer);
            }

            var k = this.timers.indexOf(timer);
            if (k !== -1){
                this.timers.splice(k, 1);
            }
        },
        initialize: function(){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this.on('destroy', function(){
                for (var i=0; i<this.timers.length; i++){
                    if (this.timers[i].timer !== null){
                        clearTimeout(this.timers[i].timer);
                    }
                }
            }, this);
            
            this.timers = [];
        }
    });

    server.Timer = server.SyncedData.extend({
        className: 'Timer',
        wbpSent: true,
        fillZero: function(n){
            if (n < 10){
                return '0'+n;
            }
            return n;
        },
        getTimeOutStamp: function(){
            return this.get('outTime');
        },
        getTime: function(){
            if (this.get('started')){
                var time = this.get('outTime') - this.sessionTimer.now();
                
                if (time < 0){
                    time = 0;
                }
                
                time = new Date(time);
                
                return this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds());
            }else{
                return this.get('timer');
            }
        },
        _toMs: function(time){
            var spl = time.split(':');
            
            if (!spl[2]){
                spl[2] = 0;
            }
            
            return Date.UTC(1970,0,1,spl[0]*1,spl[1]*1,spl[2]*1);
        },
        startTimer: function(){
            if (this.timer === null){
                this.set({
                    outTime: this.sessionTimer.now() + this._toMs(this.getTime()),
                    started: 1
                });

                if (this.timer){
                    this.sessionTimer.clearTimeout(this.timer);
                }

//                console.log('Set timer', this.get('name'));

                this.timer = this.sessionTimer.setTimeout(function(){
                    this.set({
                        timer: '00:00:00',
                        started: 0
                    });

                    this.timer = null;

//                    console.log('Time out', this.get('name'));
                    
                    this.callEventListener('timeout', {target: this});
                }.bind(this), this._toMs(this.getTime()));
                
                this.callEventListener('starttimer', {target: this});
            }
        },
        _restartTimer: function(){
            if (this.timer === null){
                this.timer = this.sessionTimer.endTimeout(function(){
                    this.set({
                        timer: '00:00:00',
                        started: 0
                    });

                    this.timer = null;
                    
                    this.callEventListener('timeout', {target: this});
                }.bind(this), this.get('outTime'));
            }
        },
        stopTimer: function(){
            this.set({
                timer: this.getTime(),
                started: 0
            });
            
            if (this.timer){
                this.sessionTimer.clearTimeout(this.timer);
            }
            
            this.timer = null;
        },
        addTime: function(time){
            var started = this.isStart();
            if (started){
                this.stopTimer();
            }
            
            time = new Date(
                this._toMs(this.getTime()) + this._toMs(time)
            );

            this.set({timer: this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds())});
            
            if (started){
                this.startTimer();
            }
        },
        subTime: function(time){
            var started = this.isStart();
            if (started){
                this.stopTimer();
            }
            
            time = this._toMs(this.getTime()) - this._toMs(time);
            
            if (time < 0){
                time = 0;
            }
            
            time = new Date(
                time
            );

            this.set({timer: this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds())});
            
            if (started){
                this.startTimer();
            }
        },
        createAttrs: function(watcher){
            this.set({
                timer: this._init,
                started: 0,
                triggerList: watcher.watch(
                    new server.ActionList(
                        [], {target: watcher.watch(new server.ActionArg('Таймер', 'Timer'))}
                ))
            });
        },
        isStart: function(){
            return this.get('started');
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            this.watcher.waitItem('SessionTime', function(st){
                this.sessionTimer = st;
                
                this.watcher.on('after-sync', function(){
                    if (this.get('started')){
                        //restart timer after load
                        this._restartTimer();
                    }
                }, this);

                this.on('set:timer', function(ev){
                    if (this.get('timer').length === 5){
                        this.set({timer: this.get('timer')+':00'});
                    }
                });

                this.on('watch-player', function(){
                    this.set({
                        timer: this.getTime()
                    });
                });
                
                this.on('destroy', function(){
                    if (this.timer){
                        this.sessionTimer.clearTimeout(this.timer);
                    }                
                }, this);
            }.bind(this));
            
            this.on('set:triggerList', function(ev){
                this.get('triggerList').mount({target: this});
            }, this);
        },
        addTrigger: function(trigger){
            this.get('triggerList').add([trigger]);
            trigger.mount({target: this});
        },
        initialize: function(time){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = time;
            this.sessionTimer = null;
            this.timer = null;
        }
    });
};