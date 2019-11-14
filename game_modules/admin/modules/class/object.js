var ObjectCounter = 1;

admin.ObjectsEditorList = admin.ActionList.extend({
    className: 'ObjectsEditorList',
    moduleName: 'common',
    collectionInstance: null
});

admin.ObjectItem = ActionClass.extend({
    className: 'ObjectItem',
    moduleName: 'common',
    cloneAttrs: function(){
        if (this.isCloned()){
            return ['item'];
        }
        
        return [];
    },
    createObjectSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectItemField'))
            .linkTextValue('.blki-name', this.name, 'name')
            .linkTextValue('.blk-hint', this.name, 'hint')
            .openFieldClick('.link-open', function(){
                return this.get('itemType').selectCollection();
            }.bind(this), {onSelect: function(item){
                this.set({item: item});
            }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('item'))
                    return this.get('item').getEditor();
                return false;
            }.bind(this),{})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    getObjectEditField: function( object ){
        return this.get('item')?this.get('itemType').getObjectEditField( this.get('item'), object ):null;
    },
    createAttrs: function(project){
        this.set(this._init);
    },
    isCloned: function(){
        return this.get('itemType').getCloned() === 'clone';
    },
    getTypeName: function(){
        return this.get('itemType').get('name');
    },
    getItem: function(){
        return this.get('item');
    },
    setItemName: function(name){
        var item = this.get('item');
        if (item){
            item.set({name: name});
        }
    },
    init: function(){
        var itemType = this.get('itemType');
        this.name = (new zz.data());

        this.on('destroy', function(){
            if (this.isCloned() && this.get('item')){
                this.get('item').deleteSync();
            }
        }, this);
        
        if (itemType){
            itemType.afterSync(function(){
                this.addNameListenerEvent('item', this.name, 'name', 'Выбрать '+itemType.get('name'), 'name');
                //this.addLocalsListener('item', itemType.classObject);
                
                this.on('set:item', function(ev){
                    this.name.set({hint: ev.value === null?'Выберите '+itemType.get('name'):ev.value.get('name')});
                }, this);
            }.bind(this));
        }
        
        this.on('before-clone', function(ev){
            if (ev.attr.item && ev.attr.itemType.get('cloned') === 'clone'){
                ev.attr.item = ev.attr.item.clone();
            }            
        }, this);
    },
    initialize: function(itemType){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {itemType: itemType, item: null};
    }
});

admin.ObjectField = admin.ObjectItem.extend({
    className: 'ObjectField',
    moduleName: 'Class',
    changeClone: function(cloneargs){
        var i = this.get('item');
        
        var f = cloneargs.find(function(o){
            return i === o.arg;
        }.bind(this));

        if (f){
            this.set({item: f.clone});
        }

        return this;
    },
    createObjectSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectItemField'))
            .linkTextValue('.blki-name', this.name, 'name')
            .linkTextValue('.blk-hint', this.name, 'hint')
            .openFieldClick('.link-open', function(){
                return makeSchemeFieldList(new SchemeCollection([
                    this.nulled?new SelectField(this.nulled, null):null,
                    this.get('ac').createLocalsField(this.get('itemType').classObject),
                    this.get('itemType').selectCollection()
                ]));
            }.bind(this), {onSelect: function(item){
                this.set({item: item});
            }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('item'))
                    return this.get('item').getEditor();
                return false;
            }.bind(this),{})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    init: function(){
        var itemType = this.get('itemType');
        this.name = (new zz.data());
        
        this.on('set:item', function(ev){
            this.name.set({hint: ev.value === null?'Выберите '+this.get('itemType').get('name'):this.get('itemType').get('name')});
        }, this);
        
        if (itemType){
            itemType.afterSync(function(){
                this.addNameListenerEvent('item', this.name, 'name', 'Нет '+itemType.get('name'), 'name');
                //this.addLocalsListener('item', itemType.classObject);
            }.bind(this));
        }
    },
    initialize: function(itemType, actionClass){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.nulled = null;
        this._init = {itemType: itemType, item: null, name: '', ac: actionClass};
    },
});

admin.Object = ActionClass.extend({
    className: 'Object',
    moduleName: 'Class',
    removeFlag: function(flag){
        this.get('flagList').remove(flag);
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#ObjectSelectBlock'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.editorBlk;}.bind(this), {})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                if (stack.onSelect){
                    stack.onSelect(this);
                }else{
                    DOMfield.DOM.find('.link-open').click();
                }
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            name: this._class.get('name')+' '+ObjectCounter++,
/*            flagList: project.watch(
                new admin.FlagCollectionList([admin.global.ObjectAllFlag])
            ),*/
            class: this._class
        });
        
        //admin.global.ObjectAllFlag.add([this]);
    },
    init: function(project){
        var flags = (new zz.data()).set({flagsName: ''});
//        this.addGroupListenerEvent('flagList', flags, 'Выберите коллекции', 'name', 'flagsName');
        this.name = (new zz.data());
//        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= ObjectCounter){
            ObjectCounter = digit[0]*1+1;
        }
        
