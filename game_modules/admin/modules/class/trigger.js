var Project = admin.global.Project;

admin.ClassTriggerCreate = admin.TriggerClass.extend({
    className: 'ClassTriggerCreate',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#ClassTriggerCreate'))
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
        return [];//this.get('classArg')];
    },
    createAttrs: function(project){
        /*this.set({
            classArg: project.watch( new admin.ActionArgClass('Класс', this._init.target) )
        });*/
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.ClassTriggerDelete = admin.TriggerClass.extend({
    className: 'ClassTriggerDelete',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#ClassTriggerDelete'))
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
        return [];//this.get('classArg')];
    },
    createAttrs: function(project){
        /*this.set({
            classArg: project.watch( new admin.ActionArgClass('Класс', this._init.target) )
        });*/
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.ClassTriggerAddFlag = admin.TriggerClass.extend({
    className: 'ClassTriggerAddFlag',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['list', 'flagList'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#ClassTriggerAddFlag'))
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
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        admin.global.ObjectFlagsList.createButtonField('Создать коллекцию'),
                        admin.global.ObjectFlagsList.createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
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
        return [];//this.get('classArg')];
    },
    createAttrs: function(project){
        /*this.set({
            classArg: project.watch( new admin.ActionArgClass('Класс', this._init.target) )
        });*/
        
        this.set({
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
    }
});

admin.ClassTriggerRemoveFlag = admin.TriggerClass.extend({
    className: 'ClassTriggerRemoveFlag',
    moduleName: 'Class',
    cloneAttrs: function(){
        return ['list', 'flagList'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#ClassTriggerRemoveFlag'))
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
            .linkTextValue('.blki-group', this.flags, 'flagsName')
            .openFieldClick('.link-group', 
                function(){
                    return makeSchemeFieldList(new SchemeCollection([
                        this.createLocalsField('Collection'),
                        admin.global.ObjectFlagsList.createButtonField('Создать коллекцию'),
                        admin.global.ObjectFlagsList.createSchemeField(this.get('flagList'))
                    ]));
                }.bind(this), 
                {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
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
        return [];//this.get('classArg')];
    },
    createAttrs: function(project){
        /*this.set({
            classArg: project.watch( new admin.ActionArgClass('Класс', this._init.target) )
        });*/
        
        this.set({
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){
        this.flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', this.flags, 'Выберите коллекции', 'name', 'flagsName');
        this.errorTestGroup('flagList', 'Ошибка: выберите коллекции');
    }
});

admin.fields.NewClassTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#ClassTriggerCreate', admin.ClassTriggerCreate),
        new SelectButtonField('#ClassTriggerDelete', admin.ClassTriggerDelete),
        new SelectButtonField('#ClassTriggerAddFlag', admin.ClassTriggerAddFlag),
        new SelectButtonField('#ClassTriggerRemoveFlag', admin.ClassTriggerRemoveFlag),
/*        new ModuleContainer([
            new SelectButtonField('#SetCustomTrigger', admin.SetCustomTrigger),
        ], 'Function')*/
    ])
);
