client.PlayerMapInterface = ActionClass.extend({
    className: 'PlayerMapInterface',
    init: function(project){
        var tab = new client.WindowTab(this.get('icon'), this.get('name'));
        
        client.tabs.addTab(tab);
        
        this.on('set:map', function(){
            this.get('style').waitItem(function(){
                this.get('map').setStyle(this.get('style'));
            }.bind(this));

            tab.setSchemeField(
                this.get('map').getSchemeField()
            );

            tab.on('show', function(){
                this.get('map').resize();
                this.get('map').setPlayerCenter();
            }, this);

            tab.on('click', function(){
                this.get('map').setPlayerCenter();
            }, this);
        }, this);
        
        this.on('destroy', function(){
            client.tabs.removeTab(tab);
        });
    }
});
