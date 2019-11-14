var TaskClassCounter = 1;

admin.TaskClass = ActionClass.extend({
    className: 'TaskClass',
    moduleName: 'Task',
    classObject: 'Task',
    defaultMessage: 'Выберите задачу',
    cloneAttrs: function(){
        return ['task', 'triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('task')?this.get('task').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('task');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.TaskCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#TaskClassTable', admin.TaskClassTable, this)
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
        var task = project.watch( new admin.Task );
        
        task.removeFlag( admin.global.TaskAllFlag );
        
        this.set({
            name: 'Задача '+TaskClassCounter,
            task: task
        });
        
        this.set({
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= TaskClassCounter){
            TaskClassCounter = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        this.on('set:name', function(ev){
            this.get('task').set({name: '['+ev.value+']'});
        }, this);
        
        project.afterSync([triggerList], function(){
            this.get('task').on('destroy', function(){
                this.destroy();
            }, this);

            var editBlk = this.destrLsn(new SchemeField('#TaskClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewTaskTriggers),
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
        new SelectButtonField('#TaskClassEditBlock', admin.TaskClass)
    ], 'Task')
]);
