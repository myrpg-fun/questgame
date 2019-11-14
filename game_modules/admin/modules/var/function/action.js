admin.FunctionRunAction = ActionClass.extend({
    className: 'FunctionRunAction',
    moduleName: 'Function',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#FunctionRunAction', this))
            .linkTextValue('.blki-funcname', this.name, 'funcName')
            .openFieldClick('.link-func', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Function'),
                            admin.fields.FunctionCollection
                        ]));
                }.bind(this),
                {onSelect: function(func){
                    this.set({func: func});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-func').click();
                    return false; 
                })
            .linkCollection('.blk-classfields', this.classFields)
            .openFieldClick('.link-edit', function(){
                if (this.get('func'))
                    return this.get('func').getEditor();
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
        this.addNameListenerEvent('func', this.name, 'funcName', 'Выберите функцию', 'name');
        this.addLocalsListener('func', 'Function');
    },
    createAttrs: function(project){
        this.set({
            func: null,
        });
    },
    init: function(){
        this.errorTestValue('func', null, 'Ошибка: Выберите функцию');
        
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

        this.on('set:func', function(ev){
            var lastValue = ev.lastValue;
            if (lastValue instanceof admin.ActionArgClassItem){
                lastValue = lastValue.get('item');
                if (lastValue instanceof admin.FunctionClass){
                    lastValue = lastValue.getValue();
                }
            }
            
            if (lastValue instanceof admin.Function){
                lastValue.get('action').off('add-args', afn);
                lastValue.get('action').off('remove-args', rfn);
                
                lastValue._listArgsKeys().forEach(function(id){
                    rfn({item: lastValue.get(id), id: id});
                }, this);
            }

            var value = ev.value;
            if (value instanceof admin.ActionArgClassItem){
                value = value.get('item');
                if (value instanceof admin.FunctionClass){
                    value = value.getValue();
                }
            }
            
            if (value instanceof admin.Function){
                value.get('action').on('add-args', afn, this);
                value.get('action').on('remove-args', rfn, this);

                value._listArgsKeys().forEach(function(id){
                    afn({item: value.get(id), id: id});
                }, this);
            }
        }, this);
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Функции', new SchemeCollection([
            new SelectButtonField('#FunctionRunAction', admin.FunctionRunAction),
        ]))
    ], 'Function')
]);
