module.exports = function (server){
    server.DialogImage = server.SyncedData.extend({
        className: 'DialogImage',
    });
    
    server.DialogImageList = server.SyncedData.extend({
        className: 'DialogImageList',
    });
    
    server.DialogPtr = server.SyncedData.extend({
        className: 'DialogPtr',
        _updateArgs: function(cloneargs){
            var attrs = Object.assign({}, this.attributes);
            for (var i in attrs){
                if (attrs[i] && attrs[i].changeClone){
                    this.setAttribute(i, attrs[i].changeClone(cloneargs));
                }
            }
        },
        onChangePtr: function(){
            this.callEventListener('change-dialog');
        },
        get: function(attr){
            var value = this.attributes[attr];
            var inf = 0;

            while (value instanceof server.ActionArg){
                value = value.getValue();
                if (++inf>10000){
                    console.error('infinite loop here');
                    return null;
                }
            }

            return value;
        },
        getLastDialogPtr: function(){
            var dialog = this.get('dialog');

            console.log('getLastDialogPtr', this.get('dialog')?this.get('dialog').className:null);

            if (this._loop){
                return null;
            }

            if (dialog instanceof server.DialogPtr){
                this._loop = true;
                
                var res = dialog.getLastDialogPtr();
                
                this._loop = false;
                
                return res;
            }
            
            console.log(this.get('dialog')?this.get('dialog').get('name'):null);
            
            return this;
        },
        changeDialog: function(dialog, newargs){
            if (dialog === null){
                var lastdialog = this.get('dialog');
                if (lastdialog instanceof server.DialogPtr){
                    lastdialog.off('change-dialog', this.onChangePtr, this);
                }
                
                this.set({
                    dialog: dialog
                });

                this.callEventListener('change-dialog');
            }
            
            if (dialog instanceof server.SyncedData){
                var lastdialog = this.get('dialog');
                if (lastdialog instanceof server.DialogPtr){
                    lastdialog.off('change-dialog', this.onChangePtr, this);
                }
                
                this.set({
                    dialog: dialog
                });
                
                var newdialog = this.get('dialog');
                
                if (newdialog instanceof server.DialogPtr){
                    newdialog.on('change-dialog', this.onChangePtr, this);
                }

                if (newdialog instanceof server.Dialog && !newdialog.isRun){
//                    console.trace('set args', Object.keys(newargs));
                    var args = this.get('args');
                    var attrs = args.getAttributes();
                    for (var i in attrs){
                        args.removeAttribute(i);
                    }
                    args.set(newargs);
                }
                
                this.callEventListener('change-dialog');
            }
        },
        init: function(){
            if (!this.get('args')){
                var args = this.watcher.watch(new server.SyncedData);
                this.set({args: args});
                var attr = this.attributes;//this.getAttributes();
                delete attr.name;
                delete attr.dialogview;
                for (var i in attr){
                    if (attr[i] instanceof server.CustomField || attr[i] instanceof server.ActionArg){
                        args.setAttribute(i, attr[i]);
                    }
                }
            }
        }            
    });
    
    server.DialogPtrAdmin = server.DialogPtr.extend({
        className: 'DialogPtrAdmin'
    });
    
    server.Dialog = server.ActionClass.extend({
        className: 'Dialog',
        wbpSent: true,
        isRun: false,
        get: function(attr){
            return this.attributes[attr];
        },
        cloneAttrs: function(){
            return ['fieldsList', 'setupArgs'];
        },
        addField: function(field){
            this.get('fieldsList').add([field]);
        },
        createAttrs: function(watcher){
            this.set({
                player: watcher.watch(new server.ActionArgClass('Игрок', server.PlayerTemplate)),
                thisArg: watcher.watch(new server.ActionArg('Текущий интерфейс', 'Dialog')),
            });
        
            this.set({
                fieldsList: watcher.watch(
                    new server.ActionList(
                        [], [this.get('player'), this.get('thisArg')]
                ))
            });
        
            this.set({
                triggerList: watcher.watch(
                    new server.ActionList(
                        [], [this.get('player'), this.get('thisArg')]
                ))
            });
        },
        storeArgs: function(){
            var args = this.getAttributes();
            var setup = this.get('setupArgs');
            
            for (var i in args){
                var value = args[i];
                if (value instanceof server.ActionArg){
                    console.log('store', value.className);
                    var inf = 0;
                    while (value instanceof server.ActionArg){
                        value = value.getValue();
                        if (++inf>10000){
                            console.error('infinite loop here');
                            return null;
                        }
                    }

                    if (value instanceof server.PlayerObject){
                        console.log('player', value.get('userid'));
                    }

                    setup.setAttribute(i, value);
                }
            }
        },
        restoreArgs: function(){
            console.log('restore args');
            var setup = this.get('setupArgs').attributes;
            
            for (var i in setup){
                if (setup[i] instanceof server.PlayerObject){
                    console.log('player', setup[i].get('userid'));
                }

                this.get(i).setup(setup[i]);
            }
            
            this.get('fieldsList').runAction('restoreArgs');
        },
        setupDialog: function(args){
            if (this.isRun){
                return;
            }
            
            this.isRun = true;

            args.thisArg = this;
            for (var i in args){
                if (this.get(i)){
                    console.log('setup dialog arg', i, this.get(i).id);
                    this.get(i).setup(args[i]);
                }
            }
            
            //this.get('thisArg').setup(this);

            this.storeArgs();

            this.get('fieldsList').runAction('setup', args);
            
            console.log('dialog-init');
            this.callEventListener('dialog-init');
            
            this.isRun = false;
        },
        init: function(){
            this.isRun = false;
            
            if (!this.get('setupArgs')){
                this.set({
                    setupArgs: this.watcher.watch(new server.SyncedData)
                });
            }
            
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    if (!flag.has(this)){
                        flag.add([this]);
                    }
                }, this);
            }, this);

            this.on('before-clone', function(ev){
                delete ev.attr.flagList;
            }, this);
            
            /*this.set({
                args: this.watcher.watch(new server.SyncedData)
            });*/
            
            //this.on('set:triggerList', function(ev){
            this.get('triggerList').afterSync(function (){
                this.get('triggerList').mount({target: this});
            }.bind(this));
            //}, this);
    
            this.on('watch-player', function(ev){
                //this.get('fieldsList').setupArgs(this.get('args').getAttributes());
                
                ev.watcher.watch(
                    this.get('fieldsList')
                );
            }, this);
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(
                    this.get('fieldsList')
                );
            }, this);
        }
    });
    
    server.DialogFieldList = server.Dialog.extend({
        className: 'DialogFieldList',
    });
};