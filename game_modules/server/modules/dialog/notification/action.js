module.exports = function (server){
    server.NotificationPlayerOpenAction = server.ActionClass.extend({
        className: 'NotificationPlayerOpenAction',
        getLocals: function(){
            var attr = this.getAttributes();
            var result = {};
            
            for (var i in attr){
                if (attr[i] instanceof server.CustomField || attr[i] instanceof server.ActionArg){
                    result[i] = attr[i].getValue();
                }
            }
            
            return result;
        },
        run: function(){
            console.log('open notification');
            
            var dialog = this.get('dialog').clone();
            
            var args = this.getLocals();
            args.player = this.get('player');
            
            dialog.setupDialog(args);
            
            this.get('player').openNotification(dialog);
            
            dialog.on('unwatch-player', function(){
                dialog.destroy();
            });
        }
    });

    server.NotificationPlayerClearAction = server.ActionClass.extend({
        className: 'NotificationPlayerClearAction',
        run: function(){
            console.log('clear all notifications');
            
            this.get('player').clearNotifications();
        }
    });
};