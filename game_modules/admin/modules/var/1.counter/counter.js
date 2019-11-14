var CounterCounter = 1;

admin.Counter = ActionClass.extend({
    className: 'Counter',
    moduleName: 'Counter',
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainCounter: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            name: 'Счётчик '+CounterCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            count: 0
        });
        
        this.get('flagList').add([admin.global.CounterAllFlag]);
        admin.global.CounterAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= CounterCounter){
            CounterCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        if (!flagList){
            return;
        }
        
        project.afterSyncItem("CounterFlagsList", function(CounterFlagsList){
            project.afterSync([flagList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    CounterFlagsList.createButtonField('Создать коллекцию'),
                    CounterFlagsList.createSchemeField(flagList)
                ]) ));
                
                this.on('before-clone', function(ev){
                    ev.attr.flagList = this.watcher.watch(
                        new admin.FlagCollectionList([])
                    );
                }, this);

                this.on('after-clone', function(ev){
                    var flagList = ev.clone.get('flagList');
                    this.get('flagList').forEach(function(flag){
                        flagList.add([flag]);
                    }, this);
                }, this);

                var editorField = this.destrLsn(new SchemeField('#Counter'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputFloat('.blki-count', this, 'count')
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

