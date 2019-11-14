module.exports = function (server){
    server.Function = server.ActionClass.extend({
        className: 'Function'
    });

    server.CustomTrigger = server.ActionClass.extend({
        className: 'CustomTrigger'
    });
};