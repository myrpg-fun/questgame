var MapStyleCounter = 1;

admin.MapStyleEffectGlitchBlur = ActionClass.extend({
    className: 'MapStyleEffectGlitchBlur',
    moduleName: 'MapStyle',
    createSchemeField: function(){
        var x = 0;
        var unglitch = function(){
            x -= this.get('speed');
            if (x<0){
                x=0;
            }else{
                if (show){
                    setTimeout(unglitch, 20);
                }
            }

            if (show){
                admin.global.Map.mapDOM.style.filter = "blur("+x+"px)";
            }else{
                admin.global.Map.mapDOM.style.filter = "blur(0px)";
            }
        }.bind(this);

        var glitch = function(){
            if (!show){
                admin.global.Map.mapDOM.style.filter = "blur(0px)";
                return;
            }
            
            if (x === 0){
                setTimeout(unglitch, 20);
            }

            x = Math.random()*this.get('max');

            admin.global.Map.mapDOM.style.filter = "blur("+(x)+"px)";

            if (show){
                setTimeout(glitch, Math.random()*this.get('period')+300);
            }
        }.bind(this);

        return this.destrLsn(new SchemeField('#MapStyleEffectGlitchBlur'))
            .init(null, function(){
                show = true;
                x = 0;
                glitch();
            }.bind(this), function(){
                show = false;
            }.bind(this))
            .linkInputInteger('.blki-period', this, 'period')
            .linkInputInteger('.blki-max', this, 'max')
            .linkInputFloat('.blki-speed', this, 'speed')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            period: 2000,
            max: 10,
            speed: 2
        });
    },
});

admin.MapStyleEffectGlitch = ActionClass.extend({
    className: 'MapStyleEffectGlitch',
    moduleName: 'MapStyle',
    createSchemeField: function(){
        var c = null;
        var cl = null;
        var unglitch = function(){
            if (c){
                c.remove();
            }
        }.bind(this);

        var glitch = function(){
            if (c){
                c.remove();
            }
            
            if (!show){
                return;
            }
            
            c = cl.clone();
            var w = cl.width()-20;
            var h = cl.height();
            c[0].style.clip = "rect("+Math.floor(Math.random()*h)+"px, "+w+"px, "+Math.floor(Math.random()*h)+"px, 0px)";
            c[0].style.left = Math.round(Math.random()*this.get('max')-this.get('max')/2)+"px";
            c[0].style.opacity = Math.random()*0.4+0.3;
            c[0].style.filter = "hue-rotate("+Math.random()*180+90+"deg)";
            c[0].style.pointerEvents = "none";
            c.appendTo(admin.global.Map.mapDOM);

            setTimeout(unglitch, 100);

            setTimeout(glitch, Math.random()*this.get('period')+100);
        }.bind(this);
        
        return this.destrLsn(new SchemeField('#MapStyleEffectGlitch'))
            .init(null, function(){
                show = true;
                cl = $(admin.global.Map.mapDOM).children().first();
                glitch();
            }.bind(this), function(){
                if (c){
                    c.remove();
                }
                show = false;
            }.bind(this))
            .linkInputInteger('.blki-period', this, 'period')
            .linkInputInteger('.blki-max', this, 'max')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            period: 2000,
            max: 30
        });
    },
});

admin.MapStyleEffectBlur = ActionClass.extend({
    className: 'MapStyleEffectBlur',
    moduleName: 'MapStyle',
    createSchemeField: function(){
        this.on('set:max', function(){
            admin.global.Map.mapDOM.style.filter = "blur("+this.get('max')+"px)";
        }, this);

        return this.destrLsn(new SchemeField('#MapStyleEffectBlur'))
            .init(null, function(){
                admin.global.Map.mapDOM.style.filter = "blur("+this.get('max')+"px)";
            }.bind(this), function(){
                admin.global.Map.mapDOM.style.filter = "blur(0px)";
            }.bind(this))
            .linkInputFloat('.blki-max', this, 'max')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            max: 4
        });
    },
});

