admin.CounterSetAction = ActionClass.extend({
    className: 'CounterSetAction',
    moduleName: 'Counter',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterSetAction', this))
            .linkInputValue('.blki-counter', this, 'counter')
            .linkTextValue('.blki-fcountername', this.name, 'fcounterName')
            .linkCollection('.blk-classfields', this.classFields)
            .openFieldClick('.link-fcounter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({fcounter: counterObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-fcounter').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('fcounter'))
                    return this.get('fcounter').getEditor();
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
        this.addNameListenerEvent('fcounter', this.name, 'fcounterName', 'Выберите счётчик', 'name');
        this.addLocalsListener('fcounter', 'Counter');
    },
    createAttrs: function(project){
        this.set({
            fcounter: null,
            counter: '1',
            customFields:[]
        });
    },
    init: function(){
        this.errorTestValue('fcounter', null, 'Ошибка: Выберите счётчик');
        
        if (!this.get('customFields')){
            this.set({customFields:[]});
        }
            
        this.classFields = new SchemeCollection([]);

        this.redraw = function(){
            this.classFields.removeAll();
            this.classFields.add(
                this.get('customFields').map(function(field){
                    return field.getSchemeField();
                })
            );
        };
        
        this.on('set:counter', function(ev){
            //test count
            var lastText = ev.lastValue;
            var text = ev.value;
            
            if (lastText){
                for (var i=0;i<text.length;i++){
                    if (text[i] !== lastText[i]){
                        break;
                    }
                }
                var start = i;
                
                var shift = text.length - lastText.length;//larger
                for (var i=text.length-1;i >= start;i--){
                    if (text[i] !== lastText[i-shift]){
                        break;
                    }
                }
                var end = i;
                
                var patt = /\{[dtm]\}/gi;
                var startMatch = text.substr(0, start).match(patt);
                startMatch = startMatch===null?0:startMatch.length;
                var endMatch = text.substr(end).match(patt);
                endMatch = endMatch===null?0:endMatch.length;
                var middleMatch = text.substring(Math.max(0,start-2), Math.min(end+3, text.length)).match(patt);
                middleMatch = middleMatch===null?[]:middleMatch;
                
                var cf = this.get('customFields');
                cf.splice.apply(cf, [startMatch, cf.length-endMatch-startMatch].concat(middleMatch.map(function(type){
                    switch (type){
                        case '{m}':
                        case '{M}':
                            return this.watcher.watch(new admin.CustomDialogTextField('Timer', this));
                        case '{d}':
                        case '{D}':
                            return this.watcher.watch(new admin.CustomDialogTextField('Counter', this));
                    }
                }.bind(this))));
            }
            
            this.redraw();
        });
    }
});

admin.CounterAddAction = ActionClass.extend({
    className: 'CounterAddAction',
    moduleName: 'Counter',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterAddAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-counter', this, 'counter')
            .linkInputValue('.blki-operator', this, 'operator')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-fcountername', this.name, 'fcounterName')
            .openFieldClick('.link-fcounter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({fcounter: counterObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-fcounter').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('fcounter'))
                    return this.get('fcounter').getEditor();
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
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
        this.addNameListenerEvent('fcounter', this.name, 'fcounterName', 'Выберите счётчик', 'name');
        this.addLocalsListener('fcounter', 'Counter');
    },
    createAttrs: function(project){
        this.set({
            fcounter: null,
            counter: 1,
            counterObject: null,
            operator: '+'
        });
    },
    init: function(){
        this.errorTestValue('fcounter', null, 'Ошибка: Выберите счётчик');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:counterObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.CounterRandomAction = ActionClass.extend({
    className: 'CounterRandomAction',
    moduleName: 'Counter',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterRandomAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputInteger('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-fcountername', this.name, 'fcounterName')
            .openFieldClick('.link-fcounter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({fcounter: counterObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-fcounter').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('fcounter'))
                    return this.get('fcounter').getEditor();
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
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
        this.addNameListenerEvent('fcounter', this.name, 'fcounterName', 'Выберите счётчик', 'name');
        this.addLocalsListener('fcounter', 'Counter');
    },
    createAttrs: function(project){
        this.set({
            fcounter: null,
            counter: 1,
            counterObject: null
        });
    },
    init: function(){
        this.errorTestValue('fcounter', null, 'Ошибка: Выберите счётчик');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:counterObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.CounterTestAction = ActionClass.extend({
    className: 'CounterTestAction',
    moduleName: 'Counter',
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterTestAction', this))
            .linkInputValue('.blki-test', this, 'test')
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-fcountername', this.name, 'fcounterName')
            .openFieldClick('.link-fcounter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Counter'),
                            this.createLocalsField('QRCode'),
                            admin.fields.CounterCollection,
                            admin.fields.QRCodeCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({fcounter: counterObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-fcounter').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('fcounter'))
                    return this.get('fcounter').getEditor();
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
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
        this.addNameListenerEvent('fcounter', this.name, 'fcounterName', 'Выберите счётчик', 'name');
        this.addLocalsListener('fcounter', 'Counter');
    },
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    createAttrs: function(project){
        this.set({
            fcounter: null,
            counter: 1,
            counterObject: null,
            test: '=',
            yes: project.watch(new admin.ActionList([], this._listArgs())),
            no: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){
        this.errorTestValue('fcounter', null, 'Ошибка: Выберите счётчик');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:counterObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.CounterEachAction = ActionClass.extend({
    className: 'CounterEachAction',
    moduleName: 'Counter',
    _actionLists: function(){
        return [this.get('action')];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CounterEachAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputFloat('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counterObject: counterObject});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('counter'))
                    return this.get('counter').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-action', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('action').getLocalsSchemeField(),
                        this.get('action').createCopyButtonField('Действия'),
                        this.get('action').getSchemeField()
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
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
    },
    cloneAttrs: function(){
        return ['action'];
    },
    createAttrs: function(project){
        this.set({
            arg: project.watch(new admin.ActionArg('Счётчик цикла', 'Counter')),
        });
            
        this.set({
            counter: 1,
            counterObject: null,
            action: project.watch(new admin.ActionList([], this._listArgs())),
        });
    },
    init: function(){
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:counterObject', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Счётчики', new SchemeCollection([
            new SelectButtonField('#CounterSetAction', admin.CounterSetAction),
//            new SelectButtonField('#CounterAddAction', admin.CounterAddAction),
            new SelectButtonField('#CounterRandomAction', admin.CounterRandomAction),
            new SelectButtonField('#CounterTestAction', admin.CounterTestAction),
            new SelectButtonField('#CounterEachAction', admin.CounterEachAction),
        ]))
    ], 'Counter')
]);
