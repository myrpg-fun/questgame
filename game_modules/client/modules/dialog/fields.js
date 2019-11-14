DialogFieldAnimated = ActionClass.extend({});
InventoryItemWidth = 24;

client.DialogFieldText = DialogFieldAnimated.extend({
    className: 'DialogFieldText',
    _toMs: function(time){
        var spl = time.split(':');
        if (!spl[2]){
            spl[2] = 0;
        }
            
        return Date.UTC(1970,0,1,spl[0]*1,spl[1]*1,spl[2]*1);
    },
    fillZero: function(n){
        if (n < 10){
            return '0'+n;
        }
        return n;
    },
    _toTime: function(time){
        time = new Date(time);

        return this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds());
    },
    createSchemeField: function(){
        var style = new zz.data();
        style.set({
            style: 'width: '+this.get('width')+'%'
        });
        
        this.on('set:width', function(ev){
            style.set({
                style: 'width: '+this.get('width')+'%'
            });
        }.bind(this));
        
        var vars = (new zz.data).set({
            text: this.get('textview').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>"),
            style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('center')?'center':'')+' '+(this.get('italic')?'italic':''),
            colorstyle: 'color: '+(this.get('color')?this.get('color'):'#FFFFFF')
        });
        
        this.on('set', function(){
            vars.set({
                text: this.get('textview').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>"),
                style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('center')?'center':'')+' '+(this.get('italic')?'italic':''),
                colorstyle: 'color: '+(this.get('color')?this.get('color'):'#FFFFFF')
            });
        });
        
        var timer = null;
        var self = this;
        var initt = null;
        return this.destrLsnTimer(new SchemeField('#DialogFieldText'))
            .linkHtmlValue('.blk-text', vars, 'text')
            .init(null, function(DOMel){
                initt = function(){
                    setTimeout(function(){
                        var timers = DOMel.find('.timer');
                        console.log('find timers', timers.length);
                        if (timers.length){
                            timers.each(function(){
                                var timeout = $(this).data('timeout')*1;
                                $(this).html(self._toTime(timeout - Date.now() - client.serverTimeOffset));
                            });
                            timer = setInterval(function(){
                                timers.each(function(){
                                    var time = self._toMs($(this).html()) - 1000;

                                    if (time < 0){
                                        time = 0;
                                    }

                                    $(this).html(self._toTime(time));
                                });
                            }, 1000);
                        }
                    }, 0);
                };
                
                vars.addEventListener('set:text', initt);
                initt();
            }, function(){
                if (timer){
                    clearInterval(timer);
                }
                
                if (initt){
                    vars.clearEventListener('set:text', initt);
                }
            })
            .linkAttributeValue('.blk-interface', 'style', style, 'style')
            .linkAttributeValue('.blk-text', 'class', vars, 'style')
            .linkAttributeValue('.blk-text', 'style', vars, 'colorstyle');
    }
});

client.DialogFieldTask = DialogFieldAnimated.extend({
    className: 'DialogFieldTask',
    _toMs: function(time){
        var spl = time.split(':');
        if (!spl[2]){
            spl[2] = 0;
        }
            
        return Date.UTC(1970,0,1,spl[0]*1,spl[1]*1,spl[2]*1);
    },
    fillZero: function(n){
        if (n < 10){
            return '0'+n;
        }
        return n;
    },
    _toTime: function(time){
        time = new Date(time);

        return this.fillZero((time.getUTCDate()-1)*24+time.getUTCHours())+':'+this.fillZero(time.getUTCMinutes())+':'+this.fillZero(time.getUTCSeconds());
    },
    createSchemeField: function(){
        var vars = (new zz.data).set({
            text: this.get('textview').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>"),
            style: 'blk-task task-'+this.get('status')
        });
        
        this.on('set', function(){
            vars.set({
                text: this.get('textview').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />").replace(/\[ion-([\w-]+)\]/g, "<i class='ion-$1'></i>").replace(/\[tmr-(\d+)\]/g, "<span class='timer' data-timeout='$1'></span>"),
                style: 'blk-task task-'+this.get('status')
            });
        });
        
        var timer = null;
        var self = this;
        return this.destrLsnTimer(new SchemeField('#DialogFieldTask'))
            .init(null, function(DOMel){
                setTimeout(function(){
                    var timers = DOMel.find('.timer');
                    if (timers.length){
                        timers.each(function(){
                            var timeout = $(this).data('timeout')*1;
                            $(this).html(self._toTime(timeout - Date.now() - client.serverTimeOffset));
                        });
                        timer = setInterval(function(){
                            timers.each(function(){
                                var time = self._toMs($(this).html()) - 1000;

                                if (time < 0){
                                    time = 0;
                                }

                                $(this).html(self._toTime(time));
                            });
                        }, 1000);
                    }
                }, 0);
            }, function(){
                if (timer){
                    clearInterval(timer);
                }
            })
            .linkHtmlValue('.blk-text', vars, 'text')
            .linkAttributeValue('.blk-task', 'class', vars, 'style');
    }
});

