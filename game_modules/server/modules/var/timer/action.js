module.exports = function (server){
    server.TimerStartAction = server.ActionClass.extend({
        className: 'TimerStartAction',
        run: function(args){
            console.log('timer start action');
            
            this.get('timer').startTimer();
        }
    });

    server.TimerStopAction = server.ActionClass.extend({
        className: 'TimerStopAction',
        run: function(args){
            console.log('timer start action');
            
            this.get('timer').stopTimer();
        }
    });

    server.TimerSetAction = server.ActionClass.extend({
        className: 'TimerSetAction',
        fillZero: function(n){
            if (n < 10){
                return '0'+n;
            }
            return n;
        },
        run: function(args){
            console.log('timer set action');
            
            this.get('timer').stopTimer();
            
            var set = this.get('ftimer');
            if (set === null){
                console.log(null);
                
                this.get('timer').set({timer: this.get('set')});
            }else if (set instanceof server.Counter){
                var time = new Date(set.getCount()*1000);
                
                this.get('timer').set({timer: this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds())});
                
                console.log('counter', this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds()));
            }else if (set instanceof server.Timer){
                console.log('timer');
                
                this.get('timer').set({timer: set.getTime()});
            }
            
            if (this.get('start')){
                this.get('timer').startTimer();
            }
        }
    });

    server.TimerAddAction = server.ActionClass.extend({
        className: 'TimerAddAction',
        run: function(args){
            console.log('timer add action');
            
            switch(this.get('operator')){
                case '+': 
                    this.get('timer').addTime(this.get('set'));
                    break;
                case '-': 
                    this.get('timer').subTime(this.get('set'));
                    break;
            }
        }
    });

/*    server.TimerDummyStartAction = server.ActionClass.extend({
        className: 'TimerDummyStartAction',
        run: function(args){
            console.log('dummy timer start');
            var args = Object.assign({}, args);
            
            var timer = this.watcher.watch(new server.Timer(this.get('set')));
            this.watcher.root([timer]);
            
            var TTimeout = this.watcher.watch(new server.TimerTriggerTimeout);
            var TTlist = TTimeout.get('list');
            TTlist.set(this.get('action').locals());
            TTlist.setupArgs(args);
            TTlist.list().add(
                this.get('action').getCollection()
            );
            
            timer.addTrigger(TTimeout);
            
            var DTimeout = this.watcher.watch(new server.TimerTriggerTimeout);
            DTimeout.get('list').list().add([
                this.watcher.watch(new server.TimerDestroy).set({timer: timer})
            ]);
            timer.addTrigger(DTimeout);
            
            timer.startTimer();
        }
    });*/

    server.TimerDestroy = server.ActionClass.extend({
        className: 'TimerDestroy',
        run: function(){
            console.log('timer destroy');
            this.get('timer').destroy();
        }
    });

    server.TimerIsActiveAction = server.ActionClass.extend({
        className: 'TimerIsActiveAction',
        run: function(){
            console.log('timer is active?');
            
            var timer = this.get('timer');
            
            if (timer){
                if (timer.isStart()){
                    this.get('yes').run();
                }else{
                    this.get('no').run();
                }
            }
        }
    });
};