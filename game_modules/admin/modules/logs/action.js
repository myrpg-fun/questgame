admin.LogText = ActionClass.extend({
    className: 'LogText',
    moduleName: 'Log',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#LogText'))
            .linkInputValue('.blki-text', this, 'text')
            .linkInputColor('.blki-color', this, 'color')
            .linkCollection('.blk-classfields', this.classFields)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Текст',
            color: '#00A000',
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
                
                var patt = /\{[dtmu]\}/gi;
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
                        case '{u}':
                        case '{U}':
                            return this.watcher.watch(new admin.CustomDialogTextField(admin.global.PlayerTemplate, this));
                    }
                }.bind(this))));
            }
            
            this.redraw();
        });
    }
});

admin.fields.NewActionCollection.add([
    new ModuleContainer([
        new GroupField('Статистика и логи', new SchemeCollection([
            new SelectButtonField('#LogText', admin.LogText)
        ]))
    ], 'Log')
]);
