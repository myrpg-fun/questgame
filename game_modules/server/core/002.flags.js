module.exports = function (server){
    server.FlagGroupClass = server.SyncedList.extend({
        className: 'FlagGroupClass',
        init: function(){
            this.set({collection: []});//re-set flags from items
        }
    });

    server.FlagGroupClassEnabled = server.FlagGroupClass.extend({
        className: 'FlagGroupClassEnabled'
    });

    server.FlagCollectionList = server.SyncedList.extend({
        className: 'FlagCollectionList',
        collectionInstance: server.FlagGroupClass
    });
};