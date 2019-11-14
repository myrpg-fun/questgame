var SchemeFieldDOM = zz.Class.extend({
    window: function(){
        return this.parent.window();
    },
    removeDOM: function(){
        this.SField.callClearEventsFn(this.DOM);
        
        this.DOM.remove();
    },
    initialize: function(templateName, SField, PField){
        this.SField = SField;
        this.parent = PField;
        this.DOM = $($templates.find(templateName).html());
        
        if (this.DOM.length === 0){
            console.error('Cannot find template '+templateName);
        }
        
        SField.on('destroy', function(){
            this.removeDOM();
        }.bind(this));
    }
});


function autoResizeTextarea (text) {
    function resize () {
        text.style.height = 'auto';
        text.style.height = text.scrollHeight+'px';
    }
    function delayedResize () {
        window.setTimeout(resize, 0);
    }
    text.addEventListener('change',  resize, false);
    text.addEventListener('cut',  delayedResize, false);
    text.addEventListener('paste',  delayedResize, false);
    text.addEventListener('drop',  delayedResize, false);
    text.addEventListener('keydown',  delayedResize, false);

    delayedResize ();
}

var SFLink = zz.Class.extend({
    DOMFind: function(DOMfind, DOMfield){
        var DOMel = (DOMfind !== null)?
            DOMfield.DOM.filter(DOMfind).add( DOMfield.DOM.find( DOMfind ) ):
            DOMfield.DOM;
    
        if (DOMel.length === 0){
            console.error('Wrong selector', DOMfind);
        }
        
        return DOMel;
    }
});

var SFLinkInputValue = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel = DOMel[0];
            
            listener = function(event){
                if (DOMel.value !== event.value){
                    DOMel.value = event.value;
                }
            };
            model.addEventListener('set:'+modelName, listener, model);

            function inputListener(){
                if (DOMel.value !== model.get(modelName)){
                    model.setAttribute(modelName, this.value);
                }
            }

            DOMel.addEventListener('keyup', inputListener);
            DOMel.addEventListener('change', inputListener);

            DOMel.value = model.get(modelName);
            
            if (DOMel.type === 'textarea'){
                autoResizeTextarea(DOMel);
            }
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkEditableValue = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel = DOMel[0];
            
            $(DOMel).bind("selectstart", function(event){
                event.stopPropagation();
            });
            
            DOMel.contentEditable = true;
            
            var listen = true;
            listener = function(event){
                if (listen && DOMel.innerHTML !== event.value){
                    //DOMel.innerHTML = event.value;
                }
            };
            model.addEventListener('set:'+modelName, listener, model);

            function inputListener(){
                if (DOMel.innerHTML !== model.get(modelName)){
                    var o = {};
                    o[modelName] = DOMel.innerHTML;
                    listen = false;
                    //model.set(o);
                    listen = true;
                }
            }

            //DOMel.addEventListener('input', inputListener);
            /*DOMel.addEventListener('keypress', function(ev){
                if(ev.keyCode == '13'){
                    document.execCommand('formatBlock', false, 'p');
                }
            }, false);*/

            DOMel.innerHTML = model.get(modelName);
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkInputInteger = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel = DOMel[0];
            
            listener = function(event){
                if (DOMel.value !== event.value){
                    DOMel.value = event.value;
                }
            };
            model.addEventListener('set:'+modelName, listener, model);

            function inputListener(){
                if (DOMel.value !== model.get(modelName)){
                    var val = parseInt(DOMel.value);
                    if (isNaN(val)){
                        return;
                    }
                    
                    model.setAttribute(modelName, val);
                }
            }

            DOMel.addEventListener('keyup', inputListener);
            DOMel.addEventListener('change', inputListener);

            DOMel.value = model.get(modelName);
            
            if (DOMel.type === 'textarea'){
                autoResizeTextarea(DOMel);
            }
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkInputColor = SFLink.extend({
    initialize: function(DOMfind, model, modelName, opacityName){
        var listener, listenero;
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel.minicolors({
                defaultValue: model.get(modelName),
                opacity: opacityName?true:false,
                change: function(value, opacity) {
                    if (value !== model.get(modelName)){
                        model.setAttribute(modelName, value);
                    }
                    
                    if (opacityName && opacity !== model.get(opacityName)){
                        model.setAttribute(opacityName, opacity);
                    }
                }
            });
            window.setTimeout(function(){
                DOMel.minicolors('value', {color: model.get(modelName), opacity: opacityName?model.get(opacityName):1});
            }, 0);

            var el = DOMel[0];
            
            listener = function(event){
                if (el.value !== event.value){
                    DOMel.minicolors('value', {color: model.get(modelName), opacity: opacityName?model.get(opacityName):1});
                }
            };
            model.addEventListener('set:'+modelName, listener, model);

            if (opacityName){
                listenero = function(event){
                    DOMel.minicolors('value', {color: model.get(modelName), opacity: opacityName?model.get(opacityName):1});
                };
                model.addEventListener('set:'+opacityName, listenero, model);
            }

            function inputListener(){
                if (el.value !== model.get(modelName)){
                    var val = el.value;
                    model.setAttribute(modelName, val);
                }
            }

            el.addEventListener('keyup', inputListener);
            el.addEventListener('change', inputListener);

            if (el.type === 'textarea'){
                autoResizeTextarea(el);
            }
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
            if (opacityName){
                model.clearEventListener('set:'+opacityName, listenero);
            }
        };
    }
});

