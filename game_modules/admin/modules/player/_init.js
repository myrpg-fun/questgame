admin.watcher.on('start', function(ev){
    admin.global.ObjectFlagsList = admin.watcher.watchByID("ObjectFlagsList", function(){
        var p = admin.watcher.watchByID("PlayerAllFlag", function(){
            return new admin.FlagGroupClass([], true);
        });

        p.set({name: '     Все игроки'});

        var f = admin.watcher.watchByID("ObjectAllFlag", function(){
            return new admin.FlagGroupClass([], true);
        });

        f.set({name: '     Все объекты'});

        return new admin.FlagCollectionList([f, p]);
    });

    admin.global.PlayerTemplate = ev.watcher.watchByID("PlayerTemplate", function(){
        return new admin.PlayerTemplate();
    });
    
    admin.global.root.add([admin.global.ObjectFlagsList, admin.global.PlayerTemplate]);
    
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
    
    admin.fields.NewArgumentsCollection.add([
        makeSchemeFieldSelectArgClass(admin.global.PlayerTemplate)
    ]);
});
