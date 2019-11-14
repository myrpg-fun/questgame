admin.menu.Map.add([
    new MenuModuleContainer([
        new MenuItem('Точки на карте', '/admin/mapmarker.png', 'sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.MapMarkerCollection, null);
        })
    ], 'MapMarker')
]);

admin.menu.MapWindowMenu.add([
    new MenuModuleContainer([
        new MenuItemNS('Новая точка', '/admin/new.png', 'map', function(){
            var map = admin.global.Map.getMap().getCenter();
            admin.watcher.watch(new admin.MapMarker(map.lat(), map.lng()));
        })
    ], 'MapMarker')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Точка на карте', 'MapMarker')
    ], 'MapMarker'),
    new ModuleContainer([
        new SelectArgumentField('Координаты', 'LatLng')
    ], 'MapMarkerLatLng')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.Map.add([
            new ProjectModuleSubCollection([
                new ProjectModule("Точки на карте", 'MapMarker', "Создание и взаимодействие с точками на карте", 0, function(){
                    admin.global.MapMarkerFlagsList = admin.watcher.watchByID("MapMarkerFlagsList", function(){
                        var f = admin.watcher.watchByID("MapMarkersAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все точки на карте'})

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.MapMarkersAllFlag = admin.watcher.getItem('MapMarkersAllFlag');

                    admin.global.root.add([admin.global.MapMarkerFlagsList]);

                    admin.fields.MapMarkerCollection = makeSchemeFieldList(
                        new SchemeCollection([
                            admin.global.MapMarkerFlagsList.getSchemeCollectionField()
                        ])
                    );

                    admin.fields.ArgumentRelation['MapMarker'] = admin.fields.MapMarkerCollection;
                }, function(){
                }),
                new ProjectModule("Координаты", 'MapMarkerLatLng', "Работа точек с координатами", 0, function(){
                    
                }, function(){
                }, ['MapMarker']),
                new ProjectModule("Информация", 'MapMarkerOverlay', "Вывод информации над и под точками", 0, function(){
                    
                }, function(){
                }, ['MapMarker'])
            ])
        ]);
    });
});
