admin.PlayerInventoryInterface = ActionClass.extend({
    className: 'PlayerInventoryInterface',
    moduleName: 'Map',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerInventoryInterface'))
            .linkInputValue('.blki-name', this, 'name')
            .linkInputValue('.blki-icon', this, 'icon')
            .linkTextValue('.blki-inventoryname', this.name, 'inventoryName')
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-interface').click();
                    return false; 
                })
            .openFieldClick('.link-inventory', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Inventory'),
                            admin.global.InvetoryAllFlag.getSchemeCollectionField()
                        ]));
                }.bind(this),
                {onSelect: function(inventory){
                    this.set({inventory: inventory});
                }.bind(this)})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    createAttrs: function(project){
        this.set({
            inventory: null,
            icon: 'ion-pizza',
            name: 'Инвентарь'
        });
    },
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
    }
});