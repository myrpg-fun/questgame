admin.ObjectCreateAction = ActionClass.extend({
    className: 'ObjectCreateAction',
    moduleName: 'Class',
    cloneAttrs: function(){
        return [];
    },
    _listArgsAfter: function(){
        return [this.get('arg')];
    },
    _updateArgsAfter: function(){
        var cloneargs = this._listArgsAfter().map(function(arg){
            return {arg: arg, clone: arg.clone()};
        }.bind(this));
        
        this._al._updateArgs(cloneargs);
    },
    createSchemeField: function(){
        return this.editorBlk;
    },
    createLocalsField: function(type){
        var LocalsCollection = new SchemeCollection([]);
        var list = this._al;
        var arg = this.get('arg');
        
        if (list){
            var result = [];
            list.args().forEach(function(local){
                if (local !== arg){
                    result = result.concat(local.filterByType(type));
                }
            });
            
            LocalsCollection.add(
                result.map(function(arg){
                    return arg.getSelectSchemeField();
                })
            );
        }
        
        return makeSchemeFieldList( LocalsCollection );
    },
    createAttrs: function(project){
        this.set({
            name: 'Новый объект',
/*            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.ObjectAllFlag])
            ),*/
            class: null,
            arg: null
        });
    },
    init: function(project){
//        var flags = (new zz.data()).set({flagsName: ''});
//        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        
        this.errorTestValue('class', null, 'Ошибка: Выберите класс');
//        this.errorTestGroup('flagList', 'Ошибка: Выберите коллекцию');
        
        this.on('before-clone', function(ev){
            for (var i in ev.attr){
                if (ev.attr[i] instanceof admin.ObjectField){
                    ev.attr[i] = ev.attr[i].clone();
                }
            }
        }, this);

        this.on('after-clone', function(ev){
            for (var i in ev.attr){
                //?
            }
        }, this);

        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
        }, this);
        
//        var flagList = this.get('flagList');
        
        var classFields = new SchemeCollection([]);

        var afn = function(ev){
            var val = this.get(ev.item.id);
            if (!val){
                if (ev.item && ev.item.getCloned() === 'none'){
                    val = this.watcher.watch(new admin.ObjectField(ev.item, this));
//                    ev.item.setupField(val);
                    this.setAttribute(ev.item.id, val);
                }
            }

            if (val){
                classFields.add([
                    val.getObjectSchemeField()
                ]);
            }
        }.bind(this);

        var cfn = function(ev){
            var val = this.get(ev.item.id);
            if (val){
                if (ev.item && ev.item.getCloned() !== 'none'){
                    this.removeAttribute(ev.item.id);
                    val.deleteSync();
                }
            }else{
                if (ev.item && ev.item.getCloned() === 'none'){
                    val = this.watcher.watch(new admin.ObjectField(ev.item, this));
//                    ev.item.setupField(val);
                    this.setAttribute(ev.item.id, val);
                }
            }

            classFields.removeAll();
            if (this.get('class')){
                this.get('class').getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }.bind(this);

        var rfn = function(ev){
            var val = this.get(ev.item.id);

            if (val){
                this.removeAttribute(ev.item.id);
                val.deleteSync();
            }

            classFields.removeAll();
            if (this.get('class')){
                this.get('class').getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }.bind(this);

        this.on('set:class', function(ev){
            if (ev.lastValue){
                ev.lastValue.off('add-item', afn);
                ev.lastValue.off('remove-item', rfn);
                ev.lastValue.off('change-item', cfn);

                ev.value.getClassFields().forEach(function(item){
                    rfn({item: item});
                });
            }

            classFields.removeAll();

            if (ev.value){
                ev.value.on('add-item', afn, this);
                ev.value.on('remove-item', rfn, this);
                ev.value.on('change-item', cfn, this);

                ev.value.getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }, this);
            
        project.afterSync(function(){
//            var ObjectFlagsList = project.getItem("ObjectFlagsList");

            this.on('set:name', function(ev){
                var arg = this.get('arg');
                if (arg){
                    arg.set({name: ev.value});
                }
            }, this);

            this.editorBlk = this.destrLsn(new SchemeField('#ObjectCreateAction'))
                .linkInputValue('.blki-name', this, 'name')
/*                .linkTextValue('.blki-group', flags, 'flagsName')
                .openFieldClick('.link-group', function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        ObjectFlagsList.createButtonField('Создать коллекцию'),
                        ObjectFlagsList.createSchemeField(flagList)
                    ]));
                }.bind(this), {onSelect: flagList.toggleFlag.bind(flagList)})*/
                .linkTextValue('.blki-classname', this.name, 'className')
                .openFieldClick('.link-class', admin.fields.ClassCollection, 
                    {onSelect: function(classObj){
                        if (this.get('arg')){
                            this.get('arg').deleteSync();
                        }

                        var arg = this.watcher.watch(new admin.ActionArgClass(this.get('name'), classObj));

                        this._al.addArgs([arg]);

                        this.set({
                            class: classObj,
                            arg: arg
                        });
                    }.bind(this)})
                .openFieldClick('.link-edit', function(){
                    if (this.get('class'))
                        return this.get('class').getEditor();
                    return false;
                }.bind(this),{})
                .linkCollection('.blk-classfields', classFields)
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));
        }.bind(this));
    },
});

