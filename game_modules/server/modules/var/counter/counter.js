module.exports = function (server){
    server.Counter = server.SyncedData.extend({
        className: 'Counter',
        isEqualObj: function(obj){
            return obj instanceof server.Counter?obj.getCount() === this.getCount():this === obj;
        },
        getCount: function(){
            return this.get('count')*1;
        },
        setCount: function(count){
            this.set({count: parseFloat(count)});
        },
        createAttrs: function(watcher){
            this.set({
                count: this._init
            });
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
        },
        initialize: function(count){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = count;
        }
    });
};