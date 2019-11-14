var TextClassCounter = 1;

admin.TextClassTable = ActionClass.extend({
    className: 'TextClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TextClassTable'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-className', this, 'header')
            .openFieldClick('.link-click', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('click').getLocalsSchemeField(),
                        this.get('click').createCopyButtonField('Действия'),
                        this.get('click').getSchemeField()
                    ])
                )
            , {}))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            header: this._init.name,
            name: this._init.name,
            click: project.watch(new admin.ActionList([], {
                admin: project.watch(new admin.ActionArgClass('Адинистратор кликнул', admin.global.PlayerTemplate)),
                object: project.watch(new admin.ActionArgClass('Объект класса', this._init.class))
            }))
        });
    },
    initialize: function(classObj, name){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj, name: name};
    }
});

/*admin.TextClass = ActionClass.extend({
    className: 'TextClass',
    moduleName: 'Text',
    classObject: 'Text',
    defaultMessage: 'Выберите текст',
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        this.setupField(object);
        
        return object;
    },
    setupField: function(object){
        switch (this.get('cloned')){
            case 'none':
                object.set({item: null});
                break;
            case 'no':
                object.set({item: this.get('text')});
                break;
            case 'clone':
                object.set({item: this.get('text')?this.get('text').clone():null});
                break;
        }        
    },
    getValue: function(){
        return this.get('text');
    },
    getCloned: function(){
        return this.get('cloned');
    },
    selectCollection: function(){
        return admin.fields.TextCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#TextClassTable', admin.TextClassTable, this)
        ];
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
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            name: 'Текст '+TextClassCounter,
            cloned: 'none',
            text: null,
        });
    },
    init: function(project){
        this.name = (new zz.data());
        this.addNameListenerEvent('text', this.name, 'textName', 'Нет текста', 'name');
        
        this.on('set:cloned', function(){
            this.name.set({
                style: this.get('cloned')!=='none'?'':'display:none'
            });
        }, this);
        
        //var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TextClassCounter){
            TextClassCounter = digit[0]*1+1;
        }

        //project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#TextClassEditBlock', this))
                .linkAttributeValue('.blki-obj', 'style', this.name, 'style')
                .linkInputValue('.blki-name', this, 'name')
                .linkTextValue('.blki-textname', this.name, 'textName')
                .openFieldClick('.link-text', 
                    function(){
                        return makeSchemeFieldList(new SchemeCollection([
                            this.selectCollection()
                        ]));
                    }.bind(this),
                    {onSelect: function(text){
                        this.set({text: text});
                    }.bind(this)})
                .linkInputValue('.blki-cloned', this, 'cloned')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk
            ])));
        //}.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});*/

admin.TextClass = ActionClass.extend({
    className: 'TextClass',
    moduleName: 'Text',
    classObject: 'Text',
    defaultMessage: 'Выберите текст',
    cloneAttrs: function(){
        return ['text'];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('text')?this.get('text').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('text');
    },
    getCloned: function(){
        return 'clone';
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#TextClassTable', admin.TextClassTable, this)
        ];
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
    cloneAttrs: function(){
        return [];
    },
    getObjectEditField: function(mm, obj){
        mm.parentObject = obj;
        
        return this.destrLsn(new SchemeField('#TextObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputValue('.blki-text', mm, 'text')
            .linkCollection('.blk-errors', mm.errorList);
    },
    createAttrs: function(project){
        var txt = new admin.Text;

        this.set({
            name: 'Текст '+TextClassCounter,
            cloned: 'none',
            text: project.watch(txt)
        });

        txt.removeFlag( admin.global.TextAllFlag );
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TextClassCounter){
            TextClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        project.afterSync([this.get('text')], function(){
            var editBlk = this.destrLsn(new SchemeField('#TextClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkInputValue('.blki-text', this.get('text'), 'text')
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

admin.TextClassSet = ActionClass.extend({
    className: 'TextClassSet',
    moduleName: 'Text',
    classObject: 'Text',
    defaultMessage: 'Выберите текст',
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('text');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.TextCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#TextClassTable', admin.TextClassTable, this)
        ];
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
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            name: 'Текст '+TextClassCounter
            /*triggerList: project.watch(
                new admin.ActionList(
                    [], {
                        object: project.watch(new admin.ActionArgClass('Класс точки', this._init.class))
                    }
            ))*/
        });
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TextClassCounter){
            TextClassCounter = digit[0]*1+1;
        }

        //project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#TextClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk
            ])));
        //}.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
    new ModuleContainer([
        new SelectButtonField('#TextClassEditBlock', admin.TextClass),
        new SelectButtonField('#TextClassSetEditBlock', admin.TextClassSet)
    ], 'Text')
]);