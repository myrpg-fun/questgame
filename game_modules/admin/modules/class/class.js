var ClassCounter = 1;

SelectClassField = SchemeField.extend({
    initialize: function(templateId, values, cls){
        SchemeField.prototype.initialize.call(this, '#SelectButtonFieldTpl');//, templateId);
        
        var fieldBlk = new SchemeField(templateId);
        fieldBlk.linkTextValue('.blki-className', cls, 'name');
        
        this.linkField('.blk-select', fieldBlk);
        this.click(null, function(DOMfield){
            var stack = DOMfield.window().stack();
            stack.onSelect(values, cls, stack);
        }.bind(this));
    }
});

admin.ClassFlagGroupClass = admin.FlagGroupClass.extend({
    className: 'ClassFlagGroupClass',
    _schemeArgBlk: null,
    createArgSchemeField: function(){
        var schemeBlk = this.destrLsn(new GroupField(this.get('name'), this.createSchemeCollection('getArgSchemeField')));

        this.on('set:name', function(ev){
            schemeBlk.object.set({name: ev.value});
        }.bind(this));
        
        return schemeBlk;
    },
    getArgSchemeField: function(){
        if (this._schemeArgBlk){
            return this._schemeArgBlk;
        }
            
        this._schemeArgBlk = this.createArgSchemeField();
            
        return this._schemeArgBlk;
    },
});

admin.ClassObjectList = SyncedList.extend({
    className: 'ClassObjectList',
    moduleName: 'common',
    collectionInstance: null,
    getSchemeCollectionField: function(){
        return (this._schemeCBlk)?(this._schemeCBlk):(this._schemeCBlk=this.createSchemeCollectionField());
    },
});

admin.Class = ActionClass.extend({
    className: 'Class',
    moduleName: 'Class',
    _schemeArgBlk: null,
    _localInUse: false,
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createArgSchemeField: function(){
        return this.destrLsn(new SchemeField('#ClassSelectArgBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(
                        new admin.ActionArgClassRemove(this.get('name'), this)
                    );
                }
            }.bind(this));
    },
    getArgSchemeField: function(){
        if (this._schemeArgBlk){
            return this._schemeArgBlk;
        }
            
        this._schemeArgBlk = this.createArgSchemeField();
            
        return this._schemeArgBlk;
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#ClassSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){
                return this.getEditor();
            }.bind(this), {})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    getLocalsByType: function(type, argclass){
        if (this._localInUse){
            return [];
        }
        
        var result = [];
        this._localInUse = true;
        
        this.get('classList').forEach(function(classLocal){
            result = result.concat(classLocal.getLocalsByType(type, argclass));
        }, this);

        this._localInUse = false;
        
        return result;
    },
    getClassFields: function(){
        return this.get('classList');
    },
    cloneAttrs: function(){
        return ['classList', 'triggerList'];
    },
    _listArgs: function(){
        return [this.get('classArg')];
    },
    createAttrs: function(project){
        this.set({
            name: 'Класс '+ClassCounter++,
            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.ClassAllFlag])
            ),
            objectList: project.watch(
                new admin.ClassObjectList([])
            )
        });

        this.set({
            classArg: project.watch( new admin.ActionArgClass('Класс', this) )
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            classList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
        });
        
        admin.global.ClassAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= ClassCounter){
            ClassCounter = digit[0]*1+1;
        }
        
        this.on('before-clone', function(ev){
            var attr = ev.attr;
            var digit = /\d+$/g.exec(attr.name);
            if (digit === null){
                attr.name += ' '+ClassCounter++;
            }else{
                digit = digit[0];
                attr.name = attr.name.substr(0, attr.name.length - digit.length) + ClassCounter++;
            }
        }, this);        
        
        var flagList = this.get('flagList');
        var classList = this.get('classList');

        this.on('set:classList', function(){
            //on init
            this.get('classList').forEach(function(clsObj){
                clsObj.on('set:cloned', function(ev){
                    this.callEventListener('change-item', {item: clsObj, cloned: ev.value});
                }, this);
                clsObj.parentObject = this;
            }, this);
        }, this);

        this.on('destroy', function(){
            this.get('classArg').deleteSync();
        }, this);

/*        this.on('set:name', function(ev){
            this.get('classArg').set({name: ev.value});
        }, this);
*/
        project.afterSync(function(){
            var ClassFlagsList = project.getItem('ClassFlagsList');
            
            classList.on('add', function(ev){
                this.callEventListener('add-item', {item: ev.item, class: this});
                ev.item.on('set:cloned', function(ev){
                    this.callEventListener('change-item', {item: ev.target, cloned: ev.value});
                }, this);
                
                ev.item.parentObject = this;
            }, this);

            classList.on('remove', function(ev){
                this.callEventListener('remove-item', {item: ev.item, class: this});
                ev.item.off('set:cloned', null, this);
                ev.item.parentObject = null;
            }, this);

            flagList.on('add', function(ev){
                ev.item.add([this]);
            }, this);

            flagList.on('remove', function(ev){
                ev.item.remove(this);
            }, this);

            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new admin.FlagCollectionList([])
                );
                ev.attr.objectList = project.watch(
                    new admin.ClassObjectList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);

            var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                ClassFlagsList.createButtonField('Создать коллекцию', admin.ClassFlagGroupClass),
                ClassFlagsList.createSchemeField(flagList)
            ]) ));

            var ObjectsCollection = this.destrLsn(makeSchemeFieldList(new SchemeCollection([
                new CreateButtonField('Создать новый объект', function(df){
                    var inv = admin.watcher.watch(new admin.Object(this));

                    this.get('objectList').add([inv]);

                    var stack = df.window().stack();
                    if (stack.onSelect){
                        stack.onSelect(inv);
                    }

                    return inv.getEditor();
                }.bind(this), {}),
                this.destrLsn(makeSchemeFieldList(this.get('objectList').createSchemeCollection())  )
            ])));
            
            var editorField = this.destrLsn(new SchemeField('#Class'))
                .click('.clone', function(SField){
                    var clone = this.clone();

                    SField.window().open(clone.getEditor(), SField.DOM, {mainObject: clone});
                }.bind(this))
                .linkInputValue('.blki-name', this, 'name')
                .linkTextValue('.blki-group', flags, 'flagsName')
                .openFieldClick('.link-group', flagCField, {onSelect: flagList.toggleFlag.bind(flagList)})
                .openFieldClick('.link-objects', ObjectsCollection, {})
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            var triggerList = this.get('triggerList');

            this.editorBlk = this.destrLsn(makeSchemeFieldList(new SchemeCollection([
                editorField,
                new CreateButtonField('Триггеры', admin.fields.NewClassTriggers, {onSelect: (function(actionClass){
                    var newAC = new actionClass(this);

                    triggerList.add([ this.watcher.watch(newAC) ]);
                }).bind(this)}),
                triggerList.getSchemeField(),
                new CreateButtonClassField('Переменные', admin.fields.NewClasses, {onSelect: function(actionClass){
                    var newAC = new actionClass(this);

                    classList.add([ this.watcher.watch(newAC) ]);
                }.bind(this)}),
                classList.getSchemeField()
            ])));
        }.bind(this));
    }
});