var SFLinkInputFloat = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel = DOMel[0];
            
            listener = function(event){
                if (DOMel.value !== event.value){
                    DOMel.value = event.value;
                }
            };
            model.addEventListener('set:'+modelName, listener, model);

            function inputListener(){
                if (DOMel.value !== model.get(modelName)){
                    var val = parseFloat(DOMel.value);
                    if (isNaN(val)){
                        return;
                    }
                    
                    model.setAttribute(modelName, val);
                }
            }

            DOMel.addEventListener('keyup', inputListener);
            DOMel.addEventListener('change', inputListener);

            DOMel.value = model.get(modelName);
            
            if (DOMel.type === 'textarea'){
                autoResizeTextarea(DOMel);
            }
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkAttributeValue = SFLink.extend({
    initialize: function(DOMfind, attrName, model, modelName){
        var listener;
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            var DOMattr = document.createAttribute(attrName);

            DOMel = DOMel[0];
            
            listener = function(event){
                DOMattr.value = event.value;
            };
            model.addEventListener('set:'+modelName, listener);

            DOMattr.value = model.get(modelName);

            DOMel.setAttributeNode( DOMattr );
        }.bind(this);
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkTextValue = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            var DOMtext = document.createTextNode('');

            DOMel = DOMel[0];

            DOMel.innerHTML = '';
            DOMel.appendChild(DOMtext);

            listener = function(event){
                DOMtext.data = event.value;
            };

            model.addEventListener('set:'+modelName, listener);

            DOMtext.data = model.get(modelName);
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkHtmlValue = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel = DOMel[0];

            listener = function(event){
                DOMel.innerHTML = event.value;
            };

            model.addEventListener('set:'+modelName, listener);

            DOMel.innerHTML = model.get(modelName);
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkSwitchValue = SFLink.extend({
    initialize: function(DOMfind, model, modelName){
        var listener;
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel.click(function(){
                var O = {};

                if (model.get(modelName)){
                    O[modelName] = 0;
                    model.set(O);
                }else{
                    O[modelName] = 1;
                    model.set(O);
                }
            });

            listener = function(event){
                DOMel.removeClass('on');

                if (event.value){
                    DOMel.addClass('on');
                }
            };

            model.addEventListener('set:'+modelName, listener);

            DOMel.removeClass('on');

            if (model.get(modelName)){
                DOMel.addClass('on');
            }
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            model.clearEventListener('set:'+modelName, listener);
        };
    }
});

var SFLinkCollection = SFLink.extend({
    initialize: function(DOMfind, collection){
        var SCDF = null;
        
        if (!(collection instanceof SchemeCollection)){
            console.error('linked collection is not SchemeCollection');
        }
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            SCDF = collection.createCollectionDOM(DOMel, DOMfield);
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            if (SCDF){
                SCDF.removeDOM();
            }
        };
    }
});

