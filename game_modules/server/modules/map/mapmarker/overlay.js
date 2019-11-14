var zz = require('./../../../zz');

module.exports = function (server){
    server.MapMarkerOverlayTextView = server.ActionClass.extend({
        className: 'MapMarkerOverlayTextView',
        wbpSent: true,
        update: function(){
            var text = this.get('text');
            var fields = this.get('realFields');

            var patt = /\{[dtm]\}/gmi;
            var match, i = 0;
            var result = '';
            var lastIndex = 0;
            while (match = patt.exec(text)){
                var rtxt = '';
                if (fields[i]){
                    if (fields[i] instanceof server.Counter){
                        rtxt = fields[i].getCount();
                    }
                    if (fields[i] instanceof server.Text){
                        rtxt = fields[i].getText();
                    }
                    if (fields[i] instanceof server.Timer){
                        if (fields[i].isStart()){
                            rtxt = '[tmr-'+fields[i].getTimeOutStamp()+']';
                        }else{
                            rtxt = fields[i].getTime();
                        }
                    }
                }
                result = result+text.substring(lastIndex, match.index)+rtxt;
                lastIndex = patt.lastIndex;
                i++;
            }
            result = result+text.substr(lastIndex);

            this.set({
                textview: result
            });
        },
        init: function(project){
            project.afterSync(function(){
                var mapmarker = this.get('mapmarker');

                this.update();

                this.on('watch-player', function(){
                    this.get('realFields').forEach(function(item){
                        if (item){
                            item.on('set', this.update, this);
                        }
                    }, this);
                }, this);

                this.on('unwatch-player', function(){
                    this.get('realFields').forEach(function(item){
                        if (item){
                            item.off('set', null, this);
                        }
                    }, this);
                }, this);
                
                mapmarker.on('watch-player', function(ev){
                    ev.player.watch(this, true);
                }, this);

                mapmarker.on('unwatch-player', function(ev){
                    ev.player.unwatch(this, true);
                }, this);
                
                this.watcher.getItem('AllPlayers').eachWatchedPlayers(mapmarker, function(player){
                    player.watch(this, true);
                }.bind(this));
            }.bind(this));
        },
        createAttrs: function(){
            var attrs = this._init.overlay.getAttributes();
            delete attrs.customFields;
            this.set(attrs);
            this.set({
                mapmarker: this._init.mapmarker,
                realFields: this._init.overlay.get('customFields').map(function(field){
                    if (field){
                        var item = field.getValue();
                        if (item){
                            return item;
                        }
                    }
                    return null;
                }, this)
            });
        },
        initialize: function(mapmarker, overlay){
            server.ActionClass.prototype.initialize.apply(this, arguments);
            
            this._init = {mapmarker: mapmarker, overlay: overlay};
        }        
    });
    
    server.MapMarkerOverlayText = server.TriggerClass.extend({
        className: 'MapMarkerOverlayText',
        _mount: function(mapmarker, args){
            console.log('create overlay text', mapmarker.get('name'));
            
            var overlay = this.get(mapmarker.id);
            if (!overlay){
                this.setupClass(args);
                
                overlay = this.watcher.watch(new server.MapMarkerOverlayTextView(mapmarker, this));
                this.setAttribute(mapmarker.id, overlay);
            }
            
            return overlay;
        },
        _unmount: function(mapmarker, overlay){
            overlay.destroy();
            this.removeAttribute(mapmarker.id);
        }
    });    

    server.MapMarkerOverlayBarView = server.ActionClass.extend({
        className: 'MapMarkerOverlayBarView',
        wbpSent: true,
        init: function(project){
            project.afterSync(function(){
                var mapmarker = this.get('mapmarker');

                this.on('watch-player', function(){
                    this.get('counter').on('set:count', function(){
                        this.set({value: this.get('counter').getCount()});
                    }, this);
                    this.get('max').on('set:count', function(){
                        this.set({maxvalue: this.get('max').getCount()});
                    }, this);
                }, this);

                this.on('unwatch-player', function(){
                    this.get('counter').off('set:count', null, this);
                    this.get('max').off('set:count', null, this);
                }, this);
                
                mapmarker.on('watch-player', function(ev){
                    ev.player.watch(this, true);
                }, this);

                mapmarker.on('unwatch-player', function(ev){
                    ev.player.unwatch(this, true);
                }, this);
                
                this.watcher.getItem('AllPlayers').eachWatchedPlayers(mapmarker, function(player){
                    player.watch(this, true);
                }.bind(this));
                
                this.set({
                    value: this.get('counter').getCount(),
                    maxvalue: this.get('max').getCount()
                });
            }.bind(this));
        },
        createAttrs: function(){
            var attrs = this._init.overlay.getAttributes();
            this.set(attrs);
            this.set({
                mapmarker: this._init.mapmarker,
            });
        },
        initialize: function(mapmarker, overlay){
            server.ActionClass.prototype.initialize.apply(this, arguments);
            
            this._init = {mapmarker: mapmarker, overlay: overlay};
        }        
    });
    
    server.MapMarkerOverlayBar = server.TriggerClass.extend({
        className: 'MapMarkerOverlayBar',
        _mount: function(mapmarker, args){
            console.log('create overlay bar', mapmarker.get('name'));
            
            var overlay = this.get(mapmarker.id);
            if (!overlay){
                this.setupClass(args);
                overlay = this.watcher.watch(new server.MapMarkerOverlayBarView(mapmarker, this));
                this.setAttribute(mapmarker.id, overlay);
            }
            
            return overlay;
        },
        _unmount: function(mapmarker, overlay){
            overlay.destroy();
            this.removeAttribute(mapmarker.id);
        }
    });    
};