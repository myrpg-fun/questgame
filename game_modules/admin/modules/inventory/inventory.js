var InventoryCounter = 1;
var InventoryItemWidth = 48;
var InventoryItemRelationEmptySchemeField = new SchemeField('#InventoryItemRelationEmpty');

admin.InventoryItemRelation = ActionClass.extend({
    className: 'InventoryItemRelation',
    moduleName: 'Inventory',
    removeItem: function(col){
        var lastItem = this.get('item');
        var col = this.get('collection');
        if (col){
            col.removeItem(this.get('x'), this.get('y'), lastItem.get('x'), lastItem.get('y'));
            this.set({collection: null});
        }
    },
    _setCollection: function(col){
        this.set({collection: col});
    },
    getSchemeField: function(x, y, col){
        if (this.get('x') === x && this.get('y') === y){
            var item = this.get('item');
            return this.destrLsn(new SchemeField(item.templateName))
//                .linkAttributeValue('.blki-icon', 'src', item, 'icon')
                .link( new ADLinkIcon('.blki-icon', item, 'icon') )
                .linkAttributeValue('.blk-iconbox', 'style', item.style, 'style')
                .linkAttributeValue('.blk-item', 'style', this.style, 'style')
                .linkInputInteger('.blki-count', this, 'count')
                .openFieldClick('.blk-item', admin.fields.InventoryItemCollection, {onSelect: function(item){
                    var lastItem = this.get('item');
                    if (item.get('x') + this.get('x') > col.get('x') || item.get('y') + this.get('y') > col.get('y')){
                        //error
                        return;
                    }
                    
                    col.removeItem(this.get('x'), this.get('y'), lastItem.get('x'), lastItem.get('y'));
                    col.clearPlace(this.get('x'), this.get('y'), item.get('x'), item.get('y'));
                    if (!(item instanceof admin.InventoryItemEmpty)){
                        col.placeItem(this.watcher.watch(new admin.InventoryItemRelation(item, x, y, col)), this.get('x'), this.get('y'), item.get('x'), item.get('y'));
                        this.destroy();
                    }
                }.bind(this)});
        }
        return InventoryItemRelationEmptySchemeField;
    },
    createAttrs: function(project){
        this.set( this._init );
    },
    init: function(){
        this.style = (new zz.data()).set({style: 'position:absolute;top:'+this.get('y')*InventoryItemWidth+'px;left:'+this.get('x')*InventoryItemWidth+'px'});
        
        this.on('set:x', function(){
            this.style.set({style: 'position:absolute;top:'+this.get('y')*InventoryItemWidth+'px;left:'+this.get('x')*InventoryItemWidth+'px'})
        }, this);
        
        this.on('set:y', function(){
            this.style.set({style: 'position:absolute;top:'+this.get('y')*InventoryItemWidth+'px;left:'+this.get('x')*InventoryItemWidth+'px'})
        }, this);
        
        var item = this.get('item');
        
        item.afterSync(function(){
            item.on('set:x', function(ev){
                var col = this.get('collection');
                if (col && ev.lastValue){
                    col.removeItem(this.get('x'), this.get('y'), ev.lastValue, item.get('y'));
                    col.clearPlace(this.get('x'), this.get('y'), ev.value, item.get('y'));
                    col.placeItem(this, this.get('x'), this.get('y'), ev.value, item.get('y'));
                    this.set({collection: col});
                }
            }, this);

            item.on('set:y', function(ev){
                var col = this.get('collection');
                if (col && ev.lastValue){
                    col.removeItem(this.get('x'), this.get('y'), item.get('x'), ev.lastValue);
                    col.clearPlace(this.get('x'), this.get('y'), item.get('x'), ev.value);
                    col.placeItem(this, this.get('x'), this.get('y'), item.get('x'), ev.value);
                    this.set({collection: col});
                }
            }, this);
            
            item.on('destroy', function(){
                var col = this.get('collection');
                if (col){
                    col.removeItem(this.get('x'), this.get('y'), item.get('x'), item.get('y'));
                }
            }, this);
        }.bind(this));
    },
    initialize: function(item, x, y, col){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {item: item, x: x*1, y: y*1, count: 1, collection: col};
    }
});

