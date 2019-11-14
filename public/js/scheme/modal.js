var ModalDialog = zz.Class.extend({
    clearModal: function(fn){
        if (this.field === null){
            if (fn){
                fn();
            }
            return;
        }
        
        this.DOM.removeClass('hidden').addClass('hidden');

        window.setTimeout(function(){
            if (this.field){
                this.field.removeDOM();
                this.field = null;
                this.DOM.css({
                    display: 'none'
                });
            }
        }.bind(this), 110);
        window.setTimeout(fn, 120);
        
        return this;
    },
    showModal: function(Field){
        this.clearModal(function(){
            var FieldDOM = Field.createFieldDOM();
            
            this.DOM.empty();
            this.DOM.append(FieldDOM.DOM);
            this.DOM.css({
                display: 'block',
                marginLeft: -Math.floor(this.DOM.width()/2)+'px',
                marginTop: -Math.floor(this.DOM.height()/2)+'px'
            });
            this.DOM.removeClass('hidden');
            
            this.field = FieldDOM;
        }.bind(this));
        
        return this;
    },
    initialize: function(DOM){
        this.DOM = DOM;
        this.field = null;
        
        $(document).click(function(event){
            if (this.field !== null && $(event.target).closest(this.DOM).length === 0){
                this.clearModal();
            }
        }.bind(this));
    }
});