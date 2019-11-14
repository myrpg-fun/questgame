var Project = admin.global.Project;

admin.DialogTriggerInit = admin.TriggerClass.extend({
    className: 'DialogTriggerInit',
    moduleName: 'Dialog',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#DialogTriggerInit'))
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

admin.DialogTriggerClose = admin.TriggerClass.extend({
    className: 'DialogTriggerClose',
    moduleName: 'Dialog',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#DialogTriggerClose'))
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

admin.DialogTriggerOpen = admin.TriggerClass.extend({
    className: 'DialogTriggerOpen',
    moduleName: 'Dialog',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#DialogTriggerOpen'))
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

admin.fields.NewDialogTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#DialogTriggerInit', admin.DialogTriggerInit),
        new SelectButtonField('#DialogTriggerOpen', admin.DialogTriggerOpen),
        new SelectButtonField('#DialogTriggerClose', admin.DialogTriggerClose)
    ])
);
