module.exports = function (server){
    server.CollectionClass = server.SyncedData.extend({
        className: 'CollectionClass',
        createNew: function(){
            switch (this.get('cloned')){
                case 'no':
                    return this.get('collection');
                    break;
                case 'clone':
                    return this.get('collection').clone();
                    break;
            }
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