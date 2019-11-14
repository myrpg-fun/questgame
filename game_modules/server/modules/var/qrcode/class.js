module.exports = function (server){
    server.QRCodeClass = server.SyncedData.extend({
        className: 'QRCodeClass',
        cloned: true,
        createNew: function(){
            return this.get('qrcode').clone();
        },
        mount: function(args){
            //this.get('triggerList').mount(args);
        },
        unmount: function(args){
            //this.get('triggerList').unmount(args);
        }
    });    

    server.QRCodeClassSet = server.SyncedData.extend({
        className: 'QRCodeClassSet',
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