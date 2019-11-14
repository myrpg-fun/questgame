client.ModalDialog = zz.Class.extend({
    _showModal: function(){
        if (this.stack.length > 0){
            var FieldDOM = this.stack.shift().createFieldDOM();

            this.DOM.empty();
            this.DOM.append(FieldDOM.DOM);
            this.DOM.css({
                display: 'block'
            });
            this.field = FieldDOM;
            this.DOM.removeClass('hidden').addClass('hidden');
            client.setTimeout(function(){
                this.DOM.removeClass('hidden');
            }.bind(this), 0);
        }
    },
    clearModal: function(fn){
        this.DOM.removeClass('hidden').addClass('hidden');

        client.setTimeout(function(){
            if (this.field){
                this.field.removeDOM();
                this.field = null;
                this.DOM.css({
                    display: 'none'
                });
            }
            
            this._showModal();
        }.bind(this), 100);
        
        return this;
    },
    showModal: function(Field){
        this.stack.push(Field);
        
        if (this.field === null){
            this._showModal();
            return;
        }
        
        if (this.useStack === false){
            this.clearModal();
        }
        
        return this;
    },
    initialize: function(DOM, useStack){
        this.DOM = DOM;
        this.DOM.css({
            display: 'none'
        });
        this.field = null;
        this.stack = [];        
        this.useStack = useStack;
        
        /*$(document).click(function(event){
            if (this.field !== null && $(event.target).closest(this.DOM).length === 0){
                this.clearModal();
            }
        }.bind(this));*/
    }
});