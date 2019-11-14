admin.menu.add([
    new MenuModuleContainer([
        new MenuItem('Таймеры', '/admin/timer.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.TimerCollection, null);
        })
    ], 'Timer')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Таймер', 'Timer')
    ], 'Timer')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.CollText.add([
            new ProjectModule("Таймеры", 'Timer', "Таймеры", 0, function(){
                admin.global.TimerFlagsList = admin.watcher.watchByID("TimerFlagsList", function(){
                    var f = admin.watcher.watchByID("TimerAllFlag", function(){
                        return new admin.FlagGroupClass([], true);
                    });

                    f.set({name: '     Все таймеры'});

                    return new admin.FlagCollectionList([f]);
                });

                admin.global.TimerAllFlag = admin.watcher.getItem('TimerAllFlag');

                admin.global.root.add([admin.global.TimerFlagsList]);

                admin.fields.TimerCollection = new SchemeField('#BlkListTpl')
                    .linkCollection('.blk-list', new SchemeCollection([
                        new CreateButtonField('Создать новый таймер', function(df){
                            var timer = admin.watcher.watch(new admin.Timer);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(timer);
                            }

                            return timer.getEditor();
                        }, {}),
                        admin.global.TimerFlagsList.getSchemeCollectionField()
                    ]));

                admin.fields.ArgumentRelation['Timer'] = admin.fields.TimerCollection;
            }, function(){

            }),
        ]);
    });
});
