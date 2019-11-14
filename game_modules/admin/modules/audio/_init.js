admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        project.modules.add([
            new ProjectModuleCollection('Звуковые эффекты', 'Audio', [
                new ProjectModuleSubCollection([
                    new ProjectModule("Звуки", 'Audio', "Использование звуковых эффектов", 0, function(){
                        admin.global.NewAudio = admin.watcher.watchByID("NewAudio", function(){
                            return new admin.Audio;
                        });

                        admin.global.AudioList = admin.watcher.watchByID("AudioList", function(){
                            return new admin.AudioList([
                                admin.global.NewAudio
                            ]);
                        });

                        admin.global.root.add([admin.global.AudioList]);

                        admin.fields.AudioCollection = makeSchemeFieldList(
                            new SchemeCollection([
                                admin.global.AudioList.createButtonField('Загрузить звук'),
                                admin.global.AudioList.getSchemeField()
                            ])
                        );
                    }, function(){
                        
                    }),            
                ]),
            ]),
        ]);
    });
});
