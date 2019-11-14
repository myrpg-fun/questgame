admin.DialogPlayerOpenAction = ActionClass.extend({
    className: 'DialogPlayerOpenAction',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogPlayerOpenAction', this))
            .linkTextValue('.blki-playername', this.name, 'playerName')
            .openFieldClick('.link-player', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate)
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .linkTextValue('.blki-dialogname', this.name, 'dialogName')
            .openFieldClick('.link-dialog', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Dialog'),
                            this.createLocalsField('DialogPtr'),
                            admin.fields.DialogCollection,
                            admin.fields.DialogPtrCollection
                        ]));
                }.bind(this),
                {onSelect: function(dialog){
                    this.set({dialog: dialog});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-dialog').click();
                    return false; 
                })
            .linkCollection('.blk-classfields', this.classFields)
            .openFieldClick('.link-edit', function(){
                if (this.get('dialog'))
                    return this.get('dialog').getEditor();
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
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Выберите интерфейс', 'name');
        this.addLocalsListener('dialog', 'Dialog');
    },
    createAttrs: function(project){
        this.set({
            dialog: null,
            player: null
        });
    },
    init: function(){
        this.errorTestValue('player', null, 'Ошибка: Выберите игрока');
        this.errorTestValue('dialog', null, 'Ошибка: Выберите диалог');

        this.on('before-clone', function(ev){
            var attr = ev.attr;
            for (var i in attr){
                if (attr[i] instanceof admin.CustomField){
                    attr[i] = attr[i].clone();
                }
            }
        }, this);
        
        this.on('after-clone', function(ev){
            var attr = ev.clone.getAttributes();
            for (var i in attr){
                if (attr[i] instanceof admin.CustomField){
                    attr[i].set({actionClass: ev.clone});
                }
            }
        }, this);
        
        this.classFields = new SchemeCollection([]);

        this.redraw = function(){
            var attrs = this.getAttributes();

            this.classFields.removeAll();

            for (var i in attrs){
                if (attrs[i] instanceof admin.CustomField){
                    this.classFields.add([attrs[i].getSchemeField()]);
                }
            }
        };

        var afn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.id);
            if (!val){
                val = this.watcher.watch(new admin.CustomField(ev.item, this));
                this.setAttribute(ev.id, val);
            }
            
            this.redraw();
        }.bind(this);

        var rfn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.id);
            if (val){
                this.removeAttribute(ev.id);
                val.destroy();
            }
            
            this.redraw();
        }.bind(this);

        this.on('set:dialog', function(ev){
            var lastValue = ev.lastValue;
            if (lastValue instanceof admin.ActionArgClassItem){
                lastValue = lastValue.get('item');
                if (lastValue instanceof admin.DialogClass){
                    lastValue = lastValue.getValue();
                }
            }
            
            if (lastValue instanceof admin.DialogFieldList){
                lastValue.get('fieldsList').off('add-args', afn);
                lastValue.get('fieldsList').off('remove-args', rfn);
                
                lastValue._listArgsKeys().forEach(function(id){
                    rfn({item: lastValue.get(id), id: id});
                }, this);
            }

            var value = ev.value;
            if (value instanceof admin.ActionArgClassItem){
                value = value.get('item');
                if (value instanceof admin.DialogClass){
                    value = value.getValue();
                }
            }
            
            if (value instanceof admin.DialogFieldList){
                value.get('fieldsList').on('add-args', afn, this);
                value.get('fieldsList').on('remove-args', rfn, this);

                value._listArgsKeys().forEach(function(id){
                    afn({item: value.get(id), id: id});
                }, this);
            }
        }, this);
    }
});

admin.DialogPlayerCloseAction = ActionClass.extend({
    className: 'DialogPlayerCloseAction',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogPlayerCloseAction', this))
            .linkTextValue('.blki-playername', this.name, 'playerName')
            .openFieldClick('.link-player', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate)
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-player').click();
                    return false; 
                })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        
        this.errorTestValue('player', null, 'Ошибка: Выберите игрока');
    },
    createAttrs: function(project){
        this.set({
            player: null
        });
    }
});

