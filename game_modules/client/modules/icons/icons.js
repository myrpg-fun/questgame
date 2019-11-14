var ADLinkIcon = SFLink.extend({
    initialize: function(DOMfind, model, modelName, resize){
        var change;
        var seticon;
        var icontimer = null;

        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            seticon = function(event){
                var icon = event.target;
                
                icon = Array.isArray(icon)?icon:[icon];
                
                icon = icon[0];

                if (!(icon instanceof WatcherRelation)){
                    DOMel.css({
                        backgroundImage: 'url('+icon.get('url').replace(/upload\/([\w.-]+)$/gi, "resize/"+(resize)+"/$1")+')',
                        backgroundPosition: '0px 0px',
                        backgroundSize: '100% '+Math.floor(icon.get('height')*100/icon.get('width'))+'%'
                    });

                    if (icontimer){
                        window.clearInterval(icontimer);
                    }

                    icontimer = icon.startAnimation(DOMel);
                }
            };

            change = function(event){
                if (event.lastValue){
                    var v = Array.isArray(event.lastValue)?event.lastValue:[event.lastValue];
                    
                    v.forEach(function(e){
                        if (!(e instanceof WatcherRelation)){
                            e.off('set', seticon);
                        }
                    });
                }
                
                if (event.value){
                    var v = Array.isArray(event.value)?event.value:[event.value];
                    
                    v.forEach(function(e){
                        if (!(e instanceof WatcherRelation)){
                            e.on('set', seticon);
                        }
                    });
                    
                    seticon({
                        target: v
                    });
                }
            };
            
            if (modelName){
                model.addEventListener('set:'+modelName, change);

                change({
                    value: model.get(modelName),
                    lastValue: null
                });
            }else{
                change({
                    value: model,
                    lastValue: null
                });
            }
        }.bind(this);
        this.clearEventFn = function(DOMel){
            if (icontimer){
                window.clearInterval(icontimer);
            }
                
            if (modelName){
                model.clearEventListener('set:'+modelName, change);
                if (model.get(modelName)){
                    var v = model.get(modelName);
                    v = Array.isArray(v)?v:[v];
                    
                    v.forEach(function(e){
                        e.clearEventListener('set', seticon);
                    });
                }
            }else{
                model.clearEventListener('set', seticon);
            }
        };
    }
});

client.MapMarkerIcon = ActionClass.extend({
    className: 'MapMarkerIcon',
    startAnimation: function(DOMel){
        var icon = this;
        var icontimer = null;
        //check animation
        var frame = 0;
        var forward = true;
        switch (icon.get('animate')){
            case 'repeat':
                //repeat from start
                icontimer = setInterval(function(){
                    DOMel.css({
                        backgroundPosition: '0px '+frame*100/(icon.get('height') - icon.get('width'))+'%'
                    });

                    frame += icon.get('width');
                    if (frame > icon.get('height') - icon.get('width')){
                        frame = 0;
                    }
                }, icon.get('speed'));

                break;
            case 'alternate':
                //repeat to start
                icontimer = setInterval(function(){
                    DOMel.css({
                        backgroundPosition: '0px '+frame*100/(icon.get('height') - icon.get('width'))+'%'
                    });

                    if (forward){
                        frame += icon.get('width');
                        if (frame > icon.get('height') - icon.get('width')){
                            frame -= 2*icon.get('width');
                            forward = false;
                        }
                    }else{
                        frame -= icon.get('width');
                        if (frame < 0){
                            frame += 2*icon.get('width');
                            forward = true;
                        }
                    }
                }, icon.get('speed'));

                break;
            case 'normal':
                //one way
                icontimer = setInterval(function(){
                    DOMel.css({
                        backgroundPosition: '0px '+frame*100/(icon.get('height') - icon.get('width'))+'%'
                    });

                    frame += icon.get('width');
                    if (frame > icon.get('height') - icon.get('width')){
                        window.clearInterval(icontimer);
                    }
                }, icon.get('speed'));

                break;
        }
        
        return icontimer;
    },
    init: function(project){}
});