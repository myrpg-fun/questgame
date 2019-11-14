var Project = admin.global.Project;

admin.MapMarkerTriggerActive = admin.TriggerClass.extend({
    className: 'MapMarkerTriggerActive',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#MapMarkerTriggerActive'))
            .linkSwitchValue('.blki-active', this, 'active')
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch( new admin.ActionArg('Точка на карте', 'MapMarker') )
        });
        
        this.set({
            active: 1,
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.MapMarkerTriggerClick = admin.TriggerClass.extend({
    className: 'MapMarkerTriggerClick',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['list'];
    },
    _listArgs: function(){
        return [this.get('arg'), this.get('target')];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#MapMarkerTriggerClick'))
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch( new admin.ActionArg('Точка на карте', 'MapMarker') )
        });
        
        this.set({
            arg: project.watch(new admin.ActionArgClass('Игрок кликнул', admin.global.PlayerTemplate))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.MapMarkerTriggerMove = admin.TriggerClass.extend({
    className: 'MapMarkerTriggerMove',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#MapMarkerTriggerMove'))
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch( new admin.ActionArg('Точка на карте', 'MapMarker') )
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.MapMarkerTriggerNear = admin.TriggerClass.extend({
    className: 'MapMarkerTriggerNear',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['near', 'far', 'flagList'];
    },
    _listArgs: function(){
        return [this.get('arg'), this.get('target')];
    },
    createSchemeField: function(){
        var nearList = this.get('near');
        var farList = this.get('far');
        return this.destrLsn(new SchemeField('#MapMarkerTriggerNear'))
            .linkInputValue('input.blki-radius', this, 'radius')
            .openFieldClick('.link-near', this.destrLsn(makeSchemeFieldList(
                new SchemeCollection([
                    nearList.getLocalsSchemeField(),
                    nearList.createCopyButtonField('Действия'),
                    nearList.getSchemeField()
                ])
            ), {}))
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
            .openFieldClick('.link-far', this.destrLsn(makeSchemeFieldList(
                new SchemeCollection([
                    farList.getLocalsSchemeField(),
                    farList.createCopyButtonField('Действия'),
                    farList.getSchemeField()
                ])
            ), {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-near').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('near'), this.get('far')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch( new admin.ActionArg('Точка на карте', 'MapMarker') )
        });
        
        this.set({
            arg: project.watch(new admin.ActionArgClass('Игрок приблизился', admin.global.PlayerTemplate))
        });

        this.set({
            near: project.watch(new admin.ActionList([], this._listArgs())),
            far: project.watch(new admin.ActionList([], this._listArgs())),
            flagList: project.watch(
                new admin.FlagCollectionList([
                    project.getItem('PlayerAllFlag')
                ])
            ),
            radius: '40'
        });
    }, 
    init: function(project){
        if (!this.get('flagList')){
            this.set({
                flagList: project.watch(
                    new admin.FlagCollectionList([
                        project.getItem('PlayerAllFlag')
                    ])
                )
            });
        }
        
        var circle = new google.maps.Circle({
            strokeColor: '#0080AF',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: '#0000ff',
            fillOpacity: 0.1,
            map: null,
            center: {lat: 0, lng: 0},
            radius: parseInt(this.get('radius')),
            zIndex: 0
        });
        
        var setcnt = function(ev){
            var m = ev.target;
            circle.setCenter({lat: m.get('lat'),lng: m.get('lng')});
        };

        this.on('set:radius', function(ev){
            circle.setRadius(parseInt(ev.value));
        }, this);
        
        this.on('show-on-map', function(ev){
            var m = ev.marker;
            circle.setCenter({lat: m.get('lat'),lng: m.get('lng')});
            circle.setMap(m.get('map').map);
            circle.__marker = m;
            m.on('set', setcnt, this);
        }, this);
        
        this.on('hide-on-map', function(ev){
            circle.setMap(null);
            if (circle.__marker){
                circle.__marker.off('set', setcnt, this);
            }
        }, this);
        
        this.on('destroy', function(){
            circle.setMap(null);
            if (circle.__marker){
                circle.__marker.off('set', setcnt, this);
            }
        });
        
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');        
    }
});

admin.MapMarkerTriggerNearMapMarker = admin.TriggerClass.extend({
    className: 'MapMarkerTriggerNearMapMarker',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['near', 'far', 'flagList'];
    },
    _listArgs: function(){
        return [this.get('arg'), this.get('target')];
    },
    createSchemeField: function(){
        var nearList = this.get('near');
        var farList = this.get('far');
        return this.destrLsn(new SchemeField('#MapMarkerTriggerNearMapMarker'))
            .linkInputValue('input.blki-radius', this, 'radius')
            .openFieldClick('.link-near', this.destrLsn(makeSchemeFieldList(
                new SchemeCollection([
                    nearList.getLocalsSchemeField(),
                    nearList.createCopyButtonField('Действия'),
                    nearList.getSchemeField()
                ])
            ), {}))
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
            .openFieldClick('.link-far', this.destrLsn(makeSchemeFieldList(
                new SchemeCollection([
                    farList.getLocalsSchemeField(),
                    farList.createCopyButtonField('Действия'),
                    farList.getSchemeField()
                ])
            ), {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-near').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('near'), this.get('far')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch( new admin.ActionArg('Точка на карте', 'MapMarker') )
        });
        
        this.set({
            arg: project.watch(new admin.ActionArg('Точка приблизилась', 'MapMarker')),
        });

        this.set({
            near: project.watch(new admin.ActionList([], this._listArgs())),
            far: project.watch(new admin.ActionList([], this._listArgs())),
            flagList: project.watch(
                new admin.FlagCollectionList([
                    project.getItem('MapMarkersAllFlag')
                ])
            ),
            radius: '40'
        });
    }, 
    init: function(project){
        if (!this.get('flagList')){
            this.set({
                flagList: project.watch(
                    new admin.FlagCollectionList([
                        project.getItem('PlayerAllFlag')
                    ])
                )
            });
        }
        
        var circle = new google.maps.Circle({
            strokeColor: '#008000',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: '#00ff00',
            fillOpacity: 0.1,
            map: null,
            center: {lat: 0, lng: 0},
            radius: parseInt(this.get('radius')),
            zIndex: 0
        });
        
        var setcnt = function(ev){
            var m = ev.target;
            circle.setCenter({lat: m.get('lat'),lng: m.get('lng')});
        };

        this.on('set:radius', function(ev){
            circle.setRadius(parseInt(ev.value));
        }, this);
        
        this.on('show-on-map', function(ev){
            var m = ev.marker;
            circle.setCenter({lat: m.get('lat'),lng: m.get('lng')});
            circle.setMap(m.get('map').map);
            circle.__marker = m;
            m.on('set', setcnt, this);
        }, this);
        
        this.on('hide-on-map', function(ev){
            circle.setMap(null);
            if (circle.__marker){
                circle.__marker.off('set', setcnt, this);
            }
        }, this);
        
        this.on('destroy', function(){
            circle.setMap(null);
            if (circle.__marker){
                circle.__marker.off('set', setcnt, this);
            }
        });
        
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');        
    }
});

admin.fields.NewMapMarkerTriggers = makeSchemeFieldList(
    admin.fields.NewMapMarkerTriggersCollection = new SchemeCollection([
        new SelectButtonField('#MapMarkerTriggerActive', admin.MapMarkerTriggerActive),
        new SelectButtonField('#MapMarkerTriggerClick', admin.MapMarkerTriggerClick),
        new ModuleContainer([
            new SelectButtonField('#MapMarkerTriggerNear', admin.MapMarkerTriggerNear)
        ], 'MapGps'),
        new ModuleContainer([
            new SelectButtonField('#MapMarkerTriggerNearMapMarker', admin.MapMarkerTriggerNearMapMarker),
            new SelectButtonField('#MapMarkerTriggerMove', admin.MapMarkerTriggerMove)
        ], 'MapMarkerLatLng')
    ])
);
