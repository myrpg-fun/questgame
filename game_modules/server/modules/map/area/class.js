module.exports = function (server){
    server.MapCircleAreaClass = server.SyncedData.extend({
        className: 'MapCircleAreaClass',
        cloned: true,
        createNew: function(){
            return this.get('maparea').clone();
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    

    server.MapAreaClass = server.SyncedData.extend({
        className: 'MapAreaClass',
        cloned: true,
        createNew: function(){
            return this.get('maparea').clone();
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    

    server.MapAreaClassSet = server.SyncedData.extend({
        className: 'MapAreaClassSet',
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
};