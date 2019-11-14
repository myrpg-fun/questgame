var SyncedItem = SyncedData.extend({
    getSchemeField: function(){
        if (this._schemeBlk){
            return this._schemeBlk;
        }
            
        this._schemeBlk = this.createSchemeField();
            
        return this._schemeBlk;
    },
    initialize: function(){
        SyncedData.prototype.initialize.apply(this, arguments);
    
        this._schemeBlk = null;
        
        this.on('added-collection', function(eventcol){
            var fn = function(event){
                eventcol.collection.remove(this);
            };
            
            var rnf = function(event){
                if (eventcol.collection === event.collection){
                    this.off('destroy', fn, this);
                    this.off('removed-collection', rnf, this);
                }
            };
            
            this.on('destroy', fn, this);
            this.on('removed-collection', rnf, this);
        }, this);
    }
});

ActionClass = SyncedItem.extend({
    className: 'ActionClass',
    destrLsnTimer: function(field){
        this.on('destroy', function(event){
            client.setTimeout(function(){
                field.destroy();
            }, 200);
        }.bind(this));
        
        return field;
    },
    get: function(attr){
        var value = this.attributes[attr];
        if (value instanceof WatcherRelation && value.issetItem()){
            value = value.getItem();
        }
        if (value instanceof client.ActionArg){
            value = value.getValue();
        }

        return value;
    }
});

SyncedList = SyncedItem.extend({
    collectionInstance: null,
    onSelect: function(actionClass){
        var newAC = new actionClass(this);
        if (this.collectionInstance && !(newAC instanceof this.collectionInstance)){
            console.error('Selected wrong instance class');
            return;
        }

        this.add([ this.watcher.watch(newAC) ]);
    },
    afterSync: function(fn){
        SyncedData.prototype.afterSync.call(this, function(){
            this.watcher.afterSync(this.getCollection(), fn);
        }.bind(this));
    },
    getWatchedEvents: function(){
        return ['set', 'add', 'remove', 'sort', 'removed-nulls'];
    },
    add: function(actionArray){
        actionArray.forEach(function(action){
            if (this.collectionInstance && !(action instanceof this.collectionInstance)){
                console.error('Added class is wrong instance');
                return;
            }

            this.get('collection').push( action.getRel() );
            this.callEventListener('add', {collection: this, item: action});
            action.callEventListener('added-collection', {collection: this, item: action});
        }, this);
    },
    remove: function(action){
        var SRel = action.getRel();
        this.get('collection').forEach(function(fld, idx){
            if (SRel === fld){
                this.get('collection').splice(idx, 1);
                this.callEventListener('remove', {collection: this, item: action, index: idx});
                action.callEventListener('removed-collection', {collection: this, item: action});

                return true;
            }
        }, this);
    },
    sort: function(event, testFn){
        var FCollection = event.sorted;
        var col = this.get('collection');
        var sorted = false;
        for (var dc = 0; dc < col.length; dc++){
            for (var fc = dc; fc < FCollection.length; fc++){
                if (testFn(FCollection[fc], (col[dc] instanceof WatcherRelation)?(col[dc].getItem()):col[dc])){
                    if (dc !== fc){
                        col.splice(dc, 0, col.splice(fc, 1)[0]);
                        sorted = true;
                    }                    
                    break;
                }
            }
        }

        if (sorted){
            this.callEventListener('sort', {target: this, sorted: this.getCollection()});
        }
    },
    has: function(item){
        return this.getCollection().indexOf(item) !== -1;
    },
    forEach: function(fn, self){
        return this.getCollection().forEach(fn, self);
    },
    getCollection: function(){
        var result = [];
        var collection = this.get('collection');

        for (var i=0; i<collection.length; i++){
            var item = collection[i];
            if (item instanceof WatcherRelation){
                var titem = item.getItem();
                if (titem === null){
                    collection.splice(i, 1); //remove deleted items
                    this.callEventListener('removed-nulls', {target: this});
                    i--;
                }else{
                    result.push(titem);
                }
            }else{
                result.push(item);
            }
        }

        return result;
    },
    createSchemeCollection: function(methodName){
        if (!methodName){
            methodName = 'getSchemeField';
        }

        var sendArgs = Array.prototype.slice.call(arguments, 1);

        var SCollection = new SchemeCollectionUserSort([]);

        this.on('replace', function(){
            client.setTimeout(function(){
                SCollection.removeAll();
                SCollection.add( this.getCollection().map(function(action){
                    return action[methodName].apply(action, sendArgs);
                }) );
            }.bind(this), 0);
        }.bind(this));

        this.on('add', function(event){
            SCollection.add([event.item[methodName].apply(event.item, sendArgs)]);
        }.bind(this));

        this.on('remove', function(event){
            SCollection.remove(event.item[methodName].apply(event.item, sendArgs));
        }.bind(this));

        this.on('sort', function(event){
            SCollection.sort(event, function(action, SC){return SC === action[methodName].apply(action, sendArgs);});
        }.bind(this));

        var SCe;

        SCollection.on('sort', SCe = function(event){
            this.sort(event, function(SC, action){return SC === action[methodName].apply(action, sendArgs);});
        }.bind(this));

        this.on('destroy', function(){
            SCollection.off('sort', SCe);
        }.bind(this));

        client.setTimeout(function(){
            SCollection.removeAll();
            SCollection.add(this.getCollection().map(function(action){
                return action[methodName].apply(action, sendArgs);
            }));
        }.bind(this), 0);

        return SCollection;
    },
    createAttrs: function(project){
        this.set({
            collection: this._initCollection
        });
    },
    init: function(project){},
    initialize: function(collection){
        SyncedItem.prototype.initialize.call(this);

        this._initCollection = collection;

        this.on('set:collection', function(event){
            var collection = this.get('collection');

            for (var i=0; i<collection.length; i++){
                var item = collection[i];
                if (item instanceof WatcherRelation){
                    var titem = item.getItem();
                    if (titem === null){
                        collection.splice(i, 1); //remove deleted items
                        this.callEventListener('removed-nulls', {target: this});
                        i--;
                    }
                }
            }
            
            this.callEventListener('replace', {
                lastValue: event.lastValue?event.lastValue.map(function(item){
                    item = (item instanceof WatcherRelation)?(item.getItem()):item;
                    if (item){
                        item.callEventListener('removed-collection', {collection: this, item: item});
                    }
                    return item;
                }.bind(this)):null,
                value: event.value.map(function(item){
                    item = (item instanceof WatcherRelation)?(item.getItem()):item;
                    if (item){
                        item.callEventListener('added-collection', {collection: this, item: item});
                    }
                    return item;
                }.bind(this)),
                target: this
            });
        }.bind(this));
    }
});

