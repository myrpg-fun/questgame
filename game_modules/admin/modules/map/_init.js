admin.menu.MapWindowMenu = new MenuContainer([]);
var $mapmenu = $('<div class="mapmenu"></div>').append(admin.menu.MapWindowMenu.schemeBlk.createFieldDOM().DOM);

admin.menu.add([
    admin.menu.Map = new MenuModuleContainer([
        new MenuItemCheck('Карта', '/admin/map.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.global.Map.getEditor(), null);
        }, function($b){
            admin.global.Map.appendMapTo($b);
            $b.append($mapmenu);
        })
    ], 'Map')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        project.modules.add([
            admin.module.Map = new ProjectModuleCollection('Карта', 'Map', [
                admin.module.CollMap = new ProjectModuleSubCollection([
                    new ProjectModule("Карта", 'Map', "Отображать игроку карту", 0, function(){
                        admin.global.Map = admin.watcher.watchByID("Map", function(){
                            return new admin.Map("map", 55.997, 37.182);
                        });
                        
                        admin.global.root.add([admin.global.Map]);
                    }, function(){
                    }),
                    new ProjectModule("GPS", 'MapGps', "Взаимодействие с положением игрока на карте", 0),
                    new ProjectModule("Стили карты", 'MapStyle', "Стили и спецэффекты на карте", 0),
                ]),
            ]),
        ]);
    });
});
