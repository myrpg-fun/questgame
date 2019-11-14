var TimerClassCounter = 1;

admin.TimerClassTable = ActionClass.extend({
    className: 'TimerClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerClassTable'))
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

admin.TimerClass = ActionClass.extend({
    className: 'TimerClass',
    moduleName: 'Timer',
    classObject: 'Timer',
    defaultMessage: 'Выберите таймер',
    cloneAttrs: function(){
        return ['timer'];
    },
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('timer')?this.get('timer').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('timer');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.TimerCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#TimerClassTable', admin.TimerClassTable, this)
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
    getObjectEditField: function(mm, obj){
        mm.parentObject = obj;
        
        return this.destrLsn(new SchemeField('#TimerObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputValue('.blki-timer', mm, 'timer')
            .linkCollection('.blk-errors', mm.errorList);
    },
    createAttrs: function(project){
        var timer = project.watch( new admin.Timer );
        
        timer.removeFlag( admin.global.TimerAllFlag );
        
        this.set({
            name: 'Таймер '+TimerClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            timer: timer
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TimerClassCounter){
            TimerClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#TimerClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkInputValue('.blki-timer', this.get('timer'), 'timer')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewTimerTriggers),
                triggerList.getSchemeField()
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.TimerClassSet = ActionClass.extend({
    className: 'TimerClassSet',
    moduleName: 'Timer',
    classObject: 'Timer',
    defaultMessage: 'Выберите таймер',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('timer');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.TimerCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#TimerClassTable', admin.TimerClassTable, this)
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
    createAttrs: function(project){
        this.set({
            name: 'Таймер '+TimerClassCounter,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
            timer: null
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TimerClassCounter){
            TimerClassCounter = digit[0]*1+1;
        }

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#TimerClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewTimerTriggers),
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
    new ModuleContainer([
        new SelectButtonField('#TimerClassEditBlock', admin.TimerClass),
        new SelectButtonField('#TimerClassSetEditBlock', admin.TimerClassSet)
    ], 'Timer')
]);