var DialogClassCounter = 1;

ActionArgSelectDialogItem = zz.data.extend({
    onSelect: function(){
        return this._init.item.get('dialog');
    },
    getSelectSchemeField: function(){
        var schemeBlk = new SchemeField('#ArgSelectFieldTpl')
            .linkTextValue('.blki-name', this, 'name')
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(
                    this.onSelect()
                );
            }.bind(this));

        return schemeBlk;
    },
    initialize: function(item, classArg){
        zz.data.prototype.initialize.call(this);

        this._init = {item: item, class: classArg};
        
        this.set({name: classArg.map(function(f){return f.get('name');}).join(' → ')+' → '+item.get('name')});
    }
});

admin.ActionDArgClass = admin.ActionArgClass.extend({
    className: 'ActionDArgClass',
    isCustomArg: function(){
        return true;
    }
});

admin.DialogClass = ActionClass.extend({
    className: 'DialogClass',
    moduleName: 'Dialog',
    classObject: 'Dialog',
    defaultMessage: 'Выберите диалог',
    cloneAttrs: function(){
        return ['dialog'];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('dialog')?this.get('dialog').clone({createObject: true}):null});
        
        return object;
    },
    getValue: function(){
        return this.get('dialog');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.DialogCollection;
    },
    createTableSchemeField: function(){
        return [];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
//        return (type === this.classObject)?[new ActionArgSelectDialogItem(this, argclass)]:[];
    },
    getObjectEditField: function(dlg, obj){
        return dlg.getEditor();
    },
    createAttrs: function(project){
        var dlg = project.watch(new admin.DialogFieldList);
        var arg = project.watch( new admin.ActionDArgClass('Класс', this._init.class) );
        
        dlg.get('fieldsList').addArgs([
            arg
        ]);
        
        this.set({
            name: 'Диалог '+DialogClassCounter,
            dialog: dlg
        });
    },
    init: function(project){
        var dlg = this.get('dialog');
        
        this.on('set:name', function(ev){
            dlg.set({name: '['+ev.value+']'});
        }, this);
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= DialogClassCounter){
            DialogClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        project.afterSync(function(){
            var editBlk = this.destrLsn(new SchemeField('#DialogClassEditBlock', this))
//                .linkAttributeValue('.blki-obj', 'style', this.name, 'style')
                .linkInputValue('.blki-name', this, 'name')
/*                .linkTextValue('.blki-invname', this.name, 'inventoryName')
                .openFieldClick('.link-inv', 
                    function(){
                        return makeSchemeFieldList(new SchemeCollection([
                            this.selectCollection()
                        ]));
                    }.bind(this),
                    {onSelect: function(dialog){
                        this.set({dialog: dialog});
                    }.bind(this)})*/
//                .linkInputValue('.blki-cloned', this, 'cloned')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                new ClassHiddenPropertiesField([
                    this.get('dialog').editorBlk
                ])
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.DialogPtrClass = ActionClass.extend({
    className: 'DialogPtrClass',
    moduleName: 'Dialog',
    classObject: 'DialogPtr',
    defaultMessage: 'Выберите диалог',
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('dialogptr').clone()});
        
        return object;
    },
    getValue: function(){
        return this.get('dialog');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.DialogCollection;
    },
    createTableSchemeField: function(){
        return [];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    createAttrs: function(project){
        this.set({
            name: 'Диалог '+DialogClassCounter,
            dialogptr: project.watch( new admin.DialogPtr )
        });
        
        this.set({
            classArg: project.watch( new admin.ActionArgClass('Класс ', this._init.class) )
        });
    },
    init: function(project){
        this.name = (new zz.data());
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= DialogClassCounter){
            DialogClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.get('classArg').deleteSync();
            this.get('dialogptr').deleteSync();
        }, this);

        project.afterSync(function(){
            this.get('dialogptr').addNameListenerEvent('dialog', this.name, 'dialogName', 'Пустой интерфейс', 'name');
            
            var editBlk = this.destrLsn(new SchemeField('#DialogPtrClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
/*                .linkAttributeValue('.blki-obj', 'style', this.name, 'style')
                .linkTextValue('.blki-dialogname', this.name, 'dialogName')
                .openFieldClick('.link-dlg', 
                    function(){
                        return makeSchemeFieldList(new SchemeCollection([
                            new SelectField('#ArgValueEmptyForm', null),
                            /*makeSchemeFieldList(new SchemeCollection(
                                this.get('classArg').filterByType('Dialog').map(function(arg){
                                    return arg.getSelectSchemeField();
                                })
                            )),*/
//                            this.createLocalsField('Dialog'),
//                            this.selectCollection()
/*                        ]));
                    }.bind(this),
                    {onSelect: function(dialog){
                        this.get('dialogptr').setDialog(dialog);
                    }.bind(this)})*/
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
    new ModuleContainer([
        new SelectButtonField('#DialogPtrClassEditBlock', admin.DialogPtrClass),
        new SelectButtonField('#DialogClassEditBlock', admin.DialogClass),
    ], 'Dialog')
]);