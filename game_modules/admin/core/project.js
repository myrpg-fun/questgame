var ProjectModule = zz.data.extend({
    disable: function(disabled){
        if (disabled === 0){
            this.set({active: disabled});
        }
    },
    active: function(){
        this.set({active: 1});
    },
    initialize: function(name, module, info, price, onFn, offFn, bounds){
        zz.data.prototype.initialize.call(this);
        
        this.on('set:active', function(ev){
            var active = ev.value;
            
            this.set({
                activeClass: module?(active?'blk-module active':'blk-module'):'blk-module disable'
            });
            
            if (active){
                if (onFn){
                    onFn();
                }
            }else{
                if (offFn){
                    offFn();
                }
            }
        }, this);

        this.on('set:price', function(ev){
            this.set({
                priceClass: (ev.value===0)?'blk-price hide':'blk-price'
            });
        }, this);
            
        if (module){
            this.on('set:active', function(ev){
                admin.global.Project.activateModule(this.get('module'), ev.value);
                if (bounds && ev.value){
                    bounds.forEach(function(mod){
                        admin.global.Project.activateModule(mod, 1);
                    }, this);
                }
            }, this, ['activate:module']);

            admin.global.Project.on('activate:module:'+module, function(ev){
                this.set({active: ev.active}, 'activate:module');
            }, this);

            var active = admin.global.Project.isActiveModule(module)?1:0;
        
            if (bounds){
                bounds.forEach(function(mod){
                    admin.global.Project.on('activate:module:'+mod, function(ev){
                        if (ev.active === 0){
                            this.set({active: 0}, 'activate:module');
                        }
                    }, this);
                }, this);
            }
        }else{
            active = false;
        }
        
        this.set({
            name: name,
            module: module,
            info: info,
            price: price,
            priceClass: (price===0)?'blk-price hide':'blk-price',
            active: active
        });
        
        this.schemeBlk = new SchemeField('#ProjectModuleTpl', this)
            .linkTextValue('.blki-name', this, 'name')
            .linkAttributeValue('.blk-module', 'class', this, 'activeClass')
            .linkTextValue('.blki-info', this, 'info')
            .linkTextValue('.blki-price', this, 'price')
            .linkAttributeValue('.blk-price', 'class', this, 'priceClass')
            .click(null, function(){
                if (module){
                    this.set({
                        active: 1-this.get('active')
                    });
                }
            }.bind(this));
    }
});

var ProjectModuleSubCollection = zz.data.extend({
    disable: function(disabled){
        this.collection.forEach(function(module){
            module.disable(disabled);
        });
    },
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
        
        this.collection.on('add', function(ev){
            ev.value.on('set:active', function(ev){
                this.callEventListener('activate', ev);
            }, this);
        }, this);
        
        this.collection.on('remove', function(ev){
            ev.value.off('set:active', null, this);
        }, this);
        
        this.collection.add(collection);

        this.schemeBlk = new SchemeField('#ProjectSubModulesTpl', this)
            .linkCollection('.blki-col', this.SCollection);
    }
});

var ProjectModuleSelectCollection = zz.data.extend({
    disable: function(disabled){
        this.collection.forEach(function(module){
            module.disable(disabled);
        });
    },
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
        
        this.collection.on('add', function(ev){
            ev.value.on('set:active', function(ev){
                if (ev.value){
                    this.collection.forEach(function(module){
                        if (module !== ev.target){
                            module.disable(0);
                        }
                    }, this);
                }
                this.callEventListener('activate', ev);
            }, this);
        }, this);
        
        this.collection.on('remove', function(ev){
            ev.value.off('set:active', null, this);
        }, this);
        
        this.collection.add(collection);

        this.schemeBlk = new SchemeField('#ProjectSubModulesTpl', this)
            .linkCollection('.blki-col', this.SCollection);
    }
});

