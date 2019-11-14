module.exports = function (server){
    server.PlayerDialogInterfaceView = server.ActionClass.extend({
        className: 'PlayerDialogInterfaceView',
        wbpSent: true,
        getValue: function(){
            return this.get('dialog');
        },
        createAttrs: function(){},
        init: function(){
            this.on('watch-player', function(ev){
                var player = ev.player;
                
                console.log('watch PlayerDialogInterfaceView', this.id, this.get('dialog').id);
                
                this.on('set:dialog', function(ev){
                    if (ev.lastValue){
                        player.unwatch(ev.lastValue, true);
                    }

                    if (ev.value){
                        player.watch(ev.value, true);
                    }
                });
            });
            
            this.on('unwatch-player', function(ev){
                var player = ev.player;
                
                this.off('set:dialog');
                
                player.unwatch(this.get('dialog'), true);
                
                this.get('dialog').destroy();
            });
        }        
    });
    
    server.PlayerDialogInterface = server.ActionClass.extend({
        className: 'PlayerDialogInterface',
        wbpSent: false,
        mount: function(args){
            if (!args.object.get('DialogInterface'+this.id)){
                console.log('interface dialog setup');

                var dialog = null;
                if (this.get('dialog')){
                    dialog = this.get('dialog').clone();

                    console.log('dlg cloned');
                    
                    dialog.setupDialog({
                        player: args.object
                    });
                }else{
                    dialog = null;
                }

                var ifw = this.watcher.watch(new server.PlayerDialogInterfaceView)
                    .set({
                        dialog: dialog,
                        name: this.get('name'),
                        icon: this.get('icon')
                    });
                args.object.watch(ifw);

                args.object.setAttribute(
                    'DialogInterface'+this.id, ifw
                );
            }
        },
        unmount: function(args){
            var ifw = args.object.get('DialogInterface'+this.id);
            if (ifw){
                args.object.unwatch(ifw);
                args.object.removeAttribute('DialogInterface'+this.id);
            }
        }
    });
};