admin.DialogFieldClass = admin.TriggerClass.extend({
/*    cloneAttrs: function(){
        return [];
    },*/
    getLocalsByType: function(type){
        return [];
    }
});


admin.CustomDialogTextField = admin.CustomField.extend({
    className: 'CustomDialogTextField',
    moduleName: 'common',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CustomField'))
            .linkTextValue('.blki-name', this.name, 'name')
            .openFieldClick('.link-open', function(){
                return makeSchemeFieldList(new SchemeCollection([
                    this.get('actionClass').createLocalsField(this.get('type')),
                    admin.fields.ArgumentRelation[this.get('type')]
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
    createAttrs: function(project){
        this.set(this._init);
    },
    initialize: function(type, actionClass){
        ActionClass.prototype.initialize.apply(this, arguments);

        this._init = {type: type, item: null, actionClass: actionClass};
    },
    init: function(){
        var defaultName = '';
        switch(this.get('type')){
            case 'Text':
                defaultName = 'текст';
                break;
            case 'Counter':
                defaultName = 'счетчик';
                break;
            case 'Timer':
                defaultName = 'таймер';
                break;
            case admin.global.PlayerTemplate:
                defaultName = 'игрока';
                break;
        }
        
        this.name = (new zz.data());
        this.addNameListenerEvent('item', this.name, 'name', 'Выбрать '+defaultName, 'name');
        this.addLocalsListener('item', this.get('type'));
    }
});

admin.DialogFieldText = admin.DialogFieldClass.extend({
    className: 'DialogFieldText',
    moduleName: 'Dialog',
    createSchemeField: function(){
        var refresh = function(){
            vars.set({
                TXTst: 'full blki-text txt-editor '+(this.get('center')?'center':'')+' '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')+' '+this.get('style')+' font-'+this.get('font')
            });
        }.bind(this);
        
        var vars = (new zz.data).set({
            Bst: 'btn '+(this.get('bold')?'checked':''),
            Ist: 'btn '+(this.get('italic')?'checked':''),
            Hst: 'btn '+(this.get('style')==='header'?'checked':''),
            Mst: 'btn '+(this.get('style')==='medium'?'checked':''),
            Sst: 'btn '+(this.get('style')==='small'?'checked':''),
            Cst: 'btn '+(this.get('center')?'checked':''),
            Fst: 'btn '+(this.get('font')==='roboto-condenced'?'checked':''),
        });
        
        refresh();
        
        this.on('set:bold', function(ev){ 
            vars.set({
                Bst: 'btn '+(ev.value?'checked':''),
            }); 
            refresh();
        }, this);
        
        this.on('set:center', function(ev){ 
            vars.set({
                Cst: 'btn '+(ev.value?'checked':''),
            }); 
            refresh();
        }, this);
        
        this.on('set:italic', function(ev){ 
            vars.set({
                Ist: 'btn '+(ev.value?'checked':''),
            }); 
            refresh();
        }, this);
        
        this.on('set:font', function(ev){ 
            vars.set({
                Fst: 'btn '+(this.get('font')==='roboto-condenced'?'checked':''),
            }); 
            refresh();
        }, this);
        
        this.on('set:style', function(ev){ 
            vars.set({
                Hst: 'btn '+(ev.value==='header'?'checked':''), 
                Mst: 'btn '+(ev.value==='medium'?'checked':''),
                Sst: 'btn '+(ev.value==='small'?'checked':''),
            }); 
            refresh();
        }, this);
        
        return this.destrLsn(new SchemeField('#DialogFieldText'))
            .linkInputValue('.blki-text', this, 'text')
            .click('.btn-bold', function(){
                this.set({
                    bold: this.get('bold')?false:true
                });
            }.bind(this))
            .click('.btn-center', function(){
                this.set({
                    center: this.get('center')?false:true
                });
            }.bind(this))
            .click('.btn-italic', function(){
                this.set({
                    italic: this.get('italic')?false:true
                });
            }.bind(this))
            .click('.btn-header', function(){
                this.set({
                    style: 'header'
                });
            }.bind(this))
            .click('.btn-small', function(){
                this.set({
                    style: 'small'
                });
            }.bind(this))
            .click('.btn-medium', function(){
                this.set({
                    style: 'medium'
                });
            }.bind(this))
            .click('.btn-font', function(ev){
                this.set({
                    font: this.get('font')==='roboto-condenced'?'roboto':'roboto-condenced'
                });
            }.bind(this))
            .linkInputColor('.blki-color', this, 'color')
            .linkAttributeValue('.btn-bold', 'class', vars, 'Bst')
            .linkAttributeValue('.btn-center', 'class', vars, 'Cst')
            .linkAttributeValue('.btn-italic', 'class', vars, 'Ist')
            .linkAttributeValue('.btn-header', 'class', vars, 'Hst')
            .linkAttributeValue('.btn-small', 'class', vars, 'Sst')
            .linkAttributeValue('.btn-medium', 'class', vars, 'Mst')
            .linkAttributeValue('.btn-font', 'class', vars, 'Fst')
            .linkAttributeValue('.blki-text', 'class', vars, 'TXTst')
            .linkInputValue('.blki-percent', this, 'width')
            .linkCollection('.blk-classfields', this.classFields)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Текст',
            style: 'medium',
            center: false,
            bold: false,
            italic: false,
            font: 'roboto',
            color: '#FFFFFF',
            width: 100,
            customFields: []
        });
    }, 
    init: function(){
        if (!this.get('customFields')){
            this.set({customFields:[]});
        }
            
        this.on('before-clone', function(ev){
            ev.attr.customFields.forEach(function(attr, i){
                if (attr instanceof admin.CustomDialogTextField){
                    ev.attr.customFields[i] = attr.clone();
                }
            }, this);
        }, this);
        
        this.on('after-clone', function(ev){
            ev.clone.get('customFields').forEach(function(attr, i){
                if (attr instanceof admin.CustomDialogTextField){
                    attr.set({actionClass: ev.clone});
                }
            }, this);
        }, this);
        
        this.classFields = new SchemeCollection([]);

        this.redraw = function(){
            this.classFields.removeAll();
            this.classFields.add(
                this.get('customFields').map(function(field){
                    return field.getSchemeField();
                })
            );
        };
        
        this.on('set:text', function(ev){
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
                        case '{t}':
                        case '{T}':
                            return this.watcher.watch(new admin.CustomDialogTextField('Text', this));
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

admin.DialogFieldTask = admin.DialogFieldClass.extend({
    className: 'DialogFieldTask',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldTask'))
            .linkInputValue('.blki-text', this, 'text')
            .linkCollection('.blk-classfields', this.classFields)
            .linkTextValue('.blki-taskname', this.name, 'taskName')
            .openFieldClick('.link-edit', function(){
                if (this.get('task'))
                    return this.get('task').getEditor();
                return false;
            }.bind(this),{})
            .openFieldClick('.link-task', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Task'),
                            admin.fields.TaskCollection
                        ]));
                }.bind(this),
                {onSelect: function(taskObject){
                    this.set({task: taskObject});
                }.bind(this)})
            .click(null, function(DOMfield){
                    DOMfield.DOM.find('.link-task').click();
                    return false; 
                })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Выполните ...',
            task: null,
            customFields: []
        });
    }, 
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('task', this.name, 'taskName', 'Выберите задачу', 'name');
        this.addLocalsListener('task', 'Task');
        
        this.classFields = new SchemeCollection([]);

        this.redraw = function(){
            this.classFields.removeAll();
            this.classFields.add(
                this.get('customFields').map(function(field){
                    return field.getSchemeField();
                })
            );
        };
        
        this.on('set:text', function(ev){
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
                        case '{t}':
                        case '{T}':
                            return this.watcher.watch(new admin.CustomDialogTextField('Text', this));
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

admin.DialogChangeTextField = admin.DialogFieldClass.extend({
    className: 'DialogChangeTextField',
    moduleName: 'Dialog',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            Bst: 'btn '+(this.get('bold')?'checked':''),
            Ist: 'btn '+(this.get('italic')?'checked':''),
            Hst: 'btn '+(this.get('style')==='header'?'checked':''),
            Mst: 'btn '+(this.get('style')==='medium'?'checked':''),
            Sst: 'btn '+(this.get('style')==='small'?'checked':''),
            Cst: 'btn '+(this.get('center')?'checked':''),
            Fst: 'btn '+(this.get('font')==='roboto-condenced'?'checked':''),
        });
        
        this.on('set:bold', function(ev){ 
            vars.set({
                Bst: 'btn '+(ev.value?'checked':''),
            }); 
        }, this);
        
        this.on('set:center', function(ev){ 
            vars.set({
                Cst: 'btn '+(ev.value?'checked':''),
            }); 
        }, this);
        
        this.on('set:italic', function(ev){ 
            vars.set({
                Ist: 'btn '+(ev.value?'checked':''),
            }); 
        }, this);
        
        this.on('set:font', function(ev){ 
            vars.set({
                Fst: 'btn '+(this.get('font')==='roboto-condenced'?'checked':''),
            }); 
        }, this);
        
        this.on('set:style', function(ev){ 
            vars.set({
                Hst: 'btn '+(ev.value==='header'?'checked':''), 
                Mst: 'btn '+(ev.value==='medium'?'checked':''),
                Sst: 'btn '+(ev.value==='small'?'checked':''),
            }); 
        }, this);
        
        return this.destrLsn(new SchemeField('#DialogChangeTextField'))
            .click('.btn-bold', function(){
                this.set({
                    bold: this.get('bold')?false:true
                });
            }.bind(this))
            .click('.btn-center', function(){
                this.set({
                    center: this.get('center')?false:true
                });
            }.bind(this))
            .click('.btn-italic', function(){
                this.set({
                    italic: this.get('italic')?false:true
                });
            }.bind(this))
            .click('.btn-header', function(){
                this.set({
                    style: 'header'
                });
            }.bind(this))
            .click('.btn-small', function(){
                this.set({
                    style: 'small'
                });
            }.bind(this))
            .click('.btn-medium', function(){
                this.set({
                    style: 'medium'
                });
            }.bind(this))
            .click('.btn-font', function(ev){
                this.set({
                    font: this.get('font')==='roboto-condenced'?'roboto':'roboto-condenced'
                });
            }.bind(this))
            .linkAttributeValue('.btn-bold', 'class', vars, 'Bst')
            .linkAttributeValue('.btn-center', 'class', vars, 'Cst')
            .linkAttributeValue('.btn-italic', 'class', vars, 'Ist')
            .linkAttributeValue('.btn-header', 'class', vars, 'Hst')
            .linkAttributeValue('.btn-small', 'class', vars, 'Sst')
            .linkAttributeValue('.btn-medium', 'class', vars, 'Mst')
            .linkAttributeValue('.btn-font', 'class', vars, 'Fst')
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-textname', this.name, 'textName')
            .openFieldClick('.link-text', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Text'),
                            admin.fields.TextCollection
                        ]));
                }.bind(this),
                {onSelect: function(text){
                    this.set({text: text});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('text'))
                    return this.get('text').getEditor();
                return false;
            }.bind(this),{})
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            name: 'f'+DialogCounter++,
            text: null,
            style: 'medium',
            center: false,
            bold: false,
            italic: false,
            font: 'roboto'
        });
    }, 
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('text', this.name, 'textName', 'Выберите текст', 'name');
        this.addLocalsListener('text', 'Text');
    }
});

