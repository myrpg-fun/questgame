module.exports = function (server){
    server.TimerTriggerTimeout = server.TriggerClass.extend({
        className: 'TimerTriggerTimeout',
        _mount: function(timer, args){
            var fn = function(args, ev){
                this.setupArg('target', timer);
                
                this.get('list').run(args);
            }.bind(this, args);

            timer.on('timeout', fn, this);
            
            return fn;
        },
        _unmount: function(timer, fn){
            timer.off('timeout', fn);
        },
        createAttrs: function(project){
            this.set({
                list: project.watch(new server.ActionList([], []))
            });
        },
    });

    server.TimerTriggerStart = server.TriggerClass.extend({
        className: 'TimerTriggerStart',
        _mount: function(timer, args){
            var fn = function(args, ev){
                this.setupArg('target', timer);
                
                this.get('list').run(args);
            }.bind(this, args);

            timer.on('starttimer', fn, this);
            
            return fn;
        },
        _unmount: function(timer, fn){
            timer.off('starttimer', fn);
        },
    });
};