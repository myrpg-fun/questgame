var InventoryClassCounter = 1;

admin.InventoryClassTable = ActionClass.extend({
    className: 'InventoryClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    _listArgs: function(){
        return [this.get('adminarg')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryClassTable'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-className', this, 'header')
            .openFieldClick('.link-click', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('click').getLocalsSchemeField(),
                        this.get('click').createCopyButtonField('Действия'),
                        this.get('click').getSchemeField()
                    ])
                )
            , {}))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            header: this._init.name,
            name: this._init.name,
            adminarg: project.watch(new admin.ActionArgClass('Адинистратор кликнул', admin.global.PlayerTemplate)),
        });
        
        this.set({
            click: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    initialize: function(classObj, name){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj, name: name};
    }
});

admin.InventoryClass = ActionClass.extend({
    className: 'InventoryClass',
    moduleName: 'Inventory',
    classObject: 'Inventory',
    defaultMessage: 'Выберите инвентарь',
    cloneAttrs: function(){
        return ['inventory', 'triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('inventory')?this.get('inventory').clone():null});
        
        return object;
    },
    getCloned: function(){
        return 'clone';
    },
    getValue: function(){
        return this.get('inventory');
    },
    selectCollection: function(){
        return admin.fields.InventoryCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#InventoryClassTable', admin.InventoryClassTable, this)
        ];
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
        return this.destrLsn(new SchemeField('#InventoryObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
                .linkInputInteger('.blki-x', it, 'x')
                .linkInputInteger('.blki-y', it, 'y')
                .linkCollection('.blk-scrollx', it.getSFCollection())
                .linkAttributeValue('.blk-scrollx', 'style', it.style, 'style')
            .linkCollection('.blk-errors', this.errorList);
    },
    createAttrs: function(project){
        var inv = project.watch( new admin.Inventory );
        
        inv.removeFlag( admin.global.InvetoryAllFlag );
        
        this.set({
            name: 'Инвентарь '+InventoryClassCounter,
            inventory: inv,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= InventoryClassCounter){
            InventoryClassCounter = digit[0]*1+1;
        }

        project.afterSync(function(){
            var inventory = this.get('inventory');
            
            this.on('destroy', function(){
                this.getValue().destroy();
            }, this);

            this.on('set:name', function(ev){
                inventory.set({name: '['+ev.value+']'});
            }, this);

            inventory.on('destroy', function(){
                this.destroy();
            }, this);
            
            var editBlk = this.destrLsn(new SchemeField('#InventoryClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                    .linkInputInteger('.blki-x', inventory, 'x')
                    .linkInputInteger('.blki-y', inventory, 'y')
                    .linkCollection('.blk-scrollx', inventory.getSFCollection())
                    .linkAttributeValue('.blk-scrollx', 'style', inventory.style, 'style')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewInventoryTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.InventoryClassSet = ActionClass.extend({
    className: 'InventoryClassSet',
    moduleName: 'Inventory',
    classObject: 'Inventory',
    defaultMessage: 'Выберите инвентарь',
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
    getCloned: function(){
        return 'none';
    },
    getValue: function(){
        return this.get('inventory');
    },
    selectCollection: function(){
        return admin.fields.InventoryCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#InventoryClassTable', admin.InventoryClassTable, this)
        ];
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
            name: 'Инвентарь '+InventoryClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= InventoryClassCounter){
            InventoryClassCounter = digit[0]*1+1;
        }

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#InventoryClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewInventoryTriggers),
                triggerList.getSchemeField()
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
        new SelectButtonField('#InventoryClassEditBlock', admin.InventoryClass),
        new SelectButtonField('#InventoryClassSetEditBlock', admin.InventoryClassSet)
    ], 'Inventory')
]);