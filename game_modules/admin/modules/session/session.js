admin.Session = ActionClass.extend({
    className: 'Session',
    moduleName: 'common',
    cloneAttrs: function(){
        return ['triggerList', 'settingsList'];
    },
    _listArgs: function(){
        return [this.get('arg')];
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSelectBlockTpl'))
            .linkTextValue('span.blki-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainObject: this})
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
        this.set({
            arg: project.watch(new admin.ActionArg('Сессия', 'Session'))
        });
        
        this.set({
            name: '',
            info: 'Новая игра набирает игроков',
            waitPlayers: false,
            shared: false,
            triggerList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),
/*            settingsList: project.watch(
                new admin.ActionList(
                    [], this._listArgs()
            )),*/
        });
    },
    init: function(project){
        if (typeof this.get('shared') === 'undefined'){
            this.set({
                waitPlayers: false,
                shared: false
            });
        }
        
        if (typeof this.get('info') === 'undefined'){
            this.set({
                info: 'Новая игра набирает игроков'
            });
        }

        var triggerList = this.get('triggerList');
        var settingsList = this.get('settingsList');

        this.on('set:waitPlayers', function(ev){
            if (!ev.value){
                this.set({
                    shared: false
                });
            }
        }, this);
        
        project.afterSync([triggerList, settingsList], function(){
            var editBlk = this.destrLsn(new SchemeField('#SessionEditBlockTpl', this))
                .linkInputValue('.blki-info', this, 'info')
                .linkSwitchValue('.blki-wait', this, 'waitPlayers')
                .linkSwitchValue('.blki-shared', this, 'shared');

            this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
                .linkCollection(null, new SchemeCollection([
                    editBlk,
/*                    settingsList.createButtonField('Добавить настройки', admin.fields.NewSessionSettings),
                    settingsList.getSchemeField(),*/
                    triggerList.createButtonField('Триггеры', admin.fields.NewSessionTriggers),
                    triggerList.getSchemeField()
                ]));
        }.bind(this));
    },
    initialize: function(){
        ActionClass.prototype.initialize.call(this);
    }
});

admin.watcher.on('start', function(ev){
    admin.global.Session = ev.watcher.watchByID("Session", function(){
        return new admin.Session();
    });
    
    admin.global.root.add([admin.global.Session]);
});
