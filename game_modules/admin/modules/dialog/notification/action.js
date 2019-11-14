admin.NotificationPlayerOpenAction = ActionClass.extend({
    className: 'NotificationPlayerOpenAction',
    moduleName: 'Notification',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationPlayerOpenAction', this))
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
                            this.createLocalsField('Notification'),
                            admin.fields.NotificationCollection
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
        
        this.addNameListenerEvent('dialog', this.name, 'dialogName', 'Выберите оповещение', 'name');
        this.addLocalsListener('dialog', 'Notification');
    },
    createAttrs: function(project){
        this.set({
            dialog: null,
            player: null
        });
    },
    init: function(){
        this.errorTestValue('dialog', null, 'Ошибка: Выберите оповещение');
        this.errorTestValue('player', null, 'Ошибка: Выберите игрока');
        
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
            
            var val = this.get(ev.item.id);
            if (!val){
                val = this.watcher.watch(new admin.CustomField(ev.item, this));
                this.setAttribute(ev.item.id, val);
            }
            
            this.redraw();
        }.bind(this);

        var rfn = function(ev){
            if (!ev.item.isCustomArg()){
                return;
            }
            
            var val = this.get(ev.item.id);
            if (val){
                this.removeAttribute(ev.item.id);
                val.destroy();
            }
            
            this.redraw();
        }.bind(this);

        this.on('set:dialog', function(ev){
            if (ev.lastValue instanceof admin.NotificationFieldList){
                ev.lastValue.get('fieldsList').off('add-args', afn);
                ev.lastValue.get('fieldsList').off('remove-args', rfn);
                
                ev.lastValue.get('fieldsList').args().forEach(function(item){
                    rfn({item: item});
                }, this);
            }

            if (ev.value instanceof admin.NotificationFieldList){
                ev.value.get('fieldsList').on('add-args', afn, this);
                ev.value.get('fieldsList').on('remove-args', rfn, this);

                ev.value.get('fieldsList').args().forEach(function(item){
                    afn({item: item});
                }, this);
            }
        }, this);
    }
});

admin.NotificationPlayerClearAction = ActionClass.extend({
    className: 'NotificationPlayerClearAction',
    moduleName: 'Notification',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#NotificationPlayerClearAction', this))
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
        new GroupField('Оповещения', new SchemeCollection([
            new SelectButtonField('#NotificationPlayerOpenAction', admin.NotificationPlayerOpenAction),
            new SelectButtonField('#NotificationPlayerClearAction', admin.NotificationPlayerClearAction)
        ]))
    ], 'Notification')
]);
