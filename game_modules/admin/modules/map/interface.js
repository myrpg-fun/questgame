admin.PlayerMapInterface = ActionClass.extend({
    className: 'PlayerMapInterface',
    moduleName: 'Map',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerMapInterface'))
            .linkInputValue('.blki-name', this, 'name')
            .linkInputValue('.blki-icon', this, 'icon')
            .linkTextValue('.blk-mapstyle', this.name, 'styleName')
            .openFieldClick('.link-mapstyle', function(){
                    if (admin.global.Project.isActiveModule('MapStyle')){
                        return admin.fields.MapStyleListCollection;
                    }else{
                        if (this.get('style')){
                            return this.get('style').getEditor();
                        }
                    }
                    return false;
                }.bind(this),
                {onSelect: function(style){
                    this.set({style: style});
                }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('style'))
                    return this.get('style').getEditor();
                return false;
            }.bind(this),{})
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    createAttrs: function(project){
        this.set({
            map: admin.global.Map,
            icon: 'ion-map',
            name: 'Карта',
            style: admin.global.MapStyleDefault
        });
    },
    init: function(){
        this.errorTestValue('name', null, 'Ошибка: Введите имя закладки');
        this.errorTestValue('icon', null, 'Ошибка: Введите иконку закладки');
        
        this.name = (new zz.data());
        this.addNameListenerEvent('style', this.name, 'styleName', 'Выберите стиль', 'name');
    }
});

admin.PlayerGPSInterface = ActionClass.extend({
    className: 'PlayerGPSInterface',
    moduleName: 'Map',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#PlayerGPSInterface'))
            .linkCollection('.blk-errors', this.errorList)
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },    
    createAttrs: function(project){},
});

admin.fields.NewPlayerInterfaceCollection.add([
    new ModuleContainer([
        new SelectButtonField('#PlayerMapInterface', admin.PlayerMapInterface)
    ], 'Map'),
    new ModuleContainer([
        new SelectButtonField('#PlayerGPSInterface', admin.PlayerGPSInterface)
    ], 'MapGps')
]);