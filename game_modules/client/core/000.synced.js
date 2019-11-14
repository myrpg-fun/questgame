var SyncedData = zz.data.extend({
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
                if (item !== null){
                    attrs[i] = item;
                }else{
                    attrs[i] = this.watcher.getRel(attrs[i].id);//new WatcherRelation(this.watcher, attrs[i].id);
                }

                return;
            }
        }
    },
    unserialize: function(attrs){
        var attrs = $.extend({}, attrs);
        
        for (var i in attrs){
            this._unserializeDataSync(attrs, i);
        }
        
        return attrs;
    },
    _serializeDataSync: function(attr, i){
        var value = attr[i];
        if (value instanceof Array){
            attr[i] = value.slice(0);
            attr[i].forEach(function(q, index){
                this._serializeDataSync(attr[i], index);
            }, this);
            
            return;
        }
        
        if (value instanceof SyncedData){
            value = value.getRel();
        }
        
        if (value instanceof WatcherRelation){
            attr[i] = value.serialize();
            
            return;
        }
    },
    serialize: function (){
        var attrs = $.extend({}, this.getAttributes());

        for (var i in attrs){
            this._serializeDataSync(attrs, i);
        }
        
        return attrs;
    },
    setAttribute: function(name, value, silence){
        var last = this.attributes[name];
        if (last !== value){
            this.attributes[name] = value;

            var callEvFn = function(value){
                this.attributes[name] = value;
                client.setTimeout(function(){
                    this.callEventListener('set', {
                        attribute: name, value: value, lastValue: last, target: this
                    }, silence);
                    this.callEventListener('set:'+name, {
                        attribute: name, value: value, lastValue: last, target: this
                    }, silence);
                }.bind(this), 0);
            }.bind(this);

            if (value instanceof WatcherRelation){
                value.waitItem(callEvFn);
            }else{
                callEvFn(value);
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
        /*var value = this.attributes[attr];
        return (value instanceof WatcherRelation)?(value.getItem()):value;*/
    },
    deleteSync: function(){
        this.callEventListener('delete-sync', {destroyed: this});
    },
    destroy: function(){
        this.__destroyed__ = true;
        this.callEventListener('destroy', {destroyed: this});

        client.setTimeout(function(){
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
        return this.rLink = watcherCol.getRel(id);
    },
    getWatchedEvents: function(){
        return ['set'];
    },
    waitItem: function(fn){
        this.afterSync(fn);
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
    _getDeletedAttributes: function(){
        return [];
    },
    initialize: function(){
        zz.data.prototype.initialize.apply(this, arguments);
        
        this.rLink = null;
        this._synced = false;
        
        this.on('delete-sync', function(){
/*            var attrs = this._getDeletedAttributes();
            for (var i=0;i<attrs.length;i++){
                var attr = this.get(attrs[i]);
                if (attr && attr.deleteSync){
                    attr.deleteSync();
                }
            }
            */
            this.destroy();
        }.bind(this));
        
        this.on('destroy', function(){
/*            var attrs = this._getDeletedAttributes();
            for (var i=0;i<attrs.length;i++){
                var attr = this.get(attrs[i]);
                if (attr && attr.destroy){
                    attr.destroy();
                }
            }*/
        }.bind(this));
        
        if (!this.className){
            console.error('Class value `className` is undefined');
        }
    }
});
