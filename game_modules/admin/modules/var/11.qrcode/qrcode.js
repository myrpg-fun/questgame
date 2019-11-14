var QRCodeCounter = 1;

admin.QRCode = ActionClass.extend({
    className: 'QRCode',
    moduleName: 'QRCode',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#QRCodeSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainQRCode: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createAttrs: function(project){
        var now = Date.now();
        now = now - Math.floor(now/100000000)*100000000;
        
        this.set({
            name: 'QR '+QRCodeCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            code: 1*(([Math.floor(Math.random()*9)+1].concat(Array(7).fill(0).map(function(){return Math.floor(Math.random()*10);}))).join('')+now)
        });
        
        this.get('flagList').add([admin.global.QRCodeAllFlag]);
        admin.global.QRCodeAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= QRCodeCounter){
            QRCodeCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        if (!flagList){
            return;
        }
        
        project.afterSyncItem("QRCodeFlagsList", function(QRCodeFlagsList){
            project.afterSync([flagList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    QRCodeFlagsList.createButtonField('Создать коллекцию'),
                    QRCodeFlagsList.createSchemeField(flagList)
                ]) ));
                
                this.on('before-clone', function(ev){
                    ev.attr.flagList = this.watcher.watch(
                        new admin.FlagCollectionList([])
                    );
            
                    var now = Date.now();
                    now = now - Math.floor(now/100000000)*100000000;

                    ev.attr.code = 1*(([Math.floor(Math.random()*9)+1].concat(Array(7).fill(0).map(function(){return Math.floor(Math.random()*10);}))).join('')+now);
                }, this);

                this.on('after-clone', function(ev){
                    var flagList = ev.clone.get('flagList');
                    this.get('flagList').forEach(function(flag){
                        flagList.add([flag]);
                    }, this);
                }, this);

                var redrawQR = function(el){
                    QRCode.toCanvas(el[0], [{ data: this.get('code')+'', mode: 'numeric' }], { errorCorrectionLevel: 'H', scale: 6 }, function (error) {
                        if (error) console.error(error);
                        console.log('success!');
                    });
                }.bind(this);

                var editorField = this.destrLsn(new SchemeField('#QRCode'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputInteger('.blki-code', this, 'code')
                    .init('.blk-qrcode', function(el){
                        redrawQR(el);
                        this.on('set:code', function(){redrawQR(el);}, this);
                    }.bind(this), function(){
                        this.off('set:code', null, this);
                    }.bind(this))
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this));

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .linkCollection(null, new SchemeCollection([
                        editorField
                    ]));
            }.bind(this));
        }.bind(this));
    }
});

