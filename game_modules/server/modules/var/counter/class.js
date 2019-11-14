module.exports = function (server){
    server.CounterClass = server.SyncedData.extend({
        className: 'CounterClass',
        cloned: true,
        createNew: function(){
            return this.get('counter').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    

    server.CounterClassSet = server.SyncedData.extend({
        className: 'CounterClassSet',
        createNew: function(){
            return null;
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    
};