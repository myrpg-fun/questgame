var zz = require('../zz');

module.exports = function (server){
    server.SyncedData = zz.data.extend({
        className: 'SyncedData',
        wbpSent: false, //will be sent to player
        isEqualObj: function(obj){
            return this === obj;
        },
        _unserializeDataSync: function(attrs, i){
            if (attrs[i] instanceof Array){
                attrs[i] = attrs[i].slice(0);
                for (var index = attrs[i].length-1;index>=0;index--){
                    this._unserializeDataSync(attrs[i], index);
                };
            }

            if (attrs[i] && typeof attrs[i] === 'object'){ 
                if (attrs[i].type && attrs[i].type === 'rel' && attrs[i].id){
                    var item = this.watcher.getItem(attrs[i].id);
                    if (item){
                        attrs[i] = item;
                    }else{
                        //item removed
                        if (attrs instanceof Array){
                            attrs.splice(i, 1);
                        }else{
                            delete attrs[i];// = null;
                        }
                    }

                    return;
                }                
            }
        },
        unserialize: function(att){
            var attrs = Object.assign({}, att);

            for (var i in attrs){
                this._unserializeDataSync(attrs, i);
            }

            return attrs;
        },
        _serializeDataSync: function(attr, i, sIds){
            var value = attr[i];
            if (value instanceof Array){
                attr[i] = value.slice(0);
                attr[i].forEach(function(q, index){
                    this._serializeDataSync(attr[i], index);
                }, this);
                
                return;
            }
            
            if (value instanceof server.SyncedData){
                value = value.getRel();
            }

            if (value instanceof server.WatcherRelation){
                attr[i] = value.serialize();

                return;
            }
        },
        serialize: function (sIds){
            var attrs = Object.assign({}, this.attributes);

            for (var i in attrs){
                this._serializeDataSync(attrs, i, sIds);
            }

            return attrs;
        },
        setAttribute: function(name, value, silence){
            if (value instanceof server.WatcherRelation){
                value = value.getItem();
            }

            var last = this.attributes[name];
            if (last !== value){
                this.attributes[name] = value;

                this._setAttrs.push({value: value, attribute: name, lastValue: last, target: this, silence: silence});
                if (this._setTimer === null){
                    this._setTimer = setTimeout(function(){
                        server.catchSynced(function(){
                            this._setTimer = null;
                            
                            var attrs = this._setAttrs;
                            this._setAttrs = [];
                            
                            attrs.forEach(function(ev){
                                this.callEventListener('set', ev, ev.silence);
                                this.callEventListener('set:'+ev.attribute, ev, ev.silence);
                            }, this);
                        }.bind(this), this);
                    }.bind(this), 0);
                }
            }
        },
        getAttributes: function(){
            var result = {};

            for (var attr in this.attributes){
                result[attr] = this.get(attr);
            }

            return result;
        },
        get: function(attr){
            return this.attributes[attr];
            /*
            var value = this.attributes[attr];
            return (value instanceof server.WatcherRelation)?(value.getItem()):value;*/
        },
        destroy: function(){
            this.callEventListener('destroy', {destroyed: this});

            setTimeout(function(){
                this.attributes = {};//null;
                var events = this.__getEvents();
                for (var i in events){
                    delete events[i];
                }
            }.bind(this), 0);
        },
        destrLsn: function(field){
            this.on('destroy', function(event){
                field.destroy();
            }.bind(this));

            return field;
        },
        getRel: function(){
            return this.rLink;
        },
        _startSync: function(watcherCol, id){
            this.watcher = watcherCol;
            this.id = id;
            return this.rLink = new server.WatcherRelation(watcherCol, id);
        },
        getWatchedEvents: function(){
            return ['set', 'remove-attribute'];
        },
        afterSync: function(fn){
            if (this._synced){
                fn(this);
            }else{
                var afn = function(){
                    this.off('after-sync', afn);
                    fn(this);
                }.bind(this);

                this.on('after-sync', afn);
            }
        },
        updateSync: function(attrs, silence){
            this.set( this.unserialize( attrs ) , silence);
        },
        initSync: function(attrs, silence){
            this.updateSync(attrs, silence);
            this.init(this.watcher);
            this._synced = true;
            this.callEventListener('after-sync', {});                
        },
        createSync: function(){
            this.createAttrs(this.watcher);
            this.init(this.watcher);
            this._synced = true;
            this.callEventListener('after-sync', {});
        },
        init: function(){},
        createAttrs: function(){},
        cloneAttrs: function(){
            var attrs = Object.assign({}, this.attributes);
            
            var keys = Object.keys(attrs).filter((a)=>attrs[a] instanceof server.ActionList);
            
            return keys;
//            return [];
        },
        clone: function(){
            var attr = Object.assign({}, this.attributes);

            this.callEventListener('before-clone', {target: this, attr: attr});

            var clone = this.watcher.clone(this.watcher.create(this.className), attr);
            
            this.callEventListener('after-clone', {target: this, clone: clone, attr: attr});

            return clone;
        },
        initialize: function(){
            zz.data.prototype.initialize.apply(this, arguments);

            this.rLink = null;
            this._synced = false;
            
            this._setTimer = null;
            this._setAttrs = [];
            
            this.on('before-clone', function(ev){
                var attr = ev.attr;
                this.cloneAttrs().forEach(function(idx){
                    attr[idx] = (attr[idx] instanceof server.WatcherRelation)?attr[idx].getItem().clone():attr[idx].clone();
                }, this);
            }, this);

            if (!this.className){
                console.error('Class value `className` is undefined');
            }
        }
    });
    
    server.SyncedList = server.SyncedData.extend({
        className: 'SyncedList',
        collectionInstance: null,
        afterSync: function(fn){
            server.SyncedData.prototype.afterSync.call(this, function(){
                this.watcher.afterSync(this.getCollection(), fn);
            }.bind(this));
        },
        add: function(actionArray){
            actionArray.forEach(function(action){
                if (this.collectionInstance && !(action instanceof this.collectionInstance)){
                    console.trace('Added class is wrong instance', action.className, this.className);
                    return;
                }

                var collection = this.attributes['collection'];
                collection.push( action );
                this.callEventListener('add', {target: this, collection: this, item: action});
                action.callEventListener('added-collection', {collection: this, item: action});
            }, this);
        },
        remove: function(action){
            var collection = this.attributes['collection'];
            var idx = collection.indexOf(action);
            if (idx !== -1){
                collection.splice(idx, 1);
                this.callEventListener('remove', {target: this, collection: this, item: action, index: idx});
                action.callEventListener('removed-collection', {collection: this, item: action});

                return true;
            }
        },
        has: function(item){
            return this.attributes['collection'].indexOf( item ) !== -1;
        },
        forEach: function(fn, self){
            return this.getCollection().forEach(fn, self);
        },
        getCollection: function(){
/*            var result = [];
            var collection = this.get('collection');

            for (var i=0; i<collection.length; i++){
                var item = collection[i];
                if (item instanceof server.WatcherRelation){
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

            return result;*/
            return this.get('collection').slice(0);
        },
        getWatchedEvents: function(){
            return ['set', 'add', 'remove', 'removed-nulls'];
        },
        createAttrs: function(session){
            this.set({
                collection: this._initCollection
            });

            if (!this._initCollection){
                console.error('SyncedList init collection Error:', this._initCollection);
            }
        },
        initialize: function(collection){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._initCollection = collection;
            
            this.on('before-clone', function(ev){
//                ev.attr.collection = [];
                ev.attr.collection = ev.attr.collection.slice(0);
            }, this);

/*            this.on('after-clone', function(ev){
                this.get('collection').forEach(function(action){
                    ev.clone.add([action.clone()]);
                });
            }, this);

            /*this.on('set:collection', function(event){
                event.value.forEach(function(item){
                    item.callEventListener('added-collection', {collection: this, item: item});
                }, this);
            }, this);*/
            
/*            this.on('set:collection', function(event){
                var collection = this.get('collection');

                for (var i=0; i<collection.length; i++){
                    var item = collection[i];
                    if (item instanceof server.WatcherRelation){
                        var titem = item.getItem();
                        if (titem === null){
                            collection.splice(i, 1); //remove deleted items
                            this.callEventListener('removed-nulls', {target: this});
                            i--;
                        }
                    }
                }
            }, this);*/
        }
    });
    
    server.Root = server.SyncedList.extend({
        className: 'Root',
        add: function(actionArray){
            actionArray.forEach(function(action){
                var collection = this.attributes['collection'];
                if (collection.indexOf(action) === -1){
                    collection.push( action );
                    this.callEventListener('add', {target: this, collection: this, item: action});
                }
            }, this);
        },
    });
};