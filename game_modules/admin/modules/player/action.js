admin.PlayerSelectAction = ActionClass.extend({
    className: 'PlayerSelectAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['flagList', 'action'];
    },
    onSelectSession: function(session){
        this.set({session: session});
    },
    _actionLists: function(){
        return [this.get('action')];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerSelectAction', this))
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("ObjectFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("ObjectFlagsList").createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-action', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('action').getLocalsSchemeField(),
                        this.get('action').createCopyButtonField('Действия'),
                        this.get('action').getSchemeField()
                    ])
                )
            , {})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-action').click();
                return false; 
            })
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
            arg: project.watch(new admin.ActionArgClass('Каждый игрок в коллекции', admin.global.PlayerTemplate))
        });
        this.set({
            action: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
    }
});

admin.PlayerAddCollectionAction = ActionClass.extend({
    className: 'PlayerAddCollectionAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerAddCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'playerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("ObjectFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("ObjectFlagsList").createSchemeField(this.get('flagList'))
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
            player: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        this.errorTestValue('player', null, 'Ошибка: выберите игрока');
    }
});

admin.PlayerRemoveCollectionAction = ActionClass.extend({
    className: 'PlayerRemoveCollectionAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerRemoveCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'playerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("ObjectFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("ObjectFlagsList").createSchemeField(this.get('flagList'))
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
            player: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        this.errorTestValue('player', null, 'Ошибка: выберите игрока');
    }
});

admin.PlayerTestCollectionAction = ActionClass.extend({
    className: 'PlayerTestCollectionAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['yes', 'no', 'flagList'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerTestCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'playerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("ObjectFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("ObjectFlagsList").createSchemeField(this.get('flagList'))
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
            player: null,
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
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        this.errorTestValue('player', null, 'Ошибка: выберите игрока');
    }
});

admin.PlayerRandomSelectAction = ActionClass.extend({
    className: 'PlayerRandomSelectAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    _actionLists: function(){
        return [this.get('action')];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerRandomSelectAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-count', this, 'count')
            .linkTextValue('.blki-countname', this.name, 'counterName')
            .openFieldClick('.link-count', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({countObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("ObjectFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("ObjectFlagsList").createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-action', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('action').getLocalsSchemeField(),
                        this.get('action').createCopyButtonField('Действия'),
                        this.get('action').getSchemeField()
                    ])
                )
            , {})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-action').click();
                return false; 
            })
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
            count: 1,
            countObject: null,
            arg: project.watch(new admin.ActionArgClass('Случайный игрок в коллекции', admin.global.PlayerTemplate))
        });

        this.set({
            action: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('countObject', this.name, 'counterName', '', 'name');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:countObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
        
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
    }
});

admin.fields.NewActionCollection.add([
    new GroupField('Игроки', new SchemeCollection([
        new SelectButtonField('#PlayerSelectAction', admin.PlayerSelectAction),
        new SelectButtonField('#PlayerAddCollectionAction', admin.PlayerAddCollectionAction),
        new SelectButtonField('#PlayerRemoveCollectionAction', admin.PlayerRemoveCollectionAction),
        new SelectButtonField('#PlayerTestCollectionAction', admin.PlayerTestCollectionAction),
        new SelectButtonField('#PlayerRandomSelectAction', admin.PlayerRandomSelectAction),
    ]))
]);
