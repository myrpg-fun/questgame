admin.SetCustomTrigger = admin.TriggerClass.extend({
    className: 'SetCustomTrigger',
    moduleName: 'Function',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#SetCustomTrigger'))
            .linkTextValue('.blki-triggername', this.name, 'triggerName')
            .openFieldClick('.link-trigger', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            admin.fields.TriggerCollection
                        ]));
                }.bind(this),
                {onSelect: function(trigger){
                    this.set({trigger: trigger});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-trigger').click();
                    return false; 
                })
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
    createAttrs: function(project){
        this.set({
            list: project.watch(new admin.ActionList([], [])),
            trigger: null
        });
    },
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('trigger', this.name, 'triggerName', 'Выберите триггер', 'name');
        this.addLocalsListener('trigger', 'Function');
    }
});

