module.exports = function (server){
    server.MapStyleList = server.SyncedList.extend({
        className: 'MapStyleList',
        wbpSent: false
    });    

    server.MapStyle = server.SyncedList.extend({
        className: 'MapStyle',
        wbpSent: true,
        init: function(){
            this.on('watch-player', function(ev){
                if (this.get('effectsList')){
                    ev.watcher.watch(this.get('effectsList'));
                }
            });
            
            this.on('unwatch-player', function(ev){
                if (this.get('effectsList')){
                    ev.watcher.unwatch(this.get('effectsList'));
                }
            });
        }
    });    

    server.MapStyleDefault = server.MapStyle.extend({
        className: 'MapStyleDefault'
    });
    
    server.MapStyleEffectsList = server.SyncedList.extend({
        className: 'MapStyleEffectsList',
        wbpSent: true,
        init: function(){
            this.on('watch-player', function(ev){
                ev.watcher.watch(this.getCollection());
            });
            
            this.on('unwatch-player', function(ev){
                ev.watcher.unwatch(this.getCollection());
            });
        }
    });    
    
    server.MapStyleEffectGlitchBlur = server.SyncedData.extend({
        className: 'MapStyleEffectGlitchBlur',
        wbpSent: true
    });    
    
    server.MapStyleEffectGlitch = server.SyncedData.extend({
        className: 'MapStyleEffectGlitch',
        wbpSent: true
    });    
    
    server.MapStyleEffectBlur = server.SyncedData.extend({
        className: 'MapStyleEffectBlur',
        wbpSent: true
    });
    
    server.MapStyleEffectImageBlend = server.SyncedData.extend({
        className: 'MapStyleEffectImageBlend',
        wbpSent: true
    });    
};