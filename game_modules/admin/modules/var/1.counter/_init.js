admin.menu.add([
    new MenuModuleContainer([
        new MenuItem('Счётчики', '/admin/counter.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.CounterCollection, null);
        })
    ], 'Counter')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Счётчик', 'Counter')
    ], 'Counter')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.CollText.add([
            new ProjectModule("Счётчики", 'Counter', "Счётчики", 0, function(){
                admin.global.CounterFlagsList = admin.watcher.watchByID("CounterFlagsList", function(){
                    var f = admin.watcher.watchByID("CounterAllFlag", function(){
                        return new admin.FlagGroupClass([], true);
                    });

                    f.set({name: '     Все счётчики'});

                    return new admin.FlagCollectionList([f]);
                });

                admin.global.CounterAllFlag = admin.watcher.getItem('CounterAllFlag');

                admin.global.root.add([admin.global.CounterFlagsList]);

                admin.fields.CounterCollection = new SchemeField('#BlkListTpl')
                    .linkCollection('.blk-list', new SchemeCollection([
                        new CreateButtonField('Создать новый счётчик', function(df){
                            var counter = admin.watcher.watch(new admin.Counter);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(counter);
                            }

                            return counter.getEditor();
                        }, {}),
                        admin.global.CounterFlagsList.getSchemeCollectionField()
                    ]));

                admin.fields.ArgumentRelation['Counter'] = admin.fields.CounterCollection;
            }, function(){

            }),
        ]);
    });
});