admin.MapStyleEffectImageBlend = ActionClass.extend({
    className: 'MapStyleEffectImageBlend',
    moduleName: 'MapStyle',
    createSchemeField: function(){
        this.on('set:mix', function(){
            if (c){
                c.css({
                    mixBlendMode: this.get('mix')
                });
            }
        }, this);
        
        this.on('set:opacity', function(){
            if (c){
                c.css({
                    opacity: this.get('opacity'),
                });
            }
        }, this);
        
        this.on('set:image', function(){
            if (c){
                c.css({
                    backgroundImage: "url("+this.get('image')+")",
                });
            }
        }, this);
        
        var show = false;
        var c = null;
        var x = 0;
        var unglitch = function(){
            if (!show){
                c.remove();
                return;
            }
            
            x += this.get('speed');
            c.css({
                backgroundPosition: Math.round(x)+'px 0px'
            });            
            
            setTimeout(unglitch, 50);
        }.bind(this);

        var glitch = function(){
            if (c){
                c.remove();
            }
            
            if (!show){
                return;
            }
            
            c = $('<div></div>');
            x = 0;
            c.css({
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: '100%',
                height: '100%',
                opacity: this.get('opacity'),
                pointerEvents: "none",
                backgroundImage: "url("+this.get('image')+")",
                backgroundRepeat: 'repeat',
                backgroundPosition: '0px 0px',
                mixBlendMode: this.get('mix')
            });
            c.appendTo(admin.global.Map.mapDOM);

            setTimeout(unglitch, 50);
        }.bind(this);
        
        return this.destrLsn(new SchemeField('#MapStyleEffectImageBlend'))
            .init(null, function(){
                show = true;
                glitch();
            }.bind(this), function(){
                if (c){
                    c.remove();
                    c = null;
                }
                show = false;
            }.bind(this))
            .linkInputFloat('.blki-opacity', this, 'opacity')
            .linkInputFloat('.blki-speed', this, 'speed')
            .linkInputValue('.blki-mix', this, 'mix')
            .openFieldClick('.link-image', admin.fields.DialogImageCollection, {onSelect: function(icon){
                this.set({image: icon.get('image')});
            }.bind(this)})
            .linkAttributeValue('.blki-image', 'src', this, 'image')
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this))
            .click('.blki-image', function(FieldDOM){
                FieldDOM.DOM.find('.link-image').click();
            }.bind(this));
    },
    createAttrs: function(project){
        this.set({
            image: '/admin/cloud.jpg',
            mix: 'normal',
            opacity: 0.5,
            speed: 0
        });
    }
});

admin.MapStyleEffectsList = SyncedList.extend({
    className: 'MapStyleEffectsList',
    moduleName: 'MapStyle',
    collectionInstance: null
});

admin.MapStyle = ActionClass.extend({
    className: 'MapStyle',
    moduleName: 'MapStyle',
    getStaticStyles: function (styles) {
        if( styles ) {
          var result = [];
          styles.forEach(function(v, i, a){
            var style='';
            if( v.stylers ) { 
              if (v.stylers.length > 0) { 
                style += (v.hasOwnProperty('featureType') ? 'feature:' + v.featureType : 'feature:all') + '|';
                style += (v.hasOwnProperty('elementType') ? 'element:' + v.elementType : 'element:all') + '|';
                v.stylers.forEach(function(val, i, a){
                  var propertyname = Object.keys(val)[0];
                  var propertyval = val[propertyname].toString().replace('#', '0x');
                  style += propertyname + ':' + propertyval + '|';
                });
              }
            }
            result.push('style='+encodeURIComponent(style));
          });

          return result.join('&');
        }
    },
    getUrl: function(){
        return "http://maps.googleapis.com/maps/api/staticmap?" + 
            "center=55.71338351780844,37.578022796630876&size=400x300&zoom=16&" +
            "maptype=" + this.get('maptype') + "&" +
            this.custom;
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#MapStyleSelectBlock'))
            .linkTextValue('.blki-name', this, 'name')
            .linkAttributeValue('img.blki-icon', 'src', this.style, 'url')
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
            maptype: 'roadmap',
            style: '[]',
            name: 'Стиль карты '+MapStyleCounter++,
            effectsList: admin.watcher.watch(new admin.MapStyleEffectsList([]))
        });
    },
    init: function(){
        var digit = /\d+$/g.exec(this.get('name'));
        if (digit !== null && digit[0] >= MapStyleCounter){
            MapStyleCounter = digit[0]*1+1;
        }

        this.style = (new zz.data()).set({
            url: ''
        });
        this.custom = '';
        
        var show = false;
        this.on('set:style', function(ev){
            if (ev.value){
                try {
                    var json = JSON.parse(ev.value);
                    this.custom = this.getStaticStyles( json );
                    if (show){
                        admin.global.Map.getMap().setOptions({styles: json });
                    }
                } catch(error) {
                    this.custom = '';
                }
                
                this.style.set({
                    url: this.getUrl()
                });
            }
        }, this);

        this.on('set:maptype', function(ev){
            this.style.set({
                url: this.getUrl()
            });
            if (show){
                admin.global.Map.getMap().setOptions({mapTypeId: ev.value});
            }
        }, this);        
        
        this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection(null, this.SCtl = new SchemeCollection([
                this.destrLsn(new SchemeField('#MapStyle'))
                    .init(null, function(){
                        show = true;
                        try {
                            admin.global.Map.getMap().setOptions({styles:
                                JSON.parse(this.get('style')),
                                mapTypeId: this.get('maptype')
                            });
                        } catch(error) {}
                    }.bind(this), function(){
                        show = false;
                        admin.global.Map.getMap().setOptions({styles: [], mapTypeId: 'roadmap'});
                    }.bind(this))
                    .linkAttributeValue('img.blki-image', 'src', this.style, 'url')
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputValue('.blki-style', this, 'style')
                    .linkInputValue('.blki-maptype', this, 'maptype')
                    .click('.remove', function(){
                        this.deleteSync();
                        return false;
                    }.bind(this)),
                new CreateButtonField('Добавить эффект', admin.fields.NewMapStyleEffects, {onSelect: function(effect){
                    var ne = this.watcher.watch(new effect);
                    
                    this.get('effectsList').add([ne]);
                }.bind(this)}),
                makeSchemeFieldList(this.get('effectsList').createSchemeCollection())
            ]));
    }
});