admin.ObjectFindAction = ActionClass.extend({
    className: 'ObjectFindAction',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('action'), this.get('notfound')];
    },
    cloneAttrs: function(){
        return ['action', 'notfound'];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
/*            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.ObjectAllFlag])
            ),*/
            class: null,
            arg: null,
            action: project.watch(new admin.ActionList([], this._listArgs())),
            notfound: project.watch(new admin.ActionList([], [])),
        });
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
//        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');

        this.errorTestValue('class', null, 'Ошибка: Выберите класс');
//        this.errorTestGroup('flagList', 'Ошибка: Выберите коллекцию');
        
        this.on('before-clone', function(ev){
            for (var i in ev.attr){
                if (ev.attr[i] instanceof admin.ObjectField){
                    ev.attr[i] = ev.attr[i].clone();
                }
            }
        }, this);

        //var flagList = this.get('flagList');
        
        var classFields = new SchemeCollection([]);

        var afn = function(ev){
            var val = this.get(ev.item.id);
            if (!val){
                if (ev.item){
                    val = this.watcher.watch(new admin.ObjectField(ev.item, this));
//                    ev.item.setupField(val);
                    this.setAttribute(ev.item.id, val);
                }
            }

            if (val){
                val.nulled = '#ArgValueNotUseSelector';

                classFields.add([
                    val.getObjectSchemeField()
                ]);
            }
        }.bind(this);

        var rfn = function(ev){
            var val = this.get(ev.item.id);

            if (val){
                this.removeAttribute(ev.item.id);
                val.destroy();
            }

            classFields.removeAll();
            if (this.get('class')){
                this.get('class').getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }.bind(this);

        this.on('set:class', function(ev){
            if (ev.lastValue){
                ev.lastValue.off('add-item', afn);
                ev.lastValue.off('remove-item', rfn);

                ev.value.getClassFields().forEach(function(item){
                    rfn({item: item});
                });
            }

            classFields.removeAll();

            if (ev.value){
                ev.value.on('add-item', afn, this);
                ev.value.on('remove-item', rfn, this);

                ev.value.getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }, this);
                
        project.afterSync(function(){
            this.editorBlk = this.destrLsn(new SchemeField('#ObjectFindAction'))
/*                    .linkTextValue('.blki-group', flags, 'flagsName')
                .openFieldClick('.link-group', function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        ObjectFlagsList.createButtonField('Создать коллекцию'),
                        ObjectFlagsList.createSchemeField(flagList)
                    ]));
                }.bind(this), {onSelect: flagList.toggleFlag.bind(flagList)})*/
                .linkTextValue('.blki-classname', this.name, 'className')
                .openFieldClick('.link-class', function(){
                    return this.destrLsn(makeSchemeFieldList(
                        new SchemeCollection([
                            admin.global.PlayerTemplate.getSchemeField(),
                            admin.fields.ClassCollection
                        ])));
                }.bind(this), {onSelect: function(classObj){
                    this.set({class: classObj});

                    if (this.get('arg')){
                        this.get('arg').deleteSync();
                    }

                    this.set({arg: this.watcher.watch(new admin.ActionArgClass('Найденный объект', classObj))});

                    this.get('action').addArgs([this.get('arg')]);
                }.bind(this)})
                .openFieldClick('.link-edit', function(){
                    if (this.get('class'))
                        return this.get('class').getEditor();
                    return false;
                }.bind(this),{})
                .linkCollection('.blk-classfields', classFields)
                .openFieldClick('.link-action', 
                    this.destrLsn(makeSchemeFieldList(
                        new SchemeCollection([
                            this.get('action').getLocalsSchemeField(),
                            this.get('action').createCopyButtonField('Действия'),
                            this.get('action').getSchemeField()
                        ])
                    )
                , {}))
                .openFieldClick('.link-notfound', 
                    this.destrLsn(makeSchemeFieldList(
                        new SchemeCollection([
                            this.get('notfound').getLocalsSchemeField(),
                            this.get('notfound').createCopyButtonField('Действия'),
                            this.get('notfound').getSchemeField()
                        ])
                    )
                , {}))
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));
        }.bind(this));
    },
});

