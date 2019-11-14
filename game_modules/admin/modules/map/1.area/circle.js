var MapAreaCounter = 1;

admin.MapCircleArea = ActionClass.extend({
    className: 'MapCircleArea',
    moduleName: 'MapArea',
    getPath: function(){
        var result = [];
        var points = this.get('points');
        
        for (var i=0; i<points.length; i=i+2){
            result.push(new google.maps.LatLng(points[i], points[i+1]));
        }
        
        return result;
    },
    createMapCircleArea: function(map){
        map.afterSync(function(){
            this.mapArea = new google.maps.Circle({
                center: {lat: this.get('lat'), lng: this.get('lng')},
                radius: this.get('radius'),
                editable: false,
                draggable: false,
                strokeColor: this.get('strokeColor'),
                strokeOpacity: this.get('strokeOpacity'),
                strokeWeight: this.get('strokeWeight'),
                fillColor: this.get('fillColor'),
                fillOpacity: this.get('fillOpacity'),
                map: map.getMap(),
                zIndex: 100
            });

            this.mapArea.addListener('click', function(){
                admin.global.SchemeTable.addWindow(0, this.getEditor(), null, {mainObject: this});
            }.bind(this));

            this.on('set:strokeColor', function(ev){
                this.mapArea.setOptions({strokeColor: ev.value});
            }, this);
            
            this.on('set:strokeOpacity', function(ev){
                this.mapArea.setOptions({strokeOpacity: ev.value});
            }, this);
            
            this.on('set:strokeWeight', function(ev){
                this.mapArea.setOptions({strokeWeight: ev.value});
            }, this);
            
            this.on('set:fillColor', function(ev){
                this.mapArea.setOptions({fillColor: ev.value});
            }, this);
            
            this.on('set:fillOpacity', function(ev){
                this.mapArea.setOptions({fillOpacity: ev.value});
            }, this);

            this.addEventListener('set:lat', function(event){
                this.mapArea.setCenter(
                    new google.maps.LatLng(event.value, this.get('lng')*1)
                );
            }.bind(this));

            this.addEventListener('set:lng', function(event){
                this.mapArea.setCenter(
                    new google.maps.LatLng(this.get('lat')*1, event.value)
                );
            }.bind(this));
            
//            google.maps.event.addListener(this.mapArea, 'center_changed', function() {
            this.mapArea.addListener('dragend',function(event) {
                var c = this.mapArea.getCenter();
                
                this.set({
                    lat: c.lat(),
                    lng: c.lng()
                });
            }.bind(this));
            
            this.addEventListener('set:radius', function(event){
                this.mapArea.setRadius(
                    event.value
                );
            }.bind(this));
            
            google.maps.event.addListener(this.mapArea, 'radius_changed', function() {
                this.set({
                    radius: this.mapArea.getRadius()
                });
            }.bind(this));
            
            this.on('destroy', function(){
                this.mapArea.setMap(null);
            });
        }.bind(this));
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapAreaSelectBlockTpl'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainObject: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            lat: this._init.lat,
            lng: this._init.lng,
            radius: this._init.len,
            cloned: 0,
            active: false,
            name: 'Зона '+MapAreaCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            invisible: 0,
            map: project.getItem("Map")
        });
        
        this.get('flagList').add([admin.global.MapAreasAllFlag]);
        admin.global.MapAreasAllFlag.add([this]);
    },
    _getDeletedAttributes: function(){
        return ['flagList'];
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    init: function(project){
        this.createMapCircleArea( this.get('map') );

        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.flagsVar = flags;

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapAreaCounter){
            MapAreaCounter = digit[0]*1+1;
        }

        this.on('before-clone', function(ev){
            var attr = ev.attr;
            var digit = /\d+$/g.exec(attr.name);
            if (digit === null){
                attr.name += ' '+MapAreaCounter++;
            }else{
                digit = digit[0];
                attr.name = attr.name.substr(0, attr.name.length - digit.length) + MapAreaCounter++;
            }
            
            this.set({cloned: 1});
            ev.attr.cloned = 1;
        }, this);

        var flagList = this.get('flagList');
        var triggerList = this.get('triggerList');
        
        var classes = (new zz.data()).set({
            clonedClass: 'pinned ibtn hide'
        });
        
        this.on('set:cloned', function(ev){
            classes.set({
                clonedClass: ev.value?'pinned ibtn':'pinned ibtn hide'
            });
        }, this);

        project.afterSyncItem("MapAreaFlagsList", function(MapAreaFlagsList){
            project.afterSync([flagList, triggerList], function(){
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    MapAreaFlagsList.createButtonField('Создать коллекцию'),
                    MapAreaFlagsList.createSchemeField(flagList)
                ]) ));
                this.flagCField = flagCField;

                flagList.on('add', function(event){
                    event.item.add([this]);
                }.bind(this));

                flagList.on('remove', function(event){
                    event.item.remove(this);
                }.bind(this));

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

                var editBlk = this.destrLsn(new SchemeField('#MapCircleAreaEditBlockTpl', this))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputFloat('.blki-lat', this, 'lat')
                    .linkInputFloat('.blki-lng', this, 'lng')
                    .linkInputFloat('.blki-radius', this, 'radius')
                    .linkInputColor('.blki-color', this, 'strokeColor', 'strokeOpacity')
                    .linkInputColor('.blki-fcolor', this, 'fillColor', 'fillOpacity')
                    .linkInputInteger('.blki-stroke', this, 'strokeWeight')
                    .linkSwitchValue('.blki-active', this, 'active')
                    .linkSwitchValue('.blki-visible', this, 'invisible')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .linkAttributeValue('.pinned', 'class', classes, 'clonedClass')
                    .click('.pinned', function(SField){
                        var triggerList = this.get('triggerList').clone();
                        
                        this.set({
                            cloned: 0,
                            triggerList: triggerList
                        });
                        
                        this.SCtl.removeAll();
                        this.SCtl.add([
                            editBlk,
                            triggerList.createButtonField('Триггеры', admin.fields.NewMapAreaTriggers),
                            triggerList.getSchemeField()
                        ]);
                    }.bind(this))
                    .click('.clone', function(SField){
                        var clone = this.clone();
                
                        SField.window().open(clone.getEditor(), SField.DOM, {mainObject: clone});
                    }.bind(this))
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this));

                var show = false;

                triggerList.on('add', function(ev){
                    if (show){
                        ev.item.callEventListener('show-on-map', {marker: this});
                    }
                }, this);

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .init(null, function(){
                        show = true;
                        this.mapArea.setOptions({
                            editable: true,
                            draggable: true
                        });
                        
                        triggerList.forEach(function(trigger){
                            trigger.callEventListener('show-on-map', {marker: this});
                        }, this);
                    }.bind(this), function(){
                        show = false;
                        this.mapArea.setOptions({
                            editable: false,
                            draggable: false
                        });
                        
                        triggerList.forEach(function(trigger){
                            trigger.callEventListener('hide-on-map', {marker: this});
                        }, this);
                    }.bind(this))
                    .linkCollection(null, this.SCtl = new SchemeCollection([
                        editBlk,
                        triggerList.createButtonField('Триггеры', admin.fields.NewMapAreaTriggers),
                        triggerList.getSchemeField()
                    ]));
            }.bind(this));
        }.bind(this));
    },
    initialize: function(lat, lng, len){
        ActionClass.prototype.initialize.call(this);
        
        this._init = {lat: lat, lng: lng, len: len};
    }
});
