module.exports = function (server){
    server.SessionSettingMap = server.ActionClass.extend({
        className: 'SessionSettingMap',
        wbpSent: true,
        setInfo: function(){
            return "";
        },
        setSessionSetting: function(){},
        isWrong: function(){
            return true;
        },
    });
    
    server.SessionSettingText = server.ActionClass.extend({
        className: 'SessionSettingText',
        wbpSent: true,
        setInfo: function(){
            return "";
        },
        setSessionSetting: function(){},
        isWrong: function(){
            return true;
        },
    });
    
    server.SessionSettingCounter = server.ActionClass.extend({
        className: 'SessionSettingCounter',
        wbpSent: true,
        setInfo: function(msg){
            this.get('counter').setCount(msg[this.id]);
            this.set({
                current: msg[this.id]
            });
            
            return this.get('name')+": "+this.get('current')+"\n";
        },
        setSessionSetting: function(session){},
        isWrong: function(){//start session
            return true;//this.get('players')*1 >= this.get('min')*1 && this.get('players')*1 <= this.get('max')*1;
        },
        init: function(){
            this.set({
                current: this.get('counter').getCount()
            });
        }
    });
    
    server.SessionSettingTimer = server.ActionClass.extend({
        className: 'SessionSettingTimer',
        wbpSent: true,
        setInfo: function(msg){
            this.set({
                date: msg.date,
                time: msg.time
            });
            
            var date = this.get('date').split('-');
            var time = this.get('time').split(':');

            var timer = new Date(Date.UTC(date[0]*1, date[1]*1-1, date[2]*1, time[0]*1-3, time[1]*1) - Date.now());
                
            timer = this.n00((timer.getUTCDate()-1)*24+timer.getUTCHours())+':'+this.n00(timer.getUTCMinutes())+':'+this.n00(timer.getUTCSeconds());
            
            if (this.get('timer')){
                this.get('timer').stopTimer();
                this.get('timer').set({timer: timer});
                this.get('timer').startTimer();
            }
            
            return "Начало "+date[2]+"."+date[1]+"."+date[0]+" в "+time[0]+":"+time[1]+"\n";
        },
        n00: function(n){
            return n<10?'0'+n:n;
        },
        setSessionSetting: function(){
            var date = new Date(Date.now() + 1000*3600*4);
            
            this.set({
                date: date.getUTCFullYear()+"-"+this.n00(1*date.getUTCMonth()+1)+"-"+this.n00(date.getUTCDate()),
                time: this.n00(date.getUTCHours()*1)+":00",
                now: Date.now()
            });
        },
        isWrong: function(){
            var date = this.get('date').split('-');
            var time = this.get('time').split(':');
            
            return Date.now()+3*3600000 < Date.UTC(date[0], date[1]*1-1, date[2], time[0], time[1]);
        },
    });
    
    server.SessionSettingName = server.ActionClass.extend({
        className: 'SessionSettingName',
        wbpSent: true,
        setInfo: function(){
            return "";
        },
        setSessionSetting: function(){},
        isWrong: function(){
            return this.get('name').length > 0;
        },
    });
    
    server.SessionSettingDenied = server.ActionClass.extend({
        className: 'SessionSettingDenied',
        wbpSent: true,
    });
    
    server.SessionSettingSetupField = server.SyncedList.extend({
        className: 'SessionSettingSetupField',
        wbpSent: true,
        init: function(){
            this.on('watch-player', function(ev){
                var player = ev.player;
                var watch = player.playerWatch();
                
                player.watch(this.getCollection());
                
                watch.listenSocket('settings-save', function(msg){
                    console.log('settings-save');

                    watch.unlistenSocket('settings-save');
                    msg.player = player;
                    
                    this.get('session').callEventListener('settings-save', msg);
                }.bind(this));
            }, this);
            
            this.on('unwatch-player', function(ev){
                var player = ev.player;
                var watch = player.playerWatch();
                
                player.unwatch(this.getCollection());
                
                watch.unlistenSocket('settings-save');
            }, this);
        }
    });
    
    server.SessionSettingJoinField = server.SyncedList.extend({
        className: 'SessionSettingJoinField',
        wbpSent: true,
        init: function(){
            this.on('watch-player', function(ev){
                var player = ev.player;
                var watch = player.playerWatch();
                
                player.watch(this.getCollection());
                
                watch.listenSocket('join-player', function(msg){
                    console.log('join-player');

                    watch.unlistenSocket('join-player');
                    msg.player = player;
                    
                    this.get('session').callEventListener('join-player', msg);
                }.bind(this));
            }, this);
            
            this.on('unwatch-player', function(ev){
                var player = ev.player;
                var watch = player.playerWatch();
                
                player.unwatch(this.getCollection());
                
                watch.unlistenSocket('join-player');
            }, this);
        }
    });
};