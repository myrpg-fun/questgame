var PlayerClassCounter = 1;

admin.PlayerClassTable = ActionClass.extend({
    className: 'PlayerClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerClassTable'))
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

admin.PlayerClass = ActionClass.extend({
    className: 'PlayerClass',
    moduleName: 'Class',
    template: '#PlayerClassEditBlock',
    cloneAttrs: function(){
        return ['triggerList'];
    },
    _actionLists: function(){
        return [this.get('triggerList')];
    },
    createObjectField: function(){
        return this.watcher.watch(new admin.ObjectItem(this));
    },
    setupField: function(object){},
    selectCollection: function(){
        return null;
    },
    getValue: function(){
        return null;
    },
    getCloned: function(){
        return 'none';
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#PlayerClassTable', admin.PlayerClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        if (type === admin.global.PlayerTemplate){
            return [new ActionArgSelectClassItem(this, argclass)];
        }
        
        return admin.global.PlayerTemplate.getLocalsByType(type, argclass.concat(this));
    },
    createAttrs: function(project){
        this.set({
            name: 'Игрок '+PlayerClassCounter,
            class: admin.global.PlayerTemplate,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
    },
    init: function(project){
        var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= PlayerClassCounter){
            PlayerClassCounter = digit[0]*1+1;
        }
        
        this.classObject = admin.global.PlayerTemplate;

        project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField(this.template, this))
                .linkInputValue('.blki-name', this, 'name')
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk,
                triggerList.createButtonField('Триггеры', admin.fields.NewPlayerTriggers),
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
    new SelectButtonField('#PlayerClassEditBlock', admin.PlayerClass)
]);