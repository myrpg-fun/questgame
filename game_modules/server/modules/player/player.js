var zz = require('../../zz');

module.exports = function (server){
    server.PlayerNotificationsList = server.SyncedList.extend({
        className: 'PlayerNotificationsList',
        wbpSent: true,
        clear: function(){
            var col = this.getCollection();
            
            col.forEach(function(item){
                this.remove(item);
                item.destroy();
            }, this);
        },
        getWatchedEvents: function(){
            return ['add'];
        },
        init: function(){
            this.on('add', function(ev){
                var item = ev.item;
                this.get('player').watch(item);

                setTimeout(function(){
                    this.remove(item);
                    item.destroy();
                }.bind(this), 10000);
            }, this);
        }
    });
    
    server.PlayerObject = server.Object.extend({
        className: 'PlayerObject',
        wbpSent: true,
        getUserName: function(){
            return this.get('username');
        },
        closeDialog: function(){
            this.set({DialogOpened: null});
        },
        openDialog: function(dialog){
            this.set({DialogOpened: dialog});
        },
        closeMapOverlay: function(){
            this.set({MapOverlayOpened: null});
        },
        openMapOverlay: function(dialog){
            this.set({MapOverlayOpened: dialog});
        },
        openNotification: function(dialog){
            if (this.get('online')){
                this.get('Notifications').add([dialog]);
            }
        },
        clearNotifications: function(){
            this.get('Notifications').clear();
        },
        addFlag: function(flag){
            var flagList = this.get('flagList');
            
            if (flag instanceof server.FlagGroupClass && !flagList.has(flag)){
                flagList.add([flag]);
                flag.add([this]);
            }
        },
        removeFlag: function(flag){
            this.get('flagList').remove(flag);
            flag.remove(this);
        },
        createAttrs: function(){
            this.playerwatch = this.watcher.watch(new server.PlayerWatcher(this));
            this.set({
                DialogOpened: null,
                MapOverlayOpened: null,
                Notifications: this.watcher.watch(
                    new server.PlayerNotificationsList([]).set({player: this})
                ),
                /*
                 * spectator - случайно зашедший
                 * player - зарегистрированный игрок
                 */
                online: false,
                status: 'spectator',
                playerwatch: this.playerwatch,
                flagList: this.watcher.watch(
                    new server.FlagCollectionList([])
                ),
            });
            
            this.watch(this);
        },
        watch: function(obj, flag){
            this.playerwatch.watch(obj, flag);
            
            return obj;
        },
        unwatch: function(obj, flag){
            this.playerwatch.unwatch(obj, flag);
            
            return obj;
        },
        isWatched: function(item){
            return this.playerwatch.isWatched(item);
        },
        playerWatch: function(){
            return this.playerwatch;
        },
        isAdmin: function(){
            return this.watcher.getItem('Session').get('authorId')*1 === this.get('userid')*1;
        },
/*        setVar: function(attr, value){
            this.get('class').get('classList').forEach(function(classObj){
                if (classObj.id === attr){
                    var object = this.get(classObj.id);

                    if (object){
                        classObj.unmount({
                            target: object, object: this
                        });
                    }
                    
                    this.setAttribute(attr, value);
                    if (value){
                        classObj.mount({
                            target: value, object: this
                        });
                    }
                    
                    return true;
                }
            }, this);
        },*/
        joinGame: function(){
            //register player
            this.set({status: 'player'});
            
            var cl = this.get('class');
            var create = false;//this.get('_ct')?true:false;
                
            this.get('class').get('classList').forEach(function(classObj){
                var object = this.get(classObj.id);

                if (!object){
                    //create
                    object = classObj.createNew(this);
//                    console.log('create subclass', classObj.className, object.id);
                    this.setAttribute(classObj.id, object);
                }

                if (object && classObj.mount){
                    classObj.mount({
                        target: object, object: this, __class: cl, create: create
//                        target: object, object: this
                    });
                }
            }, this);
            
            this.get('class').get('triggerList').mount({
//                target: this, object: this
                target: this,
                object: this, 
                __class: cl, 
                create: create
            });

            this.get('class').get('objectList').add([this]);
            
            this.watcher.getItem('AllPlayers').registerPlayer(this);
        },
        init: function(project){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            //this.set({playerwatch: this.watcher.watch(new server.PlayerWatcher(this))});
            this.playerwatch = this.get('playerwatch');
            //this.watch(this);
            this.get('Notifications').afterSync(function(){
                this.clearNotifications();
                this.get('playerwatch').afterSync(function(){
                    this.watch(this.get('Notifications'), true);
                }.bind(this));
            }.bind(this));
            
            console.log('init player', this.id);
            this.on('new-player', function(ev){
                console.log('new-player');
                this.set({online: true});
//                this.callEventListener('new-player', ev); ?
            }, this);
            
            this.setupIF = true;
            
//            var timerNotification = null;
            this.on('join-player', function(ev){
                if (this.setupIF){
                    this.setupIF = false;
                    
                    this.get('class').get('interfaceList').forEach(function(classObj){
                        classObj.unmount({
                            target: this, object: this
                        });
                        classObj.mount({
                            target: this, object: this
                        });
                    }, this);
                }
                
                this.set({online: true});
                
/*                if (timerNotification){
                    clearTimeout(timerNotification);
                    timerNotification = null;
                }*/
//                this.callEventListener('join-player', ev);
            }, this);
            
            this.on('quit-player', function(ev){
                this.set({online: false});
//                this.callEventListener('quit-player', ev);
                
/*                timerNotification = setTimeout(function(){
                    this.clearNotifications();
                    timerNotification = null;
                }.bind(this), 30000);//set time to relog*/
            }, this);
            
            this.on('destroy', function(){
                this.get('class').get('objectList').remove(this);
                
                this.playerwatch.destroy();
            }, this);
            
            this.on('set:DialogOpened', function(ev){
                var oldDialog = ev.lastValue;
                if (oldDialog){
                    oldDialog.callEventListener('dialog-close');
                    
                    this.playerwatch.unwatch(oldDialog);
                    oldDialog.destroy();
                }

                if (ev.value){
                    ev.value.callEventListener('dialog-open');
            
                    this.playerwatch.watch(ev.value);
                }
            });
            
            this.on('set:MapOverlayOpened', function(ev){
                var oldDialog = ev.lastValue;
                if (oldDialog){
                    this.playerwatch.unwatch(oldDialog);
                    oldDialog.destroy();
                }

                if (ev.value){
                    this.playerwatch.watch(ev.value);
                }
            });
            
            project.afterSync(function(){
                if (this.get('status') === 'player'){
                    var cl = this.get('class');
                    var create = false;//this.get('_ct')?true:false;
                    
                    this.get('class').get('classList').forEach(function(classObj){
                        var object = this.get(classObj.id);

                        if (!object){
                            //create
                            object = classObj.createNew(this);
                            console.log('create subclass', classObj.className, object.id);
                            this.setAttribute(classObj.id, object);
                        }

                        if (object && classObj.mount){
                            classObj.mount({
                                target: object, object: this, __class: cl, create: create
                            });
                        }
                    }, this);

                    this.get('class').get('triggerList').forEach(function(classObj){
                        classObj.mount({
                            target: this, object: this, __class: cl, create: create
                        });
                    }, this);
                    
                    this.get('class').get('objectList').add([this]);
                }else{
                    this.get('class').get('classList').forEach(function(classObj){
                        var object = classObj.createNew(this);

                        this.setAttribute(classObj.id, object);
                    }, this);
                }
                
                //admin logs
                var session = this.watcher.getItem('Session');
                if (this.isAdmin()/* | session.isTest()*/){
                   this.watch(session.get('logs'));
                }
            }.bind(this));
        }
    });
    
    server.PlayerTemplate = server.Class.extend({
        className: 'PlayerTemplate',
        create: function(user){
            var player = this.watcher.watch((new server.PlayerObject).set({
                class: this, 
                userid: user.get('id'),
                username: user.get('name'), 
                useravatar: user.get('avatar'), 
                usericon: user.get('mapicon')
            }));
            
            this.get('flagList').forEach(function(flag){
                player.get('flagList').add([flag]);
                flag.add([player]);
            });
            
            return player;
        },
        init: function(){}
    });
};