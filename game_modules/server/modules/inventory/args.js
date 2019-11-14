module.exports = function (server){
    server.InventoryItemArg = server.ActionArg.extend({
        className: 'InventoryItemArg'
    });
    
    server.InventoryItemArgRemove = server.InventoryItemArg.extend({
        className: 'InventoryItemArgRemove'
    });
};