admin.DialogFieldImage = admin.DialogFieldClass.extend({
    className: 'DialogFieldImage',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldImage'))
            .openFieldClick('.link-image', admin.fields.DialogImageCollection, {onSelect: function(icon){
                this.set({image: icon.get('image')});
            }.bind(this)})
            .linkAttributeValue('.blki-image', 'src', this, 'image')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this))
            .linkInputValue('.blki-percent', this, 'width')
            .click('.blki-image', function(FieldDOM){
                FieldDOM.DOM.find('.link-image').click();
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            width: 100,
            image: '/admin/road-street-blur-blurred.jpg'
        });
    }
});

admin.DialogFieldAudio = admin.DialogFieldClass.extend({
    className: 'DialogFieldAudio',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldAudio'))
            .openFieldClick('.link-open', admin.fields.AudioCollection, {onSelect: function(icon){
                this.set({audio: icon});
            }.bind(this)})
            .link( new ADLinkAudio('.blk-audio', this, 'audio') )
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            audio: admin.global.NewAudio
        });
    }
});

admin.DialogFieldTextImage = admin.DialogFieldClass.extend({
    className: 'DialogFieldTextImage',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldTextImage'))
            .openFieldClick('.link-image', admin.fields.DialogImageCollection, {onSelect: function(icon){
                this.set({image: icon.get('image')});
            }.bind(this)})
            .linkInputValue('.blki-text', this, 'text')
            .linkInputValue('.blki-color', this, 'color')
            .linkAttributeValue('.blki-image', 'src', this, 'image')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this))
            .click('.blki-image', function(FieldDOM){
                FieldDOM.DOM.find('.link-image').click();
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            image: '/admin/road-street-blur-blurred.jpg',
            color: 'black',
            text: 'Текст'
        });
    }
});

