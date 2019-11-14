admin.InventoryItemTestCollectionAction = ActionClass.extend({
    className: 'InventoryItemTestCollectionAction',
    moduleName: 'Inventory',
    cloneAttrs: function(){
        return ['yes', 'no', 'flagList'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryItemTestCollectionAction', this))
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
                {onSelect: function(item){
                    this.set({item: item});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("InventoryItemFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("InventoryItemFlagsList").createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-yes', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('yes').getLocalsSchemeField(),
                        this.get('yes').createCopyButtonField('Действия'),
                        this.get('yes').getSchemeField()
                    ])
                )
            , {})
            .openFieldClick('.link-no', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('no').getLocalsSchemeField(),
                        this.get('no').createCopyButtonField('Действия'),
                        this.get('no').getSchemeField()
                    ])
                )
            , {})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            item: null,
            yes: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            no: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.addLocalsListener('item', 'InventoryItem');
        this.errorTestValue('item', null, 'Ошибка: выберите предмет');
    }
});

admin.InventoryItemCloneAction = ActionClass.extend({
    className: 'InventoryItemCloneAction',
    moduleName: 'Inventory',
    _actionLists: function(){
        return [];
    },
    cloneAttrs: function(){
        return [];
    },
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            name: 'Клон предмета',
            item: null,
            arg: null
        });
    },
    init: function(project){
        this.name = (new zz.data());
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.errorTestValue('item', null, 'Ошибка: Выберите предмет');
        
        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
        }, this);
        
        project.afterSync(function(){
            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new admin.FlagCollectionList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);

            this.on('set:name', function(ev){
                var arg = this.get('arg');
                if (arg){
                    arg.set({name: ev.value});
                }
            }, this);

            this.editorBlk = this.destrLsn(new SchemeField('#InventoryItemCloneAction'))
                .linkInputValue('.blki-name', this, 'name')
                .linkTextValue('.blki-itemname', this.name, 'itemName')
                .openFieldClick('.link-item',
                    function(){
                        return makeSchemeFieldList(
                            new SchemeCollection([
                                this.createLocalsField('InventoryItem'),
                                admin.fields.InventoryItemCollection
                            ]));
                    }.bind(this), 
                    {onSelect: function(classObj){
                        if (this.get('arg')){
                            this.get('arg').deleteSync();
                        }

                        var arg = this.watcher.watch(new admin.ActionArg(this.get('name'), 'InventoryItem'));

                        this._al.addArgs([arg]);
                    
                        this.set({
                            item: classObj,
                            arg: arg
                        });
                    }.bind(this)})
                .openFieldClick('.link-edit', function(){
                    if (this.get('item'))
                        return this.get('item').getEditor();
                    return false;
                }.bind(this),{})
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));
        }.bind(this));
    },
});

/*admin.fields.InvenotryActionCollection.add([
    new ModuleContainer([
//        new GroupField('Предметы', new SchemeCollection([
            new SelectButtonField('#InventoryItemSetIconAction', admin.InventoryItemSetIconAction)
//        ]))
    ], 'Inventory')
]);*/
