module.exports = function (server){
    server.MapMarkerIcon = server.SyncedData.extend({
        wbpSent: true,
        className: 'MapMarkerIcon'
    });    
    
    server.MapMarkerIconList = server.SyncedData.extend({
        className: 'MapMarkerIconList'
    });    
};