admin.DialogFieldSeparator = admin.DialogFieldClass.extend({
    className: 'DialogFieldSeparator',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogFieldSeparator'))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({});
    }
});

admin.DialogTextButton = admin.DialogFieldClass.extend({
    className: 'DialogTextButton',
    moduleName: 'Dialog',
    _actionLists: function(){
        return [this.get('list')];
    },
    cloneAttrs: function(){
        return ['list'];
    },
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#DialogTextButton'))
            .linkInputValue('.blki-text', this, 'text')
            .linkInputValue('.blki-percent', this, 'width')
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Закрыть',
            width: 100,
            list: project.watch(new admin.ActionList([
                project.watch(new admin.DialogPlayerCloseAction)
            ], this._listArgs()))
        });
    }
});

admin.DialogInputButton = admin.DialogFieldClass.extend({
    className: 'DialogInputButton',
    moduleName: 'Dialog',
    _listArgsAfter: function(){
        return [this.get('arg')];
    },
    _updateArgsAfter: function(){
        var cloneargs = this._listArgsAfter().map(function(arg){
            return {arg: arg, clone: arg.clone()};
        }.bind(this));
        
        this._al._updateArgs(cloneargs);
    },
    createSchemeField: function(){
//        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#DialogInputButton'))
            .linkInputValue('.blki-name', this, 'name')
/*            .linkInputValue('.blki-button', this, 'button')
            .openFieldClick('.link-open', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        actionList.getLocalsSchemeField(),
                        actionList.createCopyButtonField('Действия'),
                        actionList.getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-open').click();
                return false; 
            })*/
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            name: 'Текст '+DialogCounter++
        });
        
        this.set({
            arg: project.watch(new admin.ActionArg(this.get('name'), 'Text'))
        });

/*        this.set({
            list: project.watch(new admin.ActionList([], this._listArgs()))
        });*/
    },
    init: function(project){
        this.on('added-collection', function(event){
            this._al.addArgs([this.get('arg')]);
        });

        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
        }, this);
        
        project.afterSync(function(){
            this.on('set:name', function(ev){
                var arg = this.get('arg');
                if (arg){
                    arg.set({name: ev.value});
                }
            }, this);
        }.bind(this));
    }
});

