module.exports = function (server){
    server.InventoryItem = server.ActionClass.extend({
        className: 'InventoryItem',
        wbpSent: true,
        setIcon: function(icon){
            this.set({
                icon: [icon]
            });
        },
        addIcon: function(icon){
            var i = this.get('icon');
            i = Array.isArray(i)?[].concat(i):[i];
            if (i.indexOf(icon) === -1){
                i.push(icon);

                this.set({
                    icon: i
                });
            }
        },
        removeIcon: function(icon){
            var i = this.get('icon');
            var k = i.indexOf(icon);
            
            if (i.length > 1 && k !== -1){
                i.splice(k, 1);
                
                this.callEventListener('set', {
                    attribute: 'icon', value: i, lastValue: i, target: this
                });
                this.callEventListener('set:icon', {
                    attribute: 'icon', value: i, lastValue: i, target: this
                });
            }
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            var lsnr = new zz.storeEvents(this);
            
            this.on('watch-player', function(ev){
                ev.watcher.watch(this.get('icon'));
                
                lsnr.on(ev.player.id, 'set:icon', function(e){
                    if (e.lastValue){
                        ev.watcher.unwatch(e.lastValue);
                    }
                    
                    if (e.value){
                        ev.watcher.watch(e.value);
                    }
                }, this);
            }, this);
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(this.get('icon'));
                
                lsnr.off(ev.player.id);
            }, this);
        }
    });
    
    server.InventoryItemEmpty = server.InventoryItem.extend({
        className: 'InventoryItemEmpty',
        wbpSent: true,
        clone: function(){
            return this;
        }
    });
    
    server.InventoryItemRelation = server.ActionClass.extend({
        className: 'InventoryItemRelation',
        wbpSent: true,
        getItem: function(){
            return this.get('item');
        },
        getCount: function(){
            return this.get('count')*1;
        },
        removeCount: function(count){
            var c = this.get('count');
            
            if (c > count){
                this.set({count: c-count});
                
                return 0;
            }else{
                this.removeItem();
                
                return count - c;
            }
        },
        addCount: function(count){
            var c = this.get('count');
            var max = this.get('item').get('max')*1;
            
            if (max === 0 || c + count <= max){
                this.set({count: c + count});
                
                return 0;
            }else{
                this.set({count: max});
                
                return count + c - max;
            }
        },
        removeItem: function(){
            var item = this.get('item');
            var col = this.get('collection');
            if (col){
                col.fillSpace(this.watcher.getItem('InventoryEmptyRelation'), this.get('x'), this.get('y'), item.get('x'), item.get('y'));
                this.set({collection: null});
                this.destroy();
            }
        },
        init: function(){
            this.on('watch-player', function(ev){
                ev.watcher.watch(this.get('item'));
            }, this);
        },
        _setCollection: function(col){
            this.set({collection: col});
        },
        createAttrs: function(project){
            this.set( this._init );
        },
        initialize: function(item, x, y, col){
            server.ActionClass.prototype.initialize.apply(this, arguments);

            this._init = {item: item, x: x*1, y: y*1, count: 1, collection: col};
        }
    });
    
    server.InventoryEmptyRelation = server.ActionClass.extend({
        className: 'InventoryEmptyRelation',
        wbpSent: true,
        clone: function(){
            return this;
        },
        getItem: function(){
            return this.watcher.getItem('InventoryItemEmpty');
        },
        getCount: function(){
            return 0;
        }
    });
    
    server.Inventory = server.ActionClass.extend({
        className: 'Inventory',
        wbpSent: true,
        getWatchedEvents: function(){
            return ['set', 'fill', 'remove-attribute'];
        },
        getAllItems: function(){
            var result = {};
            var col = this.get('collection');
            for (var y = 0; y < col.length; y++){
                for (var x = 0; x < col[y].length; x++){
                    var rel = col[y][x];
                    if (!(rel instanceof server.InventoryEmptyRelation)){
                        var item = rel.getItem();
                        if (result[item.id]){
                            result[item.id].count += rel.getCount();
                        }else{
                            result[item.id] = {count: rel.getCount(), item: item};
                        }
                    }
                }
            }
            
            return result;
        },
        getItemByXY: function(x, y){
            var col = this.get('collection');
            if (col[y] && col[y][x]){
                return col[y][x];
            }
            
            return null;
        },
        fillSpace: function(rel, ix, iy, il, ih){
            var col = this.get('collection');
            var lastCount = this.get('lastCount');
            for (var y = iy; y < iy+ih; y++){
                for (var x = ix; x < ix+il; x++){
                    lastCount += 
                        (rel instanceof server.InventoryEmptyRelation)?
                            (col[y][x] instanceof server.InventoryEmptyRelation?0:1):
                            (col[y][x] instanceof server.InventoryEmptyRelation?-1:0)
                    ;
                    
                    col[y][x] = rel;
                }
            }
            
            this.set({
                lastCount: lastCount
            });
            
            this.callEventListener('fill', {target: this, relitem: rel, ix: ix, iy: iy, il: il, ih: ih});
        },
        addItem: function(item, count){
            var addcount = count;
            if (item instanceof server.InventoryItemEmpty){
                return false;
            }
            
            var il = item.get('x'), ih = item.get('y'), max = item.get('max')*1;
            var col = this.get('collection');
            for (var y = 0; y <= col.length - ih; y++){
                for (var x = 0; x <= col[y].length - il; x++){
                    var irr = col[y][x];
                    if (irr instanceof server.InventoryEmptyRelation){
                        emptytest:{
                            for (var yy = y; yy < y+ih; yy++){
                                for (var xx = x; xx < x+il; xx++){
                                    if (!(col[yy][xx] instanceof server.InventoryEmptyRelation)){
                                        break emptytest;
                                    }
                                }
                            }
                            
                            irr = this.watcher.watch(new server.InventoryItemRelation(item, x, y, this));
                            count = irr.addCount(count - 1);
                            this.fillSpace(irr, x, y, il, ih);
                        }
                    }else if (irr.getItem() === item && (max === 0 || irr.getCount() < max)){
                        count = irr.addCount(count);
                    }
                    
                    if (count <= 0){
                        this.callEventListener('add-item', {
                            target: this, item: item, count: addcount, lastCount: this.get('lastCount')
                        });
                        return true;
                    }
                }
            }
            
            return false;
        },
        countItem: function(item){
            var count = 0;
            
            var il = item.get('x'), ih = item.get('y');
            var col = this.get('collection');
            for (var y = 0; y <= col.length - ih; y++){
                for (var x = 0; x <= col[y].length - il; x++){
                    var irr = col[y][x];
                    if (irr.getItem() === item){
                        count += irr.getCount();
                    }
                }
            }
            
            return count;
        },
        removeItem: function(item, count){
            var deccount = count;
            if (item instanceof server.InventoryItemEmpty){
                return false;
            }
            
            var places = {};
            var col = this.get('collection');
            for (var y = col.length-1; y >= 0; y--){
                for (var x = col[y].length-1; x >= 0; x--){
                    var irr = col[y][x];
                    if (!(irr instanceof server.InventoryEmptyRelation) && irr.getItem() === item && !places[irr.id]){
                        places[irr.id] = irr;
                    }
                }
            }

            if (Object.keys(places).length > 0){
                if (count === -1){//remove all
                    for (var i in places){
                        places[i].removeCount( places[i].getCount() );
                    }
                }else{
                    for (var i in places){
                        count = places[i].removeCount(count);
                        if (count <= 0){
                            break;
                        }
                    }
                }

                this.callEventListener('remove-item', {target: this, count: deccount, item: item, lastCount: this.get('x')*this.get('y') - this.get('lastCount')});
            }
            
            return true;
        },
        init: function(){
            var wts = {};
            this.on('watch-player', function(ev){
                var watcher = ev.watcher;
                if (!wts[watcher.id]){
                    this.get('collection').forEach(function(col){
                        watcher.watch(col);
                    }, this);
                
                    wts[watcher.id] = {
                        fill: function(el){
                            console.log('on fill');
                            watcher.watch(el.relitem);
                        },
                        change: function(el){
                            console.log('on change');
                            el.value.forEach(function(col){
                                watcher.watch(col);
                            }, this);
                        }
                    };

                    this.on('fill', wts[watcher.id].fill, this);
                    this.on('set:collection', wts[watcher.id].change, this);
                }
            }, this);
            
            this.get('triggerList').afterSync(function (){
                this.get('triggerList').mount({target: this});
            }.bind(this));
            
            this.on('unwatch-player', function(ev){
                var watcher = ev.watcher;
                if (wts[watcher.id]){
                    this.get('collection').forEach(function(col){
                        watcher.unwatch(col);
                    }, this);

                    this.off('fill', wts[watcher.id].fill);
                    this.off('set:collection', wts[watcher.id].change);
                    
                    delete wts[watcher.id];
                }
            }, this);
            
            this.on('before-clone', function(ev){
                ev.attr.collection = ev.attr.collection.map(function(col){
                    var ncol = col.slice(0);

                    for (var i=0; i<ncol.length; i++){
                        if (!(ncol instanceof server.InventoryEmptyRelation)){
                            ncol[i] = ncol[i].clone();
                        }
                    }

                    return ncol;
                });                
            }, this);
            
            var lastCount = 0;
            var col = this.get('collection');
            for (var y = col.length-1; y >= 0; y--){
                for (var x = col[y].length-1; x >= 0; x--){
                    var irr = col[y][x];
                    if (irr instanceof server.InventoryItemRelation){
                        irr._setCollection(this);
                    }else{
                        lastCount++;
                    }
                }
            }

            this.set({
                lastCount: lastCount
            });
            
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
/*            this.on('watch-player', function(ev){
                ev.watcher.watch(this.get('collector'));
            }, this);
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(this.get('collector'));
            }, this);*/
            
            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new server.FlagCollectionList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);
        },
    });
};