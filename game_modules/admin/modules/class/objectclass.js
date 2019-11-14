var ObjectClassCounter = 1;

admin.ObjectClass = ActionClass.extend({
    className: 'ObjectClass',
    moduleName: 'Class',
    defaultMessage: 'Выберите объект',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    getValue: function(){
        return this.get('object');
    },
    getCloned: function(){
        return this.get('cloned');
    },
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
                object.set({item: this.get('object')});
                break;
            case 'clone':
                object.set({item: this.get('object')?this.get('object').clone():null});
                break;
        }        
    },
    selectCollection: function(){
        var type = this.get('class');
        var col = new SchemeCollection([]);

        if (type){
            admin.global.ObjectAllFlag.forEach(function(obj){
                if (obj.get('class') === type){
                    col.add([obj.getSchemeField()]);
                }
            });
        }

        return makeSchemeFieldList(col);
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#ObjectClassTable', admin.ObjectClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        if (this.get('class')){
            if (type === 'Object'){
                return [new ActionArgSelectClassItem(this, argclass)];
            }
            
            if (type === this.get('class')){
                return [new ActionArgSelectClassItem(this, argclass)];
            }
            
            return this.get('class').getLocalsByType(type, argclass.concat(this));
        }
        return [];
    },
    createAttrs: function(project){
        this.set({
            name: 'Объект '+ObjectClassCounter,
            cloned: 'none',
            class: null,
            object: null,
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
        });
    },
    init: function(project){
        this.name = (new zz.data());
        this.addNameListenerEvent('object', this.name, 'objectName', 'Нет объекта', 'name');
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        this.errorTestValue('class', null, 'Ошибка: выберите класс');

        this.on('set:cloned', function(){
            this.name.set({
                style: this.get('cloned')!=='none'?'':'display:none'
            });
        }, this);
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= ObjectClassCounter){
            ObjectClassCounter = digit[0]*1+1;
        }
        
        this.on('set:class', function(ev){
            this.classObject = ev.value;
        });

        var triggerList = this.get('triggerList');

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#ObjectClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkAttributeValue('.blki-obj', 'style', this.name, 'style')
                .linkTextValue('.blki-objectname', this.name, 'objectName')
                .linkCollection('.blk-errors', this.errorList)
                .linkTextValue('.blki-classname', this.name, 'className')
                .openFieldClick('.link-class', 
                    function(){
                        return makeSchemeFieldList(
                            new SchemeCollection([
                                admin.fields.ClassCollection
                            ]));
                    }.bind(this),
                    {onSelect: function(cls){
                        this.set({
                            class: cls,
                            object: null
                        });
                    }.bind(this)})
                .openFieldClick('.link-object', 
                    function(){
                        return makeSchemeFieldList(new SchemeCollection([
                            this.selectCollection()
                        ]));
                    }.bind(this),
                    {onSelect: function(object){
                        this.set({object: object});
                    }.bind(this)})
                .linkInputValue('.blki-cloned', this, 'cloned')
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewClassTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.ObjectClassSet = ActionClass.extend({
    className: 'ObjectClassSet',
    moduleName: 'Class',
    defaultMessage: 'Выберите объект',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    getValue: function(){
        return this.get('object');
    },
    getCloned: function(){
        return 'none';
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    selectCollection: function(){
        var type = this.get('class');
        var col = new SchemeCollection([]);

        if (type){
            return this.destrLsn(makeSchemeFieldList(type.get('objectList').createSchemeCollection()));
        }

        return makeSchemeFieldList(col);
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#ObjectClassTable', admin.ObjectClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        if (this.get('class')){
            if (type === 'Object'){
                return [new ActionArgSelectClassItem(this, argclass)].concat(this.get('class').getLocalsByType(type, argclass.concat(this)));
            }
            
            if (type === this.get('class')){
                return [new ActionArgSelectClassItem(this, argclass)].concat(this.get('class').getLocalsByType(type, argclass.concat(this)));
            }
            
            return this.get('class').getLocalsByType(type, argclass.concat(this));
        }
        return [];
    },
    createAttrs: function(project){
        this.set({
            name: 'Объект '+ObjectClassCounter,
            class: null
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
        });
    },
    init: function(project){
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        this.errorTestValue('class', null, 'Ошибка: выберите класс');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= ObjectClassCounter){
            ObjectClassCounter = digit[0]*1+1;
        }
        
        this.on('set:class', function(ev){
            this.classObject = ev.value;
        });

        var triggerList = this.get('triggerList');

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#ObjectClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .linkTextValue('.blki-classname', this.name, 'className')
                .openFieldClick('.link-class', 
                    function(){
                        return makeSchemeFieldList(
                            new SchemeCollection([
                                admin.fields.ClassCollection
                            ]));
                    }.bind(this),
                    {onSelect: function(cls){
                        this.set({
                            class: cls,
                            object: null
                        });
                    }.bind(this)})
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewClassTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
//    new SelectButtonField('#ObjectClassEditBlock', admin.ObjectClass),
    new SelectButtonField('#ObjectClassSetEditBlock', admin.ObjectClassSet),
]);