admin.DialogFieldChangeDialogAction = ActionClass.extend({
    className: 'DialogFieldChangeDialogAction',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldChangeDialogAction', this))
//            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-dialogname', this.name, 'dialogName')
            .openFieldClick('.link-dialog', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('DialogPtr'),
                            admin.fields.DialogPtrCollection
                        ]));
                }.bind(this),
                {onSelect: function(dialog){
                    this.set({dialog: dialog});
                }.bind(this)})
            .linkTextValue('.blki-changename', this.name, 'changeName')
            .openFieldClick('.link-change', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueEmptyForm', null),
                            this.createLocalsField('Dialog'),
                            this.createLocalsField('DialogPtr'),
                            admin.fields.DialogCollection,
                            admin.fields.DialogPtrCollection
                        ]));
                }.bind(this),
                {onSelect: function(dialog){
                    this.set({change: dialog});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-dialog').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('dialog'))
                    return this.get('dialog').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-editch', function(){
                if (this.get('change'))
                    return this.get('change').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-classfields', this.classFields)
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Выберите указатель', 'name');
        this.addLocalsListener('dialog', 'DialogPtr');
        
        this.addNameListenerEvent('change', this.name, 'changeName', 'Пустой интерфейс', 'name');
//        this.addLocalsListener('change', 'Dialog', 1);
    },
    createAttrs: function(project){
        this.set({
            dialog: null,
            change: null,
            name: ''
        });
    },
    init: function(){
//        this.errorTestValue('change', null, 'Ошибка: Выберите новый интерфейс');
        this.errorTestValue('dialog', null, 'Ошибка: Выберите указатель');
        
        this.on('before-clone', function(ev){
            var attr = ev.attr;
            for (var i in attr){
                if (attr[i] instanceof admin.CustomField){
                    attr[i] = attr[i].clone();
                }
            }
        }, this);
        
        this.on('after-clone', function(ev){
            var attr = ev.clone.getAttributes();
            for (var i in attr){
                if (attr[i] instanceof admin.CustomField){
                    attr[i].set({actionClass: ev.clone});
                }
            }
        }, this);
        
        this.classFields = new SchemeCollection([]);

        this.redraw = function(){
            var attrs = this.getAttributes();

            this.classFields.removeAll();

            for (var i in attrs){
                if (attrs[i] instanceof admin.CustomField){
                    this.classFields.add([attrs[i].getSchemeField()]);
                }
            }
        };

        var afn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.id);
            if (!val){
                val = this.watcher.watch(new admin.CustomField(ev.item, this));
                this.setAttribute(ev.id, val);
            }
            
            this.redraw();
        }.bind(this);

        var rfn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.id);
            if (val){
                this.removeAttribute(ev.id);
                val.destroy();
            }
            
            this.redraw();
        }.bind(this);

        this.on('set:change', function(ev){
            var lastValue = ev.lastValue;
            if (lastValue instanceof admin.ActionArgClassItem){
                lastValue = lastValue.get('item');
                if (lastValue instanceof admin.DialogClass){
                    lastValue = lastValue.getValue();
                }
            }
            
            if (lastValue instanceof admin.DialogFieldList){
                lastValue.get('fieldsList').off('add-args', afn);
                lastValue.get('fieldsList').off('remove-args', rfn);
                
                lastValue._listArgsKeys().forEach(function(id){
                    rfn({item: lastValue.get(id), id: id});
                }, this);
            }

            var value = ev.value;
            if (value instanceof admin.ActionArgClassItem){
                value = value.get('item');
                if (value instanceof admin.DialogClass){
                    value = value.getValue();
                }
            }
            
            if (value instanceof admin.DialogFieldList){
                value.get('fieldsList').on('add-args', afn, this);
                value.get('fieldsList').on('remove-args', rfn, this);

                value._listArgsKeys().forEach(function(id){
                    afn({item: value.get(id), id: id});
                }, this);
            }
        }, this);
    }
});

admin.DialogFieldChangeTextAction = ActionClass.extend({
    className: 'DialogFieldChangeTextAction',
    moduleName: 'Text',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldChangeTextAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'textClass')
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-dialogname', this.name, 'dialogName')
            .openFieldClick('.link-dialog', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Dialog'),
                            admin.fields.DialogCollection
                        ]));
                }.bind(this),
                {onSelect: function(dialog){
                    this.set({dialog: dialog});
                }.bind(this)})
            .linkTextValue('.blki-textname', this.name, 'textName')
            .linkInputValue('.blki-text', this, 'text')
            .openFieldClick('.link-text', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Text'),
                            admin.fields.TextCollection
                        ]));
                }.bind(this),
                {onSelect: function(text){
                    this.set({textObject: text});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-dialog').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('dialog'))
                    return this.get('dialog').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-editch', function(){
                if (this.get('textObject'))
                    return this.get('textObject').getEditor();
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
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Выберите интерфейс', 'name');
        this.addLocalsListener('dialog', 'Dialog');
        
        this.addNameListenerEvent('textObject', this.name, 'textName', 'Выберите текст', 'name');
    },
    createAttrs: function(project){
        this.set({
            dialog: null,
            text: '',
            textObject: null,
            name: ''
        });
    }, 
    init: function(){
        this.errorTestValue('dialog', null, 'Ошибка: Выберите диалога');
        this.errorTestValue('name', "", 'Ошибка: Введите имя поля');
        
        this.ctrdata = (new zz.data()).set({
            textClass: 'blk-field hide-object'
        });
        
        this.on('set:textObject', function(ev){
            this.ctrdata.set({
                textClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-text'
            });
        }, this);        
    }
});