admin.DialogChangeField = admin.DialogFieldClass.extend({
    className: 'DialogChangeField',
    moduleName: 'Dialog',
    _listArgsAfter: function(){
        return [this.get('arg')];
    },
    _updateArgsAfter: function(){
        var cloneargs = this._listArgsAfter().map(function(arg){
            return {arg: arg, clone: arg.clone()};
        }.bind(this));
        
        this._al._updateArgs(cloneargs);
    },
    getLocalsByType: function(type){
        return (type==='DialogField')?[this]:[];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogChangeField'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-dialogname', this.name, 'dialogName')
            .openFieldClick('.link-dialog', 
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
                    this.get('dialogptr').set({dialog: dialog});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('dialogptr').get('dialog'))
                    return this.get('dialogptr').get('dialog').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-classfields', this.classFields)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            name: 'Диалог '+DialogCounter++,
            dialogptr: project.watch( new admin.DialogPtr )
        });
        
        this.set({
            arg: project.watch(new admin.ActionArg(this.get('name'), 'DialogPtr'))
        });
    },
    init: function(project){
        this.name = (new zz.data());
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= DialogClassCounter){
            DialogClassCounter = digit[0]*1+1;
        }

        this.on('added-collection', function(event){
            this._al.addArgs([this.get('arg')]);
        });

        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
            this.get('dialogptr').deleteSync();
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

        //project.afterSync(function(){
            this.get('dialogptr').addNameListenerEvent('dialog', this.name, 'dialogName', 'Пустой интерфейс', 'name');
            
            this.get('dialogptr').on('set:dialog', function(ev){
                if (ev.lastValue instanceof admin.DialogFieldList){
                    ev.lastValue.get('fieldsList').off('add-args', afn);
                    ev.lastValue.get('fieldsList').off('remove-args', rfn);

                    ev.lastValue._listArgsKeys().forEach(function(id){
                        rfn({item: ev.lastValue.get(id), id: id});
                    }, this);
                }

                if (ev.value instanceof admin.DialogFieldList){
                    ev.value.get('fieldsList').on('add-args', afn, this);
                    ev.value.get('fieldsList').on('remove-args', rfn, this);

                    ev.value._listArgsKeys().forEach(function(id){
                        afn({item: ev.value.get(id), id: id});
                    }, this);
                }
            }, this);
        //}.bind(this));
        
        this.on('set:name', function(ev){
            this.get('arg').set({name: ev.value});
        }, this);
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Пустой интерфейс', 'name');
    }
});

