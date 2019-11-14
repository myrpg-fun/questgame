admin.InventoryRandomSelectAction = ActionClass.extend({
    className: 'InventoryRandomSelectAction',
    moduleName: 'Inventory',
    _actionLists: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryRandomSelectAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-count', this, 'count')
            .linkTextValue('.blki-countname', this.name, 'counterName')
            .openFieldClick('.link-count', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueNoRandomSelector', false),
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({countObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-inventoryname', this.name, 'inventoryName')
            .openFieldClick('.link-inventory', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Inventory'),
                            admin.fields.InventoryCollection
                        ]));
                }.bind(this),
                {onSelect: function(inventory){
                    this.set({inventory: inventory});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-inventory').click();
                    return false; 
                })
            .openFieldClick('.link-action', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('action').getLocalsSchemeField(),
                        this.get('action').createCopyButtonField('Действия'),
                        this.get('action').getSchemeField()
                    ])
                )
            , {}))
            .linkSwitchValue('.blki-useall', this, 'useall')
            .openFieldClick('.link-edit', function(){
                if (this.get('inventory'))
                    return this.get('inventory').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
        this.addLocalsListener('inventory', 'Inventory');
        this.addNameListenerEvent('countObject', this.name, 'counterName', '', 'name');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:countObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === false?(
                        'blk-field hide-object hide-counter'
                    ):(
                        ev.value === null?
                        'blk-field hide-object hide-object-all':
                        'blk-field hide-counter hide-object-all'
                    )
            });
        }, this);
    },
    cloneAttrs: function(){
        return ['action'];
    },
    _listArgs: function(){
        return [this.get('itemarg'), this.get('countarg')];
    },
    createAttrs: function(project){
        this.set({
            inventory: null,
            useall: true,
            count: 1,
            countObject: false,
            itemarg: project.watch(new admin.ActionArg('Случайный выбранный предмет', 'InventoryItem')),
            countarg: project.watch(new admin.ActionArg('Количество случайного предмета', 'Counter')),
        });
        
        this.set({
            action: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){
        this.errorTestValue('inventory', null, 'Ошибка: Выберите инвентарь');
    }
});

