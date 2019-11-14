admin.TimerTriggerTimeout = admin.TriggerClass.extend({
    className: 'TimerTriggerTimeout',
    moduleName: 'Timer',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#TimerTriggerTimeout'))
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
            target: project.watch(new admin.ActionArg('Таймер', 'Timer'))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.TimerTriggerStart = admin.TriggerClass.extend({
    className: 'TimerTriggerStart',
    moduleName: 'Timer',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#TimerTriggerStart'))
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
            target: project.watch(new admin.ActionArg('Таймер', 'Timer'))
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.fields.NewTimerTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#TimerTriggerStart', admin.TimerTriggerStart),
        new SelectButtonField('#TimerTriggerTimeout', admin.TimerTriggerTimeout),
    ])
);
