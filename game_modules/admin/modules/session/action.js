admin.SessionEndAction = ActionClass.extend({
    className: 'SessionEndAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    onSelectSession: function(session){
        this.set({session: session});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionEndAction', this))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
    },
    createAttrs: function(project){
    }
});

admin.SessionShareAction = ActionClass.extend({
    className: 'SessionShareAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    onSelectSession: function(session){
        this.set({session: session});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionShareAction', this))
            .linkSwitchValue('.blki-active', this, 'active')
            .linkInputValue('.blki-text', this, 'text')
            .linkCollection('.blk-classfields', this.classFields)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Название сессии',
            active: 1,
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

admin.SessionBeginAction = ActionClass.extend({
    className: 'SessionBeginAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    onSelectSession: function(session){
        this.set({session: session});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionBeginAction', this))
            .linkSwitchValue('.blki-active', this, 'active')
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
            active: 1
        });
    }
});

admin.SessionJoinAction = ActionClass.extend({
    className: 'SessionJoinAction',
    moduleName: 'common',
    cloneAttrs: function(){
        return [];
    },
    onSelectSession: function(session){
        this.set({session: session});
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionJoinAction', this))
            .linkSwitchValue('.blki-active', this, 'active')
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
            active: 1
        });
    }
});

admin.fields.NewActionCollection.add([
    new GroupField('Сессия', new SchemeCollection([
        new SelectButtonField('#SessionShareAction', admin.SessionShareAction),
        new SelectButtonField('#SessionJoinAction', admin.SessionJoinAction),
        new SelectButtonField('#SessionBeginAction', admin.SessionBeginAction),
        new SelectButtonField('#SessionEndAction', admin.SessionEndAction),
    ]))
]);
