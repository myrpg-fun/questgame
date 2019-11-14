var MapMarkerClassCounter = 1;

admin.MapMarkerClassTable = ActionClass.extend({
    className: 'MapMarkerClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerClassTable'))
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

admin.MapMarkerClass = ActionClass.extend({
    className: 'MapMarkerClass',
    moduleName: 'MapMarker',
    classObject: 'MapMarker',
    defaultMessage: 'Выберите точку',
    cloneAttrs: function(){
        return ['mapmarker', 'triggerList', 'overlayList'];
    },
    _actionLists: function(){
        return [this.get('triggerList'), this.get('overlayList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('mapmarker')?this.get('mapmarker').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('mapmarker');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.MapMarkerCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#MapMarkerClassTable', admin.MapMarkerClassTable, this)
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
        var mm = project.watch( new admin.MapMarker(map.lat(), map.lng()) );
        
        mm.removeFlag( admin.global.MapMarkersAllFlag );
        
        this.set({
            name: 'Точка на карте '+MapMarkerClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            overlayList: project.watch(
                new admin.ActionList( [], this._listArgs())
            ),
            mapmarker: mm
        });
    },
    getObjectEditField: function(mm, obj){
        var show = false;
        
        mm.parentObject = obj;
        
        return this.destrLsn(new SchemeField('#MapMarkerObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputFloat('.blki-lat', mm, 'lat')
            .linkInputInteger('.blki-rotate', mm, 'rotate')
            .linkInputInteger('.blki-size', mm, 'size')
            .linkInputFloat('.blki-lng', mm, 'lng')
            .link( new ADLinkIcon('.blki-icon', mm, 'icon') )
//            .linkAttributeValue('.blki-icon', 'src', mm, 'icon')
            .openFieldClick('.link-icon', function(){
                return admin.fields.MapMarkerIconCollection;
            }, {onSelect: function(icon){
                mm.set({icon: [icon]});
            }.bind(this)})
            .linkSwitchValue('.blki-active', mm, 'active')
            .init(null, function(){
                show = true;
                mm.mapMarker.setOpacity(1);
                mm.mapMarker.setZIndex(100);
                mm.mapMarker.setDraggable(true);

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('show-on-map', {marker: mm});
                }, this);
            }.bind(this), function(){
                show = false;
                mm.mapMarker.setOpacity(0.5);
                mm.mapMarker.setZIndex(0);
                mm.mapMarker.setDraggable(false);

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('hide-on-map', {marker: mm});
                }, this);
            }.bind(this))
            .linkTextValue('.blki-group', mm.flagsVar, 'flagsName')
            .openFieldClick('.link-group', function(){return mm.flagCField}, {onSelect: mm.get('flagList').toggleFlag.bind(mm.get('flagList'))})
            .linkCollection('.blk-errors', this.errorList);
    },
    init: function(project){
        var triggerList = this.get('triggerList');
        var overlayList = this.get('overlayList');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapMarkerClassCounter){
            MapMarkerClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        var mm = this.get('mapmarker');
        
        this.on('set:name', function(ev){
            mm.set({name: '['+ev.value+']'});
        }, this);
        
        project.afterSync(function(){
            mm.on('destroy', function(){
                this.destroy();
            }, this);
            
            var show = false;

            triggerList.on('add', function(ev){
                if (show){
                    ev.item.callEventListener('show-on-map', {marker: mm});
                }
            }, this);

            mm.parentObject = this;
        
            var editBlk = this.destrLsn(new SchemeField('#MapMarkerClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkInputFloat('.blki-lat', mm, 'lat')
                .linkInputInteger('.blki-rotate', mm, 'rotate')
                .linkInputInteger('.blki-size', mm, 'size')
                .linkInputFloat('.blki-lng', mm, 'lng')
                .linkTextValue('.blki-group', mm.flagsVar, 'flagsName')
                .openFieldClick('.link-group', function(){return mm.flagCField}, {onSelect: mm.get('flagList').toggleFlag.bind(mm.get('flagList'))})
                .link( new ADLinkIcon('.blki-icon', mm, 'icon') )
//                .linkAttributeValue('.blki-icon', 'src', mm, 'icon')
                .openFieldClick('.link-icon', function(){
                    return admin.fields.MapMarkerIconCollection;
                }, {onSelect: function(icon){
                    mm.set({icon: [icon]});
                }.bind(this)})
                .linkSwitchValue('.blki-active', mm, 'active')
                .init(null, function(){
                    show = true;
                    mm.mapMarker.setOpacity(1);
                    mm.mapMarker.setZIndex(100);
                    mm.mapMarker.setDraggable(true);

                    this.get('triggerList').forEach(function(trigger){
                        trigger.callEventListener('show-on-map', {marker: mm});
                    }, this);
                }.bind(this), function(){
                    show = false;
                    mm.mapMarker.setOpacity(0.5);
                    mm.mapMarker.setZIndex(0);
                    mm.mapMarker.setDraggable(false);

                    this.get('triggerList').forEach(function(trigger){
                        trigger.callEventListener('hide-on-map', {marker: mm});
                    }, this);
                }.bind(this))
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                new ModuleContainer([
                    overlayList.createButtonField('Добавить информацию', admin.fields.NewMapMarkerOverlay),
                    overlayList.getSchemeField(),
                ], 'MapMarkerOverlay'),
                triggerList.createButtonField('Триггеры', admin.fields.NewMapMarkerTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.MapMarkerClassSet = ActionClass.extend({
    className: 'MapMarkerClassSet',
    moduleName: 'MapMarker',
    classObject: 'MapMarker',
    defaultMessage: 'Выберите точку',
    cloneAttrs: function(){
        return ['triggerList', 'overlayList'];
    },
    _actionLists: function(){
        return [this.get('triggerList'), this.get('overlayList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('mapmarker');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.MapMarkerCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#MapMarkerClassTable', admin.MapMarkerClassTable, this)
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
            name: 'Точка на карте '+MapMarkerClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            overlayList: project.watch(
                new admin.ActionList( [], this._listArgs())
            ),
            mapmarker: null
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');
        var overlayList = this.get('overlayList');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapMarkerClassCounter){
            MapMarkerClassCounter = digit[0]*1+1;
        }
        
        project.afterSync(function(){
            var editBlk = this.destrLsn(new SchemeField('#MapMarkerClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                new ModuleContainer([
                    overlayList.createButtonField('Добавить информацию', admin.fields.NewMapMarkerOverlay),
                    overlayList.getSchemeField(),
                ], 'MapMarkerOverlay'),
                triggerList.createButtonField('Триггеры', admin.fields.NewMapMarkerTriggers),
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
        new SelectButtonField('#MapMarkerClassEditBlock', admin.MapMarkerClass),
        new SelectButtonField('#MapMarkerClassSetEditBlock', admin.MapMarkerClassSet)
    ], 'MapMarker')
]);