admin.InventoryEmptyRelation = ActionClass.extend({
    className: 'InventoryEmptyRelation',
    moduleName: 'Inventory',
    removeItem: function(){},
    createAttrs: function(project){},
    getSchemeField: function(x, y, col){
        var item = admin.global.InventoryItemEmpty;
        var style = (new zz.data).set({style: 'position:absolute;top:'+y*InventoryItemWidth+'px;left:'+x*InventoryItemWidth+'px'});
        return this.destrLsn(new SchemeField(item.templateName))
            .linkAttributeValue('.blk-item', 'style', style, 'style')
            .linkAttributeValue('.blki-icon', 'style', item.style, 'style')
            .openFieldClick('.blk-item', admin.fields.InventoryItemCollection, {onSelect: function(item){
                if (!(item instanceof admin.InventoryItemEmpty)){
                    col.clearPlace(x, y, item.get('x'), item.get('y'));
                    col.placeItem(this.watcher.watch(new admin.InventoryItemRelation(item, x, y, col)), x, y, item.get('x'), item.get('y'));
                }
            }.bind(this)});
    }
});

admin.Inventory = ActionClass.extend({
    className: 'Inventory',
    moduleName: 'Inventory',
    getSFCollection: function(){
        var collection = new SchemeCollection([]);
        
        var colthis = this;
        
        var fn = function(){
            collection.removeAll();
            this.get('collection').forEach(function(col, y){
                collection.add(
                    [makeSchemeFieldList(
                        new SchemeCollection( col.map( function(IIR, x){
                            return IIR.getSchemeField(x, y, colthis);
                        }) )
                    )]
                );
            });
        };
        
        this.on('change', fn, this);

        collection.removeAll();
        window.setTimeout(function(){
            this.get('collection').forEach(function(col, y){
                collection.add(
                    [makeSchemeFieldList(
                        new SchemeCollection( col.map( function(IIR, x){
                            return IIR.getSchemeField(x, y, colthis);
                        }) )
                    )]
                );
            });        
        }.bind(this), 0);
        
        return collection;
    },
    cloneAttrs: function(){
        return ['triggerList'];
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#InventorySelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainDialog: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            name: 'Инвентарь '+InventoryCounter++,
/*            collector: project.watch(
                new admin.InventoryCollector(1, 1)
            ),*/
            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.InvetoryAllFlag])
            ),
