var FunctionClassCounter = 1;

admin.FunctionClass = ActionClass.extend({
    className: 'FunctionClass',
    moduleName: 'Function',
    classObject: 'Function',
    defaultMessage: 'Выберите текст',
    cloneAttrs: function(){
        return ['func'];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('func').clone()});
        
        return object;
    },
    getValue: function(){
        return this.get('func');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.FunctionCollection;
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
    getObjectEditField: function(fnc, obj){
        var action = fnc.get('action');
        
        this.get('func').get('action').on('add-args', function(ev){
            fnc.get('action').addArgs([ev.item]);
        }, this);
        
        this.get('func').get('action').on('remove-args', function(ev){
            fnc.get('action').removeArgs(ev.item);
        }, this);
        
        return this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                this.destrLsn(new SchemeField('#FunctionObjectEditBlock', this))
                    .linkTextValue('.blk-name', this, 'name'),
                new ClassHiddenPropertiesField([
                    action.getLocalsSchemeFieldDark(),
                    action.createCopyButtonField('Действия'),
                    action.getSchemeField()
                ])
            ])));        
    },
    createAttrs: function(project){
        var f = project.watch( new admin.Function );
        
        f.removeFlag(admin.global.FunctionAllFlag);

        var arg = project.watch( new admin.ActionArgClassRemove('Класс', this._init.class) );
        
        f.get('action').addArgs([
            arg
        ]);
        
        this.set({
            name: 'Действие '+FunctionClassCounter,
            func: f
        });
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= FunctionClassCounter){
            FunctionClassCounter = digit[0]*1+1;
        }

        project.afterSync(function(){
            var editBlk = this.destrLsn(new SchemeField('#FunctionClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            var action = this.get('func').get('action');

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                new ClassHiddenPropertiesField([
                    action.getLocalsSchemeFieldDark(),
                    action.createButtonLocalsField('Добавить аргумент'),
                    action.createCopyButtonField('Действия'),
                    action.getSchemeField()
                ])
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
        new SelectButtonField('#FunctionClassEditBlock', admin.FunctionClass)
    ], 'Function')
]);