module.exports = function (server){
    server.QRCode = server.SyncedData.extend({
        className: 'QRCode',
        isEqualObj: function(obj){
            return obj instanceof server.QRCode?obj.getCount() === this.getCount():this === obj;
        },
        getCount: function(){
            return this.get('code')*1;
        },
        setCount: function(count){
            this.set({code: parseInt(count)});
        },
        createAttrs: function(watcher){
            this.set({
                code: this._init
            });
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            this.on('before-clone', function(ev){
                var now = Date.now();
                now = now - Math.floor(now/100000000)*100000000;

                ev.attr.code = 1*(([Math.floor(Math.random()*9)+1].concat(Array(7).fill(0).map(function(){return Math.floor(Math.random()*10);}))).join('')+now);
            }, this);
        },
        initialize: function(count){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = count;
        }
    });
};