var FunctionCounter = 1;

admin.Function = ActionClass.extend({
    className: 'Function',
    moduleName: 'Function',
    cloneAttrs: function(){
        return ['action'];
    },
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    _listArgsKeys: function(){
        var attrs = $.extend({}, this.attributes);

        var keys = Object.keys(attrs).filter(function(a){return attrs[a] instanceof admin.ActionArg;});

        return keys;
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#FunctionSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainFunction: this})
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
            name: 'Функция '+FunctionCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            ),
            action: project.watch(new admin.ActionList([], this._listArgs()))
        });
        
        this.get('flagList').add([admin.global.FunctionAllFlag]);
        admin.global.FunctionAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= FunctionCounter){
            FunctionCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        var action = this.get('action');
        
        if (!flagList){
            return;
        }
        
        project.afterSyncItem("FunctionFlagsList", function(FunctionFlagsList){
            project.afterSync([flagList, action], function(){
                action.on('add-args', function(ev){
                    if (ev.item.isCustomArg()){
                        this.setAttribute(ev.item.id, ev.item);
                    }
                }, this);

                action.on('remove-args', function(ev){
                    var attrs = this.attributes;
                    for (var i in attrs){
                        if (attrs[i] === ev.item){
                            this.removeAttribute(i);
                        }
                    }
                }, this);

                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    FunctionFlagsList.createButtonField('Создать коллекцию'),
                    FunctionFlagsList.createSchemeField(flagList)
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

                var editorField = this.destrLsn(new SchemeField('#Function'))
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
                        action.getLocalsSchemeFieldDark(),
                        action.createButtonLocalsField('Добавить аргумент'),
                        action.createCopyButtonField('Действия'),
                        action.getSchemeField()
                    ]));
            }.bind(this));
        }.bind(this));
    }
});