admin.DialogMapOpenAction = ActionClass.extend({
    className: 'DialogMapOpenAction',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogMapOpenAction', this))
            .linkTextValue('.blki-playername', this.name, 'playerName')
            .openFieldClick('.link-player', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate)
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .linkTextValue('.blki-dialogname', this.name, 'dialogName')
            .openFieldClick('.link-dialog', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Dialog'),
                            admin.fields.DialogCollection
                        ]));
                }.bind(this),
                {onSelect: function(dialog){
                    this.set({dialog: dialog});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-dialog').click();
                    return false; 
                })
            .linkCollection('.blk-classfields', this.classFields)
            .openFieldClick('.link-edit', function(){
                if (this.get('dialog'))
                    return this.get('dialog').getEditor();
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
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Выберите интерфейс', 'name');
        this.addLocalsListener('dialog', 'Dialog');
    },
    createAttrs: function(project){
        this.set({
            dialog: null,
            player: null
        });
    },
    init: function(){
        this.errorTestValue('player', null, 'Ошибка: Выберите игрока');
        this.errorTestValue('dialog', null, 'Ошибка: Выберите диалог');
        
        this.on('before-clone', function(ev){
            var attr = ev.attr;
            for (var i in attr){
                if (attr[i] instanceof admin.CustomField){
                    attr[i] = attr[i].clone();
                }
            }
        }, this);
        
        this.on('after-clone', function(ev){
            var attr = ev.clone.getAttributes();
            for (var i in attr){
                if (attr[i] instanceof admin.CustomField){
                    attr[i].set({actionClass: ev.clone});
                }
            }
        }, this);
        
        this.classFields = new SchemeCollection([]);

        this.redraw = function(){
            var attrs = this.getAttributes();

            this.classFields.removeAll();

            for (var i in attrs){
                if (attrs[i] instanceof admin.CustomField){
                    this.classFields.add([attrs[i].getSchemeField()]);
                }
            }
        };

        var afn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.id);
            if (!val){
                val = this.watcher.watch(new admin.CustomField(ev.item, this));
                this.setAttribute(ev.id, val);
            }
            
            this.redraw();
        }.bind(this);

        var rfn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.id);
            if (val){
                this.removeAttribute(ev.id);
                val.destroy();
            }
            
            this.redraw();
        }.bind(this);

        this.on('set:dialog', function(ev){
            var lastValue = ev.lastValue;
            if (lastValue instanceof admin.ActionArgClassItem){
                lastValue = lastValue.get('item');
                if (lastValue instanceof admin.DialogClass){
                    lastValue = lastValue.getValue();
                }
            }
            
            if (lastValue instanceof admin.DialogFieldList){
                lastValue.get('fieldsList').off('add-args', afn);
                lastValue.get('fieldsList').off('remove-args', rfn);
                
                lastValue._listArgsKeys().forEach(function(id){
                    rfn({item: lastValue.get(id), id: id});
                }, this);
            }

            var value = ev.value;
            if (value instanceof admin.ActionArgClassItem){
                value = value.get('item');
                if (value instanceof admin.DialogClass){
                    value = value.getValue();
                }
            }
            
            if (value instanceof admin.DialogFieldList){
                value.get('fieldsList').on('add-args', afn, this);
                value.get('fieldsList').on('remove-args', rfn, this);

                value._listArgsKeys().forEach(function(id){
                    afn({item: value.get(id), id: id});
                }, this);
            }
        }, this);
    }
});

admin.DialogMapCloseAction = ActionClass.extend({
    className: 'DialogMapCloseAction',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogMapCloseAction', this))
            .linkTextValue('.blki-playername', this.name, 'playerName')
            .openFieldClick('.link-player', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField(admin.global.PlayerTemplate)
                        ]));
                }.bind(this),
                {onSelect: function(player){
                    this.set({player: player});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-player').click();
                    return false; 
                })
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('player', this.name, 'playerName', 'Выберите игрока', 'name');
        this.addLocalsListener('player', admin.global.PlayerTemplate);
        
        this.errorTestValue('player', null, 'Ошибка: Выберите игрока');
    },
    createAttrs: function(project){
        this.set({
            player: null
        });
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Интерфейсы', new SchemeCollection([
            new SelectButtonField('#DialogPlayerOpenAction', admin.DialogPlayerOpenAction),
            new SelectButtonField('#DialogPlayerCloseAction', admin.DialogPlayerCloseAction),
            new SelectButtonField('#DialogFieldChangeDialogAction', admin.DialogFieldChangeDialogAction),
//            new SelectButtonField('#DialogFieldChangeTextAction', admin.DialogFieldChangeTextAction),
            new HeaderField('Интерфейс над картой'),
            new SelectButtonField('#DialogMapOpenAction', admin.DialogMapOpenAction),
            new SelectButtonField('#DialogMapCloseAction', admin.DialogMapCloseAction),
        ]))
    ], 'Dialog')
]);
