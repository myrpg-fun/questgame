module.exports = function (server){
    server.InventoryTriggerAddItem = server.TriggerClass.extend({
        className: 'InventoryTriggerAddItem',
        setupArg: function(attr, value){
            if (this.attributes[attr] && this.attributes[attr] instanceof server.ActionArg){
//                console.log('setup arg', attr, this.attributes[attr].id);
                this.attributes[attr].setup(value);
            }
        },
        _mount: function(dialog, args){
            console.log('mount inventory add ', dialog.get('name'));
            
            var fn = function(ev){
                var count = this.watcher.watch(new server.Counter(ev.count));
                var lastCount = this.watcher.watch(new server.Counter(ev.lastCount));
                
                this.setupArg('target', dialog);
                this.setupArg('itemArg', ev.item);
                this.setupArg('countArg', count);
                this.setupArg('lastCountArg', lastCount);
                
                console.log('add item', ev.count, ev.lastCount);

                this.get('list').run(args);
                
                count.destroy();
                lastCount.destroy();
            };
            
            dialog.on('add-item', fn, this);
            
            return fn;
        },
        _unmount: function(dialog, fn){
            dialog.off('add-item', fn, this);
        }
    });    

    server.InventoryTriggerRemoveItem = server.TriggerClass.extend({
        className: 'InventoryTriggerRemoveItem',
        _mount: function(dialog, args){
            console.log('mount inventory remove ', dialog.get('name'));
            
            var fn = function(ev){
                var count = this.watcher.watch(new server.Counter(ev.count));
                var lastCount = this.watcher.watch(new server.Counter(ev.lastCount));
                
                this.setupArg('target', dialog);
                this.setupArg('itemArg', ev.item);
                this.setupArg('countArg', count);
                this.setupArg('lastCountArg', lastCount);

                this.get('list').run(args);
                
                count.destroy();
                lastCount.destroy();
            };
            
            dialog.on('remove-item', fn, this);
            
            return fn;
        },
        _unmount: function(dialog, fn){
            dialog.off('remove-item', fn, this);
        }
    });    
};