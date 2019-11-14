admin.fields.NewArgumentsCollection.add([
    new SelectArgumentField('Коллекция', 'Collection')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.CollClass.add([
            new ProjectModule("Коллекции", 'Collection', "Работа элементов с коллекциями", 0, function(){
                admin.global.CollectionAll = admin.watcher.watchByID("CollectionAll", function(){
                    return new admin.FlagCollectionList([]);
                });

                admin.global.root.add([admin.global.CollectionAll]);

                admin.fields.CollectionAll = new SchemeField('#BlkListTpl')
                    .linkCollection('.blk-list', new SchemeCollection([
                        new CreateButtonField('Создать общую коллекцию', function(df){
                            var col = admin.watcher.watch(new admin.Collection);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(col);
                            }
                            
                            admin.global.CollectionAll.add([col]);

                            return col.editorBlk;
                        }, {}),
                        admin.global.CollectionAll.createSchemeCollectionField()
                    ]));
                    
                admin.fields.ArgumentRelation['Collection'] = admin.fields.CollectionAll;
                
                admin.fields.CollectionFlagsSchemeField = function(flags){
                    return makeSchemeFieldList(new SchemeCollection([
                        new CreateButtonField('Создать общую коллекцию', function(df){
                            var col = admin.watcher.watch(new admin.Collection);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(col);
                            }
                            
                            admin.global.CollectionAll.add([col]);

                            return col.editorBlk;
                        }, {}),
                        admin.global.CollectionAll.createSchemeField(flags)
                    ]));
                };
            }, function(){
            }),
        ]);
    });
});
