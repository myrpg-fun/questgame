var MapAreaClassCounter = 1;

admin.MapAreaClassTable = ActionClass.extend({
    className: 'MapAreaClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaClassTable'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-className', this, 'header')
            .openFieldClick('.link-click', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('click').getLocalsSchemeField(),
                        this.get('click').createCopyButtonField('Действия'),
                        this.get('click').getSchemeField()
                    ])
                )
            , {}))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            header: this._init.name,
            name: this._init.name,
            click: project.watch(new admin.ActionList([], {
                admin: project.watch(new admin.ActionArgClass('Адинистратор кликнул', admin.global.PlayerTemplate)),
                object: project.watch(new admin.ActionArgClass('Объект класса', this._init.class))
            }))
        });
    },
    initialize: function(classObj, name){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj, name: name};
    }
});

admin.MapCircleAreaClass = ActionClass.extend({
    className: 'MapCircleAreaClass',
    moduleName: 'MapArea',
    classObject: 'MapArea',
    defaultMessage: 'Выберите зону',
    cloneAttrs: function(){
        return ['maparea', 'triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('maparea')?this.get('maparea').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('maparea');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.MapAreaCollection;
    },
    getObjectEditField: function(ma, obj){
        var show = false;
        
        ma.parentObject = obj;
        
        return this.destrLsn(new SchemeField('#MapCircleAreaObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputFloat('.blki-lat', ma, 'lat')
            .linkInputFloat('.blki-lng', ma, 'lng')
            .linkInputFloat('.blki-radius', ma, 'radius')
            .linkInputColor('.blki-color', ma, 'strokeColor', 'strokeOpacity')
            .linkInputColor('.blki-fcolor', ma, 'fillColor', 'fillOpacity')
            .linkInputInteger('.blki-stroke', ma, 'strokeWeight')
            .linkSwitchValue('.blki-active', ma, 'active')
            .linkSwitchValue('.blki-visible', ma, 'invisible')
            .init(null, function(){
                show = true;
                ma.mapArea.setOptions({
                    editable: true,
                    draggable: true
                });

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('show-on-map', {marker: ma});
                }, this);
            }.bind(this), function(){
                show = false;
                ma.mapArea.setOptions({
                    editable: false,
                    draggable: false
                });

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('hide-on-map', {marker: ma});
                }, this);
            }.bind(this))
        .linkTextValue('.blki-group', ma.flagsVar, 'flagsName')
        .openFieldClick('.link-group', function(){return ma.flagCField}, {onSelect: ma.get('flagList').toggleFlag.bind(ma.get('flagList'))})
        .linkCollection('.blk-errors', this.errorList);
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#MapAreaClassTable', admin.MapAreaClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    createAttrs: function(project){
        var map = admin.global.Map.getMap().getCenter();
        var maparea = project.watch( new admin.MapCircleArea(map.lat(), map.lng(), 5000000/(Math.pow(2, admin.global.Map.getMap().getZoom()))) );
        
        maparea.removeFlag( admin.global.MapAreasAllFlag );
        
        this.set({
            name: 'Круг на карте '+MapAreaClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            maparea: maparea
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapAreaClassCounter){
            MapAreaClassCounter = digit[0]*1+1;
        }

        project.afterSync(function(){
            var ma = this.get('maparea');

            ma.parentObject = this;
        
            ma.on('destroy', function(){
                this.destroy();
            }, this);
            
            this.on('set:name', function(ev){
                ma.set({name: '['+ev.value+']'});
            }, this);

            this.on('destroy', function(){
                this.getValue().destroy();
            }, this);
            
            var show = false;
            
            triggerList.on('add', function(ev){
                if (show){
                    ev.item.callEventListener('show-on-map', {marker: ma});
                }
            }, this);

            var editBlk = this.destrLsn(new SchemeField('#MapCircleAreaClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                    .linkInputFloat('.blki-lat', ma, 'lat')
                    .linkInputFloat('.blki-lng', ma, 'lng')
                    .linkInputFloat('.blki-radius', ma, 'radius')
                    .linkInputColor('.blki-color', ma, 'strokeColor', 'strokeOpacity')
                    .linkInputColor('.blki-fcolor', ma, 'fillColor', 'fillOpacity')
                    .linkInputInteger('.blki-stroke', ma, 'strokeWeight')
                    .linkSwitchValue('.blki-active', ma, 'active')
                    .linkSwitchValue('.blki-visible', ma, 'invisible')
                    .init(null, function(){
                        show = true;
                        ma.mapArea.setOptions({
                            editable: true,
                            draggable: true
                        });
                        
                        triggerList.forEach(function(trigger){
                            trigger.callEventListener('show-on-map', {marker: ma});
                        }, this);
                    }.bind(this), function(){
                        show = false;
                        ma.mapArea.setOptions({
                            editable: false,
                            draggable: false
                        });
                        
                        triggerList.forEach(function(trigger){
                            trigger.callEventListener('hide-on-map', {marker: ma});
                        }, this);
                    }.bind(this))
                .linkTextValue('.blki-group', ma.flagsVar, 'flagsName')
                .openFieldClick('.link-group', function(){return ma.flagCField}, {onSelect: ma.get('flagList').toggleFlag.bind(ma.get('flagList'))})
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewMapAreaTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.MapAreaClass = ActionClass.extend({
    className: 'MapAreaClass',
    moduleName: 'MapArea',
    classObject: 'MapArea',
    defaultMessage: 'Выберите зону',
    cloneAttrs: function(){
        return ['maparea', 'triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('maparea')?this.get('maparea').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('maparea');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.MapAreaCollection;
    },
    getObjectEditField: function(ma, obj){
        var show = false;
        
        ma.parentObject = obj;
        
        return this.destrLsn(new SchemeField('#MapAreaObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputColor('.blki-color', ma, 'strokeColor', 'strokeOpacity')
            .linkInputColor('.blki-fcolor', ma, 'fillColor', 'fillOpacity')
            .linkInputInteger('.blki-stroke', ma, 'strokeWeight')
            .linkSwitchValue('.blki-active', ma, 'active')
            .linkSwitchValue('.blki-visible', ma, 'invisible')
            .init(null, function(){
                show = true;
                ma.mapArea.setOptions({
                    editable: true,
                    draggable: true
                });

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('show-on-map', {marker: ma});
                }, this);
            }.bind(this), function(){
                show = false;
                ma.mapArea.setOptions({
                    editable: false,
                    draggable: false
                });

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('hide-on-map', {marker: ma});
                }, this);
            }.bind(this))
        .linkTextValue('.blki-group', ma.flagsVar, 'flagsName')
        .openFieldClick('.link-group', function(){return ma.flagCField}, {onSelect: ma.get('flagList').toggleFlag.bind(ma.get('flagList'))})
        .linkCollection('.blk-errors', this.errorList);
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#MapAreaClassTable', admin.MapAreaClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    createAttrs: function(project){
        var map = admin.global.Map.getMap().getCenter();
        var maparea = project.watch( new admin.MapArea(map.lat(), map.lng(), 30/(Math.pow(2, admin.global.Map.getMap().getZoom()))) );
        
        maparea.removeFlag( admin.global.MapAreasAllFlag );
        
        this.set({
            name: 'Зона на карте '+MapAreaClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            maparea: maparea
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapAreaClassCounter){
            MapAreaClassCounter = digit[0]*1+1;
        }

        project.afterSync(function(){
            var ma = this.get('maparea');

            ma.parentObject = this;
        
            ma.on('destroy', function(){
                this.destroy();
            }, this);
            
            this.on('set:name', function(ev){
                ma.set({name: '['+ev.value+']'});
            }, this);

            this.on('destroy', function(){
                this.getValue().destroy();
            }, this);

            var show = false;

            triggerList.on('add', function(ev){
                if (show){
                    ev.item.callEventListener('show-on-map', {marker: ma});
                }
            }, this);

            var editBlk = this.destrLsn(new SchemeField('#MapAreaClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                    .linkInputColor('.blki-color', ma, 'strokeColor', 'strokeOpacity')
                    .linkInputColor('.blki-fcolor', ma, 'fillColor', 'fillOpacity')
                    .linkInputInteger('.blki-stroke', ma, 'strokeWeight')
                    .linkSwitchValue('.blki-active', ma, 'active')
                    .linkSwitchValue('.blki-visible', ma, 'invisible')
                    .init(null, function(){
                        show = true;
                        ma.mapArea.setOptions({
                            editable: true,
                            draggable: true
                        });
                        
                        triggerList.forEach(function(trigger){
                            trigger.callEventListener('show-on-map', {marker: ma});
                        }, this);
                    }.bind(this), function(){
                        show = false;
                        ma.mapArea.setOptions({
                            editable: false,
                            draggable: false
                        });
                        
                        triggerList.forEach(function(trigger){
                            trigger.callEventListener('hide-on-map', {marker: ma});
                        }, this);
                    }.bind(this))
                .linkTextValue('.blki-group', ma.flagsVar, 'flagsName')
                .openFieldClick('.link-group', function(){return ma.flagCField}, {onSelect: ma.get('flagList').toggleFlag.bind(ma.get('flagList'))})
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewMapAreaTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.MapAreaClassSet = ActionClass.extend({
    className: 'MapAreaClassSet',
    moduleName: 'MapArea',
    classObject: 'MapArea',
    defaultMessage: 'Выберите зону',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('maparea');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.MapAreaCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#MapAreaClassTable', admin.MapAreaClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    createAttrs: function(project){
        this.set({
            name: 'Зона на карте '+MapAreaClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            maparea: null
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapAreaClassCounter){
            MapAreaClassCounter = digit[0]*1+1;
        }

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#MapAreaClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewMapAreaTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
    new ModuleContainer([
        new SelectButtonField('#MapCircleAreaClassEditBlock', admin.MapCircleAreaClass),
        new SelectButtonField('#MapAreaClassEditBlock', admin.MapAreaClass),
        new SelectButtonField('#MapAreaClassSetEditBlock', admin.MapAreaClassSet),
    ], 'MapArea')
]);
