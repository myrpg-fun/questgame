admin.TimerSetAction = ActionClass.extend({
    className: 'TimerSetAction',
    moduleName: 'Timer',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerSetAction', this))
            .linkInputValue('.blki-set', this, 'set')
            .linkSwitchValue('.blki-start', this, 'start')
            .openFieldClick('.link-timer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Timer'),
                            admin.fields.TimerCollection
                        ]));
                }.bind(this),
                {onSelect: function(timer){
                    this.set({timer: timer});
                }.bind(this)})
            .linkTextValue('.blki-timername', this.name, 'timerName')
            .openFieldClick('.link-ftimer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Timer'),
                            this.createLocalsField('Counter'),
                            admin.fields.TimerCollection,
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(ftimer){
                    this.set({ftimer: ftimer});
                }.bind(this)})
            .linkTextValue('.blki-ftimername', this.name, 'ftimerName')
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .openFieldClick('.link-edit', function(){
                if (this.get('timer'))
                    return this.get('timer').getEditor();
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
        this.addNameListenerEvent('ftimer', this.name, 'ftimerName', 'Выберите счётчик или таймер', 'name');
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
    createAttrs: function(project){
        this.set({
            timer: null,
            set: '00:00:00',
            ftimer: null,
            start: false
        });
    },
    init: function(){
        this.errorTestValue('timer', null, 'Ошибка: Выберите таймер');
        
        this.ctrdata = (new zz.data()).set({
            counterClass: 'blk-field hide-object'
        });
        
        this.on('set:ftimer', function(ev){
            this.ctrdata.set({
                counterClass: 
                    ev.value === null?
                    'blk-field hide-object':
                    'blk-field hide-counter'
            });
        }, this);
        
    }
});

/*admin.TimerDummyStartAction = ActionClass.extend({
    className: 'TimerDummyStartAction',
    moduleName: 'Timer',
    _actionLists: function(){
        return [this.get('action')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerDummyStartAction', this))
            .linkInputValue('.blki-set', this, 'set')
            .openFieldClick('.link-edit', function(){
                if (this.get('timer'))
                    return this.get('timer').getEditor();
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
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
    },
    createAttrs: function(project){
        this.set({
            set: '00:00:00',
            action: project.watch(new admin.ActionList([], {})),
        });
    },
    init: function(){
    },
    initialize: function(){
        SyncedItem.prototype.initialize.apply(this, arguments);
        
        this.editorBlk = null;
        
        this.on('before-clone', function(ev){
            this.cloneAttrs().forEach(function(idx){
                ev.attr[idx] = ev.attr[idx].clone();
            }, this);
        }, this);
        
        this.on('added-collection', function(event){
            if (event.collection instanceof admin.ActionListCollection){
                event.collection.afterSync(function(){
                    event.collection.afterSync(function(){
                        this._al = event.collection;
                        
                        this._actionLists().forEach(function(col){
                            var locals = this._al.args();
                            for (var i in locals){
                                if (col.get(i)){
                                    continue;
                                }
                                
                                col.setAttribute(i, locals[i].clone());
                            }
                        }, this);
                        
                        var fn = function(ev){
                            this._actionLists().forEach(function(col){
                                var i = ev.attribute;
                                if (col.get(i)){
                                    return;
                                }

                                col.setAttribute(i, ev.item.clone());
                            }, this);
                        }.bind(this);
                        
                        this._al.on('add-locals', fn, this);
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    }
});*/

admin.TimerAddAction = ActionClass.extend({
    className: 'TimerAddAction',
    moduleName: 'Timer',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerAddAction', this))
            .linkInputValue('.blki-set', this, 'set')
            .linkTextValue('.blki-timername', this.name, 'timerName')
            .linkInputValue('.blki-operator', this, 'operator')
            .openFieldClick('.link-timer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Timer'),
                            admin.fields.TimerCollection
                        ]));
                }.bind(this),
                {onSelect: function(timer){
                    this.set({timer: timer});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-timer').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('timer'))
                    return this.get('timer').getEditor();
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
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
    createAttrs: function(project){
        this.set({
            timer: null,
            set: '00:00:00',
            operator: '+'
        });
    },
    init: function(){
        this.errorTestValue('timer', null, 'Ошибка: Выберите таймер');
    }
});

admin.TimerStartAction = ActionClass.extend({
    className: 'TimerStartAction',
    moduleName: 'Timer',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerStartAction', this))
            .linkTextValue('.blki-timername', this.name, 'timerName')
            .openFieldClick('.link-timer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Timer'),
                            admin.fields.TimerCollection
                        ]));
                }.bind(this),
                {onSelect: function(timer){
                    this.set({timer: timer});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('timer'))
                    return this.get('timer').getEditor();
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
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
    createAttrs: function(project){
        this.set({
            timer: null
        });
    },
    init: function(){
        this.errorTestValue('timer', null, 'Ошибка: Выберите таймер');
    }
});

admin.TimerStopAction = ActionClass.extend({
    className: 'TimerStopAction',
    moduleName: 'Timer',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerStopAction', this))
            .linkTextValue('.blki-timername', this.name, 'timerName')
            .openFieldClick('.link-timer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Timer'),
                            admin.fields.TimerCollection
                        ]));
                }.bind(this),
                {onSelect: function(timer){
                    this.set({timer: timer});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('timer'))
                    return this.get('timer').getEditor();
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
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
    createAttrs: function(project){
        this.set({
            timer: null
        });
    },
    init: function(){
        this.errorTestValue('timer', null, 'Ошибка: Выберите таймер');
    }
});

admin.TimerIsActiveAction = ActionClass.extend({
    className: 'TimerIsActiveAction',
    moduleName: 'Timer',
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TimerIsActiveAction', this))
            .linkTextValue('.blki-timername', this.name, 'timerName')
            .openFieldClick('.link-timer', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Timer'),
                            admin.fields.TimerCollection
                        ]));
                }.bind(this),
                {onSelect: function(timer){
                    this.set({timer: timer});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('timer'))
                    return this.get('timer').getEditor();
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
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
    createAttrs: function(project){
        this.set({
            timer: null,
            yes: project.watch(new admin.ActionList([], this._listArgs())),
            no: project.watch(new admin.ActionList([], this._listArgs())),
        });
    },
    init: function(){
        this.errorTestValue('timer', null, 'Ошибка: Выберите таймер');
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Таймеры', new SchemeCollection([
    //        new SelectButtonField('#TimerDummyStartAction', admin.TimerDummyStartAction),
            new SelectButtonField('#TimerSetAction', admin.TimerSetAction),
            new SelectButtonField('#TimerStopAction', admin.TimerStopAction),
            new SelectButtonField('#TimerAddAction', admin.TimerAddAction),
            new SelectButtonField('#TimerStartAction', admin.TimerStartAction),
            new SelectButtonField('#TimerIsActiveAction', admin.TimerIsActiveAction),
        ]))
    ], 'Timer')
]);
