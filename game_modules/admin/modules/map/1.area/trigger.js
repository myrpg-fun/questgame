var Project = admin.global.Project;

admin.MapAreaTriggerActive = admin.TriggerClass.extend({
    className: 'MapAreaTriggerActive',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#MapAreaTriggerActive'))
            .linkSwitchValue('.blki-active', this, 'active')
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch(new admin.ActionArg('Зона взаимодействия', 'MapArea'))
        });
        
        this.set({
            active: 1,
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.MapAreaTriggerClick = admin.TriggerClass.extend({
    className: 'MapAreaTriggerClick',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#MapAreaTriggerClickTpl'))
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('playerarg'), this.get('latlngarg'), this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            playerarg: project.watch(new admin.ActionArgClass('Игрок', admin.global.PlayerTemplate)),
            latlngarg: project.watch(new admin.ActionArg('Координаты клика', 'LatLng')),
            target: project.watch(new admin.ActionArg('Зона взаимодействия', 'MapArea'))
        });

        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.MapAreaTriggerNear = admin.TriggerClass.extend({
    className: 'MapAreaTriggerNear',
    moduleName: 'MapArea',
    cloneAttrs: function(){
        return ['near', 'far', 'flagList'];
    },
    createSchemeField: function(){
        var nearList = this.get('near');
        var farList = this.get('far');
        return this.destrLsn(new SchemeField('#MapAreaTriggerNearTpl'))
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        this.watcher.getItem("ObjectFlagsList").createButtonField('Создать коллекцию'),
                        this.watcher.getItem("ObjectFlagsList").createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .openFieldClick('.link-near', this.destrLsn(makeSchemeFieldList(
                new SchemeCollection([
                    nearList.getLocalsSchemeField(),
                    nearList.createCopyButtonField('Действия'),
                    nearList.getSchemeField()
                ])
            ), {}))
            .openFieldClick('.link-far', this.destrLsn(makeSchemeFieldList(
                new SchemeCollection([
                    farList.getLocalsSchemeField(),
                    farList.createCopyButtonField('Действия'),
                    farList.getSchemeField()
                ])
            ), {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-near').click();
                return false; 
            })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('near'), this.get('far')];
    },
    _listArgs: function(){
        return [this.get('target'), this.get('arg')];
    },
    createAttrs: function(project){
        this.set({
            arg: project.watch(new admin.ActionArgClass('Игрок вошел', admin.global.PlayerTemplate)),
            target: project.watch(new admin.ActionArg('Зона взаимодействия', 'MapArea'))
        });
        
        this.set({
            near: project.watch(new admin.ActionList([], this._listArgs())),
            far: project.watch(new admin.ActionList([], this._listArgs())),
            flagList: project.watch(
                new admin.FlagCollectionList([
                    project.getItem('PlayerAllFlag')
                ])
            ),
        });
    }, 
    init: function(){
        if (!this.get('flagList')){
            this.set({
                flagList: project.watch(
                    new admin.FlagCollectionList([
                        project.getItem('PlayerAllFlag')
                    ])
                )
            });
        }
        
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');        
    }
});

admin.fields.NewMapAreaTriggers = makeSchemeFieldList(
    admin.fields.NewMapAreaTriggersCollection = new SchemeCollection([
        new SelectButtonField('#MapAreaTriggerActive', admin.MapAreaTriggerActive),
        new SelectButtonField('#MapAreaTriggerClickTpl', admin.MapAreaTriggerClick),
        new ModuleContainer([
            new SelectButtonField('#MapAreaTriggerNearTpl', admin.MapAreaTriggerNear)
        ], 'MapGps')
    ])
);
