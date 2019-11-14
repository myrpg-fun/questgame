module.exports = function (server){
    server.IconClass = server.SyncedData.extend({
        className: 'IconClass',
        createNew: function(){
            return this.get('icon').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    
};