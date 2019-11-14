admin.MapMarkerOverlayText = admin.TriggerClass.extend({
    className: 'MapMarkerOverlayText',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            Cst: 'btn btn-align '+(this.get('align')),
            Hst: 'btn '+(this.get('size')===4?'checked':''),
            Mst: 'btn '+(this.get('size')===2?'checked':''),
            Sst: 'btn '+(this.get('size')===0?'checked':''),
        });
        
        this.on('set', function(ev){ 
            vars.set({
                Cst: 'btn btn-align '+(this.get('align')),
                Hst: 'btn '+(this.get('size')===4?'checked':''),
                Mst: 'btn '+(this.get('size')===2?'checked':''),
                Sst: 'btn '+(this.get('size')===0?'checked':''),
            }); 
        }, this);
        
        return this.destrLsn(new SchemeField('#MapMarkerOverlayText'))
            .linkCollection('.blk-errors', this.errorList)
            .linkInputValue('.blki-text', this, 'text')
//            .linkInputValue('.blki-size', this, 'size')
            .click('.btn-header', function(){
                this.set({
                    size: 4
                });
            }.bind(this))
            .click('.btn-medium', function(){
                this.set({
                    size: 2
                });
            }.bind(this))
            .click('.btn-small', function(){
                this.set({
                    size: 0
                });
            }.bind(this))
            .click('.btn-align', function(){
                this.set({
                    align: this.get('align') === 'center'?('left'):(this.get('align') === 'left'?('right'):('center'))
                });
            }.bind(this))
            .linkAttributeValue('.btn-header', 'class', vars, 'Hst')
            .linkAttributeValue('.btn-align', 'class', vars, 'Cst')
            .linkAttributeValue('.btn-small', 'class', vars, 'Sst')
            .linkAttributeValue('.btn-medium', 'class', vars, 'Mst')
            .linkInputColor('.blki-bcolor', this, 'strokeColor', 'strokeOpacity')
            .linkInputColor('.blki-fcolor', this, 'fillColor', 'fillOpacity')
            .linkInputColor('.blki-color', this, 'textColor', 'textOpacity')
            .linkInputColor('.blki-scolor', this, 'shadowColor', 'shadowOpacity')
            .linkInputInteger('.blki-y', this, 'y')
            .linkInputInteger('.blki-radius', this, 'strokeRadius')
            .linkCollection('.blk-classfields', this.classFields)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            text: 'Информация',
            y: -30,
            size: 0,
            strokeColor: '#FFFFFF',
            strokeOpacity: 0,
            fillColor: '#000000',
            fillOpacity: 0,
            textColor: '#FFFFFF',
            textOpacity: 1,
            shadowColor: '#000000',
            shadowOpacity: 0.8,
            strokeRadius: 0,
            align: 'center',
            customFields:[]
        });
    },
    init: function(){
        this.name = (new zz.data());
        
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

admin.MapMarkerOverlayBar = admin.TriggerClass.extend({
    className: 'MapMarkerOverlayBar',
    moduleName: 'MapMarker',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapMarkerOverlayBar'))
            .linkCollection('.blk-errors', this.errorList)
            .linkInputColor('.blki-bcolor', this, 'strokeColor', 'strokeOpacity')
            .linkInputColor('.blki-fcolor', this, 'fillColor', 'fillOpacity')
            .linkInputColor('.blki-color', this, 'barColor', 'barOpacity')
            .linkInputInteger('.blki-y', this, 'y')
            .linkInputInteger('.blki-radius', this, 'strokeRadius')
            .linkTextValue('.blki-countername', this.name, 'counterName')
            .openFieldClick('.link-counter', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({counter: counterObject});
                }.bind(this)})
            .linkTextValue('.blki-maxname', this.name, 'maxName')
            .openFieldClick('.link-max', 
                function(){
                    return makeSchemeFieldList(
                        new SchemeCollection([
                            this.createLocalsField('Counter'),
                            admin.fields.CounterCollection
                        ]));
                }.bind(this),
                {onSelect: function(counterObject){
                    this.set({max: counterObject});
                }.bind(this)})
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            counter: null,
            max: null,
            y: -30,
            strokeColor: '#FFFFFF',
            strokeOpacity: 0.5,
            fillColor: '#000000',
            fillOpacity: 0.8,
            barColor: '#008000',
            barOpacity: 1,
            strokeRadius: 0
        });
    },
    init: function(){
        this.name = (new zz.data());
        this.addNameListenerEvent('counter', this.name, 'counterName', 'Выберите счётчик', 'name');
        this.errorTestValue('counter', null, 'Ошибка: Выберите счётчик');
        this.addNameListenerEvent('max', this.name, 'maxName', 'Выберите максимум', 'name');
        this.errorTestValue('max', null, 'Ошибка: Выберите  максимум');
    }
});

admin.fields.NewMapMarkerOverlay = makeSchemeFieldList(
    new SchemeCollection([
        new SelectButtonField('#MapMarkerOverlayText', admin.MapMarkerOverlayText),
        new SelectButtonField('#MapMarkerOverlayBar', admin.MapMarkerOverlayBar),
    ])
);
