module.exports = function (server){
    server.Map = server.SyncedData.extend({
        className: 'Map',
        wbpSent: true
    });    
};