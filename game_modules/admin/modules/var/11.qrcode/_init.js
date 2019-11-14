admin.menu.add([
    admin.menu.QRCode = new MenuModuleContainer([
        new MenuItem('QR коды', '/admin/qrcode.png', '', function(){
            admin.global.SchemeTable.addWindow(0, admin.fields.QRCodeCollection, null);
        })
    ], 'QRCode')
]);

admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('QR-код', 'QRCode')
    ], 'QRCode')
]);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.module.CollText.add([
            new ProjectModule("QR коды", 'QRCode', "QR коды", 0, function(){
                admin.global.QRCodeFlagsList = admin.watcher.watchByID("QRCodeFlagsList", function(){
                    var f = admin.watcher.watchByID("QRCodeAllFlag", function(){
                        return new admin.FlagGroupClass([], true);
                    });

                    f.set({name: '     Все QR-коды'});

                    return new admin.FlagCollectionList([f]);
                });

                admin.global.QRCodeAllFlag = admin.watcher.getItem('QRCodeAllFlag');

                admin.global.root.add([admin.global.QRCodeFlagsList]);

                admin.fields.QRCodeCollection = new SchemeField('#BlkListTpl')
                    .linkCollection('.blk-list', new SchemeCollection([
                        new CreateButtonField('Создать новый QR код', function(df){
                            var counter = admin.watcher.watch(new admin.QRCode);

                            var stack = df.window().stack();
                            if (stack.onSelect){
                                stack.onSelect(counter);
                            }

                            return counter.getEditor();
                        }, {}),
                        admin.global.QRCodeFlagsList.getSchemeCollectionField()
                    ]));

                admin.fields.ArgumentRelation['QRCode'] = admin.fields.QRCodeCollection;
            }, function(){

            }, ['Counter']),
        ]);
    });
});
