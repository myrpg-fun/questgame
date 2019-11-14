var zz = require('../zz');

module.exports = function (server){
    server.ActionClass = server.SyncedData.extend({
        //className: 'ActionClass',
        _listArgs: function(){
            var attrs = Object.assign({}, this.attributes);
            
            var keys = Object.keys(attrs).filter((a)=>attrs[a] instanceof server.ActionArg);
            
            attrs = keys.map((a)=>attrs[a]);
            
            return attrs;
        },
/*        _updateArgs: function(cloneargs){
            var attrs = Object.assign({}, this.attributes);
            for (var i in attrs){
                if (attrs[i] && attrs[i].changeClone){
                    this.setAttribute(i, attrs[i].changeClone(cloneargs));
                }
            }
        },*/
        _listArgsAfter: function(){
            return [];
        },
        setupArg: function(attr, value){
            if (this.attributes[attr] && this.attributes[attr] instanceof server.ActionArg){
//                console.log('setup arg', attr, this.attributes[attr].id);
                this.attributes[attr].setup(value);
            }
        },
        get: function(attr){
            var value = this.attributes[attr];
            //value = (value instanceof server.WatcherRelation)?(value.getItem()):value;
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
        initialize: function(){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._collection = null;

/*            this.on('after-clone', function(ev){
                var cloneargs = ev.clone._listArgs().map(function(arg){
                    return {arg: arg, clone: arg.clone()};
                }.bind(this));
                
                ev.clone._updateArgs(cloneargs);
            }, this);*/

            
/*            
            this.on('added-collection', function(ev){
                console.log('AC added ', this.id, 'to', ev.collection.id);
                
                this._collection = ev.collection;
            }, this);*/
        }
    });
    
    server.ActionList = server.SyncedList.extend({
        className: 'ActionList',
        wbpSent: true,
        isRun: false,
/*        _updateArgs: function(cloneargs){
            var args = this.args();
            args.forEach(function(arg, i){
                args[i] = arg.changeClone( cloneargs );
            }, this);

            this.getCollection().forEach(function(actionClass){
                actionClass._updateArgs(cloneargs);
            }, this);
        },
        changeClone: function(cloneargs){
            this._updateArgs(cloneargs);
            
            return this;
        },*/
        args: function(){
/*            var attrs = this.getAttributes();
            delete attrs['_list'];*/
            return this.get('args');
        },
/*        setupArgs: function(args){
            var loc = this.locals();
            
            //console.log('setup locals', Object.keys(loc), Object.keys(args));
            for (var name in args){
                if (loc[name]){
                    //console.log('setup', name, args[name].id);
                    loc[name].setup(args[name]);
                }
            }
        },*/
        runAction: function(actionFn, args){
            if (this.isRun){
                return;
            }
            
            this.isRun = true;
            //this.setupArgs(args);
            
            try{
                var collection = this.getCollection();
                
                for (var i=0; i<collection.length; i++){
                    if (collection[i] && collection[i][actionFn]){
                        collection[i][actionFn](args);
                    }
                }
            }catch(error){
                console.trace(error);
                this.watcher.getItem('Session').log('error', {
                    error: error.toString(),
                    stack: error.stack
                });
            }
            this.isRun = false;
        },
        setupClass: function(args){
            if (args && args.__class){
                args.__class.setupArg('classArg', args.object);
            }
        },
        run: function(args){
            this.setupClass( args );
            
            this.runAction('run', args);
        },
        mount: function(args){
            this.runAction('mount', args);
        },
        unmount: function(args){
            this.runAction('unmount', args);
        },
        addArgs: function(actionArray){
            actionArray.forEach(function(action){
                if (!(action instanceof server.ActionArg)){
                    console.error('Adding wrong argument type');
                    return;
                }

                if (!this.hasArgs(action)){
                    this.get('args').push( action );

                    action.on('destroy', function(){
                        this.removeArgs(action);
                    }, this);

                    this.callEventListener('add-args', {collection: this, item: action});
                }
            }, this);            
        },
        removeArgs: function(action, silence){
            var idx = this.get('args').indexOf(action);
            if (idx !== -1){
                this.get('args').splice(idx, 1);

                action.off('destroy', null, this);

                this.callEventListener('remove-args', {collection: this, item: action, index: idx}, silence);

                return true;
            }
        },
        hasArgs: function(item){
            return this.get('args').indexOf(item) !== -1;
        },
        createAttrs: function(project){
            this.set({
                collection: [],
                args: []
            });

            this.add(this._init.col);
            this.addArgs(
                this._init.args
            );
//            this.set( this._init );
        },
        init: function(){
            this.on('watch-player', function(ev){
                ev.watcher.watch(this.getCollection());
                //ev.watcher.watch(this.args());
                
                /*var loc = this.locals();
                for (var name in loc){
                    ev.watcher.watch(loc[name]);
                }*/
            });
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(this.getCollection());
                //ev.watcher.unwatch(this.args());
                
                /*var loc = this.locals();
                for (var name in loc){
                    ev.watcher.unwatch(loc[name]);
                }*/
            });
        },
        initialize: function(collection, args){
            server.SyncedData.prototype.initialize.call(this);

            this.isRun = false;
            
            this._init = {col: collection, args: args};

            this.on('before-clone', function(ev){
                var attr = ev.attr;
                attr.collection = [];
                attr.args = attr.args.slice(0);
            }, this);

            this.on('after-clone', function(ev){
                this.getCollection().forEach(function(action){
                    ev.clone.add([action.clone()]);
                });

/*                ev.clone.getCollection().forEach(function(action){
                    if (action._updateArgsAfter){
                        action._updateArgsAfter( this );
                    }
                }, this);*/
            }, this);
        }
    });
    
    /*server.ActionListCollection = server.SyncedList.extend({
        className: 'ActionListCollection',
        wbpSent: true,
        actionList: function(){
            return this.get('actionList');
        },
        init: function(){
            this.on('watch-player', function(ev){
                ev.watcher.watch(this.getCollection());
            });
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(this.getCollection());
            });
        },
        createAttrs: function(project){
            server.SyncedList.prototype.createAttrs.apply(this, arguments);

            this.set({
                actionList: this._al
            });
        },
        initialize: function(collection, actionList){
            server.SyncedList.prototype.initialize.apply(this, arguments);

            this._al = actionList;
        }
    });*/
    
    server.ActionArg = server.SyncedData.extend({
        className: 'ActionArg',
        wbpSent: false,
        value: null,
        setup: function(variable){
            this.value = variable;
        },
        getValue: function(){
            return this.value;
        },
        changeClone: function(cloneargs){
            var f = cloneargs.find(function(o){
                return this === o.arg;
            }.bind(this));
            
            return f?f.clone:this;
        },
        createAttrs: function(project){
            this.set( this._init );
        },
        initialize: function(name, type){
            server.SyncedData.prototype.initialize.call(this);

            this._init = {name: name, type: type};
            this.value = null;
        }
    });
    
    server.ActionArgRemove = server.ActionArg.extend({});
    
    server.ActionArgAttribute = server.ActionArg.extend({
        className: 'ActionArgAttribute',
        wbpSent: false,
        getValue: function(){
            var item = this.get('arg').getValue();
                    
            if (!item){
                return null;
            }                    
            
            return item.get(this.get('attr'));
        }
    });
    
    server.ActionArgNameAttribute = server.ActionArg.extend({
        className: 'ActionArgNameAttribute',
        wbpSent: false,
        getValue: function(){
            var item = this.get('arg').getValue();
                    
            if (!item){
                return null;
            }                    

            var name = item.get(this.get('attr'));
            
            if (typeof name === 'string'){
                return this.watcher.watch(new server.Text(name));
            }
            
            return null;
        }
    });
    
    server.CustomField = server.ActionClass.extend({
        className: 'CustomField',
        changeClone: function(cloneargs){
            var i = this.attributes.item;
            
            var f = cloneargs.find(function(o){
                return i === o.arg;
            }.bind(this));
            
            if (f){
                var cl = this.clone();
                
                cl.set({item: f.clone});
                
                return cl;
            }
            
            return this;
        },
        getValue: function(){
            return this.get('item');
        }
    });
};