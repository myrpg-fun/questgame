admin.NotificationFieldClass = admin.TriggerClass.extend({
    cloneAttrs: function(){
        return [];
    },
    getLocalsByType: function(type){
        return [];
    }
});

admin.NotificationFieldText = admin.NotificationFieldClass.extend({
    className: 'NotificationFieldText',
    moduleName: 'Notification',
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
        
        return this.destrLsn(new SchemeField('#NotificationFieldText'))
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
            .linkCollection('.blk-classfields', this.classFields)
            .linkCollection('.blk-errors', this.errorList)
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
            color: '#000000',
            customFields: []
        });
    }, 
    init: function(){
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

admin.NotificationFieldImage = admin.NotificationFieldClass.extend({
    className: 'NotificationFieldImage',
    moduleName: 'Notification',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationFieldImage'))
            .openFieldClick('.link-image', admin.fields.DialogImageCollection, {onSelect: function(icon){
                this.set({image: icon.get('image')});
            }.bind(this)})
            .linkAttributeValue('.blki-image', 'src', this, 'image')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this))
            .linkCollection('.blk-errors', this.errorList)
            .click('.blki-image', function(FieldDOM){
                FieldDOM.DOM.find('.link-image').click();
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            image: '/admin/road-street-blur-blurred.jpg'
        });
    }
});

admin.NotificationFieldSeparator = admin.NotificationFieldClass.extend({
    className: 'NotificationFieldSeparator',
    moduleName: 'Notification',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationFieldSeparator'))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({});
    }
});

admin.NotificationCloseButton = admin.NotificationFieldClass.extend({
    className: 'NotificationCloseButton',
    moduleName: 'Notification',
    createSchemeField: function(){
        var actionList = this.get('list');
        return this.destrLsn(new SchemeField('#NotificationCloseButton'))
            .linkInputValue('.blki-text', this, 'text')
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Текст',
        });
    }
});

admin.NotificationInventoryItem = admin.NotificationFieldClass.extend({
    className: 'NotificationInventoryItem',
    moduleName: 'Notification',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationInventoryItem'))
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

admin.NotificationFieldTimer = admin.NotificationFieldClass.extend({
    className: 'NotificationFieldTimer',
    moduleName: 'Notification',
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
        
        return this.destrLsn(new SchemeField('#NotificationFieldTimer'))
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
            .linkCollection('.blk-errors', this.errorList)
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

admin.NotificationFieldAudio = admin.DialogFieldClass.extend({
    className: 'NotificationFieldAudio',
    moduleName: 'Dialog',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationFieldAudio'))
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

admin.fields.NewNotificationFields = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#NotificationFieldText', admin.NotificationFieldText),
        new SelectButtonField('#NotificationFieldImage', admin.NotificationFieldImage),
        new SelectButtonField('#NotificationCloseButton', admin.NotificationCloseButton),
        new SelectButtonField('#NotificationFieldSeparator', admin.NotificationFieldSeparator),
        new ModuleContainer([
            new SelectButtonField('#NotificationFieldAudio', admin.NotificationFieldAudio),
        ], 'Audio'),
        new ModuleContainer([
            new SelectButtonField('#NotificationInventoryItem', admin.NotificationInventoryItem),
        ], 'Inventory'),
        new ModuleContainer([
            new SelectButtonField('#NotificationFieldTimer', admin.NotificationFieldTimer),
        ], 'Timer'),
    ])
);