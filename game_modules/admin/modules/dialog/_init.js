admin.menu.add([
    admin.menu.Dialog = new MenuModuleContainer([
        new MenuItem('Интерфейс', '/admin/dialog.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.DialogCollection, null);
        })
    ], 'Dialog'),
    admin.menu.DialogPtr = new MenuModuleContainer([
        new MenuItem('Указатель', '/admin/iflink.png', 'sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.DialogPtrCollection, null);
        })
    ], 'DialogPtr')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Интерфейс', 'Dialog'),
    ], 'Dialog'),
    new ModuleContainer([
        new SelectArgumentField('Указатель на интерфейс', 'DialogPtr'),
    ], 'Dialog')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        project.modules.add([
            admin.module.CollDialog = new ProjectModuleCollection('Пользовательский интерфейс', 'Dialog', [
                admin.module.Dialog = new ProjectModuleSubCollection([
                    new ProjectModule("Интерфейс", 'Dialog', "Создание форм интерфейсов для пользователя", 0, function(){
                        admin.global.DialogFlagsList = admin.watcher.watchByID("DialogFlagsList", function(){
                            var f = admin.watcher.watchByID("DialogAllFlag", function(){
                                return new admin.FlagGroupClass([], true);
                            });

                            f.set({name: '     Все интерфейсы'});

                            return new admin.FlagCollectionList([f]);
                        });
                        
                        admin.global.DialogAllFlag = admin.watcher.getItem('DialogAllFlag');
                        
                        admin.global.root.add([admin.global.DialogFlagsList]);
                        
                        admin.fields.DialogCollection = new SchemeField('#BlkListTpl')
                            .linkCollection('.blk-list', new SchemeCollection([
                                new CreateButtonField('Создать новый интерфейс', function(df){
                                    var dialog = admin.watcher.watch(new admin.Dialog);
                                    
                                    var stack = df.window().stack();
                                    if (stack.onSelect){
                                        stack.onSelect(dialog);
                                    }
                                    
                                    return dialog.getEditor();
                                }, {}),
                                admin.global.DialogFlagsList.getSchemeCollectionField()
                            ]));
                    
                        admin.fields.ArgumentRelation['Dialog'] = admin.fields.DialogCollection;
                    }, function(){
                        
                    }),
                    new ProjectModule("Указатели", 'DialogPtr', "Создание указателей на интерфейсы", 0, function(){
                        admin.global.DialogPtrFlagsList = admin.watcher.watchByID("DialogPtrFlagsList", function(){
                            var f = admin.watcher.watchByID("DialogPtrAllFlag", function(){
                                return new admin.FlagGroupClass([], true);
                            });

                            f.set({name: '     Все указатели'});

                            return new admin.FlagCollectionList([f]);
                        });
                        
                        admin.global.DialogPtrAllFlag = admin.watcher.getItem('DialogPtrAllFlag');
                        
                        admin.global.root.add([admin.global.DialogPtrFlagsList]);
                        
                        admin.fields.DialogPtrCollection = new SchemeField('#BlkListTpl')
                            .linkCollection('.blk-list', new SchemeCollection([
                                new CreateButtonField('Создать новый указатель', function(df){
                                    var dialog = admin.watcher.watch(new admin.DialogPtrAdmin);
                                    
                                    var stack = df.window().stack();
                                    if (stack.onSelect){
                                        stack.onSelect(dialog);
                                    }
                                    
                                    return dialog.getEditor();
                                }, {}),
                                admin.global.DialogPtrFlagsList.getSchemeCollectionField()
                            ]));
                    
                        admin.fields.ArgumentRelation['DialogPtr'] = admin.fields.DialogPtrCollection;
                    }, function(){
                        
                    }),
                ]),
            ]),
        ]);
    });
});
