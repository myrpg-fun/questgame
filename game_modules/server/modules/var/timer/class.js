module.exports = function (server){
    server.TimerClass = server.SyncedData.extend({
        className: 'TimerClass',
        cloned: true,
        createNew: function(){
            return this.get('timer').clone();
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    

    server.TimerClassSet = server.SyncedData.extend({
        className: 'TimerClassSet',
        createNew: function(){
            return null;
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    
};