module.exports = function (server){
    server.MapMarkerCoord = server.SyncedData.extend({
        className: 'MapMarkerCoord',
        createAttrs: function(){
            this.set(this._init);
        },
        setup: function(lat, lng){
            this.set({lat: lat, lng: lng});
        },
        initialize: function(lat, lng){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = {lat: lat, lng: lng};
        }        
    });
};