module.exports = function (server){
    server.DialogTriggerInit = server.TriggerClass.extend({
        className: 'DialogTriggerInit',
        _mount: function(dialog, args){
            console.log('mount dialog init ', dialog.get('name'));
            
            var fn = function(ev){
                this.setupArg('target', dialog);

                this.get('list').run(args);
            };
            
            dialog.on('dialog-init', fn, this);
            
            return fn;
        },
        _unmount: function(dialog, fn){
            dialog.off('dialog-init', fn, this);
        }
    });    

    server.DialogTriggerClose = server.TriggerClass.extend({
        className: 'DialogTriggerClose',
        _mount: function(dialog, args){
            console.log('mount dialog close ', dialog.get('name'));
            
            var fn = function(ev){
                this.setupArg('target', dialog);

                this.get('list').run(args);
            };
            
            dialog.on('dialog-close', fn, this);
            
            return fn;
        },
        _unmount: function(dialog, fn){
            dialog.off('dialog-close', fn, this);
        }
    });    

    server.DialogTriggerOpen = server.TriggerClass.extend({
        className: 'DialogTriggerOpen',
        _mount: function(dialog, args){
            console.log('mount dialog open ', dialog.get('name'));
            
            var fn = function(ev){
                this.setupArg('target', dialog);

                this.get('list').run(args);
            };
            
            dialog.on('dialog-open', fn, this);
            
            return fn;
        },
        _unmount: function(dialog, fn){
            dialog.off('dialog-open', fn, this);
        }
    });    
};