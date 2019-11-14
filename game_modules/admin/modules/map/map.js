admin.Map = ActionClass.extend({
    className: 'Map',
    moduleName: 'MapMarker',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    appendMapTo: function($b){
        $b.append(this.mapDOM);
        
        window.setTimeout(function(){
            google.maps.event.trigger(this.map, "resize");

            if (!this.firstView){
                this.firstView = true;
                var project = admin.watcher;

                project.afterSync(function(){
                    if (this.get('havebounds')){
                        var mapbounds = this.get('bounds');
                        
                        var bounds = new google.maps.LatLngBounds(
                            new google.maps.LatLng(mapbounds[2], mapbounds[3]),
                            new google.maps.LatLng(mapbounds[0], mapbounds[1])
                        );

                        this.map.fitBounds(bounds);
                    }else{
                        var bounds = new google.maps.LatLngBounds();
                        var count = 0;

                        for (var i in project.items){
                            if (project.items[i] instanceof admin.MapMarker){
                                bounds.extend({
                                    lat: project.items[i].get('lat'),
                                    lng: project.items[i].get('lng')
                                });
                                
                                count++;
                            }
                        }

                        if (count > 0){
                            this.map.fitBounds(bounds);
                            
                            var ne = bounds.getNorthEast();
                            var sw = bounds.getSouthWest();

                            this.set({bounds: [ne.lat(), ne.lng(), sw.lat(), sw.lng()]});
                        }else{
                            this.map.setCenter(new google.maps.LatLng(55.751244, 37.618423));
                        }
                    }
                }.bind(this));
            }
        }.bind(this), 100);
    },
    createMap: function(){
        this.mapDOM = $('<div class="fullframemap"></div>')[0];
        
        this.map = new google.maps.Map(this.mapDOM, {
            zoom: 10,
            center: new google.maps.LatLng(55.751244, 37.618423)
        });
        
        this.bounds = new google.maps.Rectangle({
            strokeColor: '#B00000',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: '#F05050',
            fillOpacity: 0.15,
            map: this.map,
            editable: true,
            visible: false,
            bounds: {
              north: 55.93195700389507,
              east: 37.84377329687504,
              south: 55.57727862047047,
              west: 37.36598159375012
            }
        });
        
        this.bounds.addListener('bounds_changed', function(){
            var ne = this.bounds.getBounds().getNorthEast();
            var sw = this.bounds.getBounds().getSouthWest();

            if (this.noredraw){
                this.set({bounds: [ne.lat(), ne.lng(), sw.lat(), sw.lng()]});
            }
        }.bind(this));
        
        this.markeroverlay = new MarkerOverlay(this.map);
        
        return this;
    },
    getMap: function(){
        return this.map;
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerSelectBlockTpl'))
            .linkTextValue('span.blki-name', this, 'name')
            .linkAttributeValue('img.blki-icon', 'src', this, 'icon')
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
    _listArgs: function(){
        return [this.get('arg')];
    },
    createAttrs: function(project){
        this.set({
            arg: project.watch(new admin.ActionArg('Карта', 'Map'))
        });
        
        this.set({
            name: 'Карта',
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            id: this._init.map,
            havebounds: 0,
            bounds: [55.57727862047047,37.35900156835942,55.93195700389507,37.84938003125012]
        });
    },
    init: function(project){
        this.on('set:bounds', function(ev){
            var prj = project.getItem('project');
            prj.set({
                lat: (ev.value[0] + ev.value[2])/2,
                lng: (ev.value[1] + ev.value[3])/2
            });
        }, this);
        
        this.createMap();

        var triggerList = this.get('triggerList');

        var show = false;

        this.on('set:havebounds', function(ev){
            if (ev.lastValue === undefined){
                return;
            }
            
            if (ev.value){
                if (Object.keys(project.items).length > 0){
                    var bounds = new google.maps.LatLngBounds();

                    for (var i in project.items){
                        if (project.items[i] instanceof admin.MapMarker){
                            bounds.extend({
                                lat: project.items[i].get('lat'),
                                lng: project.items[i].get('lng')
                            });
                        }
                    }
                    
                    this.bounds.setBounds(bounds);
                }
                
                if (show){
                    this.bounds.setVisible(true);
                }
            }else{
                this.bounds.setVisible(false);
            }
        }, this);

        this.on('set:bounds', function(ev){
            var mapbounds = ev.value;
            
            var bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(mapbounds[2], mapbounds[3]),
                new google.maps.LatLng(mapbounds[0], mapbounds[1])
            );
    
            console.log('set:bounds', bounds, mapbounds);
            
            this.noredraw = false;
            this.bounds.setBounds(bounds);
            this.noredraw = true;
        }, this, ['noredraw']);
        
        this.noredraw = true;

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#MapEditBlockTpl', this))
                .linkSwitchValue('.blki-bounds', this, 'havebounds')
//                 .linkInputValue('.blki-name', this, 'name')
                .init(null, function(){
                    show = true;
            
                    if (this.get('havebounds')){
                        this.bounds.setVisible(true);
                    }
                }.bind(this), function(){
                    show = false;
                    
                    this.bounds.setVisible(false);
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                .linkCollection(null, new SchemeCollection([
                    editBlk,
/*                    triggerList.createButtonField('Триггеры', admin.fields.NewMapTriggers),
                    triggerList.getSchemeField()*/
                ]));
        }.bind(this));
    },
    _getDeletedAttributes: function(){
        return ['triggerList'];
    },
    initialize: function(id, lat, lng){
        ActionClass.prototype.initialize.call(this);
        
        this._init = {map: id, lat: lat, lng: lng};
        
        this.firstView = false;
    }
});