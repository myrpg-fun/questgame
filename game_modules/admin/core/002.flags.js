var FlagObjectCounter = 1;

admin.FlagGroupClass = SyncedList.extend({
    className: 'FlagGroupClass',
    moduleName: 'common',
    collectionInstance: null,
    getSchemeCollectionField: function(){
        return (this._schemeCBlk)?(this._schemeCBlk):(this._schemeCBlk=this.createSchemeCollectionField());
    },
    createSchemeCollectionField: function(){
        var schemeBlk = this.destrLsn(new GroupField(this.get('name'), this.createSchemeCollection()));

        this.on('set:name', function(ev){
            schemeBlk.object.set({name: ev.value});
        }.bind(this));
        
        return schemeBlk;
    },
    createSchemeField: function(){
        var selected = new zz.data();
        selected.on('set:selected', function(event){
            selected.set({class: event.value?'blk-field flag set':'blk-field flag'});
        }, this);
        
        var ea = function(event){
            if (event.item === this){
                selected.set({selected: true});
            }
        }.bind(this), er = function(event){
            if (event.item === this){
                selected.set({selected: false});
            }
        }.bind(this), es;
        
        var SField = this.destrLsn(new SchemeField('#FlagSelectBlockTpl'))
            .linkTextValue('.blki-name', this, 'name')
            .linkAttributeValue('.blk-field', 'class', selected, 'class')
            .openFieldClick('.link-open', this.editorBlk)
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(this, selected);
            }.bind(this));
                
        SField.on('added-collection', function(event){
            event.target.selectFlagList.on('add', ea);
            event.target.selectFlagList.on('remove', er);
            event.target.selectFlagList.on('set', es = function(selectFlagList, event){
                selected.set({selected: selectFlagList.has(this)});
            }.bind(this, event.target.selectFlagList));
            selected.set({
                selected: event.target.selectFlagList.has(this)
            });
        }, this);
                
        SField.on('removed-collection', function(event){
            event.target.selectFlagList.off('add', ea);
            event.target.selectFlagList.off('remove', er);
            event.target.selectFlagList.off('set', es);
        }, this);
                
        return SField;
    },
    createSelectSchemeField: function(){
        return this.destrLsn(new SchemeField('#FlagSelectOneBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.editorBlk;}.bind(this), {mainCollection: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(){
        SyncedList.prototype.createAttrs.apply(this, arguments);
        
        this.set({
            name: 'Коллекция '+FlagObjectCounter++,
            collection: this._initCollection,
            unremovable: this.unremovable
        });
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= FlagObjectCounter){
            FlagObjectCounter = digit[0]*1+1;
        }
        
        if (this.get('unremovable')){
            this.editorBlk = this.destrLsn(new SchemeField('#FlagEditBlockRO'))
                .linkInputValue('.blki-name', this, 'name');
        }else{
            this.editorBlk = this.destrLsn(new SchemeField('#FlagEditBlock'))
                .linkInputValue('.blki-name', this, 'name')
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));
        }
    
        this.on('destroy', function(){
            this.getCollection().forEach(function(item){
                if (item.removeFlag){
                    item.removeFlag(this);
                }
            }, this);
        }, this);
    },
    initialize: function(collection, unremovable){
        SyncedList.prototype.initialize.apply(this, arguments);

        this.unremovable = unremovable?true:false;
    }
});

admin.FlagCollectionList = SyncedList.extend({
    className: 'FlagCollectionList',
    moduleName: 'common',
    collectionInstance: null,
    remove: function(action, silence){
        if (action instanceof admin.ActionArgClassItem){
            var it = action.get('item');
            var c = this.getCollection();
            for (var i=0; i<c.length; i++){
                if (c[i] instanceof admin.ActionArgClassItem && c[i].get('item') === it){
                    this.get('collection').splice(i, 1);
                    this.callEventListener('remove', {collection: this, item: c[i], index: i}, silence);
                    action.callEventListener('removed-collection', {collection: this, item: c[i]}, silence);
                    
                    return true;
                }
            }
            return false;
            
            return false;
        }
        
        var idx = this.get('collection').indexOf(action);
        if (idx !== -1){
            this.get('collection').splice(idx, 1);
            this.callEventListener('remove', {collection: this, item: action, index: idx}, silence);
            action.callEventListener('removed-collection', {collection: this, item: action}, silence);

            return true;
        }
    },
    has: function(item){
        if (item instanceof admin.ActionArgClassItem){
            var it = item.get('item');
            var c = this.getCollection();
            for (var i=0; i<c.length; i++){
                if (c[i] instanceof admin.ActionArgClassItem && c[i].get('item') === it){
                    return true;
                }
            }
            return false;
        }
        
        return this.getCollection().indexOf(item) !== -1;
    },    
    toggleFlag: function(flag){
        if (this.has(flag)){
            this.remove(flag);
        }else{
            this.add([flag]);
        }
    },
    createButtonField: function(name, FlagClass){
        if (!FlagClass){
            FlagClass = admin.FlagGroupClass;//this.collectionInstance;
        }
        
        return this.destrLsn(new CreateButtonField(name, function(){
            var newFlag = this.watcher.watch( new FlagClass([]) );
            this.add([newFlag]);
            return newFlag.editorBlk;
        }.bind(this)));
    },
    createSchemeField: function(selectFlagList){
        var collection = this.createSchemeCollection('createSchemeField');
        collection.selectFlagList = selectFlagList;
        
        return this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection('.blk-list', collection);
    },
    createSelectSchemeField: function(){
        return this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection('.blk-list', this.createSchemeCollection('createSelectSchemeField'));
    },
    getSchemeCollectionField: function(){
        return (this._schemeCBlk)?(this._schemeCBlk):(this._schemeCBlk=this.createSchemeCollectionField());
    },
    createSchemeCollectionField: function(){
        return this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection('.blk-list', this.createSchemeCollection('getSchemeCollectionField'));
    }
});