admin.DialogLocalIFField = admin.DialogFieldClass.extend({
    className: 'DialogLocalIFField',
    moduleName: 'Dialog',
    _actionLists: function(){
        return [this.get('fieldsList')];
    },
    _listArgsAfter: function(){
        return [this.get('arg')];
    },
    _updateArgsAfter: function(){
        var cloneargs = this._listArgsAfter().map(function(arg){
            return {arg: arg, clone: arg.clone()};
        }.bind(this));
        
        this._al._updateArgs(cloneargs);
    },
    getLocalsByType: function(type){
        return (type==='Interface')?[this]:[];
    },
    createSchemeField: function(){
        return (new SchemeField('#BlkListSortTpl')).linkCollection('.blk-list', new SchemeCollection([
            this.destrLsn(new SchemeField('#DialogLocalIFField'))
                .linkInputValue('.blki-name', this, 'name')
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this)),
                new ClassHiddenPropertiesField([
                    this.get('fieldsList').createButtonField('Поля формы', admin.fields.NewDialogFields),
                    this.get('fieldsList').getSchemeField()
                ])
        ]));
    },
    createAttrs: function(project){
        this.set({
            name: 'Локальный диалог '+DialogCounter++
        });
        
        this.set({
            fieldsList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            ))
        });
        
        this.set({
            arg: project.watch(new admin.ActionArg(this.get('name'), 'Dialog'))
        });
    },
    init: function(project){
        this.name = (new zz.data());
        
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= DialogCounter){
            DialogCounter = digit[0]*1+1;
        }

        this.on('added-collection', function(event){
            this._al.addArgs([this.get('arg')]);
        }, this);

        this.on('destroy', function(eventcol){
            if (this.get('arg')){
                this.get('arg').deleteSync();
            }
        }, this);
        
        this.on('set:name', function(ev){
            this.get('arg').set({name: ev.value});
        }, this);
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Пустой интерфейс', 'name');
    },
});