admin.MapStyleDefault = admin.MapStyle.extend({
    className: 'MapStyleDefault',
    moduleName: 'common',
    createAttrs: function(project){
        this.set({
            maptype: 'roadmap',
            style: '[{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]}]',
            name: 'Базовый стиль'
        });
    },
    init: function(){
        this.style = (new zz.data()).set({
            url: ''
        });
        this.custom = '';
        
        var show = false;
        this.on('set:style', function(ev){
            if (ev.value){
                try {
                    this.custom = this.getStaticStyles( JSON.parse(ev.value) );
                } catch(error) {
                    this.custom = '';
                }
                
                this.style.set({
                    url: this.getUrl()
                });
            }
        }, this);

        this.on('set:maptype', function(ev){
            this.style.set({
                url: this.getUrl()
            });
            if (show){
                admin.global.Map.getMap().setOptions({mapTypeId: ev.value});
            }
        }, this);        
        
        this.editorBlk = this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection(null, this.SCtl = new SchemeCollection([
                this.destrLsn(new SchemeField('#MapStyleDefault'))
                    .init(null, function(){
                        show = true;
                        try {
                            admin.global.Map.getMap().setOptions({styles:
                                JSON.parse(this.get('style')),
                                mapTypeId: this.get('maptype')
                            });
                        } catch(error) {}
                    }.bind(this), function(){
                        show = false;
                        admin.global.Map.getMap().setOptions({styles: [], mapTypeId: 'roadmap'});
                    }.bind(this))
                    .linkAttributeValue('img.blki-image', 'src', this.style, 'url')
                    .linkInputValue('.blki-name', this, 'name')
                    .linkInputValue('.blki-maptype', this, 'maptype'),
            ]));
    }
});

admin.MapStyleList = SyncedList.extend({
    className: 'MapStyleList',
    moduleName: 'MapStyle',
    collectionInstance: admin.MapStyle,
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

admin.fields.NewMapStyleEffectsCollection = new SchemeCollection([
    new SelectButtonField('#MapStyleEffectGlitchBlur', admin.MapStyleEffectGlitchBlur),
    new SelectButtonField('#MapStyleEffectGlitch', admin.MapStyleEffectGlitch),
    new SelectButtonField('#MapStyleEffectBlur', admin.MapStyleEffectBlur),
    new SelectButtonField('#MapStyleEffectImageBlend', admin.MapStyleEffectImageBlend)
]);

admin.fields.NewMapStyleEffects = makeSchemeFieldList(admin.fields.NewMapStyleEffectsCollection);

admin.watcher.on('start', function(ev){
    admin.watcher.afterSyncItem('project', function(project){
        admin.global.MapStyleDefault = admin.watcher.watchByID("MapStyleDefault", function(){
            return new admin.MapStyleDefault;
        });

        admin.global.MapStyleList = admin.watcher.watchByID("MapStyleList", function(){
            return new admin.MapStyleList([
                admin.global.MapStyleDefault
            ]);
        });

        admin.global.root.add([admin.global.MapStyleList]);

        admin.fields.MapStyleListCollection = makeSchemeFieldList(
            new SchemeCollection([
                new CreateButtonField('Создать новый стиль', function(){
                    var st = admin.watcher.watch(new admin.MapStyle);

                    admin.global.MapStyleList.add([st]);

                    return st.getEditor();
                }, {}),
                admin.global.MapStyleList.getSchemeField()
            ])
        );
    });
});