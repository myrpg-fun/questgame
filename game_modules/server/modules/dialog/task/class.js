module.exports = function (server){
    server.TaskClass = server.SyncedData.extend({
        className: 'TaskClass',
        createNew: function(){
            return this.get('task').clone();
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    
};