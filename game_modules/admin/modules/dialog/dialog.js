var DialogCounter = 1;

admin.DialogPtr = ActionClass.extend({
    className: 'DialogPtr',
    moduleName: 'Dialog',
    setDialog: function(dialog){
        this.set({dialog: dialog});
    },
    getValue: function(){
        return this.get('dialog');
    },
    createAttrs: function(project){
        this.set({
            dialog: null
        });
    },
    init: function(project){}
});

admin.DialogPtrAdmin = admin.DialogPtr.extend({
    className: 'DialogPtrAdmin',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogSelectBlockTpl'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainDialog: this})
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
        admin.DialogPtr.prototype.createAttrs.apply(this, arguments);
        
        this.set({
            name: 'Указатель '+DialogCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            )
        });
        
        this.get('flagList').add([admin.global.DialogPtrAllFlag]);
        admin.global.DialogPtrAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= DialogCounter){
            DialogCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        
        if (!flagList){
            return;
        }
        
        project.afterSyncItem("DialogPtrFlagsList", function(DialogFlagsList){
            project.afterSync([flagList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    DialogFlagsList.createButtonField('Создать коллекцию'),
                    DialogFlagsList.createSchemeField(flagList)
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

                var editorField = this.destrLsn(new SchemeField('#DialogPtrTpl'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)});

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .linkCollection(null, new SchemeCollection([
                        editorField
                    ]));
            }.bind(this));
        }.bind(this));
    }
});

admin.DialogFieldList = ActionClass.extend({
    className: 'DialogFieldList',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogSelectBlockTpl'));
    },
    getLocalsByType: function(type){
        var result = [];
        
        this.get('fieldsList').forEach(function(field){
            result = result.concat(field.getLocalsByType(type));
        });
        
        return result;
    },
    _actionLists: function(){
        return [this.get('fieldsList'), this.get('triggerList')];
    },
    cloneAttrs: function(){
        return ['fieldsList', 'triggerList'];
    },
    _listArgsKeys: function(){
        var attrs = $.extend({}, this.attributes);

        var keys = Object.keys(attrs).filter(function(a){return attrs[a] instanceof admin.ActionArg;});

        return keys;
    },
    _listArgs: function(){
        var attrs = $.extend({}, this.attributes);

        var keys = Object.keys(attrs).filter(function(a){return attrs[a] instanceof admin.ActionArg;});

        attrs = keys.map(function(a){return attrs[a];});

        return attrs;
    },
    createAttrs: function(project){
        this.set({
            player: project.watch(new admin.ActionArgClass('Игрок', admin.global.PlayerTemplate)),
            thisArg: project.watch(new admin.ActionArg('Текущий интерфейс', 'Dialog')),
        });
        
        this.set({
            fieldsList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this.get('fieldsList').getArgs()
            ))
        });
    },
    init: function(project){
/*        this.off('after-clone');
        
        this.on('after-clone', function(ev){
            if (ev.options.createObject){
                ev.clone.get('fieldsList').set({
                    args: ev.target.get('fieldsList').get('args')
                });
            }else{
                //Clone inside arguments in lists
                var cloneargs = ev.clone._listArgs().map(function(arg){
                    return {arg: arg, clone: arg.clone()};
                }.bind(this));

                //update arguments
                ev.clone._updateArgs(cloneargs);
            }
        }, this);
*/        
        if (!this.get('triggerList')){
            this.set({
                triggerList: project.watch(
                    new admin.ActionList(
                        [], []
                ))
            });
        }

        var fieldsList = this.get('fieldsList');
        var triggerList = this.get('triggerList');
        
        this.on('before-clone', function(ev){
            var argst = ev.attr.triggerList.args();
            var argsf = ev.attr.fieldsList.args();
            var cloneargs = [];
            argsf.forEach(function(a, i){
                cloneargs.push({arg: argst[i], clone: a});
            }, this);
            
            ev.attr.triggerList._updateArgs(cloneargs);
        }, this);
        
        project.afterSync([fieldsList, triggerList], function(){
            fieldsList.on('add-args', function(ev){
                if (ev.item.isCustomArg()){
                    this.setAttribute(ev.item.id, ev.item);
                }

                triggerList.addArgs([ev.item]);
            }, this);

            fieldsList.on('remove-args', function(ev){
                var attrs = this.attributes;
                for (var i in attrs){
                    if (attrs[i] === ev.item){
                        this.removeAttribute(i);
                    }
                }
                
                triggerList.removeArgs(ev.item);
            }, this);

            fieldsList.on('update-args', function(ev){
                triggerList._updateArgs(ev.cloneargs);
            }, this);

            this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                .linkCollection(null, new SchemeCollection([
                    fieldsList.getLocalsSchemeFieldDark(),
                    fieldsList.createButtonLocalsField('Добавить аргумент'),
                    triggerList.createButtonField('Триггеры', admin.fields.NewDialogTriggers),
                    triggerList.getSchemeField(),
//                    fieldsList.createButtonLocalsField('Добавить аргумент'),
                    fieldsList.createButtonField('Поля формы', admin.fields.NewDialogFields),
                    fieldsList.getSchemeField()
                ]));
        }.bind(this));
    }
});

