module.exports = function (server){
    server.SessionTriggerInit = server.ActionClass.extend({
        className: 'SessionTriggerInit',
        _mounted: function(ev){
            console.log('run trigger init');
            this.get('list').run({session: ev.session});
        },
        mount: function(msg){
            console.log('mount');
            msg.target.on('init', this._mounted, this);
        },
        unmount: function(msg){
            msg.target.off('init', this._mounted, this);
        }
    });
    
    server.SessionTriggerBegin = server.ActionClass.extend({
        className: 'SessionTriggerBegin',
        _mounted: function(ev){
            console.log('run trigger begin');
            this.get('list').run({session: ev.session});
        },
        mount: function(msg){
            console.log('mount');
            msg.target.on('begin', this._mounted, this);
        },
        unmount: function(msg){
            msg.target.off('begin', this._mounted, this);
        }
    });
    
    server.SessionTriggerWait = server.ActionClass.extend({
        className: 'SessionTriggerWait',
        _mounted: function(ev){
            console.log('run trigger wait');
            this.get('list').run({session: ev.session});
        },
        mount: function(msg){
            msg.target.on('waitingplayers', this._mounted, this);
        },
        unmount: function(msg){
            msg.target.off('waitingplayers', this._mounted, this);
        }
    });
    
    server.SessionTriggerStart = server.ActionClass.extend({
        className: 'SessionTriggerStart',
        _mounted: function(ev){
            console.log('run trigger start');
            this.get('list').run({session: ev.session});
        },
        mount: function(msg){
            msg.target.on('activated', this._mounted, this);
        },
        unmount: function(msg){
            msg.target.off('activated', this._mounted, this);
        }
    });
    
    server.SessionTriggerEnd = server.ActionClass.extend({
        className: 'SessionTriggerEnd',
        _mounted: function(ev){
            console.log('run trigger end');
            this.get('list').run({session: ev.session});
        },
        mount: function(msg){
            msg.target.on('end', this._mounted, this);
        },
        unmount: function(msg){
            msg.target.off('end', this._mounted, this);
        }
    });
};