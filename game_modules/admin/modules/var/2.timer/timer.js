var TimerCounter = 1;

admin.Timer = ActionClass.extend({
    className: 'Timer',
    moduleName: 'Timer',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainTimer: this})
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
            name: 'Таймер '+TimerCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            timer: '00:00:00',
            started: 0,
            startTime: 0
        });
        
        this.get('flagList').add([admin.global.TimerAllFlag]);
        admin.global.TimerAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TimerCounter){
            TimerCounter = digit[0]*1+1;
        }
        
        var triggerList = this.get('triggerList');
        var flagList = this.get('flagList');
        
        project.afterSyncItem("TimerFlagsList", function(TimerFlagsList){
            project.afterSync([triggerList, flagList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    TimerFlagsList.createButtonField('Создать коллекцию'),
                    TimerFlagsList.createSchemeField(flagList)
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

                var editorField = this.destrLsn(new SchemeField('#Timer'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputValue('.blki-timer', this, 'timer')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this));

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .linkCollection(null, new SchemeCollection([
                        editorField,
                        triggerList.createButtonField('Триггеры', admin.fields.NewTimerTriggers),
                        triggerList.getSchemeField()
                    ]));
            }.bind(this));
        }.bind(this));
    }
});

