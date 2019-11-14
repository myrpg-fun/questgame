var util = require('util');
module.exports = function (server){
    server.Session = server.SyncedData.extend({
        className: 'Session',
        wbpSent: true,
        catch: function(fn, item){
            try{ fn(); }catch(e){ 
                console.error(e);
                this.log('error', {
                    error: e.toString(),
                    stack: e.stack
                });
            }
        },
        timeStatStart: function(name){
            this.timestat.push({
                name: name,
                startTime: Date.now(),
                endTime: 0
            });
        },
        timeStatEnd: function(){
            this.timestat[this.timestat.length-1].endTime = Date.now();
        },
        timeRunStart: function(){
            if (this.testTime === null){
                this.testTime = Date.now();
                return true;
            }
            return false;
        },
        timeRunEnd: function(){
            this.runCount++;
            this.runTime += Date.now() - this.testTime;
            this.testTime = null;
        },
        close: function(){
            var status = this.get('status');
            
            if (/*!this.isTest() && */status === 'activated'){
                this.callEventListener('store-close', {});
            }else{
                this.callEventListener('close', {});
            }
        },
        start: function(){
            console.log('init');
                    
            this.callEventListener('init', {session: this});
        },
        activate: function(){
            console.log('activate session');
            this.set({
                status: 'activated'
            });
        },
        stop: function(){
            console.log('stop session');
            this.set({
                status: 'end'
            });
            
            this.callEventListener('end-session', {session: this});
        },
        share: function(){
            if (!this.isTest()){
                this.set({shared: true});
                this.callEventListener('share', {session: this});
            }
        },
        unshare: function(){
            if (!this.isTest()){
                this.set({shared: false});
                this.callEventListener('unshare', {session: this});
            }
        },
        waitPlayers: function(){
            this.set({waitPlayers: true});
            this.callEventListener('wait-players', {session: this});
        },
        unwaitPlayers: function(){
            this.set({waitPlayers: false});
            this.callEventListener('unwait-players', {session: this});
            this.unshare();
        },
        isTest: function(){
            return this.get('isTest');
        },
        isWaitingPlayers: function(){
            return this.get('waitPlayers');
        },
        isShared: function(){
            return this.get('shared');
        },
        log: function(type, data){
            this.callEventListener('log', {session: this, log: data, type: type});
        },
        init: function(project){
            if (!this.get('status')){
                this.set({
                    status: 'created',
                    info: '',
                    logs: project.watch(new server.SessionLogs)
                });
            }
            
            this.runCount = 0;
            this.runTime = 0;
            this.startTime = Date.now();
            this.testTime = null;

            this.timestat = [];
            
            var runtimer = setInterval(function(){
                console.log('%', Math.round((100000*this.runTime)/(Date.now()-this.startTime))/1000, 'runtime:', this.runTime, 'count:', this.runCount);
                this.log('load', {runtime: this.runTime, time: Date.now()-this.startTime});
                
                const used = process.memoryUsage();
                for (let key in used) {
                  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                }

                if (this.timestat.length > 0){
                    var names = {};
                    
                    this.timestat.forEach(function(ts){
                        if (names[ts.name]){
                            names[ts.name].cnt++;
                            names[ts.name].sum += ts.endTime - ts.startTime;
                            names[ts.name].min = Math.min(names[ts.name].min, ts.endTime - ts.startTime);
                            names[ts.name].max = Math.max(names[ts.name].max, ts.endTime - ts.startTime);
                        }else{
                            names[ts.name] = {
                                name:ts.name,
                                min: ts.endTime - ts.startTime,
                                max: ts.endTime - ts.startTime,
                                sum: ts.endTime - ts.startTime,
                                cnt: 1
                            };
                        }
                    });
                    
                    Object.keys(names).forEach(function(i){
                        var n = names[i];
                        console.log(n.name+':', n.sum+' / '+n.cnt, '('+n.min, n.max+')', Math.round(n.sum/n.cnt, 2));
                    });
                }
                
                this.runCount = 0;
                this.runTime = 0;
                this.startTime = Date.now();
                this.timestat = [];
            }.bind(this), 10000);
            
            this.on('destroy', function(){
                clearInterval(runtimer);
            }, this);
            
            //Globals
            this.set({
                players: project.watchByID('AllPlayers', function(){
                    return new server.AllPlayers([]);
                }),
                time: project.watchByID('SessionTime', function(){
                    return new server.SessionTime;
                })
            });
            
            project.waitItem('AllPlayers', function(players){
                players.on('join-spectator', function(ev){
                    var status = this.get('status');
                    var player = ev.player;
                    
                    if (status === 'created'){
                        if (this.get('shared')){
                            this.share();
                        }else{
                            this.unshare();
                        }

                        if (this.get('waitPlayers')){
                            this.waitPlayers();
                        }else{
                            this.unwaitPlayers();
                        }

                        player.joinGame();
                        
                        this.activate();                        
                    }else{
                        if (this.isWaitingPlayers()){
                            player.joinGame();
                        }else{
                            var dialog = this.watcher.watch(new server.Dialog);

                            dialog.addField(
                                this.watcher.watch(new server.SessionSettingDenied)
                            );

                            dialog.setupDialog({
                                player: player
                            });

                            player.openDialog(dialog);
                        }
                    }
                }, this);
            }.bind(this));
            
            this.on('set:triggerList', function(ev){
                this.get('triggerList').mount({target: this});
            }, this);
            
            this.on('set:status', function(ev){
                if (!ev.lastValue){
                    return;
                }
                            
                console.log('session status', ev.value);
                if (ev.value === 'created'){
                    this.callEventListener('created', {session: this, status: ev.value});
                }
                if (ev.value === 'activated'){
                    this.callEventListener('activated', {session: this, status: ev.value});
                }
                if (ev.value === 'end'){
                    this.callEventListener('end', {session: this, status: ev.value});
                }
                
                this.callEventListener('set-status', {session: this, status: ev.value});
            }, this);
        }
    });
};