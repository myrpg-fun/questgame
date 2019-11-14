module.exports = function (server){
    server.ObjectClass = server.SyncedData.extend({
        className: 'ObjectClass',
        cloned: true,
        createNew: function(){
            switch (this.get('cloned')){
                case 'no':
                    return this.get('object');
                    break;
                case 'clone':
                    return this.get('object').clone();
                    break;
            }
            return null;
        },
        mount: function(args){
            this.get('triggerList').mount(args);
        },
        unmount: function(args){
            this.get('triggerList').unmount(args);
        }
    });    

    server.ObjectClassSet = server.SyncedData.extend({
        className: 'ObjectClassSet',
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