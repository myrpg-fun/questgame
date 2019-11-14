var Project = admin.global.Project;

admin.PlayerTriggerNew = admin.TriggerClass.extend({
    className: 'PlayerTriggerNew',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#PlayerTriggerNew'))
            .openFieldClick('.link-open', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('classArg')];
    },
    createAttrs: function(project){
        this.set({
            classArg: project.watch( new admin.ActionArgClass('Новый игрок', admin.global.PlayerTemplate) )
        });

        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
});

admin.PlayerTriggerJoin = admin.TriggerClass.extend({
    className: 'PlayerTriggerJoin',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#PlayerTriggerJoin'))
            .openFieldClick('.link-open', 
                makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('classArg')];
    },
    createAttrs: function(project){
        this.set({
            classArg: project.watch( new admin.ActionArgClass('Игрок вошел', admin.global.PlayerTemplate) )
        });

        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
});

admin.PlayerTriggerQuit = admin.TriggerClass.extend({
    className: 'PlayerTriggerQuit',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#PlayerTriggerQuit'))
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                ))
            , {})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('classArg')];
    },
    createAttrs: function(project){
        this.set({
            classArg: project.watch( new admin.ActionArgClass('Игрок вышел', admin.global.PlayerTemplate) )
        });

        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
});

admin.PlayerTriggerMove = admin.TriggerClass.extend({
    className: 'PlayerTriggerMove',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#PlayerTriggerMove'))
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                ))
            , {})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    _actionLists: function(){
        return [this.get('list')];
    },
    _listArgs: function(){
        return [this.get('classArg')];
    },
    createAttrs: function(project){
        this.set({
            classArg: project.watch( new admin.ActionArgClass('Игрок переместился', admin.global.PlayerTemplate) )
        });

        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
});

admin.fields.NewPlayerTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#PlayerTriggerNew', admin.PlayerTriggerNew),
        new SelectButtonField('#PlayerTriggerJoin', admin.PlayerTriggerJoin),
        new SelectButtonField('#PlayerTriggerQuit', admin.PlayerTriggerQuit),
        new SelectButtonField('#PlayerTriggerMove', admin.PlayerTriggerMove),
    ])
);