admin.Dialog = admin.DialogFieldList.extend({
    className: 'Dialog',
    moduleName: 'Dialog',
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogSelectBlockTpl'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainDialog: this})
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
        admin.DialogFieldList.prototype.createAttrs.apply(this, arguments);
        
        this.set({
            name: 'Интерфейс '+DialogCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([])
            )
        });
        
        this.get('flagList').add([admin.global.DialogAllFlag]);
        admin.global.DialogAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= DialogCounter){
            DialogCounter = digit[0]*1+1;
        }
        
        var flagList = this.get('flagList');
        var fieldsList = this.get('fieldsList');
        
        if (!flagList){
            return;
        }
        
        if (!this.get('triggerList')){
            this.set({
                triggerList: project.watch(
                    new admin.ActionList(
                        [], []
                ))
            });
        }
        
        var triggerList = this.get('triggerList');
        
        this.on('before-clone', function(ev){
            var argst = ev.attr.triggerList.args();
            var argsf = ev.attr.fieldsList.args();
            var cloneargs = [];
            argsf.forEach(function(a, i){
                cloneargs.push({arg: argst[i], clone: a});
            }, this);
            
            ev.attr.triggerList._updateArgs(cloneargs);
        }, this);
        
        project.afterSyncItem("DialogFlagsList", function(DialogFlagsList){
            project.afterSync([flagList, fieldsList, triggerList], function(){
                flagList.on('add', function(ev){
                    ev.item.add([this]);
                }, this);

                flagList.on('remove', function(ev){
                    ev.item.remove(this);
                }, this);
                
                var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                    DialogFlagsList.createButtonField('Создать коллекцию'),
                    DialogFlagsList.createSchemeField(flagList)
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

                var editorField = this.destrLsn(new SchemeField('#DialogTpl'))
                    .linkInputValue('.blki-name', this, 'name')
                    .linkTextValue('.blki-group', flags, 'flagsName')
                    .click('.clone', function(SField){
                        var clone = this.clone();

                        SField.window().open(clone.getEditor(), SField.DOM, {mainObject: clone});
                    }.bind(this))
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
                    .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)});

                fieldsList.on('add-args', function(ev){
                    if (ev.item.isCustomArg()){
                        this.setAttribute(ev.item.id, ev.item);
                    }

                    triggerList.addArgs([ev.item]);
                }, this);

                fieldsList.on('remove-args', function(ev){
                    var attrs = this.attributes;
                    for (var i in attrs){
                        if (attrs[i] === ev.item){
                            this.removeAttribute(i);
                        }
                    }

                    triggerList.removeArgs(ev.item);
                }, this);

                fieldsList.on('update-args', function(ev){
                    triggerList._updateArgs(ev.cloneargs);
                }, this);

                this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                    .linkCollection(null, new SchemeCollection([
                        editorField,
                        fieldsList.getLocalsSchemeFieldDark(),
                        fieldsList.createButtonLocalsField('Добавить аргумент'),
                        triggerList.createButtonField('Триггеры', admin.fields.NewDialogTriggers),
                        triggerList.getSchemeField(),
                        fieldsList.createButtonField('Поля формы', admin.fields.NewDialogFields),
                        fieldsList.getSchemeField()
                    ]));
            }.bind(this));
        }.bind(this));
    }
});

