module.exports = function (server){
    server.SessionLogs = server.ActionClass.extend({
        className: 'SessionLogs',
        wbpSent: true,
        getWatchedEvents: function(){
            return ['set', 'remove-attribute', 'log'];
        },
        log: function(text, color){
            var t = {
                time: Date.now(),
                text: text,
                color: color
            };
            
            this.get('logs').push(t);
            
            this.callEventListener('log', t);
        },
        createAttrs: function(){
            this.set({
                logs: []
            });
        },
        init: function(project){
            
        }
    });
};