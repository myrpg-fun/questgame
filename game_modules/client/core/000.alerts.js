AlertScheme = SchemeField.extend({
    initialize: function(header, message, button, color){
        SchemeField.prototype.initialize.call(this, '#AlertModal');
        
        this.object = new zz.data;
        this.object.set({
            header: header,
            button: button,
            message: message,
            style: 'blk-notify '+color            
        });
        this.fn = null;
        
        this.linkTextValue('.blki-message', this.object, 'message');
        this.linkTextValue('.blki-header', this.object, 'header');
        this.linkAttributeValue('.blk-notify', 'class', this.object, 'style');
        this.linkTextValue('.link-close', this.object, 'button');
        this.click('.link-close', function(DOMfield){
            client.notify.clearModal();
        }.bind(this));
        
        client.notify.showModal(this);
    }
});

client.alert = function(header, message, button, color){
    new AlertScheme(header, message, button, color);
};