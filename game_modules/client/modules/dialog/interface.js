client.PlayerDialogInterfaceView = ActionClass.extend({
    className: 'PlayerDialogInterfaceView',
    init: function(project){
        var tab = new client.WindowTab(this.get('icon'), this.get('name'));
        
        client.tabs.addTab(tab);
        
        this.on('set:dialog', function(ev){
            if (ev.value !== null){
                var dialog = ev.value;
                
                dialog.afterSync(function(){
                    tab.setSchemeField(dialog.getSchemeField());
                    
                    tab.on('show', function(){
                        dialog.callEventListener('resize');
                    });
                });
            }
        });
        
        this.on('destroy', function(){
            client.tabs.removeTab(tab);
        });
    }
});
