client.PlayerObject = SyncedData.extend({
    className: 'PlayerObject',
    init: function(){
        console.log('player init');
        
        this.on('set:DialogOpened', function(ev){
            if (ev.value !== null){
                var dialog = ev.value;
                
                client.modal.showModal(dialog.getSchemeField());
            }else{
                client.modal.clearModal();
            }
        });
        
        this.on('set:MapOverlayOpened', function(ev){
            if (ev.value !== null){
                var dialog = ev.value;
                
                client.mapoverlay.showModal(dialog.getSchemeField());
            }else{
                client.mapoverlay.clearModal();
            }
        });
    }
});