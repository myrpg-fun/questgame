admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.Dialog.add([
            new ProjectModule("Таблицы", 'DialogTable', "Вывод таблиц, рейтингов, классов", 0, function(){

            }, function(){

            }, ['Class']),
        ]);
    });
});