admin.DialogInventorySelect = admin.DialogFieldClass.extend({
    className: 'DialogInventorySelect',
    moduleName: 'Dialog',
    _listArgs: function(){
        return [this.get('itemArg'), this.get('countArg')];
    },
    _actionLists: function(){
        return [this.get('click'), this.get('dblclick')];
    },
    cloneAttrs: function(){
        return ['click', 'dblclick'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogInventorySelect'))
            .linkInputFloat('.blki-x', this, 'x')
            .linkInputFloat('.blki-y', this, 'y')
            .openFieldClick('.link-edit', function(){
                if (this.get('inventory'))
                    return this.get('inventory').getEditor();
                return false;
            }.bind(this),{})
            .linkTextValue('.blki-inventoryname', this.name, 'inventoryName')
            .openFieldClick('.link-inventory', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Inventory'),
                            admin.fields.InventoryCollection
                        ]));
                }.bind(this),
                {onSelect: function(inventory){
                    this.set({inventory: inventory});
                }.bind(this)})
            .linkInputValue('.blki-percent', this, 'width')
            .openFieldClick('.link-click', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('click').getLocalsSchemeField(),
                        this.get('click').createCopyButtonField('Действия'),
                        this.get('click').getSchemeField()
                    ])
                )
            , {}))
/*            .openFieldClick('.link-dblclick', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('dblclick').getLocalsSchemeField(),
                        this.get('dblclick').createCopyButtonField('Действия'),
                        this.get('dblclick').getSchemeField()
                    ])
                )
            , {}))*/
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-inventory').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('inventory', this.name, 'inventoryName', 'Выберите инвентарь', 'name');
        this.addLocalsListener('inventory', 'Inventory');
    },
    createAttrs: function(project){
        this.set({
            inventory: null,
            itemArg: project.watch(new admin.ActionArg('Выбранный предмет', 'InventoryItem')),
            countArg: project.watch(new admin.ActionArg('Количество выбранного предмета', 'Counter')),
            width: 100,
            x: 7,
            y: 0
        });
        
        this.set({
            click: project.watch(new admin.ActionList([], this._listArgs())),
            dblclick: project.watch(new admin.ActionList([], this._listArgs()))
        });
    },
    init: function(){}
});

admin.DialogQRCodeCheck = admin.DialogFieldClass.extend({
    className: 'DialogQRCodeCheck',
    moduleName: 'Dialog',
    _listArgs: function(){
        return [this.get('qrArg')];
    },
    _actionLists: function(){
        return [this.get('check')];
    },
    cloneAttrs: function(){
        return ['check'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogQRCodeCheck'))
            .linkInputValue('.blki-percent', this, 'width')
            .openFieldClick('.link-check', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('check').getLocalsSchemeField(),
                        this.get('check').createCopyButtonField('Действия'),
                        this.get('check').getSchemeField()
                    ])
                )
            , {}))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
    },
    createAttrs: function(project){
        this.set({
            qrArg: project.watch(new admin.ActionArg('Сканированный QR код', 'QRCode')),
            width: 100
        });
        
        this.set({
            check: project.watch(new admin.ActionList([], this._listArgs())),
        });
    },
    init: function(){}
});

