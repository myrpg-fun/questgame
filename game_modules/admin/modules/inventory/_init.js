admin.menu.add([
    admin.menu.Inventory = new MenuModuleContainer([
        new MenuItem('Инвентарь', '/admin/inventory.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.InventoryCollection, null);
        }),
        new MenuItem('Предметы', '/admin/inventory.png', ' sub', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.InventoryItemCollection, null);
        }),
    ], 'Inventory')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Инвентарь', 'Inventory'),
        new SelectArgumentField('Предмет', 'InventoryItem'),
    ], 'Inventory')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.CollDialog.add([
            new ProjectModuleSubCollection([
                new ProjectModule("Инвентарь", 'Inventory', "Взаимодействие с инвентарем", 0, function(){
                    admin.global.InventoryItemEmpty = admin.watcher.watchByID("InventoryItemEmpty", function(){
                        return new admin.InventoryItemEmpty;
                    });

                    admin.global.InventoryEmptyRelation = admin.watcher.watchByID("InventoryEmptyRelation", function(){
                        return new admin.InventoryEmptyRelation;
                    });

                    admin.global.InventoryFlagsList = admin.watcher.watchByID("InventoryFlagsList", function(){
                        var f = admin.watcher.watchByID("InventoryAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все инвентари'});

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.InvetoryAllFlag = admin.watcher.getItem('InventoryAllFlag');

                    admin.fields.InventoryCollection = makeSchemeFieldList(new SchemeCollection([
                        new CreateButtonField('Создать новый инвентарь', function(df){
                            var inv = admin.watcher.watch(new admin.Inventory);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(inv);
                            }

                            return inv.getEditor();
                        }, {}),
                        admin.global.InventoryFlagsList.getSchemeCollectionField()
                    ]));

                    // Items
                    admin.global.InventoryItemFlagsList = admin.watcher.watchByID("InventoryItemFlagsList", function(){
                        var f = admin.watcher.watchByID("InventoryItemAllFlag", function(){
                            return new admin.FlagGroupClass([], true);
                        });

                        f.set({name: '     Все предметы'});

                        return new admin.FlagCollectionList([f]);
                    });

                    admin.global.InventoryItemAllFlag = admin.watcher.getItem('InventoryItemAllFlag');

                    admin.fields.InventoryItemCollection = makeSchemeFieldList(new SchemeCollection([
                        new CreateButtonField('Создать новый предмет', function(df){
                            var inv = admin.watcher.watch(new admin.InventoryItem);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(inv);
                            }

                            return inv.getEditor();
                        }, {}),
                        admin.global.InventoryItemEmpty.getSchemeField(),
                        admin.global.InventoryItemFlagsList.getSchemeCollectionField()
                    ]));

                    admin.global.root.add([
                        admin.global.InventoryFlagsList,
                        admin.global.InventoryItemEmpty,
                        admin.global.InventoryItemFlagsList,
                        admin.global.InventoryEmptyRelation
                    ]);

                    admin.fields.ArgumentRelation['Inventory'] = admin.fields.InventoryCollection;
                    admin.fields.ArgumentRelation['InventoryItem'] = admin.fields.InventoryItemCollection;
                }, function(){

                }),
                new ProjectModule("Предметы", 'Inventory', "Создание предметов для инвентаря", 0)
            ]),
        ]);
    });
});
