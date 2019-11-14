var Scheme = zz.Class.extend({
    clearWindows: function(index){
        for (var idx=index;idx<this.fields.length;idx++){
            var collection = this.fields[idx];
            
            collection.removeDOM();
        }
        this.fields.splice(index, this.fields.length);
        
        return this;
    },
    addWindow: function(index, collection, parentDOM, stack){
        if (!index){ index = 0; }
        if (!parentDOM){ parentDOM = null; }
        if (!stack){ stack = {}; }
        
        this.clearWindows(index);
        
        if (index === 0){
            this.DOM.animate({
                scrollTop: "0px",
                scrollLeft: "0px"
            }, 'fast');
        }
        
        var newWindow = new SchemeWindowDOM(this, index, stack);
        newWindow.appendDOM( collection.createFieldDOM(newWindow) );
        
        this.DOMscroll.append(
            newWindow.DOM
        );
        
        if (parentDOM){
            var offset = parentDOM.offset();
            newWindow.DOM.css({marginTop: (offset.top+this.DOM.scrollTop()-77)+'px'});
            if (this.wh.height < this.DOMscroll.height()){
                this.wh.height = this.DOMscroll.height();
                this.DOMscroll.css({minHeight: (this.wh.height)+'px'});
            }
            if (this.wh.width < this.DOMscroll[0].scrollWidth){
                this.wh.width = this.DOMscroll[0].scrollWidth;  
                this.DOMscroll.css({minWidth: (this.wh.width)+'px'});
            }
        }else{
            newWindow.DOM.css({marginTop: '0px'});
        }
        
        this.fields.push(newWindow);
        
        return this;
    },
    initialize: function(DOM){
        this.fields = [];
        this.wh = {width: 0, height: 0};
        this.DOM = DOM;
        this.DOMscroll = DOM.find('.scheme-scroll');
    }
});

var SchemeWindowDOM = zz.Class.extend({
    removeDOM: function(){
        this.childField.SField.off('destroy', null, this);
        
        this.childField.removeDOM();
        
        this.DOM.remove();
    },
    window: function(){
        return this;
    },
    open: function(col, selfDOM, st){
        this.scheme.addWindow(this.index+1, col, selfDOM, $.extend({}, this._stack, st));
    },
    stack: function(){
        return this._stack;
    },
    appendDOM: function(FieldDOM){
        this.childField = FieldDOM;
        
        FieldDOM.SField.on('destroy', function(){
            this.scheme.clearWindows(this.index);
        }, this);
        
        this.DOM.append(FieldDOM.DOM);
    },
    initialize: function(scheme, index, st){
        this.scheme = scheme;
        this.index = index;
        this._stack = st;
        this.childField = null;
        this.DOM = $($templates.find('#SchemeWindowTpl').html());
    }
});

