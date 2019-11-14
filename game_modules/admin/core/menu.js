var _MenuItemSelected = null;
var MenuItem = zz.data.extend({
    initialize: function(name, url, sub, click){
        zz.data.prototype.initialize.call(this);
        
        this.on('set:select', function(ev){
            this.set({
                selectClass: (ev.value?'menu-item selected ':'menu-item ')+(this.get('sub'))
            });
        }, this);
            
        this.set({
            name: name,
            url: url,
            sub: sub,
            select: 0
        });
        
        this.click = function(){
            if (_MenuItemSelected){
                _MenuItemSelected.set({select: 0});
            }

            this.set({select: 1});
            _MenuItemSelected = this;

            click();
        }.bind(this);

        this.schemeBlk = new SchemeField('#MenuItemTpl', this)
            .linkTextValue('.m-name', this, 'name')
            .linkAttributeValue('.menu-item', 'class', this, 'selectClass')
            .linkAttributeValue('.m-img', 'src', this, 'url')
            .click(null, this.click);
    }
});

var MenuItemNS = zz.data.extend({
    initialize: function(name, url, sub, click){
        zz.data.prototype.initialize.call(this);
        
        this.set({
            name: name,
            url: url,
            selectClass: 'menu-item '+sub
        });
        
        this.click = function(){
            click();
        }.bind(this);

        this.schemeBlk = new SchemeField('#MenuItemTpl', this)
            .linkTextValue('.m-name', this, 'name')
            .linkAttributeValue('.menu-item', 'class', this, 'selectClass')
            .linkAttributeValue('.m-img', 'src', this, 'url')
            .click(null, this.click);
    }
});

var _MenuItemChecked = null;
var _MenuItemHide = function(){
    if (_MenuItemChecked){
        _MenuItemChecked.set({check: 0});
        _MenuItemChecked = null;
        
        $('#bottom').children().each(function(node){
            this.parentNode.removeChild(this);
        });
        $('#scheme').removeClass('full').addClass('full');
    }
};
admin.watcher.on('disconnect', _MenuItemHide);

var MenuItemCheck = zz.data.extend({
    initialize: function(name, url, sub, click, openFn){
        zz.data.prototype.initialize.call(this);
        
        this.on('set:select', function(ev){
            this.set({
                selectClass: (ev.value?'menu-item selected':'menu-item')+(this.get('sub')?' sub':'')
            });
        }, this);
            
        this.on('set:check', function(ev){
            this.set({
                checkClass: (ev.value?'m-check icon ion-android-checkbox':'m-check icon ion-android-checkbox-outline-blank')
            });
        }, this);
            
        this.set({
            name: name,
            url: url,
            sub: sub,
            check: 0,
            checkClass: 'm-check icon ion-android-checkbox-outline-blank',
            select: 0
        });
        
        this.click = function(){
            if (_MenuItemSelected){
                _MenuItemSelected.set({select: 0});
            }

            this.set({select: 1});
            _MenuItemSelected = this;

            click();
        }.bind(this);
        
        this.schemeBlk = new SchemeField('#MenuItemCheckTpl', this)
            .linkTextValue('.m-name', this, 'name')
            .linkAttributeValue('.menu-item', 'class', this, 'selectClass')
            .linkAttributeValue('i.m-check', 'class', this, 'checkClass')
            .click('.m-check', function(){
                var ch = this.get('check');

                if (ch === 0){
                    $('#scheme').removeClass('full');
                    openFn($('#bottom'));
                    _MenuItemChecked = this;
                }else{
                    _MenuItemHide();
                }
                
                this.set({check: 1-ch});
                
                return false;
            }.bind(this))
            .linkAttributeValue('.m-img', 'src', this, 'url')
            .click(null, this.click);
    }
});

var MenuContainer = zz.data.extend({
    add: function(col){
        this.collection.add(col);
    },
    initialize: function(collection){
        zz.data.prototype.initialize.call(this);
        
        this.collection = new zz.collection([]);
        this.SCollection = new SchemeCollection([]);
        
        var replace = function(){
            this.SCollection.removeAll();
            this.SCollection.add( this.collection.container.map(function(action){
                return action.schemeBlk;
            }) );
        }.bind(this);
        
        this.collection.on('add', replace);
        this.collection.on('remove', replace);
        
        this.collection.add(collection);
        
        this.schemeBlk = new SchemeField('#MenuContainerTpl', this)
            .linkCollection('.menu-container', this.SCollection);
    }
});

var MenuModuleContainer = zz.data.extend({
    add: function(col){
        this.collection.add(col);
    },
    show: function(){
        this.set({active: 1});
    },
    hide: function(){
        this.set({active: 0});
    },
    initialize: function(collection, module){
        zz.data.prototype.initialize.call(this);
        
        this.on('set:active', function(ev){
            this.set({
                activeClass: (ev.value?'menu-container-modules':'menu-container-modules hide')
            });
        }, this);
            
        this.set({
            active: 0
        });
        
        this.collection = new zz.collection([]);
        this.SCollection = new SchemeCollection([]);
        
        var replace = function(){
            this.SCollection.removeAll();
            this.SCollection.add( this.collection.container.map(function(action){
                return action.schemeBlk;
            }) );
        }.bind(this);
        
        this.collection.on('add', replace);
        this.collection.on('remove', replace);
        
        this.collection.add(collection);
        
        this.schemeBlk = new SchemeField('#MenuContainerModulesTpl', this)
            .linkAttributeValue('.menu-container-modules', 'class', this, 'activeClass')
            .linkCollection('.menu-container-modules', this.SCollection);

        admin.watcher.on('start', function(ev){
            admin.watcher.afterSyncItem('project', function(project){
                this.set({active: project.isActiveModule(module)});

                project.on('activate:module', function(ev){
                    if (ev.module === module){
                        this.set({active: ev.active});
                    }
                }, this);
            }.bind(this));
        }.bind(this));
    }
});

var _p;
admin.menu = new MenuContainer([
    _p = new MenuItem('Проект', '/admin/session.png', '', function(){
        admin.global.SchemeTable.addWindow(0, admin.global.Project.getEditor(), null);
    }),
    new MenuItem('Модули', '/admin/modules.png', 'sub', function(){
        admin.global.SchemeTable.addWindow(0, admin.global.Project.modulesBlk, null);
    }),
    new MenuItem('Сессия', '/admin/session.png', 'sub', function(){
        admin.global.SchemeTable.addWindow(0, admin.global.Session.getEditor(), null);
    }),
    new MenuItem('Новый игрок', '/admin/player.png', 'sub', function(){
        admin.global.SchemeTable.addWindow(0, admin.global.PlayerTemplate.getEditor(), null);
    }),
]);

admin.menu.Project = _p;

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(){
        admin.menu.Project.click();
    });
});