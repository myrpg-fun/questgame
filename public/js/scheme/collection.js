var SchemeCollectionDOM = zz.Class.extend({
    window: function(){
        return this.parent.window();
    },
    add: function(event){
        event.array.forEach(function(field){
            if (field){
                var fieldDOM = field.createFieldDOM(this);

                this._collectionDOM.push( fieldDOM );
                this.DOM.append( fieldDOM.DOM );
            }
        }, this);
    },
    remove: function(event){
        this._collectionDOM.forEach(function(field, index){
            if (event.field === field.SField && event.index === index){
                var fieldDOM = this._collectionDOM.splice(index, 1);
                fieldDOM[0].removeDOM();
                
                return true;
            }
        }, this);
    },
    sortSC: function(event){
        this.sort(event, function(a, b){ return a === b.SField; });
    },
    sort: function(event, testFn){
        var FCollection = event.sorted;
        for (var dc = 0; dc < this._collectionDOM.length; dc++){
            for (var fc = dc; fc < FCollection.length; fc++){
                if (testFn(FCollection[fc], this._collectionDOM[dc])){
                    if (dc !== fc){
                        this._collectionDOM.splice(dc, 0, this._collectionDOM.splice(fc, 1)[0]);
                    }                    
                    break;
                }
            }
        }
        
        this._collectionDOM.forEach(function(fieldDOM){
            this.DOM.append( fieldDOM );
        }, this);
    },
    removeDOM: function(){
        this.SCollection.clearEventListener('add', this.add, this);
        this.SCollection.clearEventListener('remove', this.remove, this);
        this.SCollection.clearEventListener('sort', this.sortSC, this);

        this._collectionDOM.forEach(function(fieldDOM){
            fieldDOM.removeDOM();
        });       
        
        this.DOM.remove();
    },
    createDOM: function(){
        this.SCollection.addEventListener('add', this.add, this);
        this.SCollection.addEventListener('remove', this.remove, this);
        this.SCollection.addEventListener('sort', this.sortSC, this);
    },
    initialize: function(SCollection, DOM, PField){
        this.SCollection = SCollection;
        this._collectionDOM = [];
        this.DOM = DOM;
        this.parent = PField;
        
        this.createDOM();
        
        this.add({
            array: SCollection.getCollection()
        });
    }
});

var SchemeCollection = zz.event.extend({
    _removeDestroyedObject: function(event){
        this.remove(event.destroyed);
    },
    add: function(dataArray){
        dataArray.forEach(function(field){
            if (!field){
                return;
            }
            
            if (!(field instanceof SchemeField)){
                console.error('Adding not SchemeField instance');
            }
            
            field.on('destroy', this._removeDestroyedObject, this);
            field.callEventListener('added-collection', {target: this, field: field});
            this._collection.push(field);
        }, this);
        
        this.callEventListener('add', {target: this, array: dataArray});
    },
    remove: function(field){
        this._collection.forEach(function(fld, idx){
            if (field === fld){
                this.callEventListener('remove', {target: this, field: fld, index: idx});
                field.callEventListener('removed-collection', {target: this, field: fld, index: idx});
                field.off('destroy', this._removeDestroyedObject);
                
                this._collection.splice(idx, 1);
                
                return true;
            }
        }, this);
    },
    removeAll: function(){
        for (var idx = this._collection.length-1; idx>=0; idx--){
            this.callEventListener('remove', {target: this, field: this._collection[idx], index: idx});
        };
        
        this._collection = [];
    },
    sort: function(event, testFn){
        var FCollection = event.sorted;
        var sorted = false;
        for (var dc = 0; dc < this._collection.length; dc++){
            for (var fc = dc; fc < FCollection.length; fc++){
                if (testFn(FCollection[fc], this._collection[dc])){
                    if (dc !== fc){
                        this._collection.splice(dc, 0, this._collection.splice(fc, 1)[0]);
                        sorted = true;
                    }                    
                    break;
                }
            }
        }
        
        if (sorted){
            this.callEventListener('sort', {target: this, sorted: this._collection});
        }
    },
    remap: function(maparray){
        var self = this;        
        this._collection = maparray.map(function(el){
            return self._collection[el];
        });        
        
        this.callEventListener('sort', {target: this, sorted: this._collection});
    },
    forEach: function(fn, self){
        return this._collection.forEach(fn, self);
    },
    count: function(){
        return this._collection.length;
    },
    getCollection: function(){
        return this._collection;
    },
    createCollectionDOM: function(DOM, PField){
        return new SchemeCollectionDOM(this, DOM, PField);
    },
    initialize: function(dataArray){
        zz.event.prototype.initialize.apply(this, arguments);
        
        this._collection = [];
        
        this.add(dataArray);
    }
});

var SchemeCollectionUserSortDOM = SchemeCollectionDOM.extend({
    add: function(event){
        SchemeCollectionDOM.prototype.add.apply(this, arguments);
        try{
            this.DOM.sortable( "refresh" );
        }catch(e){
            console.error(e);
        }
    },
    remove: function(event){
        SchemeCollectionDOM.prototype.remove.apply(this, arguments);
        try{
            this.DOM.sortable( "refresh" );
        }catch(e){
            console.error(e);
        }
    },
    sort: function(event){
        SchemeCollectionDOM.prototype.sort.apply(this, arguments);
        try{
            this.DOM.sortable( "refresh" );
        }catch(e){
            console.error(e);
        }
    },
    createDOM: function(){
        SchemeCollectionDOM.prototype.createDOM.apply(this, arguments);
        this.sortableInit();
    },
    sortableInit: function(){
        var startIndex;
        var self = this;
        var collection = this.SCollection;
        this.DOM.sortable({
            placeholder: "blk-block-state-highlight",
            items: "> div.blk-block.sortable, div.blk-list.sortable",
            start: function(e, ui){
                ui.placeholder.height(ui.item.height());
                startIndex = ui.item.index();
            },
            update: function(e, ui) { 
                var end = ui.item.index();

                var newmap = self._collectionDOM.map(function(v, i){
                    return i;
                });
                newmap.splice(end, 0, newmap.splice(startIndex, 1)[0]);

                collection.remap(newmap);
            },
            handle: "div.blk-header"
        }).disableSelection();
    }
});

var SchemeCollectionUserSort = SchemeCollection.extend({
    createCollectionDOM: function(DOM, PField){
        return new SchemeCollectionUserSortDOM(this, DOM, PField);
    }
});