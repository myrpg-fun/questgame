client.Text = ActionClass.extend({
    className: 'Text',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            text: this.get('text').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />"),
        });
        
        this.on('set', function(){
            vars.set({
                text: this.get('text').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />"),
            });
        });
        
        return this.destrLsnTimer(new SchemeField('#Text'))
            .linkHtmlValue('.blk-txt', vars, 'text');
    },
});