client.DialogFieldImage = DialogFieldAnimated.extend({
    className: 'DialogFieldImage',
    createSchemeField: function(){
        var style = new zz.data();
        style.set({
            style: 'width: '+this.get('width')+'%'
        });
        
        this.on('set:width', function(ev){
            style.set({
                style: 'width: '+this.get('width')+'%'
            });
        }.bind(this));
        
        return this.destrLsnTimer(new SchemeField('#DialogFieldImage'))
            .linkAttributeValue('.blk-interface', 'style', style, 'style')
            .linkAttributeValue('.blk-image', 'src', this, 'imagetb');
    }, 
    init: function(){
        this.on('set:image', function(ev){
            this.set({
                imagetb: ev.value.replace(/upload\/([\w.-]+)$/gi, "resize/1024/$1")
            });
        });
    }
});

client.DialogFieldAudio = DialogFieldAnimated.extend({
    className: 'DialogFieldAudio',
    createSchemeField: function(){
        var audio = new Audio(this.get('url'));
        
        return this.destrLsnTimer(new SchemeField('#BlkListTpl'))
            .init(null, function(){
                audio.currentTime = 0;
                audio.play();
            }, function(){
                audio.pause();
            });
    }
});

client.DialogTextButton = DialogFieldAnimated.extend({
    className: 'DialogTextButton',
    createSchemeField: function(){
        var style = new zz.data();
        style.set({
            style: 'width: '+this.get('width')+'%',
            class: 'btn link-button btn-width100'
        });
        
        this.on('set:width', function(ev){
            style.set({
                style: 'width: '+this.get('width')+'%'
            });
        }.bind(this));

        this.on('destroy', function(){
            client.socket.unwait('player-click-'+this.id+'-done');
        }, this);

        var wait = false;
        
        client.socket.wait('player-click-'+this.id+'-done', function(){
            style.set({
                class: 'btn link-button btn-width100'
            });
            wait = false;
        });
        
        return this.destrLsnTimer(new SchemeField('#DialogTextButton'))
            .linkTextValue('.link-button', this, 'text')
            .linkAttributeValue('.link-button', 'class', style, 'class')
            .linkAttributeValue('.blk-interface', 'style', style, 'style')
            .click('.link-button', function(){
                if (!wait){
                    wait = true;
                    style.set({
                        class: 'btn link-button btn-width100 waiting'
                    });

                    client.socket.emit('player-click:'+this.id, {});
                }
            }.bind(this));
    }
});

client.DialogFieldSeparator = DialogFieldAnimated.extend({
    className: 'DialogFieldSeparator',
    createSchemeField: function(){
        return this.destrLsnTimer(new SchemeField('#DialogFieldSeparator'));
    }
});