admin.DialogInventoryItem = admin.DialogFieldClass.extend({
    className: 'DialogInventoryItem',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#DialogInventoryItem'))
            .linkAttributeValue('.blk-ctrfld', 'class', this.ctrdata, 'counterClass')
            .linkInputInteger('.blki-counter', this, 'counter')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .linkCollection('.blk-errors', this.errorList)
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
                if (this.get('item'))
                    return this.get('item').getEditor();
                return false;
            }.bind(this),{})
            .linkTextValue('.blki-itemname', this.name, 'itemName')
            .openFieldClick('.link-item', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('InventoryItem'),
                            admin.fields.InventoryItemCollection
                        ]));
                }.bind(this),
                {onSelect: function(item){
                    this.set({item: item});
                }.bind(this)})
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-item').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('counterObject', this.name, 'counterName', '', 'name');
        this.addNameListenerEvent('item', this.name, 'itemName', 'Выберите предмет', 'name');
        this.addLocalsListener('item', 'InventoryItem');
    },
    createAttrs: function(project){
        this.set({
            item: null,
            counter: 1,
            counterObject: null,
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

admin.DialogTableField = admin.DialogFieldClass.extend({
    className: 'DialogTableField',
    moduleName: 'Dialog',
    createSchemeField: function(){
        var fields = new SchemeCollection([]);
        if (this.get('class')){
            this.get('class').get('classList').forEach(function(cls){
                fields.add(cls.getTableSchemeField());
            }, this);
        }
        
        this.on('set:class', function(ev){
            fields.removeAll();
            
            if (ev.value){
                ev.value.get('classList').forEach(function(cls){
                    fields.add(cls.getTableSchemeField());
                }, this);
            }
            
            var tf = this.get('tableFields');
            
            tf.getCollection().forEach(function(action){
                tf.remove(action);
            }, tf);
        });
        
        return this.destrLsn(new SchemeField('#DialogTableField'))
            .openFieldClick('.link-edit', function(){
                if (this.get('class'))
                    return this.get('class').getEditor();
                return false;
            }.bind(this),{})
            .linkTextValue('.blki-classname', this.name, 'className')
            .openFieldClick('.link-class', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            admin.fields.ClassCollection
                        ]));
                }.bind(this),
                {onSelect: function(cls){
                    this.set({class: cls});
                }.bind(this)})
            .linkTextValue('.blki-group', this.name, 'flagsName')
            .openFieldClick('.link-group', this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                admin.global.ObjectFlagsList.createButtonField('Создать коллекции'),
                admin.global.ObjectFlagsList.createSchemeField(this.get('flagList'))
            ]) )), {onSelect: this.get('flagList').toggleFlag.bind(this.get('flagList'))})
            .linkTextValue('.blki-select', this.name, 'selectName')
            .openFieldClick('.link-select', this.destrLsn(makeSchemeFieldList( new SchemeCollection([
                admin.global.ObjectFlagsList.createButtonField('Создать коллекции'),
                admin.global.ObjectFlagsList.createSchemeField(this.get('selectList'))
            ]) )), {onSelect: this.get('selectList').toggleFlag.bind(this.get('selectList'))})
            .openFieldClick('.link-fields', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        new CreateButtonField('Поля формы', function(){
                            return makeSchemeFieldList(fields);
                        }, {onSelect: function(actionClass, cls){
                            var newAC = new actionClass(this.get('class'), cls.get('name'));

                            this.get('tableFields').add([ this.watcher.watch(newAC) ]);
                        }.bind(this)}),
                        this.get('tableFields').getSchemeField()
                    ])
                )
            , {}))
            .click(null, function(DOMfield){
                DOMfield.DOM.find('.link-fields').click();
                return false; 
            })
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('class', this.name, 'className', 'Выберите класс', 'name');
    },
    createAttrs: function(project){
        this.set({
            class: null,
            flagList: project.watch(
                new admin.FlagCollectionList([
                    admin.global.ObjectAllFlag
                ])
            ),
            selectList: project.watch(
                new admin.FlagCollectionList([])
            ),
        });
        
        this.set({
            tableFields: project.watch(new admin.ActionList([], this._listArgs())),
        });
    },
    init: function(){
        this.addGroupListenerEvent('flagList', this.name, 'Выберите коллекцию', 'name', 'flagsName');
        this.addGroupListenerEvent('selectList', this.name, 'Выберите коллекции', 'name', 'selectName');
    }
});

