client.MapAreaTriggerClickListener = ActionClass.extend({
    className: 'MapAreaTriggerClickListener',
    init: function(){
        this.on('set:target', function(ev){
            setTimeout(function(){
                var maparea = ev.value;
                var disable = false;
                maparea.getMapArea().addListener('click', function(ev){
                    if (disable){
                        return;
                    }

                    console.log('click', maparea.id);

                    client.socket.emit('player_click:'+maparea.id, {
                        lat: ev.latLng.lat(),
                        lng: ev.latLng.lng()
                    });
                });

                maparea.on('destroy', function(){
                    this.destroy();
                }, this);

                this.on('destroy', function(){
                    //google.maps.event.clearListeners(mapmarker, 'click');
                    disable = true;
                }, this);
            }.bind(this), 0);
        }, this);
    }
});
