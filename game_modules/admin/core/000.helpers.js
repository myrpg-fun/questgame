SelectButtonField = SchemeField.extend({
    initialize: function(templateId, values, onSelect){
        SchemeField.prototype.initialize.call(this, '#SelectButtonFieldTpl');//, templateId);
        
        if (!onSelect){
            onSelect = 'onSelect';
        }
        
        var fieldBlk = new SchemeField(templateId);
        
        this.linkField('.blk-select', fieldBlk);
        this.click(null, function(DOMfield){
            var stack = DOMfield.window().stack();
            stack[onSelect](values, stack);
        }.bind(this));
    }
});

ClassHiddenPropertiesField = SchemeField.extend({
    initialize: function(collection){
        SchemeField.prototype.initialize.call(this, '#ClassHideProperties');//, templateId);
        
        this.object = new zz.data;
        this.object.set({
            open: 'blk-open closed',
            hidden: 'blk-hidden-pr closed',
            closed: true
        });
        
        this.linkCollection('.blk-hidden-pr', new SchemeCollection(collection));
        this.linkAttributeValue('.blk-open', 'class', this.object, 'open');
        this.linkAttributeValue('.blk-hidden-pr', 'class', this.object, 'hidden');
        
        this.click('.blk-open', function(DOMfield){
            var cl = !this.object.get('closed');
            
            this.object.set({
                open: 'blk-open'+(cl?' closed':''),
                hidden: 'blk-hidden-pr'+(cl?' closed':''),
                closed: cl
            });
        }.bind(this));
    }
});

PasteButtonField = SchemeField.extend({
    initialize: function(){
        SchemeField.prototype.initialize.call(this, '#PasteButton');//, templateId);
        
        this.object = new zz.data;
        this.object.set({
            count: 0
        });
        
        this.linkTextValue('.blk-count', this.object, 'count');
        this.click(null, function(DOMfield){
            var stack = DOMfield.window().stack();
            stack.onPaste(stack);
        }.bind(this));
    }
});

SelectField = SchemeField.extend({
    initialize: function(templateId, values, onSelect){
        SchemeField.prototype.initialize.call(this, '#SelectField');//, templateId);
        
        if (!onSelect){
            onSelect = 'onSelect';
        }
        
        var fieldBlk = new SchemeField(templateId);
        
        this.linkField('.blk-selectfield', fieldBlk);
        this.click(null, function(DOMfield){
            var stack = DOMfield.window().stack();
            stack[onSelect](values, stack);
        }.bind(this));
    }
});

var ArgumentCounter = 1;

SelectArgumentField = SchemeField.extend({
    initialize: function(name, type, onSelect){
        SchemeField.prototype.initialize.call(this, '#SelectArgBlock');
        
        var createFn;
        if (typeof type === 'string'){
            createFn = function(){
                return new admin.ActionArgRemove(name+' '+ArgumentCounter++, type);
            };
        }else{
            createFn = function(){
                return new type(name+' '+ArgumentCounter++);
            };
        }
        
        if (!onSelect){
            onSelect = 'onSelect';
        }
        
        this.object = new zz.data;
        this.object.set({
            name: name,
            type: type
        });
        
        this.linkTextValue('span.blki-name', this.object, 'name');
        this.click(null, function(DOMfield){
            var stack = DOMfield.window().stack();
            stack[onSelect]( createFn() );
        }.bind(this));
    }
});

HeaderField = SchemeField.extend({
    initialize: function(name){
        SchemeField.prototype.initialize.call(this, '#HeaderField');
        
        this.object = new zz.data;
        this.object.set({
            name: name
        });
        
        this.linkTextValue('span.blki-name', this.object, 'name');
    }
});

var ModuleContainer = SchemeField.extend({
    initialize: function(collection, module){
        SchemeField.prototype.initialize.call(this, '#BlkListTpl');
        
        this.object = new zz.data;
        this.object.set({
            style: 'display: none'
        });
        
        this.linkCollection('.blk-list', new SchemeCollection(collection));
        this.linkAttributeValue('.blk-list', 'style', this.object, 'style');
        
        admin.watcher.waitItem('project', function(project){
            project.afterSync(function(){
                project.on('activate:module:'+module, function(ev){
                    this.object.set({
                        style: ev.active?'':'display: none'
                    });
                }, this);
                
                this.object.set({
                    style: project.isActiveModule(module)?'':'display: none'
                });
            }.bind(this));
        }.bind(this));
    }
});

CreateButtonField = SchemeField.extend({
    initialize: function(name, collection, options){
        SchemeField.prototype.initialize.call(this, '#CreateButtonFieldTpl');
        
        this.object = new zz.data;
        this.object.set({
            name: name
        });
        
//        var trigger = true;
        
        this.linkTextValue('span.blki-name', this.object, 'name');
        this.openFieldClick('.link-new', collection, options);
/*        this.click(null, function(DOMfield){
            if (trigger){
                trigger = false;
                DOMfield.DOM.find('.link-new').click();
            }
            trigger = true;
            
            return false; 
        });*/
    }
});

