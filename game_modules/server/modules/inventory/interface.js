module.exports = function (server){
    server.PlayerInventoryInterface = server.ActionClass.extend({
        className: 'PlayerInventoryInterface',
        wbpSent: true,
        mount: function(args){
            args.object.watch(this);
        },
        unmount: function(args){
            args.object.unwatch(this);
        }
    });
};