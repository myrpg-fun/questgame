admin.MapAreaSetVisibilityAction = ActionClass.extend({
    className: 'MapAreaSetVisibilityAction',
    moduleName: 'MapArea',
    onSelectMapArea: function(maparea){
        this.set({maparea: maparea});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSetVisibilityActionTpl', this))
            .linkSwitchValue('.blki-vis', this, 'visibility')
            .linkTextValue('.blki-objectname', this.name, 'mapareaName')
            .linkTextValue('.blki-playername', this.name, 'playerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-player', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate)
                        ]));
                }.bind(this),
                {onSelect: this.onSelectPlayer.bind(this)})
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapArea'),
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: this.onSelectMapArea.bind(this)})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('maparea', this.name, 'mapareaName', 'Выберите зону', 'name');
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        this.errorTestValue('player', null, 'Ошибка: выберите игрока');
        this.errorTestValue('maparea', null, 'Ошибка: выберите зону');
    },
    createAttrs: function(project){
        this.set({
            visibility: '1'
        });
    }
});

admin.MapAreaSetActiveAction = ActionClass.extend({
    className: 'MapAreaSetActiveAction',
    moduleName: 'MapArea',
    onSelectMapArea: function(maparea){
        this.set({maparea: maparea});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSetActiveAction', this))
            .linkSwitchValue('.blki-vis', this, 'active')
            .linkTextValue('.blki-objectname', this.name, 'mapareaName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapArea'),
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: this.onSelectMapArea.bind(this)})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('maparea', this.name, 'mapareaName', 'Выберите зону', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        this.errorTestValue('maparea', null, 'Ошибка: выберите зону');
    },
    createAttrs: function(project){
        this.set({
            active: '1'
        });
    }
});

admin.MapAreaSelectAction = ActionClass.extend({
    className: 'MapAreaSelectAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    onSelectSession: function(session){
        this.set({session: session});
    },
    _getCollections: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSelectAction', this))
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return this.watcher.getItem("MapAreaFlagsList").createSchemeField(this.get('flagList'));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-action', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('action').getLocalsSchemeField(),
                        this.get('action').createButtonField('Добавить действие'),
                        this.get('action').list().getSchemeField()
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
            action: project.watch(
                new admin.ActionList(
                    [], {
                        smaparea: project.watch(new admin.ActionArg('Каждая зона в колекции', 'MapArea'))
                    }
            ))
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
    }
});

admin.MapAreaAddCollectionAction = ActionClass.extend({
    className: 'MapAreaAddCollectionAction',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaAddCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'mapareaName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapArea'),
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(maparea){
                    this.set({maparea: maparea});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapAreaFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapAreaFlagsList").createSchemeField(this.get('flagList'))
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
            maparea: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('maparea', this.name, 'mapareaName', 'Выберите зону', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        this.errorTestValue('maparea', null, 'Ошибка: выберите зону');
    }
});

admin.MapAreaRemoveCollectionAction = ActionClass.extend({
    className: 'MapAreaRemoveCollectionAction',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaRemoveCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'mapareaName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapArea'),
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(maparea){
                    this.set({maparea: maparea});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapAreaFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapAreaFlagsList").createSchemeField(this.get('flagList'))
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
            maparea: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('maparea', this.name, 'mapareaName', 'Выберите зону', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        this.errorTestValue('maparea', null, 'Ошибка: выберите зону');
    }
});

admin.MapAreaTestCollectionAction = ActionClass.extend({
    className: 'MapAreaTestCollectionAction',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['yes', 'no', 'flagList'];
    },
    _getCollections: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaTestCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'mapareaName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapArea'),
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(maparea){
                    this.set({maparea: maparea});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapAreaFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapAreaFlagsList").createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-yes', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('yes').getLocalsSchemeField(),
                        this.get('yes').createButtonField('Добавить действие'),
                        this.get('yes').list().getSchemeField()
                    ])
                )
            , {})
            .openFieldClick('.link-no', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('no').getLocalsSchemeField(),
                        this.get('no').createButtonField('Добавить действие'),
                        this.get('no').list().getSchemeField()
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
            maparea: null,
            yes: project.watch(
                new admin.ActionList(
                    [], {}
            )),
            no: project.watch(
                new admin.ActionList(
                    [], {}
            )),
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('maparea', this.name, 'mapareaName', 'Выберите зону', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        this.errorTestValue('maparea', null, 'Ошибка: выберите зону');
    }
});

admin.MapAreaRandomSelectAction = ActionClass.extend({
    className: 'MapAreaRandomSelectAction',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    _getCollections: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaRandomSelectAction', this))
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
                        this.watcher.getItem("MapAreaFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapAreaFlagsList").createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-action', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('action').getLocalsSchemeField(),
                        this.get('action').createButtonField('Добавить действие'),
                        this.get('action').list().getSchemeField()
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
            action: project.watch(
                new admin.ActionList(
                    [], {
                        rmaparea: project.watch(new admin.ActionArg('Случайный зона в коллекции', 'MapArea'))
                    }
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
    new GroupField('Зоны на карте', new SchemeCollection([
        new SelectButtonField('#MapAreaSetVisibilityActionTpl', admin.MapAreaSetVisibilityAction),
        new SelectButtonField('#MapAreaSetActiveAction', admin.MapAreaSetActiveAction),
        new SelectButtonField('#MapAreaSelectAction', admin.MapAreaSelectAction),
        new SelectButtonField('#MapAreaAddCollectionAction', admin.MapAreaAddCollectionAction),
        new SelectButtonField('#MapAreaRemoveCollectionAction', admin.MapAreaRemoveCollectionAction),
        new SelectButtonField('#MapAreaTestCollectionAction', admin.MapAreaTestCollectionAction),
        new SelectButtonField('#MapAreaRandomSelectAction', admin.MapAreaRandomSelectAction),
    ]))
]);