admin.InventoryAddItemAction = ActionClass.extend({
    className: 'InventoryAddItemAction',
    moduleName: 'Inventory',
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryAddItemAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this, 'counterClass')
            .linkInputInteger('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-inventoryname', this.name, 'inventoryName')
            .openFieldClick('.link-inventory', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Inventory'),
                            admin.fields.InventoryCollection
                        ]));
                }.bind(this),
                {onSelect: function(inventory){
                    this.set({inventory: inventory});
                }.bind(this)})
            .linkTextValue('.blki-itemname', this.name, 'itemName')
            .openFieldClick('.link-item', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('InventoryItem'),
                            admin.fields.InventoryItemCollection
                        ]));
                }.bind(this),
                {onSelect: function(item){
                    this.set({item: item});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-inventory').click();
                    return false; 
                })
            .openFieldClick('.link-yes', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('yes').getLocalsSchemeField(),
                        this.get('yes').createCopyButtonField('Действия'),
                        this.get('yes').getSchemeField()
                    ])
                )
            , {}))
            .openFieldClick('.link-no', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('no').getLocalsSchemeField(),
                        this.get('no').createCopyButtonField('Действия'),
                        this.get('no').getSchemeField()
                    ])
                )
            , {}))
            .openFieldClick('.link-edit', function(){
                if (this.get('inventory'))
                    return this.get('inventory').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-editit', function(){
                if (this.get('item'))
                    return this.get('item').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
        this.addLocalsListener('inventory', 'Inventory');
        
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.addLocalsListener('item', 'InventoryItem');
        
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
    },
    createAttrs: function(project){
        this.set({
            inventory: null,
            item: null,
            counter: 1,
            counterObject: null,
            counterClass: 'blk-field hide-object',
            yes: project.watch(new admin.ActionList([], this._listArgs())),
            no: project.watch(new admin.ActionList([], this._listArgs())),
        });
    },
    init: function(){
        this.errorTestValue('inventory', null, 'Ошибка: Выберите инвентарь');
        this.errorTestValue('item', null, 'Ошибка: Выберите предмет');
        
        this.on('set:counterObject', function(ev){
            this.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.InventoryTestItemAction = ActionClass.extend({
    className: 'InventoryTestItemAction',
    moduleName: 'Inventory',
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryTestItemAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this, 'counterClass')
            .linkInputInteger('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-inventoryname', this.name, 'inventoryName')
            .openFieldClick('.link-inventory', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Inventory'),
                            admin.fields.InventoryCollection
                        ]));
                }.bind(this),
                {onSelect: function(inventory){
                    this.set({inventory: inventory});
                }.bind(this)})
            .linkTextValue('.blki-itemname', this.name, 'itemName')
            .openFieldClick('.link-item', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('InventoryItem'),
                            admin.fields.InventoryItemCollection
                        ]));
                }.bind(this),
                {onSelect: function(item){
                    this.set({item: item});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-inventory').click();
                    return false; 
                })
            .openFieldClick('.link-yes', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('yes').getLocalsSchemeField(),
                        this.get('yes').createCopyButtonField('Действия'),
                        this.get('yes').getSchemeField()
                    ])
                )
            , {}))
            .openFieldClick('.link-no', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('no').getLocalsSchemeField(),
                        this.get('no').createCopyButtonField('Действия'),
                        this.get('no').getSchemeField()
                    ])
                )
            , {}))
            .openFieldClick('.link-edit', function(){
                if (this.get('inventory'))
                    return this.get('inventory').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-editit', function(){
                if (this.get('item'))
                    return this.get('item').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
        this.addLocalsListener('inventory', 'Inventory');
        
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.addLocalsListener('item', 'InventoryItem');
        
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
    },
    createAttrs: function(project){
        this.set({
            inventory: null,
            item: null,
            counter: 1,
            counterObject: null,
            counterClass: 'blk-field hide-object',
            yes: project.watch(new admin.ActionList([], this._listArgs())),
            no: project.watch(new admin.ActionList([], this._listArgs())),
        });
    },
    init: function(){
        this.errorTestValue('inventory', null, 'Ошибка: Выберите инвентарь');
        this.errorTestValue('item', null, 'Ошибка: Выберите предмет');
        
        this.on('set:counterObject', function(ev){
            this.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.InventoryRemoveItemAction = ActionClass.extend({
    className: 'InventoryRemoveItemAction',
    moduleName: 'Inventory',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryRemoveItemAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this, 'counterClass')
            .linkInputInteger('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-inventoryname', this.name, 'inventoryName')
            .openFieldClick('.link-inventory', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Inventory'),
                            admin.fields.InventoryCollection
                        ]));
                }.bind(this),
                {onSelect: function(inventory){
                    this.set({inventory: inventory});
                }.bind(this)})
            .linkTextValue('.blki-itemname', this.name, 'itemName')
            .openFieldClick('.link-item', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('InventoryItem'),
                            admin.fields.InventoryItemCollection
                        ]));
                }.bind(this),
                {onSelect: function(item){
                    this.set({item: item});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-inventory').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('inventory'))
                    return this.get('inventory').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
        this.addLocalsListener('inventory', 'Inventory');
        
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.addLocalsListener('item', 'InventoryItem');
        
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
    },
    createAttrs: function(project){
        this.set({
            inventory: null,
            item: null,
            counter: 1,
            counterObject: null,
            counterClass: 'blk-field hide-object',
        });
    },
    init: function(){
        this.errorTestValue('inventory', null, 'Ошибка: Выберите инвентарь');
        this.errorTestValue('item', null, 'Ошибка: Выберите предмет');
        
        this.on('set:counterObject', function(ev){
            this.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.InventoryItemSetIconAction = ActionClass.extend({
    className: 'InventoryItemSetIconAction',
    moduleName: 'Inventory',
    onSelectInventoryItem: function(item){
        this.set({item: item});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryItemSetIconAction', this))
            .linkSwitchValue('.blki-add', this, 'add')
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkTextValue('.blki-iconname', this.ctrdata, 'iconName')
            .link( new ADLinkIcon('.blki-icon', this, 'icon') )
//            .linkAttributeValue('.blki-icon', 'src', this, 'icon')
            .openFieldClick('.link-icon', function(){
                return makeSchemeFieldList(
                    new SchemeCollection([
                        this.createLocalsField('Icon'),
                        admin.fields.MapMarkerIconCollection
                    ]));
            }.bind(this),
            {onSelect: function(icon){
                if (icon instanceof admin.MapMarkerIcon){
                    this.set({icon: icon});
                }else{
                    this.set({icon: icon});
                }
            }.bind(this)})
            .linkTextValue('.blki-objectname', this.name, 'itemName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('InventoryItem'),
                            admin.global.InventoryItemFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: this.onSelectInventoryItem.bind(this)})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.addLocalsListener('item', 'InventoryItem');
        this.errorTestValue('item', null, 'Ошибка: выберите предмет');
    },
    createAttrs: function(project){
        this.set({
            icon: admin.global.MapMarkerNewIcon
        });
    },
    init: function(project){
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object',
            iconName: ''
        });
        
        this.on('set:icon', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value instanceof admin.ActionArg?
                    'blk-field hide-icon':
                    'blk-field hide-object',
                iconName: 
                    ev.value instanceof admin.ActionArg?
                    '['+ev.value.get('name')+']':
                    ''
            });
        }, this);
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        admin.fields.InventoryActionCollection = new GroupField('Инвентарь', new SchemeCollection([
            new SelectButtonField('#InventoryRandomSelectAction', admin.InventoryRandomSelectAction),
            new SelectButtonField('#InventoryAddItemAction', admin.InventoryAddItemAction),
            new SelectButtonField('#InventoryTestItemAction', admin.InventoryTestItemAction),
            new SelectButtonField('#InventoryRemoveItemAction', admin.InventoryRemoveItemAction),
            new SelectButtonField('#InventoryItemSetIconAction', admin.InventoryItemSetIconAction)
        ]))
    ], 'Inventory')
]);
