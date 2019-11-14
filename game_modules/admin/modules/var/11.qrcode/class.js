var QRCodeClassQRCode = 1;

admin.QRCodeClassTable = ActionClass.extend({
    className: 'QRCodeClassTable',
    moduleName: 'Class',
    _actionLists: function(){
        return [this.get('click')];
    },
    cloneAttrs: function(){
        return ['click'];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#QRCodeClassTable'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blki-className', this, 'header')
            .openFieldClick('.link-click', 
                this.destrLsn(makeSchemeFieldList(
                    new SchemeCollection([
                        this.get('click').getLocalsSchemeField(),
                        this.get('click').createCopyButtonField('Действия'),
                        this.get('click').getSchemeField()
                    ])
                )
            , {}))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            admin: project.watch(new admin.ActionArgClass('Адинистратор кликнул', admin.global.PlayerTemplate)),
            object: project.watch(new admin.ActionArgClass('Объект класса', this._init.class))
        });
        
        this.set({
            header: this._init.name,
            name: this._init.name,
            click: project.watch(new admin.ActionList([], {
                admin: project.watch(new admin.ActionArgClass('Адинистратор кликнул', admin.global.PlayerTemplate)),
                object: project.watch(new admin.ActionArgClass('Объект класса', this._init.class))
            }))
        });
    },
    initialize: function(classObj, name){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj, name: name};
    }
});

admin.QRCodeClass = ActionClass.extend({
    className: 'QRCodeClass',
    moduleName: 'QRCode',
    classObject: 'QRCode',
    defaultMessage: 'Выберите QR-код',
    cloneAttrs: function(){
        return ['qrcode'];
    },
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: this.get('qrcode')?this.get('qrcode').clone():null});
        
        return object;
    },
    getValue: function(){
        return this.get('qrcode');
    },
    getCloned: function(){
        return 'clone';
    },
    selectCollection: function(){
        return admin.fields.QRCodeCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#QRCodeClassTable', admin.QRCodeClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        var cnt = project.watch(new admin.QRCode);
        
        cnt.removeFlag(admin.global.QRCodeAllFlag);
        
        this.set({
            name: 'QR '+QRCodeClassQRCode,
            qrcode: cnt
        });
    },
    getObjectEditField: function(mm, obj){
        mm.parentObject = obj;
        
        var redrawQR = function(el){
            QRCode.toCanvas(el[0], [{ data: mm.get('code')+'', mode: 'numeric' }], { errorCorrectionLevel: 'H', scale: 6 }, function (error) {
                if (error) console.error(error);
                console.log('success!');
            });
        }.bind(mm);
                    
        return this.destrLsn(new SchemeField('#QRCodeObjectEditBlock', this))
            .linkTextValue('.blk-name', this, 'name')
            .linkInputInteger('.blki-code', mm, 'code')
            .init('.blk-qrcode', function(el){
                redrawQR(el);
                this.on('set:code', function(){redrawQR(el);}, this);
            }.bind(mm), function(){
                this.off('set:code', null, this);
            }.bind(mm))
            .linkCollection('.blk-errors', this.errorList);
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= QRCodeClassQRCode){
            QRCodeClassQRCode = digit[0]*1+1;
        }

        this.on('destroy', function(){
            this.getValue().destroy();
        }, this);

        project.afterSync([this.get('qrcode')], function(){
            var editBlk = this.destrLsn(new SchemeField('#QRCodeClassEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk/*,
                triggerList.createButtonField('Триггеры', admin.fields.NewQRCodeTriggers),
                triggerList.getSchemeField()*/
            ])));
        }.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.QRCodeClassSet = ActionClass.extend({
    className: 'QRCodeClassSet',
    moduleName: 'QRCode',
    classObject: 'QRCode',
    defaultMessage: 'Выберите QR-код',
    createObjectField: function(){
        var object = this.watcher.watch(new admin.ObjectItem(this));
        
        object.set({item: null});
        
        return object;
    },
    getValue: function(){
        return this.get('counter');
    },
    getCloned: function(){
        return 'none';
    },
    selectCollection: function(){
        return admin.fields.QRCodeCollection;
    },
    createTableSchemeField: function(){
        return [
            new SelectClassField('#QRCodeClassTable', admin.QRCodeClassTable, this)
        ];
    },
    getTableSchemeField: function(){
        return this.tableField?this.tableField:(this.tableField = this.createTableSchemeField());
    },
    getSchemeField: function(){
        return this.editorBlk;
    },
    getLocalsByType: function(type, argclass){
        return (type === this.classObject)?[new ActionArgSelectClassItem(this, argclass)]:[];
    },
    cloneAttrs: function(){
        return [];
    },
    createAttrs: function(project){
        this.set({
            name: 'QR '+QRCodeClassQRCode,
            qrcode: null,
            /*triggerList: project.watch(
                new admin.ActionList(
                    [], {
                        object: project.watch(new admin.ActionArgClass('Класс точки', this._init.class))
                    }
            ))*/
        });
    },
    init: function(project){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= QRCodeClassQRCode){
            QRCodeClassQRCode = digit[0]*1+1;
        }

        //project.afterSync([triggerList], function(){
            var editBlk = this.destrLsn(new SchemeField('#QRCodeClassSetEditBlock', this))
                .linkInputValue('.blki-name', this, 'name')
                .linkCollection('.blk-errors', this.errorList)
                .click('.remove', function(){
                    this.deleteSync();
                    return false;
                }.bind(this));

            this.editorBlk = this.destrLsn(new SchemeField('#BlkClassList').linkCollection('.blk-list', new SchemeCollection([
                editBlk/*,
                triggerList.createButtonField('Триггеры', admin.fields.NewQRCodeTriggers),
                triggerList.getSchemeField()*/
            ])));
        //}.bind(this));
    },
    initialize: function(classObj){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {class: classObj};
    }
});

admin.fields.NewClassesCollection.add([
    new ModuleContainer([
        new SelectButtonField('#QRCodeClassEditBlock', admin.QRCodeClass),
        new SelectButtonField('#QRCodeClassSetEditBlock', admin.QRCodeClassSet)
    ], 'QRCode')
]);