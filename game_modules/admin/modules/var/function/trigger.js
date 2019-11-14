var TriggerCounter = 1;

admin.CustomTrigger = ActionClass.extend({
    className: 'CustomTrigger',
    moduleName: 'Function',
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TriggerSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainTrigger: this})
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
            name: 'Триггер '+TriggerCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
        });
        
        this.get('flagList').add([admin.global.TriggerAllFlag]);
        admin.global.TriggerAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TriggerCounter){
            TriggerCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        var action = this.get('action');
        
        if (!flagList){
            return;
        }
        
        project.afterSyncItem("TriggerFlagsList", function(TriggerFlagsList){
            project.afterSync([flagList, action], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    TriggerFlagsList.createButtonField('Создать коллекцию'),
                    TriggerFlagsList.createSchemeField(flagList)
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

                var editorField = this.destrLsn(new SchemeField('#Trigger'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)});

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .linkCollection(null, new SchemeCollection([
                        editorField,
                    ]));
            }.bind(this));
        }.bind(this));
    }
});
