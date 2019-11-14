admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        project.modules.add([
            admin.module.Stat = new ProjectModuleCollection('Статистика', 'Log', [
                admin.module.CollLogs = new ProjectModuleSubCollection([
                    new ProjectModule("Логи", 'Log', "Сохранять и просматривать логи сессии", 0, function(){
                    }, function(){
                    }),
                ]),
            ]),
        ]);
    });
});
