client.PlayerNotificationsList = SyncedItem.extend({
    className: 'PlayerNotificationsList',
    init: function(){
        var showed = [];
        this.on('set:collection', function(ev){
            if (ev.value instanceof Array){
                ev.value.forEach(function(dialog){
                    if (showed.indexOf(dialog.id) === -1){
                        showed.push(dialog.id);
                        dialog.waitItem(function(dialog){
                            client.notify.showModal( dialog.getSchemeField() );
                        });
                    }
                }, this);
            }
        });
    }
});