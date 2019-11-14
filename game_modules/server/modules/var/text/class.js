module.exports = function (server){
    server.TextClass = server.SyncedData.extend({
        className: 'TextClass',
        cloned: true,
        createNew: function(){
            /*switch (this.get('cloned')){
                case 'no':
                    return this.get('text');
                    break;
                case 'clone':
                    return this.get('text').clone();
                    break;
            }*/
            return this.get('text').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    

    server.TextClassSet = server.SyncedData.extend({
        className: 'TextClassSet',
        createNew: function(){
            /*switch (this.get('cloned')){
                case 'no':
                    return this.get('text');
                    break;
                case 'clone':
                    return this.get('text').clone();
                    break;
            }*/
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