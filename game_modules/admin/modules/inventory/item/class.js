var InventoryItemClassCounter = 1;

admin.InventoryItemClass = ActionClass.extend({
    className: 'InventoryItemClass',
    moduleName: 'Inventory',
    classObject: 'InventoryItem',
    defaultMessage: 'Выберите предмет',
    cloneAttrs: function(){
        return ['triggerList', 'item'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('item')?this.get('item').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('item');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.InventoryItemCollection;
    },
    createTableSchemeField: function(){
        return [];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    getObjectEditField: function(it, obj){
        it.parentObject = obj;

        return this.destrLsn(new SchemeField('#InventoryItemObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputInteger('.blki-max', it, 'max')
            .linkInputInteger('.blki-x', it, 'x')
            .linkInputInteger('.blki-y', it, 'y')
            .linkTextValue('.blki-group', it.flagsVar, 'flagsName')
            .openFieldClick('.link-group', function(){return it.flagCField}, {onSelect: it.get('flagList').toggleFlag.bind(it.get('flagList'))})
            .openFieldClick('.link-icon', function(){
                return admin.fields.MapMarkerIconCollection;
            }, {onSelect: function(icon){
                it.set({icon: [icon]});
            }.bind(this)})
            .link( new ADLinkIcon('.blki-icon', it, 'icon') )
//            .linkAttributeValue('.blki-icon', 'src', it, 'icon')
            .linkAttributeValue('.blk-iconbox', 'style', it.style, 'style')
            .click('.blki-icon', function(DOMself){
                DOMself.DOM.filter('.link-icon').click();

                return false; 
            })
        .linkCollection('.blk-errors', this.errorList)
        ;
    },
    createAttrs: function(project){
        var item = project.watch( new admin.InventoryItem);
        
        //item.removeFlag( admin.global.InventoryItemAllFlag );
        
        this.set({
            name: 'Предмет '+InventoryItemClassCounter,
            item: item,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= InventoryItemClassCounter){
            InventoryItemClassCounter = digit[0]*1+1;
        }

        project.afterSync(function(){
            var it = this.get('item');
            
            this.on('destroy', function(){
                this.getValue().destroy();
            }, this);

            this.on('set:name', function(ev){
                it.set({name: '['+ev.value+']'});
            }, this);

            it.on('destroy', function(){
                this.destroy();
            }, this);

            it.parentObject = this;
            
            var editBlk = this.destrLsn(new SchemeField('#InventoryItemClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                    .linkInputInteger('.blki-max', it, 'max')
                    .linkInputInteger('.blki-x', it, 'x')
                    .linkInputInteger('.blki-y', it, 'y')
                    .linkTextValue('.blki-group', it.flagsVar, 'flagsName')
                    .openFieldClick('.link-group', function(){return it.flagCField}, {onSelect: it.get('flagList').toggleFlag.bind(it.get('flagList'))})
                    .openFieldClick('.link-icon', function(){
                        return admin.fields.MapMarkerIconCollection;
                    }, {onSelect: function(icon){
                        it.set({icon: [icon]});
                    }.bind(this)})
                    .link( new ADLinkIcon('.blki-icon', it, 'icon') )
//                    .linkAttributeValue('.blki-icon', 'src', it, 'icon')
                    .linkAttributeValue('.blk-iconbox', 'style', it.style, 'style')
                    .click('.blki-icon', function(DOMself){
                        DOMself.DOM.filter('.link-icon').click();

                        return false; 
                    })
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
/*                triggerList.createButtonField('Триггеры', admin.fields.NewInventoryTriggers),
                triggerList.getSchemeField()*/
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.InventoryItemClassSet = ActionClass.extend({
    className: 'InventoryItemClassSet',
    moduleName: 'Inventory',
    classObject: 'InventoryItem',
    defaultMessage: 'Выберите предмет',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('item');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.InventoryItemCollection;
    },
    createTableSchemeField: function(){
        return [];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    createAttrs: function(project){
        this.set({
            name: 'Предмет '+InventoryItemClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= InventoryItemClassCounter){
            InventoryItemClassCounter = digit[0]*1+1;
        }

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#InventoryItemClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
/*                triggerList.createButtonField('Триггеры', admin.fields.NewInventoryTriggers),
                triggerList.getSchemeField()*/
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
    new ModuleContainer([
        new SelectButtonField('#InventoryItemClassEditBlock', admin.InventoryItemClass),
        new SelectButtonField('#InventoryItemClassSetEditBlock', admin.InventoryItemClassSet),
    ], 'Inventory')
]);