//            arg: project.watch(new admin.ActionArg('Инвентарь', 'Inventory')),
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
        
        admin.global.InvetoryAllFlag.add([this]);

        var col = [];
        for (var i=0; i<1; i++){
            var a = [];
            for (var j=0; j<1; j++){
                a.push(admin.global.InventoryEmptyRelation);
            }
            col.push(a);
        }
        
        this.set({
            x: 1,
            y: 1,
            collection: col
        });
    },
    getWatchedEvents: function(){
        return ['set', 'change'];
    },
    removeItem: function(x, y, ix, iy){
        var col = this.get('collection');
        for(var j = 0; j < ix; j++){
            for(var i = 0; i < iy; i++){
                col[i+y][j+x] = admin.global.InventoryEmptyRelation;
            }
        }
        
        this.callEventListener('change', {target: this});
    },
    clearPlace: function(x, y, ix, iy){
        var col = this.get('collection');
        for(var j = 0; j < ix; j++){
            for(var i = 0; i < iy; i++){
                col[i+y][j+x].removeItem(this);
            }
        }
        
        this.callEventListener('change', {target: this});
    },
    placeItem: function(iir, x, y, ix, iy){
        var col = this.get('collection');
        for(var j = 0; j < ix; j++){
            for(var i = 0; i < iy; i++){
                col[i+y][j+x] = iir;
            }
        }
        
        this.callEventListener('change', {target: this});
    },
    init: function(project){
        this.style = (new zz.data()).set({style: 'height:'+(this.get('y')*InventoryItemWidth+20)+'px'});
        
        this.on('after-clone', function(ev){
            ev.clone.set({
                collection: ev.attr.collection.map(function(col){
                    var ncol = col.slice(0);

                    for (var i=0; i<ncol.length; i++){
                        if (!(ncol[i] instanceof admin.InventoryEmptyRelation)){
                            ncol[i] = ncol[i].clone();
                            ncol[i]._setCollection(ev.clone);
                        }
                    }

                    return ncol;
                })
            });
        }, this);
        
        this.on('set:x', function(ev){
            if (typeof ev.lastValue === 'undefined'){
                return;
            }
            var x = parseInt(ev.value);
            var nx = x;
            var y = this.get('y');
            var col = this.get('collection');
            var lx = col[0].length;
            
            if (isNaN(x)){
                x = 1;
            }
            if (x < 1){
                x = 1;
            }
            if (x > 40){
                x = 40;
            }
            
            if (nx !== x){
                this.set({x: x});
                return;
            }
            
            if (x > lx){
                //increment
                for (var j=0; j<y; j++){
                    var a = col[j];
                    for (var i=lx; i<x; i++){
                        a.push(admin.global.InventoryEmptyRelation);
                    }
                }
            }else{
                //decrement
                for (var j=0; j<y; j++){
                    for (var i=x; i<lx; i++){
                        col[j][i].removeItem(this);
                    }
                    col[j].splice(x, lx - x);
                }
            }
                
            this.callEventListener('change', {target: this});
        }, this);
        
        this.on('set:y', function(ev){
            var ny, y = parseInt(ev.value);
            ny = y;
            this.style.set({style: 'height:'+(y*InventoryItemWidth+20)+'px'});
            if (typeof ev.lastValue === 'undefined'){
                return;
            }
            var x = this.get('x');
            var col = this.get('collection');
            var ly = col.length;
            if (isNaN(y)){
                y = 1;
            }
            if (y < 1){
                y = 1;
            }
            if (y > 40){
                y = 40;
            }

            if (ny !== y){
                this.set({y: y});
                return;
            }
            
            if (y > ly){
                //increment
                for (var i=ly; i<y; i++){
                    var a = [];
                    for (var j=0; j<x; j++){
                        a.push(admin.global.InventoryEmptyRelation);
                    }
                    col.push(a);
                }
            }else{
                //decrement
                for (var i=y; i<ly; i++){
                    for (var j=0; j<x; j++){
                        col[i][j].removeItem(this);
                    }
                }
                
                col.splice(y, ly - y);
            }
                
            this.callEventListener('change', {target: this});
        }, this);
        
        this.on('set:collection', function(){
            this.callEventListener('change', {target: this}, 'sync');
        });
        
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= InventoryCounter){
            InventoryCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        var triggerList = this.get('triggerList');
        //var collector = this.get('collector');
        
        project.afterSyncItem("InventoryFlagsList", function(InventoryFlagsList){
            project.afterSync([flagList, triggerList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                this.on('before-clone', function(ev){
                    ev.attr.flagList = this.watcher.watch(
                        new admin.FlagCollectionList([])
                    );
                }, this);

                this.on('after-clone', function(ev){
                    var flagList = ev.clone.get('flagList');
                    this.get('flagList').forEach(function(flag){
                        flagList.add([flag]);
                    }, this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    InventoryFlagsList.createButtonField('Создать коллекцию'),
                    InventoryFlagsList.createSchemeField(flagList)
                ]) ));

                var editorField = this.destrLsn(new SchemeField('#Inventory'))
                    .linkInputInteger('.blki-x', this, 'x')
                    .linkInputInteger('.blki-y', this, 'y')
                    .linkInputValue('.blki-name', this, 'name')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
                    .linkCollection('.blk-scrollx', this.getSFCollection())
                    .linkAttributeValue('.blk-scrollx', 'style', this.style, 'style');

                this.editorBlk = this.destrLsn(makeSchemeFieldList(new SchemeCollection([
                    editorField,
                    triggerList.createButtonField('Триггеры', admin.fields.NewInventoryTriggers),
                    triggerList.getSchemeField()
                ])));
            }.bind(this));
        }.bind(this));
    }
});
