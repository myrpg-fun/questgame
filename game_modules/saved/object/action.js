admin.ObjectCreateAction = ActionClass.extend({
    className: 'ObjectCreateAction',
    moduleName: 'Class',
    _getCollections: function(){
        return [this.get('action')];
    },
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            name: 'Объект '+ObjectCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.ObjectAllFlag])
            ),
            class: null,
            action: project.watch(new admin.ActionList([], {}))
        });
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        
        this.on('before-clone', function(ev){
            for (var i in ev.attr){
                if (ev.attr[i] instanceof admin.ObjectField){
                    ev.attr[i] = ev.attr[i].clone();
                }
            }
        }, this);

        var flagList = this.get('flagList');
        
        project.afterSyncItem("ObjectFlagsList", function(ObjectFlagsList){
            project.afterSync([flagList], function(){
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
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    ObjectFlagsList.createButtonField('Создать коллекцию'),
                    ObjectFlagsList.createSchemeField(flagList)
                ]) ));

                var classFields = new SchemeCollection([]);

                var afn = function(ev){
                    var val = this.get(ev.item.id);
                    if (!val){
                        if (ev.item && ev.item.getValue() === null){
                            val = this.watcher.watch(new admin.ObjectField(ev.item, this));
                            ev.item.setupField(val);
                            this.setAttribute(ev.item.id, val);
                        }
                    }
                    
                    if (val){
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
                        this.get('class').getLocals().forEach(function(item){
                            afn({item: item});
                        });
                    }
                }.bind(this);
                
                this.on('set:class', function(ev){
                    if (ev.lastValue){
                        ev.lastValue.off('add-item', afn);
                        ev.lastValue.off('remove-item', rfn);

                        ev.value.getLocals().forEach(function(item){
                            rfn({item: item});
                        });
                    }
                    
                    classFields.removeAll();
                    
                    if (ev.value){
                        ev.value.on('add-item', afn, this);
                        ev.value.on('remove-item', rfn, this);

                        ev.value.getLocals().forEach(function(item){
                            afn({item: item});
                        });
                    }
                }, this);

                this.editorBlk = this.destrLsn(new SchemeField('#ObjectCreateAction'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .linkTextValue('.blki-classname', this.name, 'className')
                    .openFieldClick('.link-class', admin.fields.ClassCollection, {onSelect: function(classObj){
                        this.set({class: classObj});
                
                        if (this.get('action').get('newobject')){
                            this.get('action').get('newobject').deleteSync();
                        }
                        
                        this.get('action').set({newobject: this.watcher.watch(new admin.ActionArgClass('Новый объект', classObj))});
                    }.bind(this)})
                    .openFieldClick('.link-edit', function(){
                        if (this.get('class'))
                            return this.get('class').editorBlk;
                        return false;
                    }.bind(this),{})
                    .linkCollection('.blk-classfields', classFields)
                    .openFieldClick('.link-action', 
                        this.destrLsn(makeSchemeFieldList(
                            new SchemeCollection([
                                this.get('action').getLocalsSchemeField(),
                                this.get('action').createButtonField('Добавить действие'),
                                this.get('action').list().getSchemeField()
                            ])
                        )
                    , {}))
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this));
            }.bind(this));
        }.bind(this));
    },
});

admin.ObjectFindAction = ActionClass.extend({
    className: 'ObjectFindAction',
    moduleName: 'Class',
    _getCollections: function(){
        return [this.get('action'), this.get('notfound')];
    },
    cloneAttrs: function(){
        return ['action', 'notfound', 'flagList'];
    },
    createSchemeField: function(){
        return this.editorBlk;
    },
    createAttrs: function(project){
        this.set({
            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.ObjectAllFlag])
            ),
            class: null,
            action: project.watch(new admin.ActionList([], {})),
            notfound: project.watch(new admin.ActionList([], {})),
        });
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        
        this.on('before-clone', function(ev){
            for (var i in ev.attr){
                if (ev.attr[i] instanceof admin.ObjectField){
                    ev.attr[i] = ev.attr[i].clone();
                }
            }
        }, this);

        var flagList = this.get('flagList');
        
        project.afterSyncItem("ObjectFlagsList", function(ObjectFlagsList){
            project.afterSync([flagList], function(){
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
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    ObjectFlagsList.createButtonField('Создать коллекцию'),
                    ObjectFlagsList.createSchemeField(flagList)
                ]) ));

                var classFields = new SchemeCollection([]);

                var afn = function(ev){
                    var val = this.get(ev.item.id);
                    if (!val){
                        if (ev.item && ev.item.getValue() === null){
                            val = this.watcher.watch(new admin.ObjectField(ev.item, this));
                            ev.item.setupField(val);
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
                        this.get('class').getLocals().forEach(function(item){
                            afn({item: item});
                        });
                    }
                }.bind(this);
                
                this.on('set:class', function(ev){
                    if (ev.lastValue){
                        ev.lastValue.off('add-item', afn);
                        ev.lastValue.off('remove-item', rfn);

                        ev.value.getLocals().forEach(function(item){
                            rfn({item: item});
                        });
                    }
                    
                    classFields.removeAll();
                    
                    if (ev.value){
                        ev.value.on('add-item', afn, this);
                        ev.value.on('remove-item', rfn, this);

                        ev.value.getLocals().forEach(function(item){
                            afn({item: item});
                        });
                    }
                }, this);

                this.editorBlk = this.destrLsn(new SchemeField('#ObjectFindAction'))
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .linkTextValue('.blki-classname', this.name, 'className')
                    .openFieldClick('.link-class', admin.fields.ClassCollection, {onSelect: function(classObj){
                        this.set({class: classObj});
                
                        if (this.get('action').get('fobject')){
                            this.get('action').get('fobject').deleteSync();
                        }
                        
                        this.get('action').set({fobject: this.watcher.watch(new admin.ActionArgClass('Найденный объект', classObj))});
                    }.bind(this)})
                    .openFieldClick('.link-edit', function(){
                        if (this.get('class'))
                            return this.get('class').editorBlk;
                        return false;
                    }.bind(this),{})
                    .linkCollection('.blk-classfields', classFields)
                    .openFieldClick('.link-action', 
                        this.destrLsn(makeSchemeFieldList(
                            new SchemeCollection([
                                this.get('action').getLocalsSchemeField(),
                                this.get('action').createButtonField('Добавить действие'),
                                this.get('action').list().getSchemeField()
                            ])
                        )
                    , {}))
                    .openFieldClick('.link-notfound', 
                        this.destrLsn(makeSchemeFieldList(
                            new SchemeCollection([
                                this.get('notfound').getLocalsSchemeField(),
                                this.get('notfound').createButtonField('Добавить действие'),
                                this.get('notfound').list().getSchemeField()
                            ])
                        )
                    , {}))
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this));
            }.bind(this));
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
                    return this.get('object').editorBlk;
                return false;
            }.bind(this),{})
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
});

admin.fields.NewActionCollection.add([
    new GroupField('Объекты', new SchemeCollection([
        new SelectButtonField('#ObjectCreateAction', admin.ObjectCreateAction),
        new SelectButtonField('#ObjectFindAction', admin.ObjectFindAction),
        new SelectButtonField('#ObjectDeleteAction', admin.ObjectDeleteAction),
    ]))
]);
