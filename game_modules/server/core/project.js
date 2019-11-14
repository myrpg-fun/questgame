module.exports = function (server){
    server.Project = server.SyncedData.extend({
        className: 'Project',
        getId: function(){
            return this.get('hashid');
        },
        getRealId: function(){
            return this.get('id');
        }
    });
};