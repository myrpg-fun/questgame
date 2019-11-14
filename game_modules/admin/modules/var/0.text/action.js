admin.TextTestAction = ActionClass.extend({
    className: 'TextTestAction',
    moduleName: 'Text',
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TextTestAction', this))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'textClass')
            .linkInputInteger('.blki-text', this, 'text')
            .linkTextValue('.blki-textname', this.name, 'textName')
            .openFieldClick('.link-text', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            new SelectField('#ArgValueSetSelector', null),
                            this.createLocalsField('Text'),
                            admin.fields.TextCollection
                        ]));
                }.bind(this),
                {onSelect: function(textObject){
                    this.set({textObject: textObject});
                }.bind(this)})
            .linkTextValue('.blki-ftextname', this.name, 'ftextName')
            .openFieldClick('.link-ftext', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Text'),
                            admin.fields.TextCollection
                        ]));
                }.bind(this),
                {onSelect: function(textObject){
                    this.set({ftext: textObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-ftext').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('ftext'))
                    return this.get('ftext').getEditor();
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
        this.addNameListenerEvent('ftext', this.name, 'ftextName', 'Выберите текст', 'name');
        this.addLocalsListener('ftext', 'Text');
        this.addNameListenerEvent('textObject', this.name, 'textName', '', 'name');
        
        this.errorTestValue('ftext', null, 'Ошибка: Выберите текст');
    },
    cloneAttrs: function(){
        return ['yes', 'no'];
    },
    createAttrs: function(project){
        this.set({
            ftext: null,
            text: '?',
            textObject: null,
            yes: project.watch(new admin.ActionList([], this._listArgs())),
            no: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){
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

admin.TextGenerateIDAction = ActionClass.extend({
    className: 'TextGenerateIDAction',
    moduleName: 'Text',
    _actionLists: function(){
        return [this.get('yes'), this.get('no')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#TextGenerateIDAction', this))
            .linkInputInteger('.blki-length', this, 'length')
            .linkInputValue('.blki-abc', this, 'abc')
            .linkTextValue('.blki-ftextname', this.name, 'ftextName')
            .openFieldClick('.link-ftext', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Text'),
                            admin.fields.TextCollection
                        ]));
                }.bind(this),
                {onSelect: function(textObject){
                    this.set({ftext: textObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-ftext').click();
                    return false; 
                })
            .openFieldClick('.link-edit', function(){
                if (this.get('ftext'))
                    return this.get('ftext').getEditor();
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
        this.addNameListenerEvent('ftext', this.name, 'ftextName', 'Выберите текст', 'name');
        this.addLocalsListener('ftext', 'Text');
        
        this.errorTestValue('ftext', null, 'Ошибка: Выберите текст');
        this.errorTestValue('abc', '', 'Ошибка: введите алфавит');
        this.errorTestValue('length', 0, 'Ошибка: длина должна быть больше 0');
    },
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            ftext: null,
            length: 6,
            abc: '0123456789'
        });
    },
    init: function(){
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Тексты', new SchemeCollection([
            new SelectButtonField('#TextTestAction', admin.TextTestAction),
            new SelectButtonField('#TextGenerateIDAction', admin.TextGenerateIDAction),
        ]))
    ], 'Text')
]);
