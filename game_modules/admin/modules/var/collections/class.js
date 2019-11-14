var CollectionClassCounter = 1;

/*admin.fields.NewArgumentsCollection.add([
    new ModuleContainer([
        new SelectArgumentField('Коллекция', 'Collection')
    ], 'Class')
]);*/

//admin.fields.ArgumentRelation['Collection'] = admin.fields.CollectionAll;

admin.CollectionClass = ActionClass.extend({
    className: 'CollectionClass',
    moduleName: 'Class',
    classObject: 'Collection',
    defaultMessage: 'Выберите коллекцию',
    cloneAttrs: function(){
        return ['collection'];
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
                object.set({item: this.get('collection')});
                break;
            case 'clone':
                object.set({item: this.get('collection')?this.get('collection').clone():null});
                break;
        }        
    },
    getValue: function(){
        return this.get('collection');
    },
    getCloned: function(){
        return this.get('cloned');
    },
    selectCollection: function(){
        return admin.fields.CollectionAll;
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
            name: 'Коллекция '+CollectionClassCounter,
            cloned: 'none',
            collection: null,
            /*triggerList: project.watch(
                new admin.ActionList(
                    [], {
                        object: project.watch(new admin.ActionArgClass('Класс точки', this._init.class))
                    }
            ))*/
        });
    },
    init: function(project){
        this.name = (new zz.data());
        this.addNameListenerEvent('collection', this.name, 'collectionName', 'Нет коллекции', 'name');
        
        this.on('set:cloned', function(){
            this.name.set({
                style: this.get('cloned')!=='none'?'':'display:none'
            });
        }, this);
        
        //var triggerList = this.get('triggerList');

        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= CollectionClassCounter){
            CollectionClassCounter = digit[0]*1+1;
        }

        //project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#CollectionClassEditBlock', this))
                .linkAttributeValue('.blki-obj', 'style', this.name, 'style')
                .linkInputValue('.blki-name', this, 'name')
                .linkTextValue('.blki-collectionname', this.name, 'collectionName')
                .openFieldClick('.link-collection', 
                    this.selectCollection(),
                    {onSelect: function(collection){
                        this.set({collection: collection});
                    }.bind(this)})
                .linkInputValue('.blki-cloned', this, 'cloned')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk/*,
                triggerList.createButtonField('Триггеры', admin.fields.NewCollectionTriggers),
                triggerList.getSchemeField()*/
            ])));
        //}.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

/*admin.fields.NewClassesCollection.add([
    new SelectButtonField('#CollectionClassEditBlock', admin.CollectionClass)
]);*/