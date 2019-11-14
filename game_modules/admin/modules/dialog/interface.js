admin.PlayerDialogInterface = ActionClass.extend({
    className: 'PlayerDialogInterface',
    moduleName: 'Dialog',
    getLocalsByType: function(type, argclass){
        return (type === 'Dialog')?[new ActionArgSelectIfItem(this, argclass, 'Dialog')]:[];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerDialogInterface'))
            .linkInputValue('.blki-name', this, 'name')
            .linkInputValue('.blki-icon', this, 'icon')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-dialog').click();
                    return false; 
                })
            .openFieldClick('.link-dialog', 
                function(){
                    return this.get('dialog').getEditor();
                }.bind(this),
                {})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    createAttrs: function(project){
        this.set({
            dialog: project.watch(new admin.DialogFieldList),
            icon: 'ion-pizza',
            name: 'Инвентарь'
        });
    },
    init: function(){
        this.errorTestValue('icon', "", 'Ошибка: Введите иконку закладки');
        this.errorTestValue('name', "", 'Ошибка: Введите имя закладки');
    }
});

admin.fields.NewPlayerInterfaceCollection.add([
    new ModuleContainer([
        new SelectButtonField('#PlayerDialogInterface', admin.PlayerDialogInterface),
    ], 'Dialog')
]);

