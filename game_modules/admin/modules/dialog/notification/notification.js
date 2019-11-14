var NotificationCounter = 1;

admin.NotificationFieldList = ActionClass.extend({
    className: 'NotificationFieldList',
    moduleName: 'Notification',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationSelectBlock'));
    },
    getLocalsByType: function(type){
        var result = [];
        
        this.get('fieldsList').forEach(function(field){
            result = result.concat(field.getLocalsByType(type));
        });
        
        return result;
    },
    cloneAttrs: function(){
        return ['fieldsList'];
    },
    _listArgs: function(){
        return [this.get('playerArg'), this.get('thisArg')];
    }, 
    createAttrs: function(project){
        this.set({
            playerArg: project.watch(new admin.ActionArgClass('Игрок', admin.global.PlayerTemplate)),
            thisArg: project.watch(new admin.ActionArg('Открытое оповещение', 'Notification'))
        });
        
        this.set({
            fieldsList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){}
});

admin.Notification = admin.NotificationFieldList.extend({
    className: 'Notification',
    moduleName: 'Notification',
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainNotification: this})
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
        admin.NotificationFieldList.prototype.createAttrs.apply(this, arguments);
        
        this.set({
            name: 'Оповещение '+NotificationCounter++,
            delay: 1.5,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            )
        });
        
        this.get('flagList').add([admin.global.NotificationAllFlag]);
        admin.global.NotificationAllFlag.add([this]);
    },
    init: function(project){
        admin.NotificationFieldList.prototype.init.apply(this, arguments);
        
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= NotificationCounter){
            NotificationCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        var fieldsList = this.get('fieldsList');
        
        if (!flagList){
            return;
        }
        
        project.afterSyncItem("NotificationFlagsList", function(NotificationFlagsList){
            project.afterSync([flagList, fieldsList], function(){
                fieldsList.on('add-args', function(ev){
                    if (ev.item.isCustomArg()){
                        this.setAttribute(ev.item.id, ev.item);
                    }
                }, this);

                fieldsList.on('remove-args', function(ev){
                    var attrs = this.attributes;
                    for (var i in attrs){
                        if (attrs[i] === ev.item){
                            this.removeAttribute(i);
                        }
                    }
                }, this);
            
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    NotificationFlagsList.createButtonField('Создать коллекцию'),
                    NotificationFlagsList.createSchemeField(flagList)
                ]) ));
                
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

                var editorField = this.destrLsn(new SchemeField('#Notification'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputValue('.blki-delay', this, 'delay')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)});

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .linkCollection(null, new SchemeCollection([
                        editorField,
                        fieldsList.getLocalsSchemeFieldDark(),
                        fieldsList.createButtonLocalsField('Добавить аргумент'),
                        fieldsList.createButtonField('Поля формы', admin.fields.NewNotificationFields),
                        fieldsList.getSchemeField()
                    ]));
            }.bind(this));
        }.bind(this));
    }
});

