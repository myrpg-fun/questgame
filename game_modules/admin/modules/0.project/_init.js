admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
/*        project.modules.add([
            new ProjectModuleCollection('Проект', false, [
                new ProjectModuleSelectCollection([
                    new ProjectModule("Без нагрузки", false, "Низкая нагрузка сервера до 10 игроков", 0),
                    new ProjectModule("Нагрузка+", false, "Средняя нагрузка сервера до 50 игроков", 0),
                    new ProjectModule("Нагрузка++", false, "Высокая нагрузка сервера до 200 игроков", 0),
                    new ProjectModule("Нагрузка 1k", false, "Отдельный сервер до 1000 игроков", 400),
                    new ProjectModule("Нагрузка 5k", false, "Отдельный сервер до 5000 игроков", 1000),
                    new ProjectModule("Нагрузка 10k", false, "Несколько серверов до 10000 игроков", 5000),
                ]),
                new ProjectModuleSubCollection([
                    new ProjectModule("Реклама", false, "Показывать проект на первых 4х позициях в списке", 1000),
                    new ProjectModule("Javascript API", false, "Подключение API проекта для внешних сайтов", 500),
                ]),
            ]),
        ]);*/
    });
});
