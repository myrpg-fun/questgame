admin.menu.add([
    admin.menu.Class = new MenuModuleContainer([
        new MenuItem('Классы', '/admin/template.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.ClassCollection, null);
        }),
/*        new MenuItem('Объекты', '/admin/template.png', 'sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.ObjectCollection, null);
        }),*/
    ], 'Class')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        project.modules.add([
            new ProjectModuleCollection('Классы', 'Class', [
                admin.module.CollClass = new ProjectModuleSubCollection([
                    new ProjectModule("Классы", 'Class', "Создание собственных объектов", 0, function(){
                        admin.global.ClassFlagsList = admin.watcher.watchByID("ClassFlagsList", function(){
                            var f = admin.watcher.watchByID("ClassAllFlag", function(){
                                return new admin.ClassFlagGroupClass([]);
                            });

                            f.set({name: '     Все Классы'});

                            return new admin.FlagCollectionList([f]);
                        });
                        
                        admin.global.ClassAllFlag = admin.watcher.getItem('ClassAllFlag');
                        
                        admin.global.root.add([admin.global.ClassFlagsList]);
                        
                        admin.fields.ClassCollection = makeSchemeFieldList(new SchemeCollection([
                            new CreateButtonField('Создать новый класс', function(df){
                                var inv = admin.watcher.watch(new admin.Class);

                                var stack = df.window().stack();
                                if (stack.onSelect){
                                    stack.onSelect(inv);
                                }

                                return inv.getEditor();
                            }, {}),
                            admin.global.ClassFlagsList.getSchemeCollectionField()
                        ]));

                        //class arguments
                        var refreshFn = function(){
                            admin.fields.NewArgumentsClasses.removeAll();
                            admin.fields.NewArgumentsClasses.add(
                                admin.global.ClassFlagsList.getCollection().map(function(flag){
                                    return flag.getArgSchemeField();
                                })
                            );
                        };
                        
                        admin.global.ClassFlagsList.on('add', refreshFn, this);
                        admin.global.ClassFlagsList.on('remove', refreshFn, this);
                        admin.global.ClassFlagsList.afterSync(refreshFn);
                        
                        //object
                        
                        admin.global.ObjectFlagsList = admin.watcher.watchByID("ObjectFlagsList", function(){
                            var f = admin.watcher.watchByID("ObjectAllFlag", function(){
                                return new admin.FlagGroupClass([], true);
                            });

                            f.set({name: '     Все Объекты'});

                            return new admin.FlagCollectionList([f]);
                        });
                        
                        admin.global.ObjectAllFlag = admin.watcher.getItem('ObjectAllFlag');
                        
                        admin.global.root.add([admin.global.ObjectFlagsList]);
                        
                        admin.fields.ObjectCollection = makeSchemeFieldList(new SchemeCollection([
                            new CreateButtonField('Создать новый объект', function(df){
                                var inv = admin.watcher.watch(new admin.Object);

                                var stack = df.window().stack();
                                if (stack.onSelect){
                                    stack.onSelect(inv);
                                }
                                    
                                return inv.getEditor();
                            }, {}),
                            admin.global.ObjectFlagsList.getSchemeCollectionField()
                        ]));
                        
                        admin.fields.CollectionAll = makeSchemeFieldList(new SchemeCollection([
                            new CreateButtonField('Создать новую коллекцию', function(df){
                                var col = admin.watcher.watch(new admin.FlagGroupClass([], true));

                                var stack = df.window().stack();
                                if (stack.onSelect){
                                    stack.onSelect(col);
                                }

                                admin.global.ObjectFlagsList.add([col]);

                                return col.getEditor();
                            }, {}),
                            admin.global.ObjectFlagsList.createSelectSchemeField()
                        ]));

                        admin.fields.ArgumentRelation['Collection'] = admin.fields.CollectionAll;
                    }, function(){
                        
                    }),
                ]),
            ]),
        ]);
    });
});
