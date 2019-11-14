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
            .linkTextValue('.blki-objectname', this.name, 'mapareaName')
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
            maparea: null,
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
            maparea: null,
            active: '1'
        });
    }
});

admin.MapAreaSetCenterAction = ActionClass.extend({
    className: 'MapAreaSetCenterAction',
    moduleName: 'MapArea',
    onSelectMapArea: function(maparea){
        this.set({maparea: maparea});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSetCenterAction', this))
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
        this.addNameListenerEvent('coord', this.name, 'coordName', 'Выберите координаты', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        this.errorTestValue('maparea', null, 'Ошибка: выберите зону');
        this.errorTestValue('coord', null, 'Ошибка: выберите координаты');
    },
    createAttrs: function(project){
        this.set({
            maparea: null,
            coord: null
        });
    }
});

admin.MapAreaSetRadiusAction = ActionClass.extend({
    className: 'MapAreaSetRadiusAction',
    moduleName: 'MapArea',
    onSelectMapArea: function(maparea){
        this.set({maparea: maparea});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSetRadiusAction', this))
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
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-radius', this, 'radius')
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
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
    },
    createAttrs: function(project){
        this.set({
            maparea: null,
            radius: 30,
            counterObject: null
        });
    },
    init: function(){
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:counterObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.MapAreaSetColorAction = ActionClass.extend({
    className: 'MapAreaSetColorAction',
    moduleName: 'MapArea',
    onSelectMapArea: function(maparea){
        this.set({maparea: maparea});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSetColorAction', this))
            .linkSwitchValue('.blki-invisible', this, 'invisible')
            .linkInputColor('.blki-color', this, 'strokeColor', 'strokeOpacity')
            .linkInputColor('.blki-fcolor', this, 'fillColor', 'fillOpacity')
            .linkInputFloat('.blki-stroke', this, 'strokeWeight')
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
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            invisible: 0,
            maparea: null
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
    _listArgs: function(){
        return [this.get('arg')];
    },
    _actionLists: function(){
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
            arg: project.watch(new admin.ActionArg('Каждая зона в колекции', 'MapArea'))
        });
        
        this.set({
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            action: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
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
    _actionLists: function(){
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
            maparea: null,
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
    _actionLists: function(){
        return [this.get('action')];
    },
    _listArgs: function(){
        return [this.get('arg')];
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
                            new SelectField('#ArgValueNoRandomSelector', false),
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
            arg: project.watch(new admin.ActionArg('Случаная зона в колекции', 'MapArea'))
        });
        
        this.set({
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            count: 1,
            countObject: false,
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
                    ev.value === false?(
                        'blk-field hide-object hide-counter'
                    ):(
                        ev.value === null?
                        'blk-field hide-object hide-object-all':
                        'blk-field hide-counter hide-object-all'
                    )
            });
        }, this);
        
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
    }
});

admin.MapAreaMarkerSelectAction = ActionClass.extend({
    className: 'MapAreaMarkerSelectAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['action', 'flagList'];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    _actionLists: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaMarkerSelectAction', this))
            .linkTextValue('.blki-objectname', this.flags, 'mapareaName')
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
                        this.watcher.getItem("MapMarkerFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("MapMarkerFlagsList").createSchemeField(this.get('flagList'))
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
            .linkAttributeValue('.blk-ctrfld', 'class', this.flags, 'counterClass')
            .linkInputFloat('.blki-count', this, 'count')
            .linkTextValue('.blki-countname', this.flags, 'counterName')
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
            arg: project.watch(new admin.ActionArg('Каждая выбранная точка из зоны', 'MapMarker'))
        });

        this.set({
            maparea: null,
            count: 0,
            countObject: false,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            action: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({
            flagsName: '',
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:countObject', function(ev){
            this.flags.set({
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
        
        this.addNameListenerEvent('maparea', this.flags, 'mapareaName', 'Выберите зону', 'name');
        this.addLocalsListener('maparea', 'MapArea');
        
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
        
        this.addNameListenerEvent('countObject', this.flags, 'counterName', '', 'name');
    }
});

admin.MapAreaRandomLatLngAction = ActionClass.extend({
    className: 'MapAreaRandomLatLngAction',
    moduleName: 'MapArea',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaRandomLatLngAction', this))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-areaname', this.name, 'mapareaName')
            .openFieldClick('.link-area', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('MapArea'),
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(coord){
                    this.set({maparea: coord});
                }.bind(this)})
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
            name: 'Случайные координаты',
            maparea: null,
            arg: project.watch(new admin.ActionArg('Случайные координаты', 'LatLng'))
        });
    },
    init: function(){
        this.on('added-collection', function(ev){
            ev.collection.addArgs([this.get('arg')]);
        }, this);

        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
        }, this);
        
        this.on('set:name', function(ev){
            var arg = this.get('arg');
            if (arg){
                arg.set({name: ev.value});
            }
        }, this);
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Зоны на карте', new SchemeCollection([
            new SelectButtonField('#MapAreaSetVisibilityActionTpl', admin.MapAreaSetVisibilityAction),
            new SelectButtonField('#MapAreaSetActiveAction', admin.MapAreaSetActiveAction),
            new SelectButtonField('#MapAreaSetColorAction', admin.MapAreaSetColorAction),
            new SelectButtonField('#MapAreaSetCenterAction', admin.MapAreaSetCenterAction),
            new SelectButtonField('#MapAreaSetRadiusAction', admin.MapAreaSetRadiusAction),
            new HeaderField('Точки в зоне'),
            new SelectButtonField('#MapAreaMarkerSelectAction', admin.MapAreaMarkerSelectAction),
            new SelectButtonField('#MapAreaRandomLatLngAction', admin.MapAreaRandomLatLngAction),
            new HeaderField('Коллекции'),
//            new SelectButtonField('#MapAreaSelectAction', admin.MapAreaSelectAction),
            new SelectButtonField('#MapAreaRandomSelectAction', admin.MapAreaRandomSelectAction),
            new SelectButtonField('#MapAreaAddCollectionAction', admin.MapAreaAddCollectionAction),
            new SelectButtonField('#MapAreaRemoveCollectionAction', admin.MapAreaRemoveCollectionAction),
            new SelectButtonField('#MapAreaTestCollectionAction', admin.MapAreaTestCollectionAction),
        ]))
    ], 'MapArea')
]);
