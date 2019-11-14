module.exports = function (server){
    server.DialogClass = server.SyncedData.extend({
        className: 'DialogClass',
        createNew: function(){
            return this.get('dialog').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    

    server.DialogPtrClass = server.SyncedData.extend({
        className: 'DialogPtrClass',
        createNew: function(){
            return this.get('dialogptr').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    
};