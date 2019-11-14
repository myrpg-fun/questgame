var GroupField = SchemeFieldSort.extend({
    initialize: function(name, collection){
        SchemeField.prototype.initialize.call(this, '#GroupBlkTpl');

        this.object = new zz.data();
        this.object.set({name: name});
        
        var mainBlk = this;
        this.linkTextValue('span.blki-name', this.object, 'name');
        //this.addEventListener('.blk-list-hidden', collection);
        this.linkCollection('.blk-list', collection);
        this.click('.link-opengroup', function(){
            mainBlk.object.set({open: 1-mainBlk.object.get('open')});
        });
        
/*        this.on('added-collection', function(event){
            this.parent = event.target;
        });
        
        this.on('removed-collection', function(event){
            this.parent = null;
        });*/
        
        this.linkEventListener('.blk-list-hidden', this.object, 'set:open', function(listBlk, event){
            /*if (mainBlk.parent && event.value === 1){
                mainBlk.parent.forEach(function(block){
                    if (block instanceof GroupField && block !== mainBlk){
                        block.object.set({open: 0});
                    }
                }, this);
            }*/
            
            if (event.value){
                var h0 = listBlk.height();
                listBlk.css({height: 'auto', overflow: 'hidden'});
                var h1 = listBlk.height();
                listBlk.css({height: h0}).stop(true).animate({height: h1+'px'}, 100, 'swing', function(){
                    listBlk.css({height: 'auto', overflow: 'visible'});
                });
            }else{
                listBlk.css({overflow: 'hidden'}).stop(true).animate({height: '0px'}, 100, 'swing');
            }
        });
        this.init('.blk-list-hidden', function(listBlk, fieldDOM){
            if (this.object.get('open')){
                listBlk.css({height: 'auto', overflow: 'visible'});
            }else{
                listBlk.css({height: '0px', overflow: 'hidden'});
            }
        }.bind(this));

        this.object.set({open: 0});
    }
});
