var ADLinkAudio = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var change;
        var setaudio;

        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            setaudio = function(event){
                var audio = event.target;
                
                DOMel.find('.play').unbind('click').click(function(){
                    audio.playstop();
                    
                    return false;
                });

                DOMel.find('.name').html( audio.get('name') );

                if (audio.getDuration() === false){
                    var l = function(){
                        DOMel.find('.duration').html(Math.round(audio.getDuration()*100)/100+'s');
                        
                        audio.off('load', l);
                    };
                    
                    audio.on('load', l);
                }else{
                    DOMel.find('.duration').html(Math.round(audio.getDuration()*100)/100+'s');
                }
            };

            change = function(event){
                if (event.lastValue){
                    event.lastValue.off('set', setaudio);
                }
                
                if (event.value){
                    event.value.on('set', setaudio);
                    
                    setaudio({
                        target: event.value
                    });
                }
            };
            
            if (modelName){
                model.addEventListener('set:'+modelName, change);

                change({
                    value: model.get(modelName),
                    lastValue: null
                });
            }else{
                change({
                    value: model,
                    lastValue: null
                });
            }
        }.bind(this);
        this.clearEventFn = function(DOMel){
            if (modelName){
                model.clearEventListener('set:'+modelName, change);
                if (model.get(modelName)){
                    var v = model.get(modelName);
                    
                    v.clearEventListener('set', setaudio);
                    
                    v.stop();
                }
            }else{
                model.clearEventListener('set', setaudio);
                model.stop();
            }
        };
    }
});

admin.Audio = ActionClass.extend({
    className: 'Audio',
    moduleName: 'common',
    getDuration: function(){
        return this.duration;
    },
    play: function(){
        this.audio.currentTime = 0;
        this.audio.play();
        this.playing = true;
    },
    stop: function(){
        this.audio.pause();
        this.playing = false;
    },
    playstop: function(){
        if (this.playing){
            this.stop();
        }else{
            this.play();
        }
        
        return this.playing;
    },
    createAttrs: function(project){
        this.set({
            url: '/admin/new.mp3',
            name: 'new.mp3'
        });
    },
    createSchemeField: function(){
        return new SchemeField('#AudioBlk', this)
            .link( new ADLinkAudio('.blk-audio', this, null) )
            .linkTextValue('.blk-name', this, 'name')
            .openFieldClick('.link-open', function(){return this.getEditor();}.bind(this), {mainObject: this})
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(this, stack);
            }.bind(this));
    },
    init: function(project){
        var accept = new zz.data().set({accept: '.mp3'});

        this.duration = false;
        this.audio = null;
        this.playing = false;

        this.on('set:url', function(){
            this.audio = new Audio(this.get('url'));
            
            this.audio.onloadedmetadata = function() {
                window.setTimeout(function(){
                    this.duration = this.audio.duration;

                    this.callEventListener('load');
                }.bind(this), 0);
            }.bind(this);
            
            this.audio.onended = function(){
                this.playing = false;
            }.bind(this);
        }, this);
        
        this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection(null, new SchemeCollection([
                this.destrLsn(new SchemeField('#AudioEditBlock', this))
                    .link( new ADLinkAudio('.blk-audio', this, null) )
                    .linkInputValue('.blki-name', this, 'name')
                    .linkAttributeValue('.blki-upload', 'accept', accept, 'accept')
                    .linkUploadFile('.blki-upload', project.getItem('project').getUploadImageURL(), function(file){
                        if (file.size > 512*1024){
                            admin.alert('Ошибка', 'Файл: "'+file.name+'" занимает больше 512 кб', 'Ясно');
                            return false;
                        }

/*                        var audio = new Audio(URL.createObjectURL(file));
                        
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
                            data.uploaded.forEach(function(file){
                                this.set({url: file.upload, name: file.filename});
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
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this))
            ]));
    }
});

admin.AudioList = SyncedList.extend({
    className: 'AudioList',
    moduleName: 'common',
    collectionInstance: admin.Audio,
    createButtonField: function(name){
        return (new UploadAudioButtonField(name, '.mp3', admin.global.Project.getUploadImageURL(), function(files){
            var adding = [];
            
            files.forEach(function(file){
                adding.push(this.watcher.watch(new admin.Audio).set({url: file.upload, name: file.filename}));
            }, this);
            
            this.add(adding);
        }.bind(this)));
    },
    createSchemeField: function(){
        return new SchemeField('#BlkListTpl')
            .linkCollection('.blk-list', this.createSchemeCollection());
    },
    init: function(){
        this.on('destroy', function(){
            this.getCollection().forEach(function(attr){
                if (attr && attr.destroy){
                    attr.destroy();
                }
            });
        }.bind(this));
    }
});