var ProjectModuleCollection = zz.data.extend({
    add: function(col){
        this.collection.add(col);
    },
    initialize: function(name, module, collection, onFn, offFn){
        zz.data.prototype.initialize.call(this);
        
        this.collection = new zz.collection([]);
        this.on('set:active', function(ev){
            var active = ev.value;
            this.collection.forEach(function(module){
                module.disable(active);
            });

            this.set({
                activeClass: active?'blki-col':'blki-col inactive'
            });

            if (active){
                if (onFn){
                    onFn();
                }
            }else{
                if (offFn){
                    offFn();
                }
            }
        }, this);

        if (module){
            this.on('set:active', function(ev){
                admin.global.Project.activateModule(this.get('module'), ev.value);
            }, this, ['activate:module']);

            admin.global.Project.on('activate:module:'+module, function(ev){
                this.set({active: ev.active}, 'activate:module');
            }, this);
        }

        this.set({
            title: name,
            module: module,
            active: module?(admin.global.Project.isActiveModule(module)?1:0):1
        });
        
        var hide = (new zz.data).set({
            style: ((module === false)?'display: none':'')
        });
        
        this.SCollection = new SchemeCollection([]);
        
        var replace = function(){
            this.SCollection.removeAll();
            this.SCollection.add( this.collection.container.map(function(action){
                return action.schemeBlk;
            }) );
        }.bind(this);
        
        this.collection.on('add', replace);
        this.collection.on('remove', replace);
        
        this.collection.on('add', function(ev){
            ev.value.on('activate', function(ev){
                if (ev.value){
                    this.set({active: 1});
                }
            }, this);
        }, this);
        
        this.collection.on('remove', function(ev){
            ev.value.off('activate', null, this);
        }, this);
        
        this.collection.add(collection);
        
        this.schemeBlk = new SchemeField('#ProjectModuleCollectionTpl', this)
            .linkTextValue('.blki-title', this, 'title')
            .linkAttributeValue('.blki-col', 'class', this, 'activeClass')
            .linkSwitchValue('.blki-active', this, 'active')
            .linkAttributeValue('.blki-active', 'style', hide, 'style')
            .linkCollection('.blki-col', this.SCollection);
    }
});

