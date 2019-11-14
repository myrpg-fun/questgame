module.exports = function (server){
    server.Audio = server.SyncedData.extend({
        className: 'Audio'
    });    
    
    server.AudioList = server.SyncedData.extend({
        className: 'AudioList'
    });    
};