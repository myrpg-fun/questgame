admin.MapMarkerSetVisibilityAction = ActionClass.extend({
    className: 'MapMarkerSetVisibilityAction',
    moduleName: 'MapMarker',
    onSelectMapMarker: function(mapmarker){
        this.set({mapmarker: mapmarker});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerSetVisibilityActionTpl', this))
            .linkSwitchValue('.blki-vis', this, 'visibility')
            .linkTextValue('.blki-objectname', this.name, 'mapmarkerName')
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
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: this.onSelectMapMarker.bind(this)})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        this.errorTestValue('player', null, 'Ошибка: выберите игрока');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
    },
    createAttrs: function(project){
        this.set({
            visibility: '1'
        });
    }
});

admin.MapMarkerSetActiveAction = ActionClass.extend({
    className: 'MapMarkerSetActiveAction',
    moduleName: 'MapMarker',
    onSelectMapMarker: function(mapmarker){
        this.set({mapmarker: mapmarker});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerSetActiveAction', this))
            .linkSwitchValue('.blki-vis', this, 'active')
            .linkTextValue('.blki-objectname', this.name, 'mapmarkerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: this.onSelectMapMarker.bind(this)})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
    },
    createAttrs: function(project){
        this.set({
            active: '1'
        });
    }
});

admin.MapMarkerSelectAction = ActionClass.extend({
    className: 'MapMarkerSelectAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    _getCollections: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerSelectAction', this))
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapMarkerFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapMarkerFlagsList").createSchemeField(this.get('flagList'))
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
            action: project.watch(
                new admin.ActionList(
                    [], {
                        smapmarker: project.watch(new admin.ActionArg('Каждая точка в коллекции', 'MapMarker'))
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

admin.MapMarkerAddCollectionAction = ActionClass.extend({
    className: 'MapMarkerAddCollectionAction',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerAddCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'mapmarkerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(mapmarker){
                    this.set({mapmarker: mapmarker});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapMarkerFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapMarkerFlagsList").createSchemeField(this.get('flagList'))
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
            mapmarker: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
    }
});

admin.MapMarkerRemoveCollectionAction = ActionClass.extend({
    className: 'MapMarkerRemoveCollectionAction',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['flagList'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerRemoveCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'mapmarkerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(mapmarker){
                    this.set({mapmarker: mapmarker});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapMarkerFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapMarkerFlagsList").createSchemeField(this.get('flagList'))
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
            mapmarker: null
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
    }
});

admin.MapMarkerTestCollectionAction = ActionClass.extend({
    className: 'MapMarkerTestCollectionAction',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['yes', 'no', 'flagList'];
    },
    _getCollections: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerTestCollectionAction', this))
            .linkTextValue('.blki-objectname', this.name, 'mapmarkerName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(mapmarker){
                    this.set({mapmarker: mapmarker});
                }.bind(this)})
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("MapMarkerFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapMarkerFlagsList").createSchemeField(this.get('flagList'))
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
            mapmarker: null,
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
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
    }
});

admin.MapMarkerRandomSelectAction = ActionClass.extend({
    className: 'MapMarkerRandomSelectAction',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    _getCollections: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerRandomSelectAction', this))
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
                        this.watcher.getItem("MapMarkerFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapMarkerFlagsList").createSchemeField(this.get('flagList'))
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
                        rmapmarker: project.watch(new admin.ActionArg('Случайная точка в коллекции', 'MapMarker'))
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

admin.MapMarkerMoveAction = ActionClass.extend({
    className: 'MapMarkerMoveAction',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerMoveAction', this))
            .linkInputFloat('.blki-distance', this, 'distance')
            .linkInputFloat('.blki-time', this, 'time')
            //.linkInputFloat('.blki-accel', this, 'accel')
            .linkTextValue('.blki-coordname', this.name, 'coordName')
            .openFieldClick('.link-coord', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('LatLng'),
                            this.createLocalsField(admin.global.PlayerTemplate),
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(coord){
                    this.set({coord: coord});
                }.bind(this)})
            .linkTextValue('.blki-objectname', this.name, 'mapmarkerName')
            .openFieldClick('.link-object', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(mapmarker){
                    this.set({mapmarker: mapmarker});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-object').click();
                    return false; 
                })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addNameListenerEvent('coord', this.name, 'coordName', 'Выберите координаты', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
        this.errorTestValue('coord', null, 'Ошибка: выберите координаты');
    },
    createAttrs: function(project){
        this.set({
            distance: 2,
            time: 2,
            accel: 0,
            mapmarker: null,
            coord: null
        });
    }
});

admin.fields.NewActionCollection.add([
    new GroupField('Точки на карте', new SchemeCollection([
        new SelectButtonField('#MapMarkerSetVisibilityActionTpl', admin.MapMarkerSetVisibilityAction),
        new SelectButtonField('#MapMarkerSetActiveAction', admin.MapMarkerSetActiveAction),
        new SelectButtonField('#MapMarkerSelectAction', admin.MapMarkerSelectAction),
        new SelectButtonField('#MapMarkerMoveAction', admin.MapMarkerMoveAction),
        new SelectButtonField('#MapMarkerAddCollectionAction', admin.MapMarkerAddCollectionAction),
        new SelectButtonField('#MapMarkerRemoveCollectionAction', admin.MapMarkerRemoveCollectionAction),
        new SelectButtonField('#MapMarkerTestCollectionAction', admin.MapMarkerTestCollectionAction),
        new SelectButtonField('#MapMarkerRandomSelectAction', admin.MapMarkerRandomSelectAction),
    ]))
]);
