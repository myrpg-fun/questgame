admin.DialogImage = ActionClass.extend({
    className: 'DialogImage',
    moduleName: 'common',
    createAttrs: function(project){
        this.set({
            image: '/admin/road-street-blur-blurred.jpg'
        });
    },
    createSchemeField: function(){
        return new SchemeField('#DialogImage', this)
            .linkAttributeValue('img.blki-image', 'src', this, 'image')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainObject: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(this, stack);
            }.bind(this));
    },
    init: function(){
        this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection(null, new SchemeCollection([
                this.destrLsn(new SchemeField('#ImageEditBlockTpl', this))
                    .linkAttributeValue('img.blki-image', 'src', this, 'image')
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
            ]));
    }
});

admin.DialogImageList = SyncedList.extend({
    className: 'DialogImageList',
    moduleName: 'common',
    collectionInstance: admin.DialogImage,
    createButtonField: function(name){
        return (new UploadButtonField(name, '.jpg, .jpeg, .png', admin.global.Project.getUploadImageURL(), function(files){
            var adding = [];
            
            files.forEach(function(file){
                adding.push(this.watcher.watch(new admin.DialogImage).set({image: file}));
            }, this);
            
            this.add(adding);
        }.bind(this)));
    },
    createSchemeField: function(){
        return new SchemeField('#BlkListTpl')
            .linkCollection('.blk-list', this.createSchemeCollection());
    },
    init: function(){
        this.on('destroy', function(){
            this.getCollection().forEach(function(attr){
                if (attr && attr.destroy){
                    attr.destroy();
                }
            });
        }.bind(this));
    }
});

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.global.DialogNewImage = admin.watcher.watchByID("DialogNewImage", function(){
            return new admin.DialogImage;
        });

        admin.global.DialogImageList = admin.watcher.watchByID("DialogImageList", function(){
            return new admin.DialogImageList([
                admin.global.DialogNewImage
            ]);
        });

        admin.global.root.add([admin.global.DialogImageList]);

        admin.fields.DialogImageCollection = makeSchemeFieldList(
            new SchemeCollection([
                admin.global.DialogImageList.createButtonField('Загрузить картинки'),
                admin.global.DialogImageList.getSchemeField()
            ])
        );
    });
});