client.ActionArg = SyncedItem.extend({
    className: 'ActionArg',
    variable: null,
    setup: function(variable){
        this.variable = variable;
    },
    getValue: function(){
        return this.variable;
    }
});

client.ActionArgClass = client.ActionArg.extend({
    className: 'ActionArgClass'
});

client.ActionArgRemove = client.ActionArg.extend({
    className: 'ActionArgRemove',
});

client.ActionList = SyncedList.extend({
    className: 'ActionList',
    args: function(){
        return this.get('args');
    },
    getLocalsByType: function(type){
        var locals = this.locals();
        var result = [];
        for (var i in locals){
            if (locals[i].get('type') === type){
                result.push(locals[i]);
            }
        }
        return result;
    },
    addArgs: function(actionArray){
        actionArray.forEach(function(action){
            if (!(action instanceof client.ActionArg)){
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
    runAction: function(actionFn, args){
        if (this.isRun){
            return;
        }

        this.isRun = true;
        //this.setupArgs(args);

        try{
            var collection = this.getCollection();

            for (var i=0; i<collection.length; i++){
                if (collection[i][actionFn]){
                    collection[i][actionFn](args);
                }
            }
        }catch(error){
            console.trace(error);
        }
        this.isRun = false;
    },
    run: function(args){
        this.runAction('run', args);
    },
    mount: function(args){
        this.runAction('mount', args);
    },
    unmount: function(args){
        this.runAction('unmount', args);
    },    
    _getDeletedAttributes: function(){
        return Object.keys(this.attributes);
    },
    initialize: function(collection, args){
        ActionClass.prototype.initialize.call(this);
        
        this.isRun = false;
        
        this._init = {col: collection, args: args};
    }
});

client.ActionListSort = client.ActionList.extend({
    className: 'ActionListSort',
    add: function(actionArray){
        client.ActionList.prototype.add.call(this, actionArray);
        
        
    },
    remove: function(action){
        client.ActionList.prototype.remove.call(this, action);
        
        
    },
    initialize: function(collection, name){
        client.ActionList.prototype.initialize.call(this, collection);
        
        this._sortName = name;
    }
});