admin.ObjectSetAction = ActionClass.extend({
    className: 'ObjectSetAction',
    moduleName: 'Class',
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            class: null,
            object: null,
        });
    },
    init: function(project){
        this.name = (new zz.data());
        //this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        this.errorTestValue('object', null, 'Ошибка: Выберите объект');
        
        this.on('before-clone', function(ev){
            for (var i in ev.attr){
                if (ev.attr[i] instanceof admin.ObjectField){
                    ev.attr[i] = ev.attr[i].clone();
                }
            }
        }, this);

        var classFields = new SchemeCollection([]);

        var afn = function(ev){
            var val = this.get(ev.item.id);
            if (!val){
                if (ev.item){
                    val = this.watcher.watch(new admin.ObjectField(ev.item, this));
//                    ev.item.setupField(val);
                    this.setAttribute(ev.item.id, val);
                }
            }

            if (val){
                val.nulled = '#ArgValueNotUseSelector';

                classFields.add([
                    val.getObjectSchemeField()
                ]);
            }
        }.bind(this);

        var rfn = function(ev){
            var val = this.get(ev.item.id);

            if (val){
                this.removeAttribute(ev.item.id);
                val.destroy();
            }

            classFields.removeAll();
            if (this.get('class')){
                this.get('class').getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }.bind(this);

        this.on('set:class', function(ev){
            if (ev.lastValue){
                ev.lastValue.off('add-item', afn);
                ev.lastValue.off('remove-item', rfn);

                ev.value.getClassFields().forEach(function(item){
                    rfn({item: item});
                });
            }

            classFields.removeAll();

            if (ev.value){
                ev.value.on('add-item', afn, this);
                ev.value.on('remove-item', rfn, this);

                ev.value.getClassFields().forEach(function(item){
                    afn({item: item});
                });
            }
        }, this);

        this.editorBlk = this.destrLsn(new SchemeField('#ObjectSetAction'))
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField(admin.global.PlayerTemplate),
                        this.createLocalsField('Object')
                    ]));
                }.bind(this), 
                {onSelect: function(classObj){
                    if (classObj instanceof admin.Object){
                        this.set({class: classObj.get('class')});
                    }
                    
                    if (classObj instanceof admin.ActionArgClass){
                        this.set({class: classObj.get('type')});
                    }

                    if (classObj instanceof admin.ActionArgClassItem){
                        this.set({class: classObj.get('item').get('class')});
                    }

                    this.set({object: classObj});
                }.bind(this)})
            .openFieldClick('.link-oedit', function(){
                if (this.get('object'))
                    return this.get('object').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-classfields', classFields)
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
});

