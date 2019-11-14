client.MapMarkerTriggerClickListener = ActionClass.extend({
    className: 'MapMarkerTriggerClickListener',
    init: function(){
        this.on('set:target', function(ev){
            setTimeout(function(){
                if (this.__destroyed__){
                    return;
                }
                
                var mapmarker = ev.value;
                var disable = false;
                var mm = mapmarker.getMapMarker();
                if (!mm){
                    disable = true;
                    return;
                }
                
                mm.onClick(function(){
                    if (disable){
                        return;
                    }

                    console.log('click', mapmarker.id);

                    client.socket.emit('player_click:'+mapmarker.id, {});
                });

                mapmarker.on('destroy', function(){
                    this.destroy();
                    mm.onClick(null);
                }, this);

                this.on('destroy', function(){
                    //google.maps.event.clearListeners(mapmarker, 'click');
                    disable = true;
                }, this);
            }.bind(this), 0);
        }, this);
    }
});