var SFLinkField = SFLink.extend({
    initialize: function(DOMfind, field){
        var SCDF = null;
        
        if (!(field instanceof SchemeField)){
            console.error('linked field is not SchemeField');
        }
        
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            SCDF = field.createFieldDOM(DOMfield);
            
            DOMel.append(SCDF.DOM);
        }.bind(this);
        
        this.clearEventFn = function(DOMel){
            if (SCDF){
                SCDF.removeDOM();
            }
        };
    }
});

var SFOpenFieldClick = SFLink.extend({
    initialize: function(DOMfind, collection, stack){
        if (typeof collection === 'undefined'){
            console.error('Collection is undefined');
        }
        
        this.addEventFn = function(DOMfield){
            var selfDOM = DOMfield.DOM;
            
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            if (!stack){
                stack = {};
            }

            DOMel.click(function(event){
                $(this).parents('.fld-container').find('.selected').removeClass('selected');

                var col;
                if (typeof collection === 'function'){
                    col = collection(DOMfield, DOMel);
                }else{
                    col = collection;
                }

                var st;
                if (typeof stack === 'function'){
                    st = stack(DOMfield, DOMel);
                }else{
                    st = stack;
                }

                if (!col){
                    console.warn('return null');
                    return false;//true;
                }

                $(this).addClass('selected');
                DOMfield.window().open(col, DOMel, st);

                return false;
            });
        }.bind(this);
        
        this.clearEventFn = function(){};
    }
});
    
var SFClick = SFLink.extend({
    initialize: function(DOMfind, fn){
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel.click(function(){
                return fn.call(this, DOMfield, DOMel);
            });
        }.bind(this);
        
        this.clearEventFn = function(){};
    }
});

var SFLinkUploadFile = SFLink.extend({
    initialize: function(DOMfind, uploadurl, filterFn, successFn, errorFn, progressFn){
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            DOMel.change(function(){
                var files = $(this).get(0).files;

                if (files.length > 0){
                    var formData = new FormData();
                    for (var i = 0; i < files.length; i++) {
                        if (filterFn(files[i])){
                            formData.append('uploadfiles[]', files[i], files[i].name);
                        }
                    }

                    var ajaxdata = {
                        url: uploadurl,
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: successFn,
                        error: errorFn
                    };
                    
                    if (progressFn){
                        ajaxdata.xhr = function() {
                            var xhr = new XMLHttpRequest();

                            xhr.upload.addEventListener('progress', function(evt) {
                                if (evt.lengthComputable) {
                                    var percentComplete = evt.loaded / evt.total;
                                    percentComplete = parseInt(percentComplete * 100);

                                    progressFn(percentComplete);
                                }
                            }, false);

                            return xhr;
                        };
                    }

                    $.ajax(ajaxdata);
                }
            });
        }.bind(this);
        
        this.clearEventFn = function(){};
    }
});

var SFAddEventListener = SFLink.extend({
    initialize: function(DOMfind, model, event, fn){
        var listener;
        this.addEventFn = function(DOMfield){
            var DOMel = this.DOMFind(DOMfind, DOMfield);

            listener = function(ev){
                return fn(DOMel, ev, DOMfield);
            };

            model.addEventListener(event, listener, model);
        }.bind(this);
        
        this.clearEventFn = (function(){
            model.clearEventListener(event, listener);
        });
    }
});