/*        this.on('before-clone', function(ev){
            ev.attr.class.getLocals().forEach(function(item){
                ev.attr[item.id] = ev.attr[item.id].clone();
                
                if (ev.attr[item.id].isCloned()){
                    ev.attr[item.id].setItemName(ev.attr.name+' '+ev.attr[item.id].getTypeName());
                }
            });
        }, this);*/
        
        this.on('after-clone', function(ev){
            ev.attr.class.get('objectList').add([ev.clone]);
        }, this);
        
        this.on('after-clone', function(ev){
            var name = ev.clone.get('name');
            var digit = /\d+$/g.exec(name);
            if (digit === null){
                ev.clone.set({name: name+' '+ObjectCounter++});
            }else{
                digit = digit[0];
                ev.clone.set({name: name.substr(0, name.length - digit.length) + ObjectCounter++});
            }
        }, this);
        
        this.on('set:name', function(ev){
            if (!ev.lastValue){
                return;
            }
            
            this.get('class').getClassFields().forEach(function(item){
                if (this.get(item.id).isCloned()){
                    this.get(item.id).setItemName(ev.value+' '+this.get(item.id).getTypeName());
                }
            }, this);
        }, this);
       
        this.on('destroy', function(ev){
            if (this.get('class')){
                this.get('class').getClassFields().forEach(function(item){
                    if (this.get(item.id).isCloned()){
                        var it = this.get(item.id).getItem();
                        if (it){
                            it.destroy();
                        }
                    }
                    this.get(item.id).destroy();
                }, this);
            }
        }, this);
       
//        var flagList = this.get('flagList');
            var classFields = new SchemeCollection([]);
            var classItems = new SchemeCollection([]);

            var afn = function(ev){
                var val = this.get(ev.item.id);
                if (!val){
                    val = ev.item.createObjectField();
                    this.setAttribute(ev.item.id, val);
                }

                if (ev.item.getCloned() === 'none'){
                    classFields.add([
                        val.getObjectSchemeField()
                    ]);
                }else{
                    var inc = val.getObjectEditField( this );
                    
                    if (inc){
                        classItems.add([inc]);
                    }
                }
            }.bind(this);

            var rfn = function(ev){
                var val = this.get(ev.item.id);

                if (val){
                    this.removeAttribute(ev.item.id);
                    val.deleteSync();
                }

                classFields.removeAll();
                classItems.removeAll();
                if (this.get('class')){
                    this.get('class').getClassFields().forEach(function(item){
                        afn({item: item});
                    });
                }
            }.bind(this);

            this.on('set:class', function(ev){
                if (ev.lastValue){
                    ev.lastValue.off('add-item', afn);
                    ev.lastValue.off('remove-item', rfn);

                    ev.value.getClassFields().forEach(function(item){
                        rfn({item: item});
                    });
                }

                classFields.removeAll();

                if (ev.value){
                    ev.value.on('add-item', afn, this);
                    ev.value.on('remove-item', rfn, this);

                    ev.value.getClassFields().forEach(function(item){
                        afn({item: item});
                    });
                }
            });

        
        project.afterSync(function(){
/*            flagList.on('add', function(ev){
                ev.item.add([this]);
            }, this);

            flagList.on('remove', function(ev){
                ev.item.remove(this);
            }, this);

            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new admin.FlagCollectionList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);

            var flagCField = this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                ObjectFlagsList.createButtonField('Создать коллекцию'),
                ObjectFlagsList.createSchemeField(flagList)
            ]) ));*/

            var editorField = this.destrLsn(new SchemeField('#Object'))
                .linkInputValue('.blki-name', this, 'name')
/*                .linkTextValue('.blki-group', flags, 'flagsName')
                .openFieldClick('.link-group',                         
                    makeSchemeFieldList(
                        new SchemeCollection([
                            flagCField,
                            new ModuleContainer([
                                new HeaderField('Общие коллекции'),
                                admin.fields.CollectionAll
                            ], 'Collection')
                        ])), 
                    {onSelect: flagList.toggleFlag.bind(flagList)})
                .linkTextValue('.blki-classname', this.name, 'className')
                .openFieldClick('.link-class', admin.fields.ClassCollection,
                    {onSelect: function(classObj){
                        this.set({class: classObj});
                    }.bind(this)})
                .openFieldClick('.link-edit', function(){
                    if (this.get('class'))
                        return this.get('class').getEditor();
                    return false;
                }.bind(this),{})*/
                .linkCollection('.blk-classfields', classFields)
                .click('.clone', function(SField){
                    var clone = this.clone();

                    SField.window().open(clone.editorBlk, SField.DOM, {mainObject: clone});
                }.bind(this))
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                .linkCollection(null, new SchemeCollection([
                    editorField,
                    makeSchemeFieldList( classItems )
                ]));
        }.bind(this));
    },
    initialize: function(objectClass){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._class = objectClass;
    },
});
