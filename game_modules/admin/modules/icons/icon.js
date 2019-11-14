var ADLinkIcon = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var change;
        var seticon;
        var icontimer = null;

        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            seticon = function(event){
                var icon = event.target;
                
                icon = Array.isArray(icon)?icon:[icon];
                
                icon = icon[0];
                
                DOMel.css({
                    backgroundImage: 'url('+icon.get('url')+')',
                    backgroundPosition: '0px 0px',
                    backgroundSize: '100% '+Math.floor(icon.get('height')*100/icon.get('width'))+'%'
                });

                if (icontimer){
                    window.clearInterval(icontimer);
                }
                
                icontimer = icon.startAnimation(DOMel);
            };

            change = function(event){
                if (event.lastValue){
                    var v = Array.isArray(event.lastValue)?event.lastValue:[event.lastValue];
                    
                    v.forEach(function(e){
                        e.off('set', seticon);
                    });
                }
                
                if (event.value){
                    var v = Array.isArray(event.value)?event.value:[event.value];
                    
                    v.forEach(function(e){
                        e.on('set', seticon);
                    });
                    
                    seticon({
                        target: v
                    });
                }
            };
            
            if (modelName){
                model.addEventListener('set:'+modelName, change);

                change({
                    value: model.get(modelName),
                    lastValue: null
                });
            }else{
                change({
                    value: model,
                    lastValue: null
                });
            }
        }.bind(this);
        this.clearEventFn = function(DOMel){
            if (icontimer){
                window.clearInterval(icontimer);
            }
                
            if (modelName){
                model.clearEventListener('set:'+modelName, change);
                if (model.get(modelName)){
                    var v = model.get(modelName);
                    v = Array.isArray(v)?v:[v];
                    
                    v.forEach(function(e){
                        e.clearEventListener('set', seticon);
                    });
                }
            }else{
                model.clearEventListener('set', seticon);
            }
        };
    }
});

admin.MapMarkerIcon = ActionClass.extend({
    className: 'MapMarkerIcon',
    moduleName: 'common',
    startAnimation: function(DOMel){
        var icon = this;
        var icontimer = null;
        //check animation
        var frame = 0;
        var forward = true;
        switch (icon.get('animate')){
            case 'repeat':
                //repeat from start
                icontimer = setInterval(function(){
                    DOMel.css({
                        backgroundPosition: '0px '+frame*100/(icon.get('height') - icon.get('width'))+'%'
                    });

                    frame += icon.get('width');
                    if (frame > icon.get('height') - icon.get('width')){
                        frame = 0;
                    }
                }, icon.get('speed'));

                break;
            case 'alternate':
                //repeat to start
                icontimer = setInterval(function(){
                    DOMel.css({
                        backgroundPosition: '0px '+frame*100/(icon.get('height') - icon.get('width'))+'%'
                    });

                    if (forward){
                        frame += icon.get('width');
                        if (frame > icon.get('height') - icon.get('width')){
                            frame -= 2*icon.get('width');
                            forward = false;
                        }
                    }else{
                        frame -= icon.get('width');
                        if (frame < 0){
                            frame += 2*icon.get('width');
                            forward = true;
                        }
                    }
                }, icon.get('speed'));

                break;
            case 'normal':
                //one way
                icontimer = setInterval(function(){
                    DOMel.css({
                        backgroundPosition: '0px '+frame*100/(icon.get('height') - icon.get('width'))+'%'
                    });

                    frame += icon.get('width');
                    if (frame > icon.get('height') - icon.get('width')){
                        window.clearInterval(icontimer);
                    }
                }, icon.get('speed'));

                break;
        }
        
        return icontimer;
    },
    createAttrs: function(project){
        this.set({
            url: '/admin/new.png',
            animate: 'no',
            speed: 100,
            width: 0,
            height: 0
        });
    },
    createSchemeField: function(){
        return new SchemeField('#iconTestTpl', this)
//            .linkAttributeValue('img.blki-icon', 'src', this, 'url')
            .link( new ADLinkIcon('.blki-icon', this, null) )
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainObject: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(this, stack);
            }.bind(this));
    },
    init: function(project){
        if (this.get('animate') === undefined){
            this.set({
                animate: 'no',
                speed: 100
            });
        }
        
        this.on('set:url', function(ev){
            var image = document.createElement('img');
            image.src = ev.value;
            image.onload = function () {
                this.set({
                    width: image.width,
                    height: image.height
                });
            }.bind(this);
        }, this);
        
        var accept = new zz.data().set({accept: '.jpg,.png'});
        
        this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection(null, new SchemeCollection([
                this.destrLsn(new SchemeField('#IconEditBlockTpl', this))
                    .link( new ADLinkIcon('.blki-icon', this, null) )
//                    .linkAttributeValue('img.blki-icon', 'src', this, 'url')
                    .linkInputValue('.blki-animate', this, 'animate')
                    .linkInputInteger('.blki-speed', this, 'speed')
                    .linkAttributeValue('.blki-upload', 'accept', accept, 'accept')
                    .linkUploadFile('.blki-upload', project.getItem('project').getUploadImageURL(), function(file){
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
                                this.set({url: file.upload});
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
                    .click('.blk-iconbox', function(DOMself){
                        DOMself.DOM.filter('.blki-upload').click();

                        return false; 
                    })
                    .click('.link-icon', function(DOMself){
                        DOMself.DOM.filter('.blki-upload').click();

                        return false; 
                    })
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
            ]));
    }
});

admin.MapMarkerIconList = SyncedList.extend({
    className: 'MapMarkerIconList',
    moduleName: 'common',
    collectionInstance: admin.MapMarkerIcon,
    createButtonField: function(name){
        return (new UploadButtonField(name, '.jpg, .jpeg, .png', admin.global.Project.getUploadImageURL(), function(files){
            var adding = [];
            
            files.forEach(function(file){
                adding.push(this.watcher.watch(new admin.MapMarkerIcon).set({url: file}));
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
        admin.global.MapMarkerNewIcon = admin.watcher.watchByID("MapMarkerNewIcon", function(){
            return new admin.MapMarkerIcon;
        });

        admin.global.MapMarkerIconList = admin.watcher.watchByID("MapMarkerIconList", function(){
            return new admin.MapMarkerIconList([
                admin.global.MapMarkerNewIcon
            ]);
        });

        admin.global.root.add([admin.global.MapMarkerIconList]);

        admin.fields.MapMarkerIconCollection = makeSchemeFieldList(
            new SchemeCollection([
                admin.global.MapMarkerIconList.createButtonField('Загрузить иконки'),
                admin.global.MapMarkerIconList.getSchemeField()
            ])
        );
    });
});