admin.DialogFieldTimer = admin.DialogFieldClass.extend({
    className: 'DialogFieldTimer',
    moduleName: 'Dialog',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            Bst: 'btn '+(this.get('bold')?'checked':''),
            Ist: 'btn '+(this.get('italic')?'checked':''),
            Hst: 'btn '+(this.get('style')==='header'?'checked':''),
            Mst: 'btn '+(this.get('style')==='medium'?'checked':''),
            Sst: 'btn '+(this.get('style')==='small'?'checked':''),
            Fst: 'btn '+(this.get('font')==='roboto-condenced'?'checked':''),
            TXTst: 'full blki-text txt-editor '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')+' '+this.get('style')+' font-'+this.get('font')
        });
        
        this.on('set:bold', function(ev){ 
            vars.set({
                Bst: 'btn '+(ev.value?'checked':''),
                TXTst: 'full blki-text txt-editor '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')+' '+this.get('style')+' font-'+this.get('font')
            }); 
        }, this);
        
        this.on('set:italic', function(ev){ 
            vars.set({
                Ist: 'btn '+(ev.value?'checked':''),
                TXTst: 'full blki-text txt-editor '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')+' '+this.get('style')+' font-'+this.get('font')
            }); 
        }, this);
        
        this.on('set:font', function(ev){ 
            vars.set({
                Fst: 'btn '+(this.get('font')==='roboto-condenced'?'checked':''),
                TXTst: 'full blki-text txt-editor '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')+' '+this.get('style')+' font-'+this.get('font')
            }); 
        }, this);
        
        this.on('set:style', function(ev){ 
            vars.set({
                Hst: 'btn '+(ev.value==='header'?'checked':''), 
                Mst: 'btn '+(ev.value==='medium'?'checked':''),
                Sst: 'btn '+(ev.value==='small'?'checked':''),
                TXTst: 'full blki-text txt-editor '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')+' '+this.get('style')+' font-'+this.get('font')
            }); 
        }, this);
        
        return this.destrLsn(new SchemeField('#DialogFieldTimer'))
            .click('.btn-bold', function(){
                this.set({
                    bold: this.get('bold')?false:true
                });
            }.bind(this))
            .click('.btn-italic', function(){
                this.set({
                    italic: this.get('italic')?false:true
                });
            }.bind(this))
            .click('.btn-header', function(){
                this.set({
                    style: 'header'
                });
            }.bind(this))
            .click('.btn-small', function(){
                this.set({
                    style: 'small'
                });
            }.bind(this))
            .click('.btn-medium', function(){
                this.set({
                    style: 'medium'
                });
            }.bind(this))
            .click('.btn-font', function(ev){
                this.set({
                    font: this.get('font')==='roboto-condenced'?'roboto':'roboto-condenced'
                });
            }.bind(this))
            .linkAttributeValue('.btn-bold', 'class', vars, 'Bst')
            .linkAttributeValue('.btn-italic', 'class', vars, 'Ist')
            .linkAttributeValue('.btn-header', 'class', vars, 'Hst')
            .linkAttributeValue('.btn-small', 'class', vars, 'Sst')
            .linkAttributeValue('.btn-medium', 'class', vars, 'Mst')
            .linkAttributeValue('.btn-font', 'class', vars, 'Fst')
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
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        admin.TriggerClass.prototype.initialize.apply(this, arguments);
        
        this.name = (new zz.data());
        this.addNameListenerEvent('timer', this.name, 'timerName', 'Выберите таймер', 'name');
        this.addLocalsListener('timer', 'Timer');
    },
    createAttrs: function(project){
        this.set({
            timer: null,
            style: 'medium',
            bold: false,
            italic: false,
            font: 'roboto'
        });
    }
});

admin.fields.NewDialogFields = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#DialogFieldText', admin.DialogFieldText),
        new SelectButtonField('#DialogFieldImage', admin.DialogFieldImage),
        new SelectButtonField('#DialogTextButton', admin.DialogTextButton),
        new SelectButtonField('#DialogFieldSeparator', admin.DialogFieldSeparator),
        new ModuleContainer([
            new SelectButtonField('#DialogFieldAudio', admin.DialogFieldAudio),
        ], 'Audio'),
        new ModuleContainer([
            new SelectButtonField('#DialogInventorySelect', admin.DialogInventorySelect),
//            new SelectButtonField('#DialogInventoryItem', admin.DialogInventoryItem),
        ], 'Inventory'),
        new ModuleContainer([
            new SelectButtonField('#DialogFieldTask', admin.DialogFieldTask),
        ], 'Task'),
        new ModuleContainer([
            new SelectButtonField('#DialogQRCodeCheck', admin.DialogQRCodeCheck),
        ], 'QRCode'),
//        new SelectButtonField('#DialogFieldTimer', admin.DialogFieldTimer),
//        new SelectButtonField('#DialogChangeTextField', admin.DialogChangeTextField),
        new ModuleContainer([
            new SelectButtonField('#DialogLocalIFField', admin.DialogLocalIFField),
            new SelectButtonField('#DialogChangeField', admin.DialogChangeField),
        ], 'DialogPtr'),
        new ModuleContainer([
            new SelectButtonField('#DialogInputButton', admin.DialogInputButton),
        ], 'Text'),
        //new SelectButtonField('#DialogTableField', admin.DialogTableField),        
    ])
);