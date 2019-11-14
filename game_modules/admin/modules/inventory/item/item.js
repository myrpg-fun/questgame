var InventoryItemCounter = 1;

admin.InventoryItem = ActionClass.extend({
    className: 'InventoryItem',
    moduleName: 'Inventory',
    templateName: '#InventoryItemIcon',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryItemSelectBlock'))
            .link( new ADLinkIcon('.blki-icon', this, 'icon') )
//            .linkAttributeValue('.blki-icon', 'src', this, 'icon')
            .linkTextValue('.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            icon: [admin.global.MapMarkerNewIcon],//'/admin/new.png',
            name: 'Предмет '+InventoryItemCounter++,
            max: 0,
            x: 1,
            y: 1,
            accept: '.png,.jpg',
            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.InventoryItemAllFlag])
            ),
//            arg: project.watch(new admin.ActionArg('Предмет', 'InventoryItem')),
//            description: project.watch( new admin.DialogFieldList )
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
        
        admin.global.InventoryItemAllFlag.add([this]);
    },
    init: function(project){
        if (typeof this.get('icon') === 'string'){
            project.afterSync(function(){
                for (var i in project.items){
                    var item = project.items[i];

                    if (item instanceof admin.MapMarkerIcon && item.get('url') === this.get('icon')){
                        this.set({
                            icon: [item]
                        });
                        break;
                    }
                }
            }.bind(this));
        }
        
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.flagsVar = flags;
        
        this.style = (new zz.data()).set({style: 'width: '+this.get('x')*InventoryItemWidth+'px;height: '+this.get('y')*InventoryItemWidth+'px'});
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= InventoryItemCounter){
            InventoryItemCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        //var description = this.get('description');
        var triggerList = this.get('triggerList');
        
        this.on('set:x', function(ev){
            var x = parseInt(ev.value);
            if (isNaN(x)){
                x = 1;
            }
            if (x < 1){
                x = 1;
            }
            if (x > 9){
                x = 9;
            }
            
            this.set({x: x});
            
            this.style.set({style: 'width: '+this.get('x')*InventoryItemWidth+'px;height: '+this.get('y')*InventoryItemWidth+'px'});
        }, this);
        
        this.on('set:y', function(ev){
            var y = parseInt(ev.value);
            if (isNaN(y)){
                y = 1;
            }
            if (y < 1){
                y = 1;
            }
            if (y > 9){
                y = 9;
            }
            
            this.set({y: y});
            
            this.style.set({style: 'width: '+this.get('x')*InventoryItemWidth+'px;height: '+this.get('y')*InventoryItemWidth+'px'});
        }, this);
        
        project.afterSyncItem("InventoryItemFlagsList", function(InventoryItemFlagsList){
            project.afterSync([flagList, triggerList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                this.on('before-clone', function(ev){
                    ev.attr.flagList = this.watcher.watch(
                        new admin.FlagCollectionList([])
                    );
                }, this);

                this.on('after-clone', function(ev){
                    var flagList = ev.clone.get('flagList');
                    this.get('flagList').forEach(function(flag){
                        flagList.add([flag]);
                    }, this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    InventoryItemFlagsList.createButtonField('Создать коллекцию'),
                    InventoryItemFlagsList.createSchemeField(flagList)
                ]) ));
                
                this.flagCField = flagCField;
                
                //var accept = new zz.data().set({accept: '.jpg,.png'});

                var editorField = this.destrLsn(new SchemeField('#InventoryItem'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputInteger('.blki-max', this, 'max')
                    .linkInputInteger('.blki-x', this, 'x')
                    .linkInputInteger('.blki-y', this, 'y')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-icon', function(){
                        return admin.fields.MapMarkerIconCollection;
                    }, {onSelect: function(icon){
                        this.set({icon: [icon]});
                    }.bind(this)})
                    .link( new ADLinkIcon('.blki-icon', this, 'icon') )
//                    .linkAttributeValue('.blki-icon', 'src', this, 'icon')
                    .linkAttributeValue('.blk-iconbox', 'style', this.style, 'style')
/*                    .linkAttributeValue('.blki-upload', 'accept', accept, 'accept')
                    .linkUploadFile('.blki-upload', project.getItem('project').getUploadImageURL(), function(data){
                        if (data){
                            data = JSON.parse(data);
                        }

                        if (data && data.uploaded){
                            data.uploaded.forEach(function(file){
                                this.set({icon: file});
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
                    })*/
                    .click('.blk-iconbox', function(DOMself){
                        DOMself.DOM.filter('.link-icon').click();

                        return false; 
                    })
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this));

                    this.editorBlk = this.destrLsn(makeSchemeFieldList(new SchemeCollection([
                        editorField,
/*                        triggerList.createButtonField('Триггеры', admin.fields.NewInventoryItemFields),
                        triggerList.getSchemeField(),*/
/*                        description.get('fieldsList').createButtonField('Описание предмета', admin.fields.NewDialogFields),
                        description.get('fieldsList').getSchemeField()*/
                    ])));
            }.bind(this));
        }.bind(this));
    }
});

admin.InventoryItemEmpty = admin.InventoryItem.extend({
    className: 'InventoryItemEmpty',
    moduleName: 'Inventory',
    templateName: '#InventoryItemIconEmpty',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventoryEmptyItemSelectBlock'))
//            .link( new ADLinkIcon('.blki-icon', this, 'icon') )
            .linkAttributeValue('.blki-icon', 'src', this, 'icon')
            .linkTextValue('.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            icon: '/admin/empty.png',
            name: 'Пустота',
            x: 1,
            y: 1,
            accept: '.png,.jpg',
//            arg: project.watch(new admin.ActionArg('Предмет', 'InventoryItem')),
            //description: project.watch( new admin.DialogFieldList )
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');
        //var description = this.get('description');
        
        this.style = (new zz.data()).set({style: 'width: '+this.get('x')*InventoryItemWidth+'px;height: '+this.get('y')*InventoryItemWidth+'px'});
        
        project.afterSync([triggerList], function(){
            var editorField = this.destrLsn(new SchemeField('#InventoryItemEmpty'))
                .linkInputValue('.blki-name', this, 'name')
                .linkAttributeValue('.blki-icon', 'src', this, 'icon')
                .linkAttributeValue('.blki-icon', 'style', this.style, 'style');

                this.editorBlk = this.destrLsn(makeSchemeFieldList(new SchemeCollection([
                    editorField,
/*                    description.get('fieldsList').createButtonField('Поля формы', admin.fields.NewDialogFields),
                    description.get('fieldsList').getSchemeField()*/
                ])));
        }.bind(this));
    }
});