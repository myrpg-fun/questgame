module.exports = function (server){
    server.Notification = server.SyncedData.extend({
        className: 'Notification',
        wbpSent: true,
        cloneAttrs: function(){
            return ['fieldsList'];
        },
        addField: function(field){
            this.get('fieldsList').add([field]);
        },
        createAttrs: function(watcher){
            this.set({
                player: watcher.watch(new server.ActionArgClass('Игрок', server.PlayerTemplate)),
                thisArg: watcher.watch(new server.ActionArg('Текущий интерфейс', 'Notification')),
            });
        
            this.set({
                fieldsList: watcher.watch(
                    new server.ActionList(
                        [], [this.get('player'), this.get('thisArg')]
                ))
            });
        },
        setupDialog: function(args){
            if (this.isRun){
                return;
            }
            
            this.isRun = true;
            
            for (var i in args){
                if (this.get(i)){
                    this.get(i).setup(args[i]);
                }
            }
            
            this.get('thisArg').setup(this);
            this.get('fieldsList').runAction('setup');
            this.isRun = false;
/*            args.target = this;
            this.get('fieldsList').runAction('setup', args);*/
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    if (!flag.has(this)){
                        flag.add([this]);
                    }
                }, this);
            }, this);
            
            this.on('before-clone', function(ev){
                delete ev.attr.flagList;
            }, this);
            
            this.on('watch-player', function(ev){
                ev.watcher.watch(
                    this.get('fieldsList')
                );
            }, this);
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(
                    this.get('fieldsList')
                );
            }, this);
        }
    });
    
    server.NotificationFieldList = server.Notification.extend({});
};