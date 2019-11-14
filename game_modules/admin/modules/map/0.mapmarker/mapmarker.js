var MapMarkerCounter = 1;

admin.MapMarker = ActionClass.extend({
    className: 'MapMarker',
    moduleName: 'MapMarker',
    _canvasWidth: 64,
    cloneAttrs: function(){
        return ['overlayList'];
    },
    getEditor: function(){
        return this.parentObject?this.parentObject.getEditor():this.editorBlk;
    },
    setRotatedIcon: function(){
        this.mapMarker.setSize(this.get('size'));
        this.mapMarker.setRotate(this.get('rotate'));
        this.mapMarker.setImage(this.get('icon'));
            
/*        if (this.get('rotate') === 0){
            this.mapMarker.setIcon({
                url: this.get('icon'),
                scaledSize: new google.maps.Size(size, size),
                anchor: new google.maps.Point(size/2, size/2)
            });
            this.mapMarker.setShape({
                coords: [size/2, size/2, size/2],
                type: 'circle'
            });
            return;
        }
        var angle = this.get('rotate')* Math.PI / 180;
        
        var img = new Image();
        img.src = this.get('icon');
        $(img).bind('load', function(){
            var canvasWidth = size*4/3;
            var canvas = this._rotcontext,
                centerX = canvasWidth/2,
                centerY = canvasWidth/2;

            canvas.clearRect(0, 0, canvasWidth, canvasWidth);
            canvas.save();
            canvas.translate(centerX, centerY);
            canvas.rotate(angle);
            canvas.translate(-centerX, -centerY);
            canvas.drawImage(img, 0, 0, img.width, img.height, (canvasWidth-size)/2, (canvasWidth-size)/2, size, size);
            canvas.restore();

            this.mapMarker.setIcon({
                url: this._rotcanvas.toDataURL('image/png'),
                scaledSize: new google.maps.Size(canvasWidth, canvasWidth),
                anchor: new google.maps.Point(canvasWidth/2, canvasWidth/2)
            });
            this.mapMarker.setShape({
                coords: [canvasWidth/2, canvasWidth/2, 24],
                type: 'circle'
            });
        }.bind(this));*/
    },
    createMapMarker: function(map){
        map.afterSync(function(){
            var size = this.get('size');
            
            this.mapMarker = new MapMarker(
                new google.maps.LatLng(this.get('lat')*1, this.get('lng')*1),
                this.get('icon'), 
                this.get('rotate'), 
                0.5,
                size);
                
            this.mapMarker.setOverlay(map.markeroverlay);            
            /*new google.maps.Marker({
                map: map.getMap(),
                draggable: false,
                icon: {
                    url: this.get('icon'),
                    scaledSize: new google.maps.Size(size, size),
                    anchor: new google.maps.Point(size/2, size/2)
                },
                shape: {
                    coords: [size/2, size/2, size/2],
                    type: 'circle'
                },
                position: {lat: this.get('lat')*1, lng: this.get('lng')*1},
                opacity: 0.5,
                zIndex: 0
            });*/

            //this.setRotatedIcon();
            this.addEventListener('set:icon', this.setRotatedIcon.bind(this));
            this.addEventListener('set:rotate', this.setRotatedIcon.bind(this));

            this.addEventListener('set:lat', function(event){
                this.mapMarker.setPosition(
                    new google.maps.LatLng(event.value, this.get('lng')*1)
                );
            }.bind(this));

            this.addEventListener('set:lng', function(event){
                this.mapMarker.setPosition(
                    new google.maps.LatLng(this.get('lat')*1, event.value)
                );
            }.bind(this));

            /*this.mapMarker.addListener('dragend',function(event) {
                this.set({
                    lat: event.latLng.lat()*1,
                    lng: event.latLng.lng()*1
                });
            }.bind(this));*/

            this.mapMarker.onDrag(function(event){
                this.set({
                    lat: event.lat()*1,
                    lng: event.lng()*1
                });
            }.bind(this));

            this.mapMarker.onClick(function(){
                admin.global.SchemeTable.addWindow(0, this.getEditor(), null, {mainObject: this});
            }.bind(this));
            
            this.on('destroy', function(){
                this.mapMarker.setOverlay(null);
            });
        }.bind(this));
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerSelectBlockTpl'))
            .linkTextValue('span.blki-name', this, 'name')
            .link( new ADLinkIcon('.blki-icon', this, 'icon') )
//            .linkAttributeValue('img.blki-icon', 'src', this, 'icon')
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
            cloned: 0,
            rotate: 0,
            active: true,
            name: 'Точка '+MapMarkerCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            map: project.getItem("Map"),
            icon: [admin.global.MapMarkerNewIcon],
            size: 48
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            overlayList: project.watch(
                new admin.ActionList( [], this._listArgs() )
            ),
        });
        this.get('flagList').add([admin.global.MapMarkersAllFlag]);
        admin.global.MapMarkersAllFlag.add([this]);
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    init: function(project){
        if (typeof this.get('icon') === 'string'){
            project.afterSync(function(){
                for (var i in project.items){
                    var item = project.items[i];

                    if (item instanceof admin.MapMarkerIcon && item.get('url') === this.get('icon')){
                        this.set({
                            icon: [item]
                        });
                        break;
                    }
                }
            }.bind(this));
        }
        
        var show = false;

        if (!this.get('size')){ this.set({size: 48}); }
        
        if (this.get('rotate') === undefined){
            this.set({rotate: 0});
        }
        
/*        this._rotcanvas = document.createElement("canvas");
        this._rotcanvas.width = this.get('size')*4/3;
        this._rotcanvas.height = this.get('size')*4/3;
        this._rotcontext = this._rotcanvas.getContext("2d");*/

        this.on('set:size', function(){
/*            this._rotcanvas.width = this.get('size')*4/3;
            this._rotcanvas.height = this.get('size')*4/3;*/
            
            this.setRotatedIcon();
        }, this);

        this.createMapMarker( this.get('map') );

        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.flagsVar = flags;

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapMarkerCounter){
            MapMarkerCounter = digit[0]*1+1;
        }

        this.on('before-clone', function(ev){
            var attr = ev.attr;
            var digit = /\d+$/g.exec(attr.name);
            if (digit === null){
                attr.name += ' '+MapMarkerCounter++;
            }else{
                digit = digit[0];
                attr.name = attr.name.substr(0, attr.name.length - digit.length) + MapMarkerCounter++;
            }
            
            this.set({cloned: 1});
            ev.attr.cloned = 1;
        }, this);

        var flagList = this.get('flagList');
        var triggerList = this.get('triggerList');
        var overlayList = this.get('overlayList');
        
        var classes = (new zz.data()).set({
            clonedClass: 'pinned ibtn hide'
        });
        
        this.on('set:cloned', function(ev){
            classes.set({
                clonedClass: ev.value?'pinned ibtn':'pinned ibtn hide'
            });
        }, this);

        project.afterSync(function(){
            var MapMarkerFlagsList = project.getItem("MapMarkerFlagsList");
            var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                MapMarkerFlagsList.createButtonField('Создать коллекцию'),
                MapMarkerFlagsList.createSchemeField(flagList)
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

            var editBlk = this.destrLsn(new SchemeField('#MapMarkerEditBlockTpl', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkInputFloat('.blki-lat', this, 'lat')
                .linkInputInteger('.blki-rotate', this, 'rotate')
                .linkInputFloat('.blki-lng', this, 'lng')
                .linkInputInteger('.blki-size', this, 'size')
                .link( new ADLinkIcon('.blki-icon', this, 'icon') )
//                .linkAttributeValue('.blki-icon', 'src', this, 'icon')
                .openFieldClick('.link-icon', function(){
                    return admin.fields.MapMarkerIconCollection;
                }, {onSelect: function(icon){
                    this.set({icon: [icon]});
                }.bind(this)})
                .linkSwitchValue('.blki-active', this, 'active')
                .linkTextValue('.blki-group', flags, 'flagsName')
                .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                .linkAttributeValue('.pinned', 'class', classes, 'clonedClass')
                .click('.pinned', function(SField){
                    triggerList = this.get('triggerList').clone();

                    if (show){
                        this.get('triggerList').forEach(function(trigger){
                            trigger.callEventListener('hide-on-map', {marker: this});
                        }, this);
                    }

                    this.set({
                        cloned: 0,
                        triggerList: triggerList
                    });

                    if (show){
                        this.get('triggerList').forEach(function(trigger){
                            trigger.callEventListener('show-on-map', {marker: this});
                        }, this);
                    }

                    this.SCtl.removeAll();
                    this.SCtl.add([
                        editBlk,
                        new ModuleContainer([
                            overlayList.createButtonField('Добавить информацию', admin.fields.NewMapMarkerOverlay),
                            overlayList.getSchemeField(),
                        ], 'MapMarkerOverlay'),
                        triggerList.createButtonField('Триггеры', admin.fields.NewMapMarkerTriggers),
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

            triggerList.on('add', function(ev){
                if (show){
                    ev.item.callEventListener('show-on-map', {marker: this});
                }
            }, this);

            this._showMM = function(){
                show = true;
                this.mapMarker.setOpacity(1);
                this.mapMarker.setZIndex(100);
                this.mapMarker.setDraggable(true);

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('show-on-map', {marker: this});
                }, this);
            }.bind(this);
            
            this._hideMM = function(){
                show = false;
                this.mapMarker.setOpacity(0.5);
                this.mapMarker.setZIndex(0);
                this.mapMarker.setDraggable(false);

                this.get('triggerList').forEach(function(trigger){
                    trigger.callEventListener('hide-on-map', {marker: this});
                }, this);
            }.bind(this);

            this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                .init(null, this._showMM, this._hideMM)
                .linkCollection(null, this.SCtl = new SchemeCollection([
                    editBlk,
                    new ModuleContainer([
                        overlayList.createButtonField('Добавить информацию', admin.fields.NewMapMarkerOverlay),
                        overlayList.getSchemeField(),
                    ], 'MapMarkerOverlay'),
                    triggerList.createButtonField('Триггеры', admin.fields.NewMapMarkerTriggers),
                    triggerList.getSchemeField()
                ]));
        }.bind(this));
    },
    initialize: function(lat, lng){
        ActionClass.prototype.initialize.call(this);

        this.parentObject = null;
        
        this._init = {lat: lat, lng: lng};
    }
});
