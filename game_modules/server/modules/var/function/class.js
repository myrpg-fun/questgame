module.exports = function (server){
    server.FunctionClass = server.SyncedData.extend({
        className: 'FunctionClass',
        createNew: function(){
            return this.get('func').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    
};