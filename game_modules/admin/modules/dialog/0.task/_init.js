admin.menu.Dialog.add([
    admin.menu.Task = new MenuModuleContainer([
        new MenuItem('Задачи', '/admin/quest.png', 'sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.TaskCollection, null);
        })
    ], 'Task')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Задача', 'Task')
    ], 'Task')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.Dialog.add([
            new ProjectModule("Задачи", 'Task', "Задачи, выдаваемые игрокам", 0, function(){
                admin.global.TaskFlagsList = admin.watcher.watchByID("TaskFlagsList", function(){
                    var f = admin.watcher.watchByID("TaskAllFlag", function(){
                        return new admin.FlagGroupClass([], true);
                    });

                    f.set({name: '     Все задачи'});

                    return new admin.FlagCollectionList([f]);
                });

                admin.global.TaskAllFlag = admin.watcher.getItem('TaskAllFlag');

                admin.global.root.add([admin.global.TaskFlagsList]);

                admin.fields.TaskCollection = new SchemeField('#BlkListTpl')
                    .linkCollection('.blk-list', new SchemeCollection([
                        new CreateButtonField('Создать новую задачу', function(df){
                            var dialog = admin.watcher.watch(new admin.Task);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(dialog);
                            }

                            return dialog.getEditor();
                        }, {}),
                        admin.global.TaskFlagsList.getSchemeCollectionField()
                    ]));

                admin.fields.ArgumentRelation['Task'] = admin.fields.TaskCollection;
            }, function(){
            })
        ]);
    });
});
