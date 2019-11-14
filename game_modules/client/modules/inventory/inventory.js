/*var InventoryItemWidth = 13.3;
var InventoryItemHeight = 50;*/
var InventoryItemRelationEmptySchemeField = new SchemeField('#InventoryItemRelationEmpty');

client.InventoryItem = ActionClass.extend({
    className: 'InventoryItem',
});

client.InventoryItemEmpty = ActionClass.extend({
    className: 'InventoryItemEmpty',
});

var InventoryItemIcon = SchemeField.extend({
    initialize: function(icon, resize){
        SchemeField.prototype.initialize.call(this, '#InventoryItemIcon');//, templateId);
        
        var data = (new zz.data()).set({icon: icon});
        
        //this.linkAttributeValue('.blki-icon', 'src', data, 'icon');
        this.link( new ADLinkIcon('.blki-icon', data, 'icon', resize) );
    }
});

client.InventoryItemRelation = ActionClass.extend({
    className: 'InventoryItemRelation',
    getSchemeField: function(x, y, col, pfield, wh){
        if (this.get('x') === x && this.get('y') === y){
            var style = (new zz.data).set({style: ''});
            
            style.set({style: 'position:absolute;'+
                'top:'+this.get('y')*wh.height+'%;left:'+this.get('x')*wh.width+'%;'+
                'width:'+this.get('item').get('x')*wh.width+'%;padding-top: '+this.get('item').get('y')*wh.width+'%'
            });
            
            return this.destrLsnTimer(new SchemeField('#InventoryItem'))
//                .linkAttributeValue('.blki-icon', 'src', this.style, 'icon')
                .linkCollection('.blk-icons', this.iconCollection)
                .linkAttributeValue('.blk-item', 'style', style, 'style')
                .linkAttributeValue('.blki-count', 'style', this.style, 'countstyle')
                .linkTextValue('.blki-count', this, 'count')
                .click('.blk-item', function(x, y, col, DOMfield){
                    pfield.callEventListener('click-xy', {x: x, y: y, selected: function(){
                        DOMfield.DOM.parent().find('.selected').removeClass('selected');
                        DOMfield.DOM.parent().find('.waiting').removeClass('waiting');
                        DOMfield.DOM.addClass('selected');
                    }});
                
                    DOMfield.DOM.parent().find('.selected').removeClass('selected');
                    DOMfield.DOM.parent().find('.waiting').removeClass('waiting');
                    DOMfield.DOM.addClass('waiting');
                }.bind(this, x, y, pfield));
        }
        return InventoryItemRelationEmptySchemeField;
    },
    init: function(){
        this.iconCollection = new SchemeCollection([]);
        
        this.style = (new zz.data).set({style: '', icon: ''});
        var fn = function(){
            if (this.get('item')){
                this.iconCollection.removeAll();
                
                var icon = this.get('item').get('icon');
                icon = (Array.isArray(icon)?icon:[icon]);
                
                icon.forEach(function(i){
                    this.iconCollection.add([
                        new InventoryItemIcon(i, 192*this.get('item').get('x'))
                    ]);
                }, this);
                
                this.style.set({
//                    icon: ,
                    countstyle: (parseInt(this.get('count')) === 1)?'display: none':'display: block'
                });
            }
        };

        this.on('set:x', fn, this);
        this.on('set:y', fn, this);
        this.on('set:count', fn, this);
        this.on('set:item', function(ev){
            if (ev.lastValue){
                ev.lastValue.off('set:icon', fn, this);
            }
            
            if (ev.value){
                ev.value.on('set:icon', fn, this);
            }
            
            fn.apply(this);
        }, this);
    }
});

client.InventoryEmptyRelation = ActionClass.extend({
    className: 'InventoryEmptyRelation',
    getSchemeField: function(x, y, col, pfield, wh){
        var style = (new zz.data).set({style: 'position:absolute;top:'+y*wh.height+'%;left:'+x*wh.width+'%;width:'+wh.width+'%;padding-top: '+wh.width+'%'});
        return this.destrLsnTimer(new SchemeField('#InventoryItemIconEmpty'))
            .linkAttributeValue('.blk-item', 'style', style, 'style')
            .click('.blk-item', function(x, y, pfield){
                pfield.callEventListener('click-xy', {x: x, y: y});
            }.bind(this, x, y, pfield));
    }
});

client.Inventory = ActionClass.extend({
    className: 'Inventory',
    getSFCollection: function(pfield, wh){
        var collection = new SchemeCollection([]);
        
        var colthis = this;
        
        var fn = function(){
            collection.removeAll();
            this.get('collection').forEach(function(col, y){
                collection.add(
                    col.map( function(IIR, x){
                        if (IIR instanceof SyncedData){
                            return IIR.getSchemeField(x, y, colthis, pfield, wh);
                        }
                    })
                );
            });
        }.bind(this);
        
        this.on('set:collection', fn, this);

        fn();
        
        return collection;
    },
    createSchemeField: function(pfield){
        var wh = pfield.getBox();
        
        var st = (new zz.data());
        var y = (wh.maxheight>0)?Math.min(wh.maxheight, parseInt(this.get('y'))):parseInt(this.get('y'));
        wh.height = 100 / y;
        var x = Math.min(100 / wh.width, parseInt(this.get('x')));
        //var w = 25*(6-Math.min(6, Math.max(4, parseInt(this.get('x')))))+100;
        st.set({style: 'padding-top:'+(y*wh.width)+'%;left:'+(50-x*wh.width*0.5)+'%'});
        
        this.on('set:y', function(ev){
            var y = (wh.maxheight>0)?Math.min(wh.maxheight, parseInt(this.get('y'))):parseInt(this.get('y'));
            wh.height = 100 / y;
            var x = Math.min(100 / wh.width, parseInt(this.get('x')));
            //var w = 25*(6-Math.min(6, Math.max(4, parseInt(this.get('x')))))+100;
            st.set({style: 'padding-top:'+(y*wh.width)+'%;left:'+(50-x*wh.width*0.5)+'%'});
        }, this);
        
        return this.destrLsnTimer(new SchemeField('#InventoryCollector'))
            .linkAttributeValue(null, 'style', st, 'style')
            .linkCollection(null, this.getSFCollection(pfield, wh))
        ;
    },
});