admin.ObjectUseAction = ActionClass.extend({
    className: 'ObjectUseAction',
    moduleName: 'Class',
    _updateArgsAfter: function(){
        var cloneargs = this._listArgsAfter().map(function(arg){
            return {arg: arg, clone: arg.clone()};
        }.bind(this));
        
        this._al._updateArgs(cloneargs);
    },
    _listArgsAfter: function(){
        return [this.get('arg')];
    },
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            object: null,
            class: null,
            arg: null
        });
    },
    init: function(project){
        this._uain = false;
        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
        }, this);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');

        this.on('set:object', function(ev){
            var arg = this.get('arg');
            var classObj = this.get('object');
            if (arg){
                arg.set({name: classObj.get('name')});
            }
        }, this);

        this.editorBlk = this.destrLsn(new SchemeField('#ObjectUseAction'))
            .linkTextValue('.blki-classname', this.name, 'className')
            .openFieldClick('.link-class', admin.fields.ClassCollection, 
                {onSelect: function(classObj){
                    this.set({
                        class: classObj
                    });
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('class'))
                    return this.get('class').getEditor();
                return false;
            }.bind(this),{})
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .openFieldClick('.link-object', 
                function(){
                    if (this.get('class')){
                        return this.destrLsn(makeSchemeFieldList(this.get('class').get('objectList').createSchemeCollection()));
                    }else{
                        return null;
                    }
                }.bind(this), 
                {onSelect: function(classObj){
                    if (this.get('arg')){
                        this.get('arg').deleteSync();
                    }
                        
                    var arg = this.watcher.watch(new admin.ActionArgClass(classObj.get('name'), classObj.get('class')));
                    
                    this._al.addArgs([arg]);
                    
                    this.set({
                        object: classObj,
                        arg: arg
                    });
                }.bind(this)})
            .openFieldClick('.link-oedit', function(){
                if (this.get('object'))
                    return this.get('object').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
});

admin.ObjectDeleteAction = ActionClass.extend({
    className: 'ObjectDeleteAction',
    moduleName: 'Class',
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            object: null,
        });
    },
    init: function(project){
        this.errorTestValue('object', null, 'Ошибка: Выберите объект');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        
        this.editorBlk = this.destrLsn(new SchemeField('#ObjectDeleteAction'))
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Object'),
                        admin.fields.ObjectCollection
                    ]));
                }.bind(this), 
                {onSelect: function(classObj){
                this.set({object: classObj});
            }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('object'))
                    return this.get('object').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
});

admin.ObjectRunTriggerAction = ActionClass.extend({
    className: 'ObjectRunTriggerAction',
    moduleName: 'Class',
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            object: null,
            trigger: null
        });
    },
    init: function(project){
        this.errorTestValue('object', null, 'Ошибка: Выберите объект');
        this.errorTestValue('trigger', null, 'Ошибка: Выберите триггер');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('trigger', this.name, 'triggerName', 'Выберите триггер', 'name');
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        
        this.editorBlk = this.destrLsn(new SchemeField('#ObjectRunTriggerAction'))
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Object'),
                        admin.fields.ObjectCollection
                    ]));
                }.bind(this), 
                {onSelect: function(classObj){
                this.set({object: classObj});
            }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('object'))
                    return this.get('object').getEditor();
                return false;
            }.bind(this),{})
            .linkTextValue('.blki-triggername', this.name, 'triggerName')
            .openFieldClick('.link-trigger', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        admin.fields.TriggerCollection
                    ]));
                }.bind(this), 
                {onSelect: function(trigger){
                this.set({trigger: trigger});
            }.bind(this)})
            .openFieldClick('.link-tedit', function(){
                if (this.get('trigger'))
                    return this.get('trigger').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
});

admin.ObjectAddCollectionAction = ActionClass.extend({
    className: 'ObjectAddCollectionAction',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectAddCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Object'),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object: object});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        admin.global.ObjectFlagsList.createButtonField('Создать коллекцию'),
                        admin.global.ObjectFlagsList.createSchemeField(this.get('flagList')),
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
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
            object: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        this.errorTestValue('object', null, 'Ошибка: выберите объект');
    }
});

admin.ObjectRemoveCollectionAction = ActionClass.extend({
    className: 'ObjectRemoveCollectionAction',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectRemoveCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Object'),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object: object});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        admin.global.ObjectFlagsList.createButtonField('Создать коллекцию'),
                        admin.global.ObjectFlagsList.createSchemeField(this.get('flagList')),
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
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
            object: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        this.errorTestValue('object', null, 'Ошибка: выберите объект');
    }
});

