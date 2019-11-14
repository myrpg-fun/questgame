var Project = admin.global.Project;

admin.InventoryTriggerAddItem = admin.TriggerClass.extend({
    className: 'InventoryTriggerAddItem',
    moduleName: 'Inventory',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#InventoryTriggerAddItem'))
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
        return [this.get('lastCountArg'), this.get('itemArg'), this.get('countArg')];
    },
    createAttrs: function(project){
        this.set({
            lastCountArg: project.watch( new admin.ActionArg('Осталось места', 'Counter') ),
            itemArg: project.watch( new admin.ActionArg('Предмет', 'InventoryItem') ),
            countArg: project.watch( new admin.ActionArg('Количество предмета', 'Counter') )
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.InventoryTriggerRemoveItem = admin.TriggerClass.extend({
    className: 'InventoryTriggerRemoveItem',
    moduleName: 'Inventory',
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#InventoryTriggerRemoveItem'))
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
        return [this.get('lastCountArg'), this.get('itemArg'), this.get('countArg')];
    },
    createAttrs: function(project){
        this.set({
            lastCountArg: project.watch( new admin.ActionArg('Осталось предметов', 'Counter') ),
            itemArg: project.watch( new admin.ActionArg('Предмет', 'InventoryItem') ),
            countArg: project.watch( new admin.ActionArg('Количество предмета', 'Counter') )
        });
        
        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });
    }
});

admin.fields.NewInventoryTriggers = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#InventoryTriggerAddItem', admin.InventoryTriggerAddItem),
        new SelectButtonField('#InventoryTriggerRemoveItem', admin.InventoryTriggerRemoveItem)
    ])
);
