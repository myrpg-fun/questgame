AlertScheme = SchemeField.extend({
    alert: function(header, message, button, fn){
        this.object.set({
            header: header,
            button: button,
            message: message
        });
        this.fn = fn;
        
        admin.global.ModalDialog.showModal(this);
    },
    initialize: function(){
        SchemeField.prototype.initialize.call(this, '#AlertModalTpl');
        
        this.object = new zz.data;
        this.object.set({
            header: '',
            button: '',
            message: ''
        });
        this.fn = null;
        
        this.linkTextValue('.blki-message', this.object, 'message');
        this.linkTextValue('.blki-header', this.object, 'header');
        this.linkTextValue('.link-close', this.object, 'button');
        this.click('.link-close', function(DOMfield){
            if (this.fn){
                this.fn();
            }
            
            admin.global.ModalDialog.clearModal();
        }.bind(this));
    }
});

var _alertModalS = new AlertScheme();
admin.alert = function(header, message, button, fn){
    _alertModalS.alert(header, message, button, fn);
};