CreateCopyButtonField = SchemeField.extend({
    initialize: function(name, collection, options){
        SchemeField.prototype.initialize.call(this, '#CreateCopyButtonFieldTpl');
        
        this.object = new zz.data;
        this.object.set({
            name: name
        });
        
        this.linkTextValue('span.blki-name', this.object, 'name');
        this.click('.link-copy', function(){
            options.onCopy();
            
            return false;
        });
        this.openFieldClick('.link-new', collection, options);
/*        this.click(null, function(DOMfield){
            if (trigger){
                trigger = false;
                DOMfield.DOM.find('.link-new').click();
            }
            trigger = true;
            
            return false; 
        });*/
    }
});

CreateButtonClassField = SchemeField.extend({
    initialize: function(name, collection, options, onSelect){
        SchemeField.prototype.initialize.call(this, '#CreateButtonClassFieldTpl');
        
        this.object = new zz.data;
        this.object.set({
            name: name
        });
        
        var trigger = true;
        
        this.linkTextValue('span.blki-name', this.object, 'name');
        this.openFieldClick('.link-new', collection, options);
        this.click(null, function(DOMfield){
            if (trigger){
                trigger = false;
                DOMfield.DOM.find('.link-new').click();
            }
            trigger = true;
            
            return false; 
        });        
    }
});

CreateButtonLocalsField = SchemeField.extend({
    initialize: function(name, collection, options, onSelect){
        SchemeField.prototype.initialize.call(this, '#CreateButtonLocalsFieldTpl');
        
        this.object = new zz.data;
        this.object.set({
            name: name
        });
        
        var trigger = true;
        
        this.linkTextValue('span.blki-name', this.object, 'name');
        this.openFieldClick('.link-new', collection, options);
        this.click(null, function(DOMfield){
            if (trigger){
                trigger = false;
                DOMfield.DOM.find('.link-new').click();
            }
            trigger = true;
            
            return false; 
        });        
    }
});

UploadButtonField = SchemeField.extend({
    initialize: function(name, accept, uploadurl, successFn){
        SchemeField.prototype.initialize.call(this, '#UploadButtonFieldTpl');
        
        this.object = new zz.data;
        this.object.set({
            name: name,
            accept: accept
        });
        
        this.linkTextValue('.blki-name', this.object, 'name');
        this.linkAttributeValue('.blki-upload', 'accept', this.object, 'accept');
        this.linkUploadFile('.blki-upload', uploadurl, function(file){
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
                successFn(data.uploaded.map(function(f){return f.upload;}));
            }
        }, function(xhr){
            //console.log('error', arguments);
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
        });
        this.click('.blk-block', function(DOMself){
            DOMself.DOM.filter('.blki-upload').click();
            
            return false; 
        });        
    }
});

UploadAudioButtonField = SchemeField.extend({
    initialize: function(name, accept, uploadurl, successFn){
        SchemeField.prototype.initialize.call(this, '#UploadButtonFieldTpl');
        
        this.object = new zz.data;
        this.object.set({
            name: name,
            accept: accept
        });
        
        this.linkTextValue('.blki-name', this.object, 'name');
        this.linkAttributeValue('.blki-upload', 'accept', this.object, 'accept');
        this.linkUploadFile('.blki-upload', uploadurl, function(file){
            if (file.size > 512*1024){
                admin.alert('Ошибка', 'Файл: "'+file.name+'" занимает больше 512 кб', 'Ясно');
                return false;
            }

/*            var audio = new Audio(URL.createObjectURL(file));

            if (audio.duration > 10){
                admin.alert('Ошибка', 'Файл: "'+file.name+'" имеет длину больше 10 секунд', 'Ясно');
                return false;
            }*/

            return true;
        }, function(data){
            if (data){
                data = JSON.parse(data);
            }
            
            if (data && data.uploaded){
                successFn(data.uploaded);
            }
        }, function(xhr){
            //console.log('error', arguments);
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
        });
        this.click('.blk-block', function(DOMself){
            DOMself.DOM.filter('.blki-upload').click();
            
            return false; 
        });        
    }
});

function makeSchemeFieldList(collection){
    return (new SchemeField('#BlkListTpl')).linkCollection('.blk-list', collection);
}

function makeSchemeFieldSelectArgClass(player, cls){
    return (new SchemeField('#ClassSelectArgBlock'))
        .linkTextValue('span.blki-name', player, 'name')
        .click(null, function(DOMfield){
            var stack = DOMfield.window().stack();
            if (stack.onSelect){
                stack.onSelect(
                    new admin.ActionArgClassRemove(player.get('name'), player)
                );
            }
        }.bind(player));
}
            