var SFInitialize = SFLink.extend({
    initialize: function(DOMfind, initFn, destroyFn){
        var listener;
        this.addEventFn = function(DOMfield){
            if (initFn){
                var DOMel = this.DOMFind(DOMfind, DOMfield);
                
                initFn(DOMel, DOMfield);
            }
        }.bind(this);
        
        this.clearEventFn = (function(){
            if (destroyFn){
                destroyFn();
            }
        });
    }
});

var SchemeField = zz.event.extend({
    /* shortcuts */
    linkEditableValue: function(DOMfind, model, modelName){
       return this.link( new SFLinkEditableValue(DOMfind, model, modelName) );
    },
    linkInputValue: function(DOMfind, model, modelName){
       return this.link( new SFLinkInputValue(DOMfind, model, modelName) );
    },
    linkInputInteger: function(DOMfind, model, modelName){
       return this.link( new SFLinkInputInteger(DOMfind, model, modelName) );
    },
    linkInputFloat: function(DOMfind, model, modelName){
       return this.link( new SFLinkInputFloat(DOMfind, model, modelName) );
    },
    linkInputColor: function(DOMfind, model, modelName, opacityName){
       return this.link( new SFLinkInputColor(DOMfind, model, modelName, opacityName) );
    },
    linkTextValue: function(DOMfind, model, modelName){
       return this.link( new SFLinkTextValue(DOMfind, model, modelName) );
    },
    linkHtmlValue: function(DOMfind, model, modelName){
       return this.link( new SFLinkHtmlValue(DOMfind, model, modelName) );
    },
    linkSwitchValue: function(DOMfind, model, modelName){
       return this.link( new SFLinkSwitchValue(DOMfind, model, modelName) );
    },
    linkAttributeValue: function(DOMfind, attrName, model, modelName){
        return this.link( new SFLinkAttributeValue(DOMfind, attrName, model, modelName) );
    },
    openFieldClick: function(DOMfind, collection, stack){
        return this.link( new SFOpenFieldClick(DOMfind, collection, stack) );
    },
    linkCollection: function(DOMfind, collection){
        return this.link( new SFLinkCollection(DOMfind, collection) );
    },
    linkField: function(DOMfind, field){
        return this.link( new SFLinkField(DOMfind, field) );
    },
    click: function(DOMfind, fn){
        return this.link( new SFClick(DOMfind, fn) );
    },
    linkUploadFile: function(DOMfind, uploadurl, successFn, progressFn){
        return this.link( new SFLinkUploadFile(DOMfind, uploadurl, successFn, progressFn) );
    },
    linkEventListener: function(DOMfind, model, event, fn){
        return this.link( new SFAddEventListener(DOMfind, model, event, fn) );
    },
    init: function(DOMfind, initFn, destroyFn){
        return this.link( new SFInitialize(DOMfind, initFn, destroyFn) );
    },
    /* class */
    link: function(SFEvent){
        this.events.push(SFEvent);
        return this;
    },
    callEventsFn: function(fieldDOM){
        this.events.forEach(function(eventFn){
            eventFn.addEventFn(fieldDOM, this);
        }, this);
    },
    callClearEventsFn: function(fieldDOM){
        this.events.forEach(function(eventFn){
            eventFn.clearEventFn(fieldDOM, this);
        }, this);
    },
    /* Create DOM Field */
    createFieldDOM: function(parentFieldDOM){
        var fieldDOM = new SchemeFieldDOM(this.templateName, this, parentFieldDOM);
        this.callEventsFn(fieldDOM);

        return fieldDOM;
    },
    destroy: function(){
        this.callEventListener('destroy', {destroyed: this});
    },
    initialize: function(templateName){
        zz.event.prototype.initialize.apply(this, arguments);
        
        this.templateName = templateName;
        
        this.collection = null;
        
        this.events = [];
    }
});

var SchemeFieldSort = SchemeField.extend({});