client.DialogInventorySelect = DialogFieldAnimated.extend({
    className: 'DialogInventorySelect',
    getBox: function(){
        return {
            width: 100 / this.get('x'),
            maxheight: this.get('y')
        };
    },
    createSchemeField: function(){
        var style = new zz.data();
        style.set({
            style: 'width: '+this.get('width')+'%'
        });
        
        this.on('set:width', function(ev){
            style.set({
                style: 'width: '+this.get('width')+'%'
            });
        }.bind(this));
        
        if (this.get('inventoryview')){
            return this.destrLsnTimer(new SchemeField('#DialogInventorySelect'))
                .linkAttributeValue('.blk-interface', 'style', style, 'style')
                .linkField('.blk-inventory', this.get('inventoryview').createSchemeField(this));
        }else{
            return this.destrLsnTimer(new SchemeField('#DialogInventorySelect'))
                .linkAttributeValue('.blk-interface', 'style', style, 'style');
        }
    },
    init: function(){
        var wait = false;
        
        this.on('destroy', function(){
            client.socket.unwait('player-click-'+this.id+'-done');
        }, this);

        client.socket.wait('player-click-'+this.id+'-done', function(){
            wait();
            
            wait = false;
        });
        
        this.on('click-xy', function(ev){
            if (wait === false){
                wait = ev.selected;
                console.log('click xy');

                client.socket.emit('player-click:'+this.id, {x: ev.x, y: ev.y});
            }
        }, this);
            
        this.on('dblclick-xy', function(ev){
            console.log('dblclick xy');

            client.socket.emit('player-dblclick:'+this.id, {x: ev.x, y: ev.y});
        }, this);
    }
});

client.DialogInventoryItem = DialogFieldAnimated.extend({
    className: 'DialogInventoryItem',
    createSchemeField: function(){
        var vars = (new zz.data);
        vars.set({
            style: 'position: relative;display: inline-block;width:'+this.get('x')*InventoryItemWidth+'%;padding-top: '+this.get('y')*InventoryItemWidth+'%',
            icon: this.get('icon'),
            count: this.get('count'),
            countstyle: (parseInt(this.get('count')) === 1)?'display: none':'display: block'
        });

        return new SchemeField('#DialogInventoryItem')
            .linkAttributeValue('.blki-icon', 'src', vars, 'icon')
            .linkAttributeValue('.blki-count', 'style', vars, 'countstyle')
            .linkTextValue('.blki-count', vars, 'count')
            .linkAttributeValue('.blk-item', 'style', vars, 'style');
    },
    init: function(){
    }
});

client.DialogFieldTimer = DialogFieldAnimated.extend({
    className: 'DialogFieldTimer',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')
        });
        
        this.on('set', function(){
            vars.set({
                style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('italic')?'italic':'')
            });
        });
        
        if (!this.get('timerview')){
            return this.destrLsnTimer(new SchemeField('#DialogFieldTimer'))
                .linkAttributeValue('.blk-text', 'class', vars, 'style');
        }
        
        return this.destrLsnTimer(new SchemeField('#DialogFieldTimer'))
            .linkAttributeValue('.blk-text', 'class', vars, 'style')
            .linkField('.blk-text', this.get('timerview').createSchemeField());
    },
    init: function(){}
});

client.DialogChangeField = DialogFieldAnimated.extend({
    className: 'DialogChangeField',
    createSchemeField: function(){
        return this.destrLsnTimer(new SchemeField('#DialogChangeField'))
            .linkCollection('.blk-dialog', this.collection);
    },
    init: function(){
        this.collection = new SchemeCollection([]);
        
        this.on('set:dialogview', function(ev){
            this.collection.removeAll();
            
            if (ev.value){
                this.collection.add([
                    new SchemeField('#BlkListTpl')
                        .linkCollection('.blk-list', ev.value.getFieldsListCollection())
                ]);
            }
        });        
    }
});

client.DialogLocalIFField = DialogFieldAnimated.extend({
    className: 'DialogLocalIFField',
    createSchemeField: function(){
        return null;
        /*new SchemeField('#BlkListTpl')
            .linkCollection('.blk-list', this.get('fieldsList').createSchemeCollection());*/
    },
    getFieldsListCollection: function(){
        return this.get('fieldsList').createSchemeCollection();
    },
    init: function(){}
});

