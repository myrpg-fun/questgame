var CollectionCounter = 1;

admin.Collection = ActionClass.extend({
    className: 'Collection',
    moduleName: 'Collection',
    cloneAttrs: function(){
        return [];
    },
    getSchemeCollectionField: function(){
        return this.destrLsn(new SchemeField('#CollectionSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.editorBlk;}.bind(this), {mainCollection: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createSchemeField: function(){
        var selected = new zz.data();
        selected.on('set:selected', function(event){
            selected.set({class: event.value?'blk-field flag set':'blk-field flag'});
        }, this);
        
        var ea = function(event){
            if (event.item === this){
                selected.set({selected: true});
            }
        }.bind(this), er = function(event){
            if (event.item === this){
                selected.set({selected: false});
            }
        }.bind(this), es;
        
        var SField = this.destrLsn(new SchemeField('#FlagSelectBlockTpl'))
            .linkTextValue('.blki-name', this, 'name')
            .linkAttributeValue('.blk-field', 'class', selected, 'class')
            .openFieldClick('.link-open', this.editorBlk)
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(this, selected);
            }.bind(this));
                
        SField.on('added-collection', function(event){
            event.target.selectFlagList.on('add', ea);
            event.target.selectFlagList.on('remove', er);
            event.target.selectFlagList.on('set', es = function(selectFlagList, event){
                selected.set({selected: selectFlagList.has(this)});
            }.bind(this, event.target.selectFlagList));
            selected.set({
                selected: event.target.selectFlagList.has(this)
            });
        }, this);
                
        SField.on('removed-collection', function(event){
            event.target.selectFlagList.off('add', ea);
            event.target.selectFlagList.off('remove', er);
            event.target.selectFlagList.off('set', es);
        }, this);
                
        return SField;
    },
    createAttrs: function(project){
        this.set({
            name: 'Коллекция '+CollectionCounter++,
        });
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= CollectionCounter){
            CollectionCounter = digit[0]*1+1;
        }
        
        this.on('before-clone', function(ev){
            var attr = ev.attr;
            var digit = /\d+$/g.exec(attr.name);
            if (digit === null){
                attr.name += ' '+CollectionCounter++;
            }else{
                digit = digit[0];
                attr.name = attr.name.substr(0, attr.name.length - digit.length) + CollectionCounter++;
            }
        }, this);
        
        var editorField = this.destrLsn(new SchemeField('#Collection'))
            .linkInputValue('.blki-name', this, 'name')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));

        this.editorBlk = editorField;
    }
});

