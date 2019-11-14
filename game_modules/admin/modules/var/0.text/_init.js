admin.menu.add([
    admin.menu.Text = new MenuModuleContainer([
        new MenuItem('Тексты', '/admin/text.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.TextCollection, null);
        })
    ], 'Text')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Текст', 'Text')
    ], 'Text')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        project.modules.add([
            admin.module.Var = new ProjectModuleCollection('Переменные', 'Variables', [
                admin.module.CollText = new ProjectModuleSubCollection([
                    new ProjectModule("Тексты", 'Text', "Работа с текстом", 0, function(){
                        admin.global.TextFlagsList = admin.watcher.watchByID("TextFlagsList", function(){
                            var f = admin.watcher.watchByID("TextAllFlag", function(){
                                return new admin.FlagGroupClass([], true);
                            });

                            f.set({name: '     Все тексты'});

                            return new admin.FlagCollectionList([f]);
                        });
                        
                        admin.global.TextAllFlag = admin.watcher.getItem('TextAllFlag');
                        
                        admin.global.root.add([admin.global.TextFlagsList]);
                        
                        admin.fields.TextCollection = new SchemeField('#BlkListTpl')
                            .linkCollection('.blk-list', new SchemeCollection([
                                new CreateButtonField('Создать новый текст', function(df){
                                    var text = admin.watcher.watch(new admin.Text);
                                    
                                    var stack = df.window().stack();
                                    if (stack.onSelect){
                                        stack.onSelect(text);
                                    }
                                    
                                    return text.getEditor();
                                }, {}),
                                admin.global.TextFlagsList.getSchemeCollectionField()
                            ]));
                    
                        admin.fields.ArgumentRelation['Text'] = admin.fields.TextCollection;
                    }, function(){
                        
                    }),
                ]),
            ]),
        ]);
    });
});
