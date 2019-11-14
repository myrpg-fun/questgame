admin.PlayerTemplate = admin.Class.extend({
    className: 'PlayerTemplate',
    moduleName: 'common',
    getLocalsByType: function(type, argclass){
        var result = admin.Class.prototype.getLocalsByType.apply(this, arguments);
        
        this.get('interfaceList').forEach(function(ifLocal){
            if (ifLocal.getLocalsByType){
                result = result.concat(ifLocal.getLocalsByType(type, argclass));
            }
        }, this);

        return result;
    },
    cloneAttrs: function(){
        return ['classList', 'flagList'];
    },
    createAttrs: function(project){
        this.set({
            name: 'Игрок',
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
        });
        
        this.set({
            classArg: project.watch( new admin.ActionArgClass('Игрок', this) )
        });
        
        this.set({
            classList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            interfaceList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            objectList: project.watch(
                new admin.ClassObjectList([])
            )
        });
        
        this.get('flagList').add([project.getItem("PlayerAllFlag")]);
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    init: function(project){
        if (!this.get('classArg')){
            this.set({
                classArg: project.watch( new admin.ActionArgClass('Игрок', this) )
            });
            
            this.get('classList').addArgs([this.get('classArg')]);
            this.get('triggerList').addArgs([this.get('classArg')]);
            this.get('interfaceList').addArgs([this.get('classArg')]);
            this.get('objectList').addArgs([this.get('classArg')]);
        }        
        
        if (!this.get('objectList')){
            this.set({
                objectList: project.watch(
                    new admin.ClassObjectList([])
                )
            });
        }
        
        this.on('destroy', function(){
            this.get('classArg').deleteSync();
        }, this);

        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var flagList = this.get('flagList');
        var classList = this.get('classList');
        var triggerList = this.get('triggerList');
        var interfaceList = this.get('interfaceList');

        project.afterSyncItem("ObjectFlagsList", function(ClassFlagsList){
            project.afterSync([flagList, classList, triggerList, interfaceList], function(){
                classList.on('add', function(ev){
                    this.callEventListener('add-item', {item: ev.item, class: this});
                }, this);
                
                classList.on('remove', function(ev){
                    this.callEventListener('remove-item', {item: ev.item, class: this});
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    ClassFlagsList.createButtonField('Создать коллекцию', admin.ClassFlagGroupClass),
                    ClassFlagsList.createSchemeField(flagList)
                ]) ));

                var editorField = this.destrLsn(new SchemeField('#PlayerTemplate'))
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)});

                this.editorBlk = this.destrLsn(makeSchemeFieldList(new SchemeCollection([
                    editorField,
                    interfaceList.createButtonField('Добавить интерфейс', admin.fields.NewPlayerInterface),
                    interfaceList.getSchemeField(),
                    triggerList.createButtonField('Триггеры', admin.fields.NewPlayerTriggers),
                    triggerList.getSchemeField(),
                    new CreateButtonClassField('Объекты игрока', admin.fields.NewClasses, {onSelect: function(actionClass){
                        var newAC = new actionClass(this);

                        classList.add([ this.watcher.watch(newAC) ]);
                    }.bind(this)}),
                    classList.getSchemeField()
                ])));
            }.bind(this));
        }.bind(this));
    }
});
