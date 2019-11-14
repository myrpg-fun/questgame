admin.SessionSettingMap = admin.TriggerClass.extend({
    className: 'SessionSettingMap',
    moduleName: 'Map',
    cloneAttrs: function(){
        return [];
    },
    getPath: function(){
        var result = [];
        var points = this.get('points');
        
        for (var i=0; i<points.length; i=i+2){
            result.push(new google.maps.LatLng(points[i], points[i+1]));
        }
        
        return result;
    },
    createAttrs: function(project){
        var points = [];
        
        var minx=null,miny=null,maxx=null,maxy=null;
        if (admin.global.MapMarkersAllFlag){
            admin.global.MapMarkersAllFlag.forEach(function(mapmarker){
                var lat = mapmarker.get('lat');
                var lng = mapmarker.get('lng');
                if (minx === null){
                    minx = lat;
                    maxx = lat;
                    miny = lng;
                    maxy = lng;
                }else{
                    if (minx > lat){
                        minx = lat;
                    }
                    if (maxx < lat){
                        maxx = lat;
                    }
                    if (miny > lng){
                        miny = lng;
                    }
                    if (maxy < lng){
                        maxy = lng;
                    }
                }
            }, this);
            
            points = points.concat([
                minx, miny,
                maxx, miny,
                maxx, maxy,
                minx, maxy
            ]);
        }
        
        this.set({
            points: points
        });
    },
    createSchemeField: function(){
        var poly = null;
        return this.destrLsn(new SchemeField('#SessionSettingMapTpl'))
            .init(null, function(){
                var map = this.watcher.getItem('Map');
                if (map){
                    map = map.getMap();
                    poly = new google.maps.Polygon({
                        paths: this.getPath(),
                        editable: true,
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        map: map
                    });
                    
                    var deleteMenu = new DeleteMenu();

                    google.maps.event.addListener(poly, 'rightclick', function(e) {
                        // Check if click was on a vertex control point
                        if (e.vertex == undefined) {
                            return;
                        }
                        deleteMenu.open(map, poly.getPath(), e.vertex);
                    }.bind(this));
                    
                    var setPath = function() {
                        var vertices = poly.getPath();
                        var points = [];
                        for (var i=0; i<vertices.getLength(); i++) {
                            var xy = vertices.getAt(i);
                            points.push(xy.lat());
                            points.push(xy.lng());
                        }
                        this.set({points: points});
                    }.bind(this);
                    
                    google.maps.event.addListener(poly.getPath(), 'set_at', setPath);
                    google.maps.event.addListener(poly.getPath(), 'insert_at', setPath);
                    google.maps.event.addListener(poly.getPath(), 'remove_at', setPath);
                }
            }.bind(this), function(){
                poly.setMap(null);
            }.bind(this))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    }
});

admin.SessionSettingText = admin.TriggerClass.extend({
    className: 'SessionSettingText',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            text: 'Текст'
        });
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingTextTpl'))
            .linkInputValue('.blki-text', this, 'text')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    }
});

admin.SessionSettingInventorySelect = admin.TriggerClass.extend({
    className: 'SessionSettingInventorySelect',
    moduleName: 'Dialog',
    _actionLists: function(){
        return [this.get('click'), this.get('dblclick')];
    },
    cloneAttrs: function(){
        return ['click', 'dblclick'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingInventorySelect'))
            .openFieldClick('.link-edit', function(){
                if (this.get('inventory'))
                    return this.get('inventory').getEditor();
                return false;
            }.bind(this),{})
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
            .openFieldClick('.link-click', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('click').getLocalsSchemeField(),
                        this.get('click').createCopyButtonField('Действия'),
                        this.get('click').getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-inventory').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
        this.addLocalsListener('inventory', 'Inventory');
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    createAttrs: function(project){
        this.set({
            playerarg: project.watch(new admin.ActionArgClass('Игрок кликнул', admin.global.PlayerTemplate)),
            itemarg: project.watch(new admin.ActionArg('Выбранный предмет', 'InventoryItem')),
            countarg: project.watch(new admin.ActionArg('Количество выбранного предмета', 'Counter')),
        });
        
        this.set({
            inventory: null,
            click: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){}
});

admin.SessionSettingCounter = admin.TriggerClass.extend({
    className: 'SessionSettingCounter',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            name: 'Параметр',
            counter: null
        });
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingCounter'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counter: counterObject});
                }.bind(this)})
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('counter', this.name, 'counterName', 'Выберите счётчик', 'name');
    }
});

admin.SessionSettingTimer = admin.TriggerClass.extend({
    className: 'SessionSettingTimer',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            timer: null
        });
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingTimerTpl'))
            .openFieldClick('.link-timer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Timer'),
                            admin.fields.TimerCollection
                        ]));
                }.bind(this),
                {onSelect: function(timer){
                    this.set({timer: timer});
                }.bind(this)})
            .linkTextValue('.blki-timername', this.name, 'timerName')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
});

admin.fields.NewSessionSettings = makeSchemeFieldList(
    new SchemeCollection([
        new ModuleContainer([
            new SelectButtonField('#SessionSettingMapTpl', admin.SessionSettingMap)
        ], 'MapMarker'),
        new SelectButtonField('#SessionSettingTextTpl', admin.SessionSettingText),
        new SelectButtonField('#SessionSettingCounter', admin.SessionSettingCounter),
        new SelectButtonField('#SessionSettingTimerTpl', admin.SessionSettingTimer),
    ])
);
