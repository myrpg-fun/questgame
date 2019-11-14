admin.menu.Map.add([
    new MenuModuleContainer([
        new MenuItem('Зоны на карте', '/admin/maparea.png', 'sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.MapAreaCollection, null);
        })
    ], 'MapArea')
]);

admin.menu.MapWindowMenu.add([
    new MenuModuleContainer([
        new MenuItemNS('Новая зона', '/admin/new.png', 'map', function(){
            var map = admin.global.Map.getMap().getCenter();
            admin.watcher.watch(new admin.MapArea(map.lat(), map.lng(), 30/(Math.pow(2, admin.global.Map.getMap().getZoom()))));
        }),
        new MenuItemNS('Новый круг', '/admin/new.png', 'map', function(){
            var map = admin.global.Map.getMap().getCenter();
            admin.watcher.watch(new admin.MapCircleArea(map.lat(), map.lng(), 5000000/(Math.pow(2, admin.global.Map.getMap().getZoom()))));
        })
    ], 'MapArea')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Зона на карте', 'MapArea'),
    ], 'MapArea')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.Map.add([
            new ProjectModuleSubCollection([
                new ProjectModule("Зоны на карте", 'MapArea', "Создание и взаимодействие с зонами на карте", 0, function(){
                    admin.global.MapAreaFlagsList = admin.watcher.watchByID("MapAreaFlagsList", function(){
                        var f = admin.watcher.watchByID("MapAreasAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все зоны на карте'});

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.MapAreasAllFlag = admin.watcher.getItem('MapAreasAllFlag');

                    admin.global.root.add([admin.global.MapAreaFlagsList]);

                    admin.fields.MapAreaCollection = makeSchemeFieldList(
                        new SchemeCollection([
                            admin.global.MapAreaFlagsList.getSchemeCollectionField()
                        ])
                    );

                    admin.fields.ArgumentRelation['MapArea'] = admin.fields.MapAreaCollection;
                }, function(){
                })
            ])
        ]);
    });
});
