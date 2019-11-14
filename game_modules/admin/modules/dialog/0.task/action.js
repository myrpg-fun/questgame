admin.TaskStartAction = ActionClass.extend({
    className: 'TaskStartAction',
    moduleName: 'Task',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TaskStartAction', this))
            .openFieldClick('.link-task', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Task'),
                            admin.fields.TaskCollection
                        ]));
                }.bind(this),
                {onSelect: function(task){
                    this.set({task: task});
                }.bind(this)})
            .linkTextValue('.blki-taskname', this.name, 'taskName')
            .openFieldClick('.link-edit', function(){
                if (this.get('task'))
                    return this.get('task').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('task', this.name, 'taskName', 'Выберите задачу', 'name');
        this.addLocalsListener('task', 'Task');
    },
    createAttrs: function(project){
        this.set({
            task: null
        });
    },
    init: function(){
        this.errorTestValue('task', null, 'Ошибка: Выберите задачу');
    }
});

admin.TaskCompleteAction = ActionClass.extend({
    className: 'TaskCompleteAction',
    moduleName: 'Task',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TaskCompleteAction', this))
            .openFieldClick('.link-task', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Task'),
                            admin.fields.TaskCollection
                        ]));
                }.bind(this),
                {onSelect: function(task){
                    this.set({task: task});
                }.bind(this)})
            .linkTextValue('.blki-taskname', this.name, 'taskName')
            .openFieldClick('.link-edit', function(){
                if (this.get('task'))
                    return this.get('task').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('task', this.name, 'taskName', 'Выберите задачу', 'name');
        this.addLocalsListener('task', 'Task');
    },
    createAttrs: function(project){
        this.set({
            task: null
        });
    },
    init: function(){
        this.errorTestValue('task', null, 'Ошибка: Выберите задачу');
    }
});

admin.TaskFailedAction = ActionClass.extend({
    className: 'TaskFailedAction',
    moduleName: 'Task',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TaskFailedAction', this))
            .openFieldClick('.link-task', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Task'),
                            admin.fields.TaskCollection
                        ]));
                }.bind(this),
                {onSelect: function(task){
                    this.set({task: task});
                }.bind(this)})
            .linkTextValue('.blki-taskname', this.name, 'taskName')
            .openFieldClick('.link-edit', function(){
                if (this.get('task'))
                    return this.get('task').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('task', this.name, 'taskName', 'Выберите задачу', 'name');
        this.addLocalsListener('task', 'Task');
    },
    createAttrs: function(project){
        this.set({
            task: null
        });
    },
    init: function(){
        this.errorTestValue('task', null, 'Ошибка: Выберите задачу');
    }
});

admin.TaskCancelAction = ActionClass.extend({
    className: 'TaskCancelAction',
    moduleName: 'Task',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TaskCancelAction', this))
            .openFieldClick('.link-task', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Task'),
                            admin.fields.TaskCollection
                        ]));
                }.bind(this),
                {onSelect: function(task){
                    this.set({task: task});
                }.bind(this)})
            .linkTextValue('.blki-taskname', this.name, 'taskName')
            .openFieldClick('.link-edit', function(){
                if (this.get('task'))
                    return this.get('task').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('task', this.name, 'taskName', 'Выберите задачу', 'name');
        this.addLocalsListener('task', 'Task');
    },
    createAttrs: function(project){
        this.set({
            task: null
        });
    },
    init: function(){
        this.errorTestValue('task', null, 'Ошибка: Выберите задачу');
    }
});

admin.TaskTestAction = ActionClass.extend({
    className: 'TaskTestAction',
    moduleName: 'Task',
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TaskTestAction', this))
            .openFieldClick('.link-task', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Task'),
                            admin.fields.TaskCollection
                        ]));
                }.bind(this),
                {onSelect: function(task){
                    this.set({task: task});
                }.bind(this)})
            .linkTextValue('.blki-taskname', this.name, 'taskName')
            .linkInputValue('.blki-test', this, 'test')
            .openFieldClick('.link-edit', function(){
                if (this.get('task'))
                    return this.get('task').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-yes', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('yes').getLocalsSchemeField(),
                        this.get('yes').createCopyButtonField('Действия'),
                        this.get('yes').getSchemeField()
                    ])
                )
            , {}))
            .openFieldClick('.link-no', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('no').getLocalsSchemeField(),
                        this.get('no').createCopyButtonField('Действия'),
                        this.get('no').getSchemeField()
                    ])
                )
            , {}))
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('task', this.name, 'taskName', 'Выберите задачу', 'name');
        this.addLocalsListener('task', 'Task');
    },
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    createAttrs: function(project){
        this.set({
            task: null,
            test: 'complete',
            yes: project.watch(new admin.ActionList([], this._listArgs())),
            no: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){
        this.errorTestValue('task', null, 'Ошибка: Выберите задачу');
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Задачи', new SchemeCollection([
            new SelectButtonField('#TaskStartAction', admin.TaskStartAction),
            new SelectButtonField('#TaskCompleteAction', admin.TaskCompleteAction),
            new SelectButtonField('#TaskFailedAction', admin.TaskFailedAction),
            new SelectButtonField('#TaskCancelAction', admin.TaskCancelAction),
            new SelectButtonField('#TaskTestAction', admin.TaskTestAction),
        ]))
    ], 'Task')
]);
