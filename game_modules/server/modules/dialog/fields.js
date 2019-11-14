module.exports = function (server){
    server.DialogFields = server.ActionClass.extend({
        restoreArgs: function(){}
    });
    
    server.DialogTextButton = server.DialogFields.extend({
        className: 'DialogTextButton',
        wbpSent: true,
        cloneAttrs: function(){
            return ['args'];//, 'list'];
        },
        setup: function(args){
            this.set({
                dialog: args.thisArg
            });
//            this.get('args').set(args);
        },
        init: function(){
            if (!this.get('args')){
                this.set({
                    args: this.watcher.watch(new server.SyncedData)
                });
            }
            
            this.on('watch-player', function(ev){
                var player = ev.player;
                var watcher = player.playerWatch();

                var clickFn = function(){
//                    var args = this.get('args');
                    /*args.set({
                        player: player
                    });*/
//                    console.log('click', this.get('args').get('player').id);
                    
//                    this.get('args').get('player').setup(player);
                    this.get('dialog').restoreArgs();
                    
                    this.get('list').run();//args.getAttributes());
                    
                    watcher.sendWithPack('player-click-'+this.id+'-done');
                }.bind(this);

                watcher.listenSocket('player-click:'+this.id, clickFn);
            }, this);
            
            this.on('unwatch-player', function(ev){
                ev.player.playerWatch().unlistenSocket('player-click:'+this.id);
            }, this);
        }
    });

    server.DialogInventorySelect = server.DialogFields.extend({
        className: 'DialogInventorySelect',
        wbpSent: true,
        _listArgs: function(){
            console.log('DialogInventorySelect clone');
            
            var attrs = Object.assign({}, this.attributes);
            
            var keys = Object.keys(attrs).filter((a)=>attrs[a] instanceof server.ActionArg);
            
            attrs = keys.map((a)=>attrs[a]);
            
            console.log(attrs.map(a=>a.id));
            
            return attrs;
        },
        setup: function(args){
            console.log('inventory select setup');

            var inv = this.get('inventory');
            
            this.set({
                inventoryview: inv,
                dialog: args.thisArg
            });
        },
        init: function(){
            this.on('watch-player', function(ev){
                //this.on('set:inventory', setfn, this); ?
                var player = ev.player;
                var watcher = player.playerWatch();
                
                player.watch(this.get('inventoryview'));

                var clickFn = function(msg){
                    console.log('inventory clicked', player.get('userid'), this.id);

                    var relitem = this.get('inventoryview').getItemByXY(msg.x, msg.y);

                    if (relitem && !(relitem instanceof server.InventoryEmptyRelation)){
/*                        var args = this.get('args');
                        args.set({
                            player: player,
                            invitem: relitem.getItem(),
                            invitemcount: this.watcher.watch(new server.Counter(relitem.getCount()))
                        });*/
                        var count = this.watcher.watch(new server.Counter(relitem.getCount()));

                        this.setupArg('itemArg', relitem.getItem());
                        this.setupArg('countArg', count);

                        this.get('dialog').restoreArgs();

                        this.get('click').run();

                        count.destroy();
                    
                        watcher.sendWithPack('player-click-'+this.id+'-done');
                    }
                }.bind(this);

                watcher.listenSocket('player-click:'+this.id, clickFn);
            }, this);
            
            this.on('unwatch-player', function(ev){
                //this.off('set:inventory', setfn);

                ev.player.unwatch(this.get('inventoryview'));

                ev.player.playerWatch().unlistenSocket('player-click:'+this.id);
            }, this);
        }
    });

    server.DialogChangeField = server.DialogFields.extend({
        className: 'DialogChangeField',
        wbpSent: true,
        _updateArgs: function(cloneargs){
            server.ActionClass.prototype._updateArgs.apply(this, arguments);
            
            this.get('dialogptr')._updateArgs(cloneargs);
        },
        cloneAttrs: function(){
            return ['dialogptr'];
        },
        _listArgsAfter: function(){
            return [this.attributes.arg];
        },
        _updateArgsAfter: function(_al){
            var cloneargs = this._listArgsAfter().map(function(arg){
                return {arg: arg, clone: arg.clone()};
            }.bind(this));

            _al._updateArgs(cloneargs);
        },
        getLocals: function(){
            var attr = Object.assign({}, this.attributes);
            delete attr.name;
            delete attr.dialogptr;
            delete attr.dialogview;
            
            var result = {};
            
            for (var i in attr){
                if (attr[i] instanceof server.CustomField || attr[i] instanceof server.ActionArg){
                    result[i] = attr[i].getValue();
                }else{
                    result[i] = attr[i];
                }
            }
            
            return result;
        },
        setup: function(args){
            if (this.get('dialogptr')){
                this.get('dialogptr').changeDialog(this.get('dialogptr').get('dialog'), this.getLocals());
            }
        },
        init: function(){
            this.attributes.arg.setup( this.get('dialogptr') );
            
            this.get('dialogptr').on('change-dialog', function(){
                this.set({
                    ptr: this.get('dialogptr').getLastDialogPtr()
                });
                this.callEventListener('change-dialog');
            }, this);
            
            this.on('destroy', function(){
                this.get('dialogptr').destroy();
            }, this);
            
            this.on('watch-player', function(ev){
                var player = ev.player;
            
                var dvFn = function(){
                    if (this.get('dialogview')){
                        player.unwatch(this.get('dialogview'));
                    }

                    var dialog = this.get('ptr').get('dialog');
                    if (dialog instanceof server.DialogLocalIFField){
                        console.log('change to dialog', dialog.get('name'));
                        
                        this.set({dialogview: dialog});
                        
                        dialog.on('unwatch-player', function(){
                            dialog.destroy();
                        });

                        player.watch(dialog);
                    }else if (dialog instanceof server.Dialog){
                        console.log('change to dialog', dialog.get('name'));
                        var dialog = dialog.clone();
                        var args = this.get('ptr').get('args').getAttributes();
                        args.player = player;

                        dialog.setupDialog(args);

                        dialog.on('unwatch-player', function(){
                            dialog.destroy();
                        });

                        this.set({dialogview: dialog});
                        
                        player.watch(dialog);
                    }
                }.bind(this);
                
                this.on('change-dialog', dvFn, this);

                //console.log(this.__getEvents());
                
                if (this.get('ptr')){
                    dvFn({lastValue: null, value: this.get('dialogptr').getLastDialogPtr()});
                }
            }, this);
            
            this.on('unwatch-player', function(ev){
                this.off('change-dialog');
                
                ev.player.unwatch(this.get('dialogview'));
            }, this);
        }
    });

    server.DialogLocalIFField = server.DialogFields.extend({
        className: 'DialogLocalIFField',
        wbpSent: true,
        _listArgsAfter: function(){
            return [this.attributes.arg];
        },
        _updateArgsAfter: function(_al){
            var cloneargs = this._listArgsAfter().map(function(arg){
                return {arg: arg, clone: arg.clone()};
            }.bind(this));

            _al._updateArgs(cloneargs);
        },
        restoreArgs: function(args){
            this.get('fieldsList').runAction('restoreArgs', args);
        },
        setup: function(args){
            this.get('fieldsList').runAction('setup', args);
        },
        setupDialog: function(args){},
        init: function(){
            this.attributes.arg.setup( this );
            
            this.on('watch-player', function(ev){
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

    server.DialogChangeTextField = server.DialogFields.extend({
        className: 'DialogChangeTextField',
        wbpSent: true,
        setup: function(args){
            if (this.get('text')){
                this.changeText(this.get('text'));
            }
        },
        changeText: function(text){
            if (text instanceof server.SyncedData || typeof text === 'string'){
                console.log('set textview');
                this.set({
                    textview: text
                });
            }
        },
        init: function(){
            this.on('watch-player', function(ev){
                var player = ev.player;
            
                var dvFn = function(ev){
                    if (ev.lastValue instanceof server.Text){
                        player.unwatch(ev.lastValue);
                    }

                    var text = ev.value;
                    if (text instanceof server.Text){
                        //console.log('watch textview');
                        player.watch(text);
                    }
                }.bind(this);
                
                this.on('set:textview', dvFn, this);
                
                dvFn({lastValue: null, value: this.get('textview')});
            }, this);
            
            this.on('unwatch-player', function(ev){
                this.off('set:dialogview');
                
                ev.player.unwatch(this.get('textview'));
            }, this);
        },
    });

    server.DialogInputButton = server.DialogFields.extend({
        className: 'DialogInputButton',
        wbpSent: true,
        _listArgsAfter: function(){
            return [this.attributes.arg];
        },
        _updateArgsAfter: function(_al){
            var cloneargs = this._listArgsAfter().map(function(arg){
                return {arg: arg, clone: arg.clone()};
            }.bind(this));

            _al._updateArgs(cloneargs);
        },
        setup: function(args){},
        restoreArgs: function(){
            this.attributes.arg.setup(this.get('text'));
        },
        changeText: function(text){},
        init: function(){
            var text = this.watcher.watch(new server.Text(''));

            this.set({
                text: text
            });

            this.attributes.arg.setup(text);
            
            this.on('destroy', function(){
//                this.attributes.arg.destroy();
                this.attributes.text.destroy();
            });
            
            this.on('watch-player', function(ev){
                var player = ev.player;

                player.watch(this.attributes.text);
                
                var watcher = player.playerWatch();

                var changeFn = function(value){
                    text.setup( value.input );
                }.bind(this);

                watcher.listenSocket('player-change:'+this.id, changeFn);
            }, this);
            
            this.on('unwatch-player', function(ev){
                this.off('set:dialogview');
                
                ev.player.unwatch(this.attributes.text);
                
                ev.player.playerWatch().unlistenSocket('player-click:'+this.id);
            }, this);
        },
    });

    server.DialogQRCodeCheck = server.DialogFields.extend({
        className: 'DialogQRCodeCheck',
        wbpSent: true,
        _listArgsAfter: function(){
            return [this.attributes.qrArg];
        },
        _updateArgsAfter: function(_al){
            var cloneargs = this._listArgsAfter().map(function(arg){
                return {arg: arg, clone: arg.clone()};
            }.bind(this));

            _al._updateArgs(cloneargs);
        },
        setup: function(args){
            this.set({
                dialog: args.thisArg
            });
        },
        changeText: function(text){},
        init: function(){
            this.on('watch-player', function(ev){
                var player = ev.player;

                player.watch(this.attributes.text);
                
                var watcher = player.playerWatch();

                var changeFn = function(value){
//                    console.log('scan', value);
                    var qrcode = this.watcher.watch(new server.QRCode(value.qr));

                    this.setupArg('qrArg', qrcode);
                    
//                    console.log( this.attributes.qrArg );

                    this.get('dialog').restoreArgs();
                    
                    this.get('check').run();
                    
//                    this.get('dialog').storeArgs();
                    qrcode.destroy();
                    
                    watcher.sendWithPack('player-qrscan-'+this.id+'-done');
                }.bind(this);

                watcher.listenSocket('player-qrscan:'+this.id, changeFn);
            }, this);
            
            this.on('unwatch-player', function(ev){
                this.off('set:dialogview');
                
                ev.player.unwatch(this.attributes.text);
                
                ev.player.playerWatch().unlistenSocket('player-qrscan:'+this.id);
            }, this);
        }
    });

    server.DialogFieldTimer = server.DialogFields.extend({
        className: 'DialogFieldTimer',
        wbpSent: true,
        setup: function(args){
            var timer = this.get('timer');// get real value of argument
            
            this.set({
                timerview: timer
            });
        },
        init: function(){
            this.on('watch-player', function(ev){
                var player = ev.player;
                
                player.watch(this.get('timerview'));
            }, this);
            
            this.on('unwatch-player', function(ev){
                ev.player.unwatch(this.get('timerview'));
            }, this);
        },
    });
    
    server.CustomDialogTextField = server.DialogFields.extend({
        className: 'CustomDialogTextField',
        getValue: function(){
            return this.get('item');
        }
    });

    server.DialogFieldText = server.DialogFields.extend({
        className: 'DialogFieldText',
        wbpSent: true,
        setup: function(args){
            this.set({
                realFields: this.get('customFields').map(function(field){
                    if (field){
                        var item = field.get('item');
                        if (item){
                            return item;
                        }
                    }
                    return null;
                }, this)
            });
            
            this.update();
        },
        update: function(){
            var text = this.get('text');
            var fields = this.get('realFields');

            var patt = /\{[dtmu]\}/gmi;
            var match, i = 0;
            var result = '';
            var lastIndex = 0;
            while (match = patt.exec(text)){
                var rtxt = '';
                if (fields[i]){
                    if (fields[i] instanceof server.Counter){
                        rtxt = fields[i].getCount();
                    }
                    if (fields[i] instanceof server.Text){
                        rtxt = fields[i].getText();
                    }
                    if (fields[i] instanceof server.Timer){
                        if (fields[i].isStart()){
                            rtxt = '[tmr-'+fields[i].getTimeOutStamp()+']';
                        }else{
                            rtxt = fields[i].getTime();
                        }
                    }
                    if (fields[i] instanceof server.PlayerObject){
                        rtxt = fields[i].getUserName();
                    }
                }
/*                console.log('textup', text.substring(lastIndex, match.index));
                console.log('textfield', rtxt);*/
                result = result+text.substring(lastIndex, match.index)+rtxt;
                lastIndex = patt.lastIndex;
                i++;
            }
            result = result+text.substr(lastIndex);

            this.set({
                textview: result
            });
        },
        init: function(){
            if (!this.get('realFields')){
                this.set({realFields: []});
            }
            
            this.on('watch-player', function(){
                this.get('realFields').forEach(function(item){
                    if (item){
                        item.on('set', this.update, this);
                    }
                }, this);
            }, this);
            
            this.on('unwatch-player', function(){
                this.get('realFields').forEach(function(item){
                    if (item){
                        item.off('set', null, this);
                    }
                }, this);
            }, this);
        }
    });

    server.DialogFieldTask = server.DialogFields.extend({
        className: 'DialogFieldTask',
        wbpSent: true,
        setup: function(args){
            this.set({
                realFields: this.get('customFields').map(function(field){
                    if (field){
                        var item = field.get('item');
                        if (item){
                            return item;
                        }
                    }
                    return null;
                }, this)
            });
            
            this.update();
        },
        update: function(){
            var text = this.get('text');
            var fields = this.get('realFields');

            var patt = /\{[dtm]\}/gmi;
            var match, i = 0;
            var result = '';
            var lastIndex = 0;
            while (match = patt.exec(text)){
                var rtxt = '';
                if (fields[i]){
                    if (fields[i] instanceof server.Counter){
                        rtxt = fields[i].getCount();
                    }
                    if (fields[i] instanceof server.Text){
                        rtxt = fields[i].getText();
                    }
                    if (fields[i] instanceof server.Timer){
                        if (fields[i].isStart()){
                            rtxt = '[tmr-'+fields[i].getTimeOutStamp()+']';
                        }else{
                            rtxt = fields[i].getTime();
                        }
                    }
                }
/*                console.log('textup', text.substring(lastIndex, match.index));
                console.log('textfield', rtxt);*/
                result = result+text.substring(lastIndex, match.index)+rtxt;
                lastIndex = patt.lastIndex;
                i++;
            }
            result = result+text.substr(lastIndex);

            this.set({
                textview: result, 
                status: this.get('task').get('status')
            });
        },
        init: function(){
            if (!this.get('realFields')){
                this.set({realFields: []});
            }
            
            this.on('watch-player', function(){
                this.get('realFields').forEach(function(item){
                    if (item){
                        item.on('set', this.update, this);
                    }
                }, this);
                
                this.get('task').on('set:status', this.update, this);
            }, this);
            
            this.on('unwatch-player', function(){
                this.get('realFields').forEach(function(item){
                    if (item){
                        item.off('set', null, this);
                    }
                }, this);
                
                this.get('task').off('set:status', this.update, this);
            }, this);
        }
    });

    server.DialogInventoryItem = server.DialogFields.extend({
        className: 'DialogInventoryItem',
        wbpSent: true,
        setup: function(args){
            var item = this.get('item');
            var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                    
                    countObject.on('set:count', function(ev){
                        this.set({count: ev.value});
                    }, this);
                    
                    this.on('destroy', function(){
                        countObject.off('set:count', null, this);
                    }, this);
                }
            }else{
                count = this.get('counter')*1;
            }
            
            item.on('set:icon', function(ev){
                this.set({icon: ev.value});
            }, this);
            
            this.on('destroy', function(){
                item.off('set:icon', null, this);
            }, this);
            
            this.set({
                icon: item.get('icon'),
                x: item.get('x'),
                y: item.get('y'),
                count: count
            });
        },
        init: function(){}
    });

    server.DialogFieldImage = server.DialogFields.extend({
        className: 'DialogFieldImage',
        wbpSent: true,
        setup: false,
    });

    server.DialogFieldAudio = server.DialogFields.extend({
        className: 'DialogFieldAudio',
        wbpSent: true,
        setup: function(args){
            var audio = this.get('audio');
            
            this.set({
                url: audio.get('url')
            });
        },
    });

    server.DialogFieldSeparator = server.DialogFields.extend({
        className: 'DialogFieldSeparator',
        wbpSent: true,
        setup: false,
    });
};