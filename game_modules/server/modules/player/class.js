module.exports = function (server){
    server.PlayerClass = server.SyncedData.extend({
        className: 'PlayerClass',
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
    
    /*server.PlayerClassRO = server.PlayerClass.extend({
        className: 'PlayerClassRO',
        mountif: function(args){
            this.get('interfaceList').mount(args);
        },
        unmountif: function(args){
            this.get('interfaceList').unmount(args);
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });*/
};