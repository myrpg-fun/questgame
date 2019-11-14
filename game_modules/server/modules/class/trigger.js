module.exports = function (server){
    server.ClassTriggerCreate = server.TriggerClass.extend({
        className: 'ClassTriggerCreate',
        _mount: function(object, args){
            var fn = function(args, ev){
//                this.setupClass(args);
                
                this.get('list').run(args);
            }.bind(this, args);
                
            object.on('create-object', fn, this);
            
            return fn;
        },
        _unmount: function(object, fn){
            object.off('create-object', fn);
        }
    });
    
    server.ClassTriggerDelete = server.TriggerClass.extend({
        className: 'ClassTriggerDelete',
        _mount: function(object, args){
            var fn = function(args, ev){
//                this.setupClass(args);
                
                this.get('list').run(args);
            }.bind(this, args);
                
            object.on('delete-object', fn, this);
            
            return fn;
        },
        _unmount: function(object, fn){
            object.off('delete-object', fn);
        }
    });
    
    server.ClassTriggerAddFlag = server.TriggerClass.extend({
        className: 'ClassTriggerAddFlag',
        _mount: function(object, args){
            var fn = function(args, ev){
                if (this.get('flagList').has(ev.flag)){
                    this.setupArg('classArg', object);
                
                    this.get('list').run(args);
                }
            }.bind(this, args);
                
            object.on('add-flag', fn, this);
            
            return fn;
        },
        _unmount: function(object, fn){
            object.off('add-flag', fn);
        }
    });
    
    server.ClassTriggerRemoveFlag = server.TriggerClass.extend({
        className: 'ClassTriggerRemoveFlag',
        _mount: function(object, args){
            var fn = function(args, ev){
                if (this.get('flagList').has(ev.flag)){
                    this.setupArg('classArg', object);
                
                    this.get('list').run(args);
                }
            }.bind(this, args);
                
            object.on('remove-flag', fn, this);
            
            return fn;
        },
        _unmount: function(object, fn){
            object.off('remove-flag', fn);
        }
    });
};