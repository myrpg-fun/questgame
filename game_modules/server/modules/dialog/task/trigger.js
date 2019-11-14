module.exports = function (server){
    server.TaskTriggerStart = server.ActionClass.extend({
        className: 'TaskTriggerStart',
        mount: function(args){
            if (!this._mounted[args.target.id]){
                console.log('mount task start to ', args.target.get('name'));
                
                var args = Object.assign({}, args);
                var timer = args.target;
                this._mounted[timer.id] = function(args, ev){
                    this.setupArg('target', timer);
                    
                    this.get('list').run(args);
                }.bind(this, args);
                
                args.target.on('task:start', this._mounted[timer.id], this);
            }
        },
        unmount: function(args){
            if (this._mounted[args.target.id]){
                console.log('unmount task start to ', args.target.get('name'));
                
                args.target.off('task:start', this._mounted[args.target.id]);
                
                delete this._mounted[args.target.id];
            }
        },
        init: function(){
            this._mounted = {};
        }
    });
    
    server.TaskTriggerFailed = server.ActionClass.extend({
        className: 'TaskTriggerFailed',
        mount: function(args){
            if (!this._mounted[args.target.id]){
                console.log('mount task failed to ', args.target.get('name'));
                
                var args = Object.assign({}, args);
                var timer = args.target;
                this._mounted[timer.id] = function(args, ev){
                    this.setupArg('target', timer);
                    
                    this.get('list').run(args);
                }.bind(this, args);
                
                args.target.on('task:failed', this._mounted[timer.id], this);
            }
        },
        unmount: function(args){
            if (this._mounted[args.target.id]){
                console.log('unmount task failed to ', args.target.get('name'));
                
                args.target.off('task:failed', this._mounted[args.target.id]);
                
                delete this._mounted[args.target.id];
            }
        },
        init: function(){
            this._mounted = {};
        }
    });

    server.TaskTriggerComplete = server.ActionClass.extend({
        className: 'TaskTriggerComplete',
        mount: function(args){
            if (!this._mounted[args.target.id]){
                console.log('mount task complete to ', args.target.get('name'));
                
                var args = Object.assign({}, args);
                var timer = args.target;
                this._mounted[timer.id] = function(args, ev){
                    this.setupArg('target', timer);
                    
                    this.get('list').run(args);
                }.bind(this, args);
                
                args.target.on('task:complete', this._mounted[timer.id], this);
            }
        },
        unmount: function(args){
            if (this._mounted[args.target.id]){
                console.log('unmount task complete to ', args.target.get('name'));
                
                args.target.off('task:complete', this._mounted[args.target.id]);
                
                delete this._mounted[args.target.id];
            }
        },
        init: function(){
            this._mounted = {};
        }
    });

    server.TaskTriggerCancel = server.ActionClass.extend({
        className: 'TaskTriggerCancel',
        mount: function(args){
            if (!this._mounted[args.target.id]){
                console.log('mount task cancel to ', args.target.get('name'));
                
                var args = Object.assign({}, args);
                var timer = args.target;
                this._mounted[timer.id] = function(args, ev){
                    this.setupArg('target', timer);
                    
                    this.get('list').run(args);
                }.bind(this, args);
                
                args.target.on('task:cancel', this._mounted[timer.id], this);
            }
        },
        unmount: function(args){
            if (this._mounted[args.target.id]){
                console.log('unmount task cancel to ', args.target.get('name'));
                
                args.target.off('task:cancel', this._mounted[args.target.id]);
                
                delete this._mounted[args.target.id];
            }
        },
        init: function(){
            this._mounted = {};
        }
    });

};