admin.Project = ActionClass.extend({
    className: 'Project',
    moduleName: 'common',
    getUploadImageURL: function(){
        return '/project/'+this.get('id')+'/upload';
    },
    createSchemeField: function(){
        var accept = new zz.data().set({accept: '.jpg,.png'});

        return this.destrLsn(new SchemeField('#ProjectEditBlockTpl', this))
            .linkInputValue('.blki-name', this, 'name')
            .linkInputValue('.blki-info', this, 'info')
            .linkInputValue('.blki-genre', this, 'genre')
            .linkInputValue('.blki-location', this, 'location')
            .linkInputValue('.blki-gametype', this, 'gametype')
            .linkInputValue('.blki-difficulty', this, 'difficulty')
            .linkInputValue('.blki-lengthinfo', this, 'lengthinfo')
            .linkInputValue('.blki-authors', this, 'authors')
            .click('.link-delete', function(DOMself){
                admin.global.ModalDialog.showModal(this.removeModal);

                return false; 
            }.bind(this))
            .click('.link-test', function(DOMself){
                window.open('test', '_blank');
        
                return false; 
            }.bind(this))
            .click('.link-release', function(DOMself){
                admin.global.ModalDialog.showModal(this.releaseModal);

                return false; 
            }.bind(this))
            .linkAttributeValue('img.blki-image', 'src', this, 'image')
            .linkAttributeValue('.blki-upload', 'accept', accept, 'accept')
            .linkUploadFile('.blki-upload', this.getUploadImageURL(), function(file){
                if (file.size > 2*1024*1024){
                    admin.alert('Ошибка', 'Файл: "'+file.name+'" занимает больше 2 мб', 'Ясно');
                    return false;
                }

                return true;
            }, function(data){
                if (data){
                    data = JSON.parse(data);
                }

                if (data && data.uploaded){
                    data.uploaded.forEach(function(file){
                        this.set({image: file.upload});
                    }, this);
                }
            }.bind(this), function(xhr){
                var error = JSON.parse(xhr.responseText);
                switch(error.error){
                    case 'too large':
                        admin.alert('Ошибка загрузки', 'Файл: "'+error.file+'" занимает больше 2 мб', 'Ясно');
                        break;
                    case 'not image':
                        admin.alert('Ошибка загрузки', 'Файл: "'+error.file+'" не является картинкой JPEG или PNG', 'Ясно');
                        break;
                    default:
                        admin.alert('Ошибка: '+xhr.status+' '+xhr.statusText, 'Ошибка: '+xhr.status+' '+xhr.statusText, 'Закрыть');
                        break;
                }
            })
            .click('.link-image', function(DOMself){
                DOMself.DOM.filter('.blki-upload').click();

                return false; 
            })
            .click('img.blki-image', function(DOMself){
                DOMself.DOM.filter('.blki-upload').click();

                return false; 
            })
            .linkCollection('.blk-errors', this.projectErrors);
    },
    createAttrs: function(){
        console.error('wrong project use');
    },
    init: function(){
        this.editorBlk = this.getSchemeField();
        
        var deleteData = (new zz.data()).set({
            password: ''
        });

        this.removeModal = this.destrLsn(new SchemeField('#ProjectRemoveModalTpl', this))
            .linkInputValue('.blki-password', deleteData, 'password')
            .click('.link-cancel', function(DOMself){
                admin.global.ModalDialog.clearModal();

                return false; 
            })
            .click('.link-delete', function(DOMself){
                admin.socket.emit('project_removed', deleteData.getAttributes());
        
                return false; 
            });
            
        admin.socket.on('project_removed', function(data){
            console.log('project_removed', data);
            
            if (data.complete){
                admin.alert('Проект успешно удален', '', 'Ок', function(){
                    window.open('/project', '_self');
                });
            }else{
                admin.alert('Ошибка: не верный пароль', 'Ошибка: не верный пароль', 'Ок');
            }
        });

        var releaseData = (new zz.data()).set({
            version: this.get('version'),
            shared: 'open',
            link: 'https://'+window.location.host+'/project/'+this.get('hashid')
        });

        releaseData.on('set:shared', function(ev){
            if (ev.value === 'open'){
                releaseData.set({
                    link: 'https://'+window.location.host+'/project/'+this.get('hashid')
                });
            }
            if (ev.value === 'shared'){
                releaseData.set({
                    link: 'https://'+window.location.host+'/project/'+this.get('hashlink')
                });
            }
        }, this);
        
        this.releaseModal = this.destrLsn(new SchemeField('#ProjectReleaseModalTpl', this))
            .linkInputValue('.blki-version', releaseData, 'version')
            .linkInputValue('.blki-shared', releaseData, 'shared')
            .linkInputValue('.blki-linkprj', releaseData, 'link')
            .click('.link-cancel', function(DOMself){
                admin.global.ModalDialog.clearModal();

                return false; 
            })
            .click('.link-release', function(DOMself){
                admin.socket.emit('project_release', releaseData.getAttributes());

                return false; 
            });
            
        /* modules */
        this.activeModules = this.get('modules').split(',');
        this.on('set:modules', function(ev){
            var modules = ev.value.split(',');
            var old = ev.lastValue?ev.lastValue.split(','):[];
            
            this.activeModules = modules;
            
            old.diff(modules).forEach(function(mod){
                console.log('- module', mod);
                this.callEventListener('activate:module', {module: mod, active: 0, allmodules: modules});
                this.callEventListener('activate:module:'+mod, {module: mod, active: 0, allmodules: modules});
            }, this);
            
            modules.diff(old).forEach(function(mod){
                console.log('+ module', mod);
                this.callEventListener('activate:module', {module: mod, active: 1, allmodules: modules});
                this.callEventListener('activate:module:'+mod, {module: mod, active: 1, allmodules: modules});
            }, this);
        }, this);

        this.isActiveModule = function(module){
            return this.activeModules.indexOf(module) !== -1;
        };        
        
        this.activateModule = function(module, active){
            if (active){
                var k = this.activeModules.indexOf(module);
                if (k === -1){
                    this.activeModules.push(module);
                    this.set({
                        modules: this.activeModules.join(',')
                    });
                }
            }else{
                var k = this.activeModules.indexOf(module);
                if (k !== -1){
                    this.activeModules.splice(k, 1);
                    this.set({
                        modules: this.activeModules.join(',')
                    });
                }
            }
        };
        
        this.modules = new zz.collection([]);
        var SCollection = new SchemeCollection([]);
        
        var replace = function(){
            SCollection.removeAll();
            SCollection.add( this.modules.container.map(function(action){
                return action.schemeBlk;
            }) );
        }.bind(this);
        
        this.modules.on('add', replace);
        this.modules.on('remove', replace);
        
        this.modulesBlk = this.destrLsn(new SchemeField('#ProjectModulesTpl'))
            .linkCollection('.blki-col', SCollection);
    },
    initialize: function(){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this.projectErrors = new SchemeCollection([]);
    }
});

admin.Root = SyncedList.extend({
    className: 'Root',
    moduleName: 'common',
    add: function(actionArray, silence){
        this.afterSync(function(){
            actionArray.forEach(function(action){
                var col = this.get('collection');
                if (col.indexOf(action) !== -1){
                    return;
                }

                col.push( action );
                this.callEventListener('add', {collection: this, item: action}, silence);
                action.callEventListener('added-collection', {collection: this, item: action}, silence);
            }, this);
        }.bind(this));
    }
});

admin.watcher.on('start', function(ev){
    admin.global.Project = ev.watcher.watchByID("project", function(){
        console.error('Cannot load a project from Server');
    });
    
    admin.global.root = ev.watcher.watchByID("root", function(){
        return new admin.Root([]);
    });
    
    admin.global.root.add([admin.global.Project]);
});
