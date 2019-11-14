client.Dialog = SyncedItem.extend({
    className: 'Dialog',
    destrLsnTimer: function(field){
        this.on('destroy', function(event){
            client.setTimeout(function(){
                field.destroy();
            }, 200);
        }.bind(this));
        
        return field;
    },
    createSchemeField: function(){
        var resize = null;
        
        return this.destrLsnTimer(new SchemeField('#DialogTpl'))
            .linkCollection('.blk-modal', this.getFieldsListCollection())
            .init('.blk-modal', function(DOMel){
                var resize = function(){
                    var width = 0;
                    var maxh = 0;
                    var parts = [];
                    var maxw = DOMel.width();

                    DOMel.find('img').unbind('load').bind('load', resize);

                    DOMel.find('.blk-interface').each(function(idx, i){
                        var iw = $(i).width();
                        $(i).find('.blk-bg-black').css({height: ''});

                        width += iw / maxw;

                        if (width > 1){
                            $(parts).find('.blk-bg-black').innerHeight(maxh);
                            
                            width = iw / maxw;
                            parts = [];
                            maxh = 0;
                        }
                        
                        parts.push(i);
                        maxh = Math.max(maxh, $(i).height());
                    });
                    
                    $(parts).find('.blk-bg-black').innerHeight(maxh);
                };
                
                setTimeout(resize, 0);
                
                window.addEventListener('resize', resize);
                this.on('resize', resize);
            }.bind(this), function(){
                window.removeEventListener('resize', resize);
            });
    },
    getFieldsListCollection: function(){
        return this.get('fieldsList').createSchemeCollection();
    },
    init: function(){
        
    }
});

client.DialogFieldList = client.Dialog.extend({
    className: 'DialogFieldList',
});