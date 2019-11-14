client.PlayerInventoryInterface = ActionClass.extend({
    className: 'PlayerInventoryInterface',
    init: function(project){
        var tab = new client.WindowTab(this.get('icon'), this.get('name'));
        
        client.tabs.addTab(tab);
        
        /*tab.setSchemeField(
            
        );
        
        tab.on('show', function(){
            
        }, this);*/
        
        this.on('destroy', function(){
            client.tabs.removeTab(tab);
        });
    }
});
