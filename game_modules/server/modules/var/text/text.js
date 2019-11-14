module.exports = function (server){
    server.Text = server.SyncedData.extend({
        className: 'Text',
        wbpSent: true,
        isEqualObj: function(obj){
            return obj instanceof server.Text?obj.getText() === this.getText():this === obj;
        },
        setup: function(value){
            this.set({
                text: value
            });
        },
        getText: function(){
            return this.get('text')+'';
        },
        createAttrs: function(watcher){
            this.set({
                text: this._init
            });
        },
        init: function(){
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
        },
        initialize: function(text){
            server.SyncedData.prototype.initialize.apply(this, arguments);
            
            this._init = text;
        }
    });
};