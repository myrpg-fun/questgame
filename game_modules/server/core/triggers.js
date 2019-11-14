module.exports = function (server){
    server.TriggerClass = server.ActionClass.extend({
        _getKey: function(args){
            /*var key = '';
            for (var k in args){
                if (args[k].id){
                    key += args[k].id+' ';
                }
            }
            return key;*/
            
            return args.target.id+(args.object?('|'+args.object.id):'');
        },
        _mount: function(){
            console.error('_mount method not initialized');
        },
        _unmount: function(){
            console.error('_unmount method not initialized');
        },
        setupClass: function(args){
            if (args && args.__class){
                args.__class.setupArg('classArg', args.object);
            }
        },
        mount: function(args){
            var key = this._getKey(args);

            //console.error('MOUNT KEY', key);
            
            if (!this._mounted[key]){
                var args = Object.assign({}, args);
                var target = args.target;
                var object = args.object;
                var cls = args.class;
                
                this._mounted[key] = this._mount(target, args, object, cls);
            }
        },
        unmount: function(args){
            var key = this._getKey(args);
            
            //console.error('UNMOUNT KEY', key);
            
            if (this._mounted[key]){
                var target = args.target;
                this._unmount(target, this._mounted[key], args);
                
                delete this._mounted[key];
            }
        },
        initialize: function(){
            server.ActionClass.prototype.initialize.apply(this, arguments);
            
            this._mounted = {};
        },
    });
};