admin.ObjectTestCollectionAction = ActionClass.extend({
    className: 'ObjectTestCollectionAction',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['yes', 'no', 'flagList'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectTestCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Object'),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object: object});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        admin.global.ObjectFlagsList.createButtonField('Создать коллекцию'),
                        admin.global.ObjectFlagsList.createSchemeField(this.get('flagList')),
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
            object: null,
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
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        this.errorTestValue('object', null, 'Ошибка: выберите объект');
    }
});

admin.ObjectTestAction = ActionClass.extend({
    className: 'ObjectTestAction',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectTestAction', this))
            .linkTextValue('.blki-classname', this.name, 'className')
            .openFieldClick('.link-class', admin.fields.ClassCollection, {onSelect: function(classObj){
                this.set({class: classObj});
            }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate),
                            this.createLocalsField(this.get('class')),
                            makeSchemeFieldList(this.get('class').get('objectList').createSchemeCollection())
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object: object});
                }.bind(this)})
            .linkTextValue('.blki-object2name', this.name, 'object2Name')
            .openFieldClick('.link-object2', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate),
                            this.createLocalsField(this.get('class')),
                            makeSchemeFieldList(this.get('class').get('objectList').createSchemeCollection())
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object2: object});
                }.bind(this)})
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
            class: null,
            object: null,
            object2: null,
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
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите объект', 'name');
        this.errorTestValue('object', null, 'Ошибка: выберите объект');
        this.addNameListenerEvent('object2', this.name, 'object2Name', 'Выберите объект', 'name');
        this.errorTestValue('object2', null, 'Ошибка: выберите объект 2');
    }
});

admin.CollectionTestAction = ActionClass.extend({
    className: 'CollectionTestAction',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CollectionTestAction', this))
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .linkTextValue('.blki-objectname', this.name, 'objectName')
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Collection'),
                            admin.fields.CollectionAll
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object: object});
                }.bind(this)})
            .linkTextValue('.blki-object2name', this.name, 'object2Name')
            .openFieldClick('.link-object2', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Collection'),
                            admin.fields.CollectionAll
                        ]));
                }.bind(this),
                {onSelect: function(object){
                    this.set({object2: object});
                }.bind(this)})
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
            object: null,
            object2: null,
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
        this.name = (new zz.data());
        this.addNameListenerEvent('object', this.name, 'objectName', 'Выберите коллекцию', 'name');
        this.errorTestValue('object', null, 'Ошибка: выберите коллекцию');
        this.addNameListenerEvent('object2', this.name, 'object2Name', 'Выберите коллекцию', 'name');
        this.errorTestValue('object2', null, 'Ошибка: выберите коллекцию 2');
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Объекты', new SchemeCollection([
            new SelectButtonField('#ObjectCreateAction', admin.ObjectCreateAction),
            new SelectButtonField('#ObjectDeleteAction', admin.ObjectDeleteAction),
            new SelectButtonField('#ObjectSetAction', admin.ObjectSetAction),
            new SelectButtonField('#ObjectUseAction', admin.ObjectUseAction),
            new SelectButtonField('#ObjectFindAction', admin.ObjectFindAction),
            new SelectButtonField('#ObjectTestAction', admin.ObjectTestAction),
/*            new ModuleContainer([
                new SelectButtonField('#ObjectRunTriggerAction', admin.ObjectRunTriggerAction),
            ], 'Function'),*/
//            new HeaderField('Коллекции'),
/*            new SelectButtonField('#ObjectAddCollectionAction', admin.ObjectAddCollectionAction),
            new SelectButtonField('#ObjectRemoveCollectionAction', admin.ObjectRemoveCollectionAction),
            new SelectButtonField('#ObjectTestCollectionAction', admin.ObjectTestCollectionAction),*/
//            new SelectButtonField('#CollectionTestAction', admin.CollectionTestAction),
        ]))
    ], 'Class')
]);
