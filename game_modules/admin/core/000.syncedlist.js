var SyncedItem = SyncedData.extend({
    _schemeBlk: null,
    getSchemeField: function(){
        if (this._schemeBlk){
            return this._schemeBlk;
        }
            
        this._schemeBlk = this.createSchemeField();
            
        return this._schemeBlk;
    },
    createObjectSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectThisField'))
            .linkTextValue('.blki-name', this, 'name')
            .openFieldClick('.link-open', this.getEditor(), {})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    getObjectSchemeField: function(){
        if (this._objSchemeBlk){
            return this._objSchemeBlk;
        }
            
        this._objSchemeBlk = this.createObjectSchemeField();
            
        return this._objSchemeBlk;
    },    
    initialize: function(){
        SyncedData.prototype.initialize.apply(this, arguments);
        
        this._schemeBlk = null;
        this._objSchemeBlk = null;
        
        this.on('added-collection', function(eventcol){
            var fn = function(event){
                eventcol.collection.remove(this, 'destroy');
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

SyncedList = SyncedItem.extend({
    moduleName: 'common',
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
    add: function(actionArray, silence){
        actionArray.forEach(function(action){
            if (this.collectionInstance && !(action instanceof this.collectionInstance)){
                console.error('Added class is wrong instance');
                return;
            }

            this.get('collection').push( action );
            this.callEventListener('add', {collection: this, item: action}, silence);
            action.callEventListener('added-collection', {collection: this, item: action}, silence);
        }, this);
    },
    remove: function(action, silence){
        var idx = this.get('collection').indexOf(action);
        if (idx !== -1){
            this.get('collection').splice(idx, 1);
            this.callEventListener('remove', {collection: this, item: action, index: idx}, silence);
            action.callEventListener('removed-collection', {collection: this, item: action}, silence);

            return true;
        }
    },
    count: function(){
        return this.get('collection').length;
    },
    sort: function(event, testFn){
        var FCollection = event.sorted;
        var col = this.get('collection');
        var sorted = false;
        var newcol = [];
        for (var fc = 0; fc < FCollection.length; fc++){
            for (var dc = 0; dc < col.length; dc++){
                if (testFn(FCollection[fc], col[dc])){
                    break;
                }                
            }
            newcol.push(col[dc]);
        }
        
        for (var dc = 0; dc < newcol.length; dc++){
            if (newcol[dc] !== col[dc]){
                sorted = true;
                break;
            }
        }
        
        if (sorted){
            col.splice.apply(col, [0, col.length].concat(newcol));
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
        return this.get('collection');
    },
    createSchemeCollection: function(methodName){
        if (!methodName){
            methodName = 'getSchemeField';
        }

        var sendArgs = Array.prototype.slice.call(arguments, 1);

        var SCollection = new SchemeCollectionUserSort([]);

        this.on('replace', function(){
            window.setTimeout(function(){
                SCollection.removeAll();
                SCollection.add( this.getCollection().map(function(action){
                    if (action && action[methodName]){
                        return action[methodName].apply(action, sendArgs);
                    }
                    return null;
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

        window.setTimeout(function(){
            SCollection.removeAll();
            SCollection.add(this.getCollection().map(function(action){
                if (action && action[methodName]){
                    return action[methodName].apply(action, sendArgs);
                }
                return null;
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

        this.on('before-clone', function(ev){
            ev.attr.collection = ev.attr.collection.slice(0);
        }, this);

        this.on('delete-sync', function(){
            this.getCollection().forEach(function(attr){
                if (attr && attr.deleteSync){
                    attr.deleteSync();
                }
            });
        }.bind(this));

        this.on('set:collection', function(event){
            this.callEventListener('replace', {
                lastValue: event.lastValue?event.lastValue.map(function(item){
                    item.callEventListener('removed-collection', {collection: this, item: item});
                    return item;
                }.bind(this)):null,
                value: event.value.map(function(item){
                    if (item){
                        item.callEventListener('added-collection', {collection: this, item: item});
                        return item;
                    }else{
                        return null;
                    }
                }.bind(this)),
                target: this
            });
        }.bind(this));
    }
});

admin.SyncedList = SyncedList.extend({
    className: 'SyncedList'
});