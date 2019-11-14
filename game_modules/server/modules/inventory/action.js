module.exports = function (server){
    server.InventoryItemCloneAction = server.ActionClass.extend({
        className: 'InventoryItemCloneAction',
        run: function(){
            console.log('Item clone action', this.get('name'));
            
            var clone = this.get('item').clone();
            
            this.setupArg('arg', clone);
        }
    });

    server.InventoryRandomSelectAction = server.ActionClass.extend({
        className: 'InventoryRandomSelectAction',
        init: function(){
            if (this.get('counter') === undefined){
                this.set({
                    counter: this.watcher.watch(new server.Counter(0))
                });
            }
        },
        run: function(){
            console.log('random select item action');
            
            var items = this.get('inventory').getAllItems();
            var k = Object.keys(items);
            
            if (k.length > 0){
                var countObject = this.get('countObject'), count;

                if (countObject){
                    if (countObject instanceof server.Counter){
                        count = countObject.getCount();
                    }else{
                        count = countObject;
                    }
                }else if (countObject === null){
                    count = this.get('count')*1;
                }else if (countObject === false){
                    k.forEach(function(i){
                        this.get('counter').setCount(items[i].count);
                        this.setupArg('itemarg', items[i].item);
                        this.setupArg('countarg', this.get('counter'));

                        this.get('action').run();
                    }, this);

                    return;
                }

                if (k.length < count){
                    count = k.length;
                }

                if (this.get('useall')){
                    var countall = 0;
                    for (var i in items){
                        countall = countall + items[i].count;
                    }

                    for (var j = 0; j<count; j++){
                        var r = Math.floor(Math.random()*(countall));

//                        console.log('random', r, countall);

                        for (var i in items){
                            r = r - items[i].count;
                            if (r < 0){
                                k.splice( k.indexOf(i), 1 );
                                this.get('counter').setCount(items[i].count);
                                this.setupArg('itemarg', items[i].item);
                                this.setupArg('countarg', this.get('counter'));
                        
                                this.get('action').run();
                                
                                countall -= items[i].count;
                                delete items[i];
                                break;
                            }
                        }
                    }
                }else{
                    for (var i = 0; i<count; i++){
                        var key = k.splice(Math.floor(Math.random()*(k.length)), 1)[0];
                        var item = items[key];
                        this.get('counter').setCount(item.count);
                        this.setupArg('itemarg', item.item);
                        this.setupArg('countarg', this.get('counter'));
                        
                        this.get('action').run();
                    }
                }
            }
        }
    });

    server.InventoryAddItemAction = server.ActionClass.extend({
        className: 'InventoryAddItemAction',
        run: function(){
            console.log('add item action');
            
            var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('counter');
            }
            
            //console.error("Inventory add", this.get('inventory').id, this.get('inventory').get('name'), this.get('item').id, this.get('item').get('name'), count, Math.floor(count));
            var can = this.get('inventory').addItem(this.get('item'), Math.floor(count));
            if (can){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });

    server.InventoryTestItemAction = server.ActionClass.extend({
        className: 'InventoryTestItemAction',
        run: function(){
            console.log('test item action');
            
            var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('counter');
            }
            
            //console.error("Inventory add", this.get('inventory').id, this.get('inventory').get('name'), this.get('item').id, this.get('item').get('name'), count, Math.floor(count));
            var can = this.get('inventory').countItem(this.get('item'));
            if (can >= Math.floor(count)){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });

    server.InventoryRemoveItemAction = server.ActionClass.extend({
        className: 'InventoryRemoveItemAction',
        run: function(){
            console.log('remove item action');
            
            var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('counter');
            }
            
            //console.error("Inventory remove", this.get('inventory').id, this.get('inventory').get('name'), this.get('item').id, this.get('item').get('name'), count, Math.floor(count));
            this.get('inventory').removeItem(this.get('item'), Math.floor(count));
        }
    });

    server.InventoryItemSetIconAction = server.ActionClass.extend({
        className: 'InventoryItemSetIconAction',
        run: function(){
            var icon = this.get('icon');
            
/*            if (icon instanceof server.MapMarkerIcon){
                icon = icon.get('url');
            }*/
            
            if (this.get('add')){
                console.log('set inventory item add icon', icon);
                this.get('item').addIcon(icon);
            }else{
                console.log('set inventory item set icon', icon);
                this.get('item').setIcon(icon);
            }
        }
    });
};