client.DialogChangeTextField = DialogFieldAnimated.extend({
    className: 'DialogChangeTextField',
    createSchemeField: function(){
        var vars = (new zz.data).set({
            style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('center')?'center':'')+' '+(this.get('italic')?'italic':'')
        });
        
        this.on('set', function(){
            vars.set({
                style: 'blk-text fsize-'+this.get('style')+' font-'+this.get('font')+' '+(this.get('bold')?'bold':'')+' '+(this.get('center')?'center':'')+' '+(this.get('italic')?'italic':'')
            });
        });
        
        return this.destrLsnTimer(new SchemeField('#DialogFieldText'))
            .linkAttributeValue('.blk-text', 'class', vars, 'style')
            .linkCollection('.blk-text', this.collection);
    },
    init: function(){
        this.collection = new SchemeCollection([]);
        
        this.on('set:textview', function(ev){
            this.collection.removeAll();
            
            if (ev.value instanceof client.Text){
                this.collection.add([
                    ev.value.getSchemeField()
                ]);
            }
            if (typeof ev.value === 'string'){
                var vars = (new zz.data).set({
                    text: ev.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />")
                });
                
                this.collection.add([
                    new SchemeField('#DialogChangeTextField')
                        .linkHtmlValue('.blk-change', vars, 'text')
                ]);
            }
        });        
    }
});

client.DialogInputButton = DialogFieldAnimated.extend({
    className: 'DialogInputButton',
    createSchemeField: function(){
        return this.destrLsnTimer(new SchemeField('#DialogInputButton'))
            .linkInputValue('.blki-input', this, 'input');
    },
    init: function(){
        if (!this.get('input')){
            this.set({input: ''});
        }
        
        this.on('set:input', function(ev){
            client.socket.emit('player-change:'+this.id, {input: ev.value});
        }.bind(this));
/*        this.collection = new SchemeCollection([]);
        
        this.on('set:textview', function(ev){
            this.collection.removeAll();
            
            if (ev.value instanceof client.Text){
                this.collection.add([
                    ev.value.getSchemeField()
                ]);
            }
            if (typeof ev.value === 'string'){
                var vars = (new zz.data).set({
                    text: ev.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br />")
                });
                
                this.collection.add([
                    new SchemeField('#DialogChangeTextField')
                        .linkHtmlValue('.blk-change', vars, 'text')
                ]);
            }
        });        */
    }
});

client.DialogQRCodeCheck = DialogFieldAnimated.extend({
    className: 'DialogQRCodeCheck',
    createSchemeField: function(){
        var send = null;
        var scanner = null;
        var camera = 1;
        var domel = null;

        this.on('destroy', function(){
            client.socket.unwait('player-qrscan-'+this.id+'-done');
        }, this);

        client.socket.wait('player-qrscan-'+this.id+'-done', function(){
            if (send){
                send.hide();
            }
        });
        
        var startScan = function(){
            scanner = new Instascan.Scanner({ video: domel, backgroundScan: false });

            scanner.addListener('scan', function (content) {
//                console.log('player-qrscan:'+this.id, content);
                if (send){
                    send.show();
                }

                client.socket.emit('player-qrscan:'+this.id, {qr: content});
            }.bind(this));

            Instascan.Camera.getCameras().then(function (cameras) {
                if (cameras.length > 0) {
                    if (camera >= cameras.length){
                        camera = 0;
                    }

                    scanner.start(cameras[camera]).catch(function (e) {
                        if (e.message === 'Permission denied'){
                            client.alert('Закрыт доступ к модулю камеры', "Чтобы отсканировать QR код, необходимо разрешить доступ к модулю камеры.", "Закрыть", "red");
                        }else{
                            client.alert(e.name, e.message, "Закрыть", "red");
                            console.error(e);
                        }
                    });
                } else {
                    client.alert("Ошибка доступа к модулю камеры", "В телефоне не найдена камера", "Закрыть", "red");
//                        console.error('No cameras found.');
                }
            }).catch(function (e) {
                console.error(e, error.code);
            });
        }.bind(this);
        
        return this.destrLsnTimer(new SchemeField('#DialogQRCodeCheck'))
            .init('.blk-qrscan-send', function(el){
                send = el;
                send.hide();
            }.bind(this), function(){
                send = null;
            }.bind(this))
            .click('.blk-qrscan-camera', function(){
                scanner.stop();
        
                camera++;
        
                startScan();
            }.bind(this))
            .init('.blk-qrscan', function(el){
                domel = el[0];
                
                startScan();
            }.bind(this), function(){
                domel = null;
                
                scanner.stop();
            }.bind(this));
    },
    init: function(){
    }
});

