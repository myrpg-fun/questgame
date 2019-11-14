/*admin.InventoryItemArg = admin.ActionArg.extend({
    className: 'InventoryItemArg',
    moduleName: 'common',
    filterByType: function(type){
        return []
            .concat(('InventoryItem' === type)?([this]):([]))
//            .concat(this.get('description').filterByType(type))
//            .concat(this.get('itemname').filterByType(type));
    },
    createAttrs: function(project){
        this.set(this._init);
        this.set({
//            description: this.watcher.watch(new admin.ActionArgAttribute('Описание', 'description', this, 'Dialog')),
//            itemname: this.watcher.watch(new admin.ActionArgNameAttribute('Название', 'name', this, 'Text')),
        });
    },
    init: function(){
        if (!this.get('itemname')){
            this.set({
                itemname: this.watcher.watch(new admin.ActionArgNameAttribute('Название', 'name', this, 'Text')),
            });
        }
    },
    getType: function(){
        return 'InventoryItem';
    },
    initialize: function(name){
        SyncedItem.prototype.initialize.call(this);

        this._init = {
            name: name
        };
    }
});

admin.InventoryItemArgRemove = admin.InventoryItemArg.extend({
    className: 'InventoryItemArgRemove',
    moduleName: 'common',
    createSchemeField: function(){
        var schemeBlk = this.destrLsn(new SchemeField('#ArgFieldRemoveTpl'))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this))
            .linkInputValue('.blki-name', this, 'name');

        return schemeBlk;
    }
});
*/