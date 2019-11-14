admin.menu.add([
    new MenuModuleContainer([
        new MenuItem('Функции', '/admin/fx.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.FunctionCollection, null);
        }),
    ], 'Function')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.Var.add([
            new ProjectModuleSubCollection([
                new ProjectModule("Функции", 'Function', "Создание своих функций и триггеров", 0, function(){
                    admin.global.FunctionFlagsList = admin.watcher.watchByID("FunctionFlagsList", function(){
                        var f = admin.watcher.watchByID("FunctionAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все функции'});

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.FunctionAllFlag = admin.watcher.getItem('FunctionAllFlag');

                    admin.global.root.add([admin.global.FunctionFlagsList]);

                    admin.fields.FunctionCollection = new SchemeField('#BlkListTpl')
                        .linkCollection('.blk-list', new SchemeCollection([
                            new CreateButtonField('Создать новую функцию', function(df){
                                var dialog = admin.watcher.watch(new admin.Function);

                                var stack = df.window().stack();
                                if (stack.onSelect){
                                    stack.onSelect(dialog);
                                }

                                return dialog.getEditor();
                            }, {}),
                            admin.global.FunctionFlagsList.getSchemeCollectionField()
                        ]));
                        
                    admin.global.TriggerFlagsList = admin.watcher.watchByID("TriggerFlagsList", function(){
                        var f = admin.watcher.watchByID("TriggerAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все триггеры'});

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.TriggerAllFlag = admin.watcher.getItem('TriggerAllFlag');

                    admin.global.root.add([admin.global.TriggerFlagsList]);

                    admin.fields.TriggerCollection = new SchemeField('#BlkListTpl')
                        .linkCollection('.blk-list', new SchemeCollection([
                            new CreateButtonField('Создать новый триггер', function(df){
                                var dialog = admin.watcher.watch(new admin.CustomTrigger);

                                var stack = df.window().stack();
                                if (stack.onSelect){
                                    stack.onSelect(dialog);
                                }

                                return dialog.getEditor();
                            }, {}),
                            admin.global.TriggerFlagsList.getSchemeCollectionField()
                        ]));
                }, function(){

                })
            ])
        ]);
    });
});
