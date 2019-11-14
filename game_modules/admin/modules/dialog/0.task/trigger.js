admin.TaskTriggerFailed = admin.TriggerClass.extend({
    className: 'TaskTriggerFailed',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#TaskTriggerFailed'))
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
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch(new admin.ActionArg('Задача', 'Task'))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.TaskTriggerComplete = admin.TriggerClass.extend({
    className: 'TaskTriggerComplete',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#TaskTriggerComplete'))
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
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch(new admin.ActionArg('Задача', 'Task'))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.TaskTriggerCancel = admin.TriggerClass.extend({
    className: 'TaskTriggerCancel',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#TaskTriggerCancel'))
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
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch(new admin.ActionArg('Задача', 'Task'))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.TaskTriggerStart = admin.TriggerClass.extend({
    className: 'TaskTriggerStart',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#TaskTriggerStart'))
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
        return [this.get('target')];
    },
    createAttrs: function(project){
        this.set({
            target: project.watch(new admin.ActionArg('Задача', 'Task'))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.fields.NewTaskTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#TaskTriggerStart', admin.TaskTriggerStart),
        new SelectButtonField('#TaskTriggerComplete', admin.TaskTriggerComplete),
        new SelectButtonField('#TaskTriggerFailed', admin.TaskTriggerFailed),
        new SelectButtonField('#TaskTriggerCancel', admin.TaskTriggerCancel)
    ])
);
