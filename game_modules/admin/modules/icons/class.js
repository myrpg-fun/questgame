var IconClassCounter = 1;

admin.IconClass = ActionClass.extend({
    className: 'IconClass',
    moduleName: 'common',
    classObject: 'Icon',
    defaultMessage: 'Выберите точку',
    cloneAttrs: function(){
        return ['icon'];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('icon')?this.get('icon').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('icon');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.MapMarkerIconCollection;
    },
    createTableSchemeField: function(){
        return [];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    createAttrs: function(project){
        var mm = project.watch( new admin.MapMarkerIcon() );
        
        this.set({
            name: 'Иконка '+IconClassCounter,
            icon: mm//admin.global.MapMarkerNewIcon
        });
    },
    getObjectEditField: function(mm, obj){
        mm.parentObject = obj;
        
        var accept = new zz.data().set({accept: '.jpg,.png'});
        
        return this.destrLsn(new SchemeField('#IconObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .link( new ADLinkIcon('.blki-icon', mm, null) )
//                    .linkAttributeValue('img.blki-icon', 'src', this, 'url')
            .linkInputValue('.blki-animate', mm, 'animate')
            .linkInputInteger('.blki-speed', mm, 'speed')
            .linkAttributeValue('.blki-upload', 'accept', accept, 'accept')
            .linkUploadFile('.blki-upload', this.watcher.getItem('project').getUploadImageURL(), function(file){
                if (file.size > 2*1024*1024){
                    admin.alert('Ошибка', 'Файл: "'+file.name+'" занимает больше 2 мб', 'Ясно');
                    return false;
                }

                return true;
            }, function(data){
                if (data){
                    data = JSON.parse(data);
                }

                if (data && data.uploaded){
                    data.uploaded.forEach(function(file){
                        mm.set({url: file.upload});
                    }, this);
                }
            }.bind(this), function(xhr){
                var error = JSON.parse(xhr.responseText);
                switch(error.error){
                    case 'too large':
                        admin.alert('Ошибка загрузки', 'Файл: "'+error.file+'" занимает больше 2 мб', 'Ясно');
                        break;
                    case 'not image':
                        admin.alert('Ошибка загрузки', 'Файл: "'+error.file+'" не является картинкой JPEG или PNG', 'Ясно');
                        break;
                    default:
                        admin.alert('Ошибка: '+xhr.status+' '+xhr.statusText, 'Ошибка: '+xhr.status+' '+xhr.statusText, 'Закрыть');
                        break;
                }
            })
            .openFieldClick('.link-icon', function(){
                return admin.fields.MapMarkerIconCollection;
            }, {onSelect: function(icon){
                mm.set({
                    url: icon.get('url'),
                    animate: icon.get('animate'),
                    speed: icon.get('speed')
                });
            }.bind(this)})
            .click('.blk-iconbox', function(DOMself){
                DOMself.DOM.filter('.blki-upload').click();

                return false; 
            });
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= IconClassCounter){
            IconClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        var mm = this.get('icon');
        
        var accept = new zz.data().set({accept: '.jpg,.png'});
        
        project.afterSync(function(){
            mm.on('destroy', function(){
                this.destroy();
            }, this);
            
            mm.parentObject = this;
        
            var editBlk = this.destrLsn(new SchemeField('#IconClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .link( new ADLinkIcon('.blki-icon', this, 'icon') )
//                .linkAttributeValue('.blki-icon', 'src', mm, 'url')
/*                .openFieldClick('.link-icon', function(){
                    return admin.fields.MapMarkerIconCollection;
                }, {onSelect: function(icon){
                    icon.set({icon: icon});
                }.bind(this)})
                .linkCollection('.blk-errors', this.errorList)*/
                .link( new ADLinkIcon('.blki-icon', mm, null) )
    //                    .linkAttributeValue('img.blki-icon', 'src', this, 'url')
                .linkInputValue('.blki-animate', mm, 'animate')
                .linkInputInteger('.blki-speed', mm, 'speed')
                .linkAttributeValue('.blki-upload', 'accept', accept, 'accept')
                .linkUploadFile('.blki-upload', this.watcher.getItem('project').getUploadImageURL(), function(file){
                    if (file.size > 2*1024*1024){
                        admin.alert('Ошибка', 'Файл: "'+file.name+'" занимает больше 2 мб', 'Ясно');
                        return false;
                    }

                    return true;
                }, function(data){
                    if (data){
                        data = JSON.parse(data);
                    }

                    if (data && data.uploaded){
                        data.uploaded.forEach(function(file){
                            mm.set({url: file.upload});
                        }, this);
                    }
                }.bind(this), function(xhr){
                    var error = JSON.parse(xhr.responseText);
                    switch(error.error){
                        case 'too large':
                            admin.alert('Ошибка загрузки', 'Файл: "'+error.file+'" занимает больше 2 мб', 'Ясно');
                            break;
                        case 'not image':
                            admin.alert('Ошибка загрузки', 'Файл: "'+error.file+'" не является картинкой JPEG или PNG', 'Ясно');
                            break;
                        default:
                            admin.alert('Ошибка: '+xhr.status+' '+xhr.statusText, 'Ошибка: '+xhr.status+' '+xhr.statusText, 'Закрыть');
                            break;
                    }
                })
                .openFieldClick('.link-icon', function(){
                    return admin.fields.MapMarkerIconCollection;
                }, {onSelect: function(icon){
                    mm.set({
                        url: icon.get('url'),
                        animate: icon.get('animate'),
                        speed: icon.get('speed')
                    });
                }.bind(this)})
                .click('.blk-iconbox', function(DOMself){
                    DOMself.DOM.filter('.blki-upload').click();

                    return false; 
                })
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
    new ModuleContainer([
        new SelectButtonField('#IconClassEditBlock', admin.IconClass)
    ], 'common')
]);