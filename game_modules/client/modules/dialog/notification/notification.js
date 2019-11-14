client.Notification = SyncedItem.extend({
    className: 'Notification',
    getSchemeField: function(){
        var timer = this.get('delay');
        var stimeout = null;
        
        var col = this.getFieldsListCollection();
        
        if (col){
            return new SchemeField('#Notification')
                .linkCollection('.blk-notify', col)
                .click('.blk-notify', function(){
                    if (stimeout !== null){
                        clearTimeout(stimeout);
                    }
                    client.notify.clearModal();
                })
                .init('.blk-notify', function(){
                    if (timer > 0){
                        stimeout = client.setTimeout(function(){
                            stimeout = null;
                            client.notify.clearModal();
                        }, timer*1000);
                    }
                }, function(){
                    if (stimeout !== null){
                        clearTimeout(stimeout);
                    }
                });
        }

        return new SchemeField('#Notification')
            .init('.blk-notify', function(){
                client.setTimeout(function(){
                    client.notify.clearModal();
                }, 0);
            });
    },
    getFieldsListCollection: function(){
        if (this.get('fieldsList') instanceof SyncedList){
            return this.get('fieldsList').createSchemeCollection();
        }else{
            console.error('no notification fields list return');
            
            return null;
        }
    },
    init: function(){
        
    }
});