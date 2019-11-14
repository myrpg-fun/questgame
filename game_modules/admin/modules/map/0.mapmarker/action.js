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

admin.MapMarkerSetIconAction = ActionClass.extend({
    className: 'MapMarkerSetIconAction',
    moduleName: 'MapMarker',
    onSelectMapMarker: function(mapmarker){
        this.set({mapmarker: mapmarker});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerSetIconAction', this))
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
            icon: admin.global.MapMarkerNewIcon,
            add: false
        });
    },
    init: function(project){
        if (typeof this.get('icon') === 'string'){
            project.afterSync(function(){
                for (var i in project.items){
                    var item = project.items[i];

                    if (item instanceof admin.MapMarkerIcon && item.get('url') === this.get('icon')){
                        this.set({
                            icon: item
                        });
                        break;
                    }
                }
            }.bind(this));
        }
        
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

admin.MapMarkerRemoveIconAction = ActionClass.extend({
    className: 'MapMarkerRemoveIconAction',
    moduleName: 'MapMarker',
    onSelectMapMarker: function(mapmarker){
        this.set({mapmarker: mapmarker});
    },
    onSelectPlayer: function(player){
        this.set({player: player});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerRemoveIconAction', this))
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
            icon: [admin.global.MapMarkerNewIcon]
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

admin.MapMarkerSelectAction = ActionClass.extend({
    className: 'MapMarkerSelectAction',
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
            arg: project.watch(new admin.ActionArg('Каждая точка в коллекции', 'MapMarker'))
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
    _actionLists: function(){
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
            mapmarker: null,
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
    _actionLists: function(){
        return [this.get('action')];
    },
    _listArgs: function(){
        return [this.get('arg')];
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
            countObject: false,
            arg: project.watch(new admin.ActionArg('Случайная точка в коллекции', 'MapMarker'))
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

admin.MapMarkerMoveAction = ActionClass.extend({
    className: 'MapMarkerMoveAction',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerMoveAction', this))
            .linkInputFloat('.blki-distance', this, 'distance')
            .openFieldClick('.link-fdistance', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(ftimer){
                    this.set({fdistance: ftimer});
                }.bind(this)})
            .linkTextValue('.blki-fcountername', this.name, 'fcounterName')
            .linkAttributeValue('.blk-ctrfld', 'class', this.name, 'counterClass')
/*            .openFieldClick('.link-edit', function(){
                if (this.get('fdistance'))
                    return this.get('fdistance').getEditor();
                return false;
            }.bind(this),{})*/    
            .linkInputFloat('.blki-time', this, 'time')
            .linkInputValue('.blki-mode', this, 'mode')
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
            .linkSwitchValue('.blki-rotate', this, 'rotate')
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data().set({
            counterClass: 'blk-field hide-object'
        }));
        this.addNameListenerEvent('fdistance', this.name, 'fcounterName', 'Выберите счётчик', 'name');
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addNameListenerEvent('coord', this.name, 'coordName', 'Выберите координаты', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
        this.errorTestValue('coord', null, 'Ошибка: выберите координаты');
        
        this.on('set:fdistance', function(ev){
            this.name.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    },
    createAttrs: function(project){
        this.set({
            distance: 5,
            fdistance: null,
            time: 5,
            accel: 0,
            rotate: 0,
            mode: 'direct',
            mapmarker: null,
            coord: null
        });
    }
});

admin.MapMarkerRotateAction = ActionClass.extend({
    className: 'MapMarkerRotateAction',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerRotateAction', this))
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
            mapmarker: null,
            coord: null
        });
    }
});

admin.MapMarkerDistanceAction = ActionClass.extend({
    className: 'MapMarkerDistanceAction',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerDistanceAction', this))
            .linkInputValue('.blki-name', this, 'name')
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
                            this.createLocalsField('LatLng'),
                            this.createLocalsField(admin.global.PlayerTemplate),
                            this.createLocalsField('MapMarker'),
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(mapmarker){
                    this.set({mapmarker: mapmarker});
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
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addNameListenerEvent('coord', this.name, 'coordName', 'Выберите координаты', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите координаты 1');
        this.errorTestValue('coord', null, 'Ошибка: выберите координаты 2');
    },
    createAttrs: function(project){
        this.set({
            name: 'Расстояние между точками',
            mapmarker: null,
            coord: null,
            arg: project.watch(new admin.ActionArg('Расстояние между точками', 'Counter'))
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

admin.MapMarkerGetRadiusCoordAction = ActionClass.extend({
    className: 'MapMarkerGetRadiusCoordAction',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerGetRadiusCoordAction', this))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-coordname', this.name, 'mapmarkerName')
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
                    this.set({mapmarker: coord});
                }.bind(this)})
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-max', this, 'max')
            .linkTextValue('.blki-maxname', this.name, 'maxName')
            .openFieldClick('.link-max', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({maxObject: counterObject});
                }.bind(this)})
            .linkAttributeValue('.blk-ctrfld2', 'class', this.ctrdata, 'counterClass2')
            .linkInputFloat('.blki-min', this, 'min')
            .linkTextValue('.blki-minname', this.name, 'minName')
            .openFieldClick('.link-min', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({minObject: counterObject});
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
        this.addNameListenerEvent('minObject', this.name, 'minName', '', 'name');
        this.addNameListenerEvent('maxObject', this.name, 'maxName', '', 'name');
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите координаты 1');
    },
    createAttrs: function(project){
        this.set({
            name: 'Случайные координаты',
            mapmarker: null,
            max: 40,
            maxObject: null,
            min: 0,
            minObject: null,
            arg: project.watch(new admin.ActionArg('Случайные координаты', 'LatLng'))
        });
    },
    init: function(){
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object',
            counterClass2: 'blk-field hide-object',
        });
        
        this.on('set:maxObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
        
        this.on('set:minObject', function(ev){
            this.ctrdata.set({
                counterClass2: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
        
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

admin.MapMarkerGetRadiusMarkerAction = ActionClass.extend({
    className: 'MapMarkerGetRadiusMarkerAction',
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
        return this.destrLsn(new SchemeField('#MapMarkerGetRadiusMarkerAction', this))
            .linkTextValue('.blki-coordname', this.name, 'mapmarkerName')
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
                    this.set({mapmarker: coord});
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
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-max', this, 'max')
            .linkTextValue('.blki-maxname', this.name, 'maxName')
            .openFieldClick('.link-max', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({maxObject: counterObject});
                }.bind(this)})
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
            max: 40,
            maxObject: null,
            mapmarker: null,
            arg: project.watch(new admin.ActionArg('Каждая точка в радиусе', 'MapMarker'))
        });
        
        this.set({
            action: project.watch(
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
        this.addNameListenerEvent('mapmarker', this.name, 'mapmarkerName', 'Выберите точку', 'name');
        this.addLocalsListener('mapmarker', 'MapMarker');
        this.addNameListenerEvent('maxObject', this.name, 'maxName', '', 'name');
        this.errorTestValue('mapmarker', null, 'Ошибка: выберите точку');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object',
        });
        
        this.on('set:maxObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Точки на карте', new SchemeCollection([
            new SelectButtonField('#MapMarkerSetVisibilityActionTpl', admin.MapMarkerSetVisibilityAction),
            new SelectButtonField('#MapMarkerSetActiveAction', admin.MapMarkerSetActiveAction),
            new SelectButtonField('#MapMarkerSetIconAction', admin.MapMarkerSetIconAction),
            new SelectButtonField('#MapMarkerRemoveIconAction', admin.MapMarkerRemoveIconAction),
            new ModuleContainer([
                new HeaderField('Перемещение'),
                new SelectButtonField('#MapMarkerMoveAction', admin.MapMarkerMoveAction),
                new SelectButtonField('#MapMarkerRotateAction', admin.MapMarkerRotateAction),
                new SelectButtonField('#MapMarkerDistanceAction', admin.MapMarkerDistanceAction),
                new SelectButtonField('#MapMarkerGetRadiusCoordAction', admin.MapMarkerGetRadiusCoordAction),
                new SelectButtonField('#MapMarkerGetRadiusMarkerAction', admin.MapMarkerGetRadiusMarkerAction),
            ], 'MapMarkerLatLng'),
            new HeaderField('Коллекции'),
//            new SelectButtonField('#MapMarkerSelectAction', admin.MapMarkerSelectAction),
            new SelectButtonField('#MapMarkerRandomSelectAction', admin.MapMarkerRandomSelectAction),
            new SelectButtonField('#MapMarkerAddCollectionAction', admin.MapMarkerAddCollectionAction),
            new SelectButtonField('#MapMarkerRemoveCollectionAction', admin.MapMarkerRemoveCollectionAction),
            new SelectButtonField('#MapMarkerTestCollectionAction', admin.MapMarkerTestCollectionAction),
        ]))
    ], 'MapMarker')
]);
