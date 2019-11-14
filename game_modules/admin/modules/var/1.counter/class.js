var CounterClassCounter = 1;

admin.CounterClassTable = ActionClass.extend({
    className: 'CounterClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterClassTable'))
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
            admin: project.watch(new admin.ActionArgClass('Адинистратор кликнул', admin.global.PlayerTemplate)),
            object: project.watch(new admin.ActionArgClass('Объект класса', this._init.class))
        });
        
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

admin.CounterClass = ActionClass.extend({
    className: 'CounterClass',
    moduleName: 'Counter',
    classObject: 'Counter',
    defaultMessage: 'Выберите счётчик',
    cloneAttrs: function(){
        return ['counter'];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('counter')?this.get('counter').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('counter');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.CounterCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#CounterClassTable', admin.CounterClassTable, this)
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
        var cnt = project.watch(new admin.Counter);
        
        cnt.removeFlag(admin.global.CounterAllFlag);
        
        this.set({
            name: 'Счётчик '+CounterClassCounter,
            counter: cnt,
            /*triggerList: project.watch(
                new admin.ActionList(
                    [], {
                        object: project.watch(new admin.ActionArgClass('Класс точки', this._init.class))
                    }
            ))*/
        });
    },
    getObjectEditField: function(mm, obj){
        mm.parentObject = obj;
        
        return this.destrLsn(new SchemeField('#CounterObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputFloat('.blki-count', mm, 'count')
            .linkCollection('.blk-errors', mm.errorList);
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= CounterClassCounter){
            CounterClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        project.afterSync([this.get('counter')], function(){
            var editBlk = this.destrLsn(new SchemeField('#CounterClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkInputFloat('.blki-count', this.get('counter'), 'count')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk/*,
                triggerList.createButtonField('Триггеры', admin.fields.NewCounterTriggers),
                triggerList.getSchemeField()*/
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.CounterClassSet = ActionClass.extend({
    className: 'CounterClassSet',
    moduleName: 'Counter',
    classObject: 'Counter',
    defaultMessage: 'Выберите счётчик',
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('counter');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.CounterCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#CounterClassTable', admin.CounterClassTable, this)
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
            name: 'Счётчик '+CounterClassCounter,
            counter: null,
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
        if (digit !== null && digit[0] >= CounterClassCounter){
            CounterClassCounter = digit[0]*1+1;
        }

        //project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#CounterClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk/*,
                triggerList.createButtonField('Триггеры', admin.fields.NewCounterTriggers),
                triggerList.getSchemeField()*/
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
        new SelectButtonField('#CounterClassEditBlock', admin.CounterClass),
        new SelectButtonField('#CounterClassSetEditBlock', admin.CounterClassSet)
    ], 'Counter')
]);