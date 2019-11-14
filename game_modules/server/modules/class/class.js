var zz = require('../../zz');

module.exports = function (server){
    server.ClassObjectList = server.SyncedList.extend({
        className: 'ClassObjectList'
    });

    server.Class = server.ActionClass.extend({
        className: 'Class',
        createNewObject: function(locals){
            this.get('classList').forEach(function(classObj){
                if (locals[classObj.id] === undefined){
                    locals[classObj.id] = classObj.createNew();
                }
            });
            
            locals.class = this;
            
            var obj = this.watcher.clone(new server.Object, locals);
            
            return obj;
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
        }
    });
};