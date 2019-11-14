module.exports = function (server){
    server.Task = server.SyncedData.extend({
        className: 'Task',
        wbpSent: false,
        changeStatus: function(status){
            switch (status){
                case 'start':
                    if (this.get('status') !== 'inprogress'){
                        this.set({status: 'inprogress'});
                        this.callEventListener('task:start', {target: this});
                    }
                    break;
                case 'complete':
                    if (this.get('status') === 'inprogress'){
                        this.set({status: 'complete'});
                        this.callEventListener('task:complete', {target: this});
                    }
                    break;
                case 'failed':
                    if (this.get('status') === 'inprogress'){
                        this.set({status: 'failed'});
                        this.callEventListener('task:failed', {target: this});
                    }
                    break;
                case 'cancel':
                    if (this.get('status') === 'inprogress'){
                        this.set({status: 'cancel'});
                        this.callEventListener('task:cancel', {target: this});
                    }
                    break;
            }
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            this.on('set:triggerList', function(ev){
                this.get('triggerList').mount({target: this});
            }, this);
        }
    });
};