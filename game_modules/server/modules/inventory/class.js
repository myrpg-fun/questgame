module.exports = function (server){
    server.InventoryClass = server.SyncedData.extend({
        className: 'InventoryClass',
        cloned: true,
        createNew: function(){
            return this.get('inventory').clone();
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    

    server.InventoryClassSet = server.SyncedData.extend({
        className: 'InventoryClassSet',
        createNew: function(){
            return null;
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    

    server.InventoryItemClass = server.SyncedData.extend({
        className: 'InventoryItemClass',
        cloned: true,
        createNew: function(){
            return this.get('item').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    

    server.InventoryItemClassSet = server.SyncedData.extend({
        className: 'InventoryItemClassSet',
        createNew: function(){
            return null;
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    
};