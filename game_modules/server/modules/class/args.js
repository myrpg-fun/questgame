module.exports = function (server){
    server.ActionArgClass = server.ActionArg.extend({
        className: 'ActionArgClass'
    });
    
    server.ActionArgClassRemove = server.ActionArgClass.extend({
        className: 'ActionArgClassRemove'
    });
    
    server.ActionArgClassItem = server.ActionArg.extend({
        className: 'ActionArgClassItem',
        wbpSent: false,
        changeClone: function(cloneargs){
            var clsarr = this.get('class');
            
            if (clsarr.length > 0){
                var f = cloneargs.find(function(o){
                    return clsarr[0] === o.arg;
                }, this);
                
                if (f){
                    var cl = this.clone();
            
                    clsarr = cl.get('class');
                    
                    clsarr[0] = f.clone;
            
                    return cl;
                }
            }
            
            return this;
        },
        getValue: function(){
            if (!(Array.isArray(this.get('class')))){
                console.error('class ',this.get('name'));
                console.log('arg',this.get('class').id,'get', cls);
                
                return null;
            }
            
            var clsarr = this.get('class');
            cls = clsarr[0].getValue();
            
            //console.log('getValue count', clsarr.length);
            
            for (var i = 1; i<clsarr.length; i++){
                cls = cls.get(clsarr[i].id);
                if (cls.getValue){
                    cls = cls.getValue();//.get('item');
                }
                
                //console.log('link to ', cls.className);
            }
            
            if (!(cls instanceof server.SyncedData)){
                console.trace('class ! ', this.get('name'), 'arg', clsarr[0].id, 'get', cls);
                
                return null;
            }
            
            var item = cls.get(this.get('id'));
            
            if (!item){
                console.trace('item ! ',this.get('name'), 'arg', this.get('id'), 'get', item, cls.attributes[this.get('id')]?cls.attributes[this.get('id')].attributes:null);
                
                return null;
            }
            //console.log('class get item', this.get('name'), cls.id, this.get('id'), Object.keys(cls.getAttributes()));
            if (item.getValue){
                return item.getValue();//.get('item');
            }

            /*if (item instanceof server.ObjectItem){
                return item.get('item');
            }
            if (item instanceof server.PlayerDialogInterfaceView){
                return item.get('dialog');
            }*/
            return item;
        },
        init: function(){
/*            this.on('player-watch', function(ev){
                console.log('send class', this.get('class').className, this.get('class').wbpSent);
                ev.watcher.watch(this.get('class'));
            });*/
        }
    });
};