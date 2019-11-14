module.exports = function (server){
    server.MapMarkerClass = server.SyncedData.extend({
        className: 'MapMarkerClass',
        cloned: true,
        createNew: function(){
            return this.get('mapmarker').clone();
        },
        mount: function(args){
            this.get('triggerList').mount(args);
            this.get('overlayList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
            this.get('overlayList').unmount(args);
        }
    });    

    server.MapMarkerClassSet = server.SyncedData.extend({
        className: 'MapMarkerClassSet',
        createNew: function(){
            return null;
        },
        mount: function(args){
            this.get('triggerList').mount(args);
            this.get('overlayList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
            this.get('overlayList').unmount(args);
        }
    });    
};