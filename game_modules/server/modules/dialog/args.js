module.exports = function (server){
    server.ActionDArgClass = server.ActionArgClass.extend({
        className: 'ActionDArgClass'
    });
    
    server.DialogArg = server.ActionArg.extend({
        className: 'DialogArg'
    });
};