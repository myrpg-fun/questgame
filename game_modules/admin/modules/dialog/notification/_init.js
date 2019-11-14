admin.menu.Dialog.add([
    new MenuModuleContainer([
        new MenuItem('Оповещения', '/admin/notification.png', ' sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.NotificationCollection, null);
        })
    ], 'Notification')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Оповещение', 'Notification') // ?
    ], 'Notification')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.CollDialog.add([
            new ProjectModuleSubCollection([
                new ProjectModule("Оповещения", 'Notification', "Инфорование игрока о событиях", 0, function(){
                    admin.global.NotificationFlagsList = admin.watcher.watchByID("NotificationFlagsList", function(){
                        var f = admin.watcher.watchByID("NotificationAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все оповещения'});

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.NotificationAllFlag = admin.watcher.getItem('NotificationAllFlag');

                    admin.global.root.add([admin.global.NotificationFlagsList]);

                    admin.fields.NotificationCollection = new SchemeField('#BlkListTpl')
                        .linkCollection('.blk-list', new SchemeCollection([
                            new CreateButtonField('Создать новое оповещение', function(df){
                                var dialog = admin.watcher.watch(new admin.Notification);

                                var stack = df.window().stack();
                                if (stack.onSelect){
                                    stack.onSelect(dialog);
                                }

                                return dialog.getEditor();
                            }, {}),
                            admin.global.NotificationFlagsList.getSchemeCollectionField()
                        ]));

                    admin.fields.ArgumentRelation['Notification'] = admin.fields.NotificationCollection;
                }, function(){

                })
            ])
        ]);
    });
});
