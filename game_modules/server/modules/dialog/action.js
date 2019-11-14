module.exports = function (server){
    server.DialogPlayerOpenAction = server.ActionClass.extend({
        className: 'DialogPlayerOpenAction',
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
            console.log('open dialog', this.get('dialog')?this.get('dialog').get('name'):null);
/*            var c = 0;
            for (var i in this.watcher.items){
                if (this.watcher.items[i] instanceof server.Dialog){
                    c++;
                }
            }
            console.log('count dialog', c);*/
            var dialog = this.get('dialog');
            
            if (dialog instanceof server.DialogPtr){
                dialog = dialog.getLastDialogPtr().get('dialog');
            }
            
            if (dialog){
                var dialog = dialog.clone();

                var args = this.getLocals();
                args.player = this.get('player');

                dialog.setupDialog(args);

                this.get('player').openDialog(dialog);

                dialog.on('unwatch-player', function(){
                    dialog.destroy();
                });
            }
        }
    });

    server.DialogFieldChangeDialogAction = server.ActionClass.extend({
        className: 'DialogFieldChangeDialogAction',
        getLocals: function(){
            var attr = this.getAttributes();
            delete attr.dialog;
            delete attr.change;
//            delete attr.name;
            var result = {};
            
            for (var i in attr){
                console.log(i, attr[i].className, attr[i] instanceof server.CustomField || attr[i] instanceof server.ActionArg);
                if (attr[i] instanceof server.CustomField || attr[i] instanceof server.ActionArg){
                    result[i] = attr[i].getValue();
                }
            }
            
            return result;
        },
        run: function(){
            console.log('change dialog');
/*            var c = 0;
            for (var i in this.watcher.items){
                if (this.watcher.items[i] instanceof server.Dialog){
                    c++;
                }
            }
            console.log('count dialog', c);*/
            
            var field = this.get('dialog');
            
            if (field && field.changeDialog){
                field.changeDialog(this.get('change'), this.getLocals());
            }
        }
    });

    server.DialogFieldChangeTextAction = server.ActionClass.extend({
        className: 'DialogFieldChangeTextAction',
        run: function(){
            console.log('change text');

            var text = this.get('textObject');

            if (!text){
                text = this.get('text')+'';
            }            
            
            var fid = this.get('name');
            this.get('dialog').get('fieldsList').forEach(function(field){
                if (field.changeText && field.get('name') === fid){
                    field.changeText(text);
                    
                    return true;
                }
            }, this);
        }
    });

    server.DialogPlayerCloseAction = server.ActionClass.extend({
        className: 'DialogPlayerCloseAction',
        run: function(){
            console.log('close dialog');
            
            this.get('player').closeDialog();
            
/*            var c = 0;
            for (var i in this.watcher.items){
                if (this.watcher.items[i] instanceof server.Dialog){
                    c++;
                }
            }
            console.log('count dialog', c);*/
        }
    });

    server.DialogMapOpenAction = server.ActionClass.extend({
        className: 'DialogMapOpenAction',
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
            console.log('open map overlay');

            var dialog = this.get('dialog').clone();
            
            var args = this.getLocals();
            args.player = this.get('player');
            
            dialog.setupDialog(args);
            
            this.get('player').openMapOverlay(dialog);
            
            dialog.on('unwatch-player', function(){
                dialog.destroy();
            });
        }
    });

    server.DialogMapCloseAction = server.ActionClass.extend({
        className: 'DialogMapCloseAction',
        run: function(){
            console.log('close map overlay');
            
            this.get('player').closeMapOverlay();
        }
    });
};