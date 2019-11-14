var Project = admin.global.Project;

admin.SessionTriggerStart = admin.TriggerClass.extend({
    className: 'SessionTriggerStart',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#SessionTriggerStart'))
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
    createAttrs: function(project){
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.SessionTriggerBegin = admin.TriggerClass.extend({
    className: 'SessionTriggerBegin',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#SessionTriggerBegin'))
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
    createAttrs: function(project){
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.SessionTriggerEnd = admin.TriggerClass.extend({
    className: 'SessionTriggerEnd',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['list'];
    },
    _actionLists: function(){
        return [this.get('list')];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#SessionTriggerEnd'))
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
    _getDeletedAttributes: function(){
        return ['list'];
    },
    createAttrs: function(project){
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.fields.NewSessionTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#SessionTriggerStart', admin.SessionTriggerStart),
        new SelectButtonField('#SessionTriggerBegin', admin.SessionTriggerBegin),
        new SelectButtonField('#SessionTriggerEnd', admin.SessionTriggerEnd),
    ])
);
