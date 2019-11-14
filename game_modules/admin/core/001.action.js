ActionClass = SyncedItem.extend({
    cloneAttrs: function(){
        var attrs = $.extend({}, this.attributes);

        var keys = Object.keys(attrs).filter(function(a){
            return attrs[a] instanceof admin.ActionList ||
                   attrs[a] instanceof admin.ObjectItem ||
                   attrs[a] instanceof admin.CustomField
            ;
        });

        return keys;
    },
    _listArgs: function(){
        return [];
        /*var attrs = $.extend({}, this.attributes);

        var keys = Object.keys(attrs).filter(function(a){return attrs[a] instanceof admin.ActionArg;});

        attrs = keys.map(function(a){return attrs[a];});*/
    },
    _actionLists: function(){
        var attrs = $.extend({}, this.attributes);

        var keys = Object.keys(attrs).filter(function(a){return attrs[a] instanceof admin.ActionList;});

        attrs = keys.map(function(a){return attrs[a];});

        return attrs;
    },
    _updateArgs: function(cloneargs){
        var attrs = this.attributes;
        for (var i in attrs){
            if (attrs[i] && attrs[i].changeClone){
                this.setAttribute(i, attrs[i].changeClone(cloneargs));
            }
        }
    },
    _listArgsAfter: function(){
        return [];
    },
    _updateArgsAfter: function(){
        var cloneargs = this._listArgsAfter().map(function(arg){
            return {arg: arg, clone: arg.clone()};
        }.bind(this));
        
        this._al._updateArgs(cloneargs);
    },
    getEditor: function(){
        return this.parentObject?this.parentObject.getEditor():this.editorBlk;
    },
    addNameListenerEvent: function(objectName, lsnr, nameAtt, defaultValue, objectNameAtt){
        var change = function(event){
            var val = function(item){
                return (item instanceof admin.ActionArg)?
                    "["+item.get(objectNameAtt)+"]":
                    item.get(objectNameAtt);
            };
            
            var efn = function(event){
                lsnr.setAttribute(nameAtt, val(event.target), 'sync');
            }.bind(this);

            var dfn = function(event){
                this.setAttribute(objectName, null);
            }.bind(this);

            if (event.lastValue){
                event.lastValue.off('set:'+objectNameAtt, null, this);
                event.lastValue.off('destroy', null, this);
            }

            if (event.value){
                event.value.on('set:'+objectNameAtt, efn, this);
                event.value.on('destroy', dfn, this);

                lsnr.setAttribute(nameAtt, val(event.value), 'sync');
            }else{
                lsnr.setAttribute(nameAtt, defaultValue, 'sync');
            }
        }.bind(this);
        
        this.addEventListener('set:'+objectName, change);
        
        change({
            value: this.get(objectName)
        });
    },
    addGroupListenerEvent: function(objectName, flagsObject, defaultValue, objectNameAtt, nameAtt){
        var flagList = this.get(objectName);
        
        if (!flagList){
            return;
        }
        
        if (!nameAtt){
            nameAtt = 'flagsName';
        }
        
        flagList.afterSync(function(){
            var change = function(){
                var value = flagList.getCollection().map(function(flag){
                    if (flag instanceof admin.ActionArg){
                        return '['+flag.get(objectNameAtt)+']';
                    }
                    
                    return flag.get(objectNameAtt);
                });

                if (value.length > 0){
                    flagsObject.setAttribute(nameAtt, value.join(', '));
                }else{
                    flagsObject.setAttribute(nameAtt, defaultValue);
                }
            }.bind(this);

            flagList.on('add', change);
            flagList.on('remove', change);
            flagList.on('replace', change);

            flagList.on('add', function(event){
                event.item.on('set:'+objectNameAtt, change);
            });
            flagList.on('remove', function(event){
                event.item.off('set:'+objectNameAtt, change);
            });
            flagList.on('replace', function(event){
                if (event.lastValue){
                    event.lastValue.forEach(function(item){
                        item.off('set:'+objectNameAtt, change);
                    }, this);
                }
                event.value .forEach(function(item){
                    item.on('set:'+objectNameAtt, change);
                }, this);
            });
        
            flagList.getCollection().forEach(function(item){
                if (item){
                    item.on('set:'+objectNameAtt, change);
                }
            }, this);
            
            change();
        }.bind(this));
    },
    createLocalsField: function(type){
        var LocalsCollection = new SchemeCollection([]);
        var list = this._al;
        
        if (list){
            LocalsCollection.add(
                list.getLocalsByType(type).map(function(arg){
                    return arg.getSelectSchemeField();
                })
            );
        }
        
        return makeSchemeFieldList( LocalsCollection );
    },
    addLocalsListener: function(name, type, index){
        if (!index){
            index = 0;
        }
        
        this.on('added-collection', function(event){
            event.collection.afterSync(function(){
                if (!this.get(name)){
                    var mm = event.collection.getLocalsByType(type);
                    if (mm[index]){
                        this.setAttribute(name, mm[index].onSelect());
                    }else{
                        this.setAttribute(name, null);
                    }
                }
            }.bind(this));
        }.bind(this));
    },
    _createErrorScheme: function(errorText){
        var ed = (new zz.data).set({text: errorText});
        var error = new SchemeField('#ErrorField')
            .linkTextValue('.error-text', ed, 'text');
    
        error.prj = new SchemeField('#ErrorFieldOpen')
            .linkTextValue('.error-text', ed, 'text')
            .openFieldClick('.link-open', function(){
                return makeSchemeFieldList(new SchemeCollection([
                    this._al.getLocalsSchemeField(),
                    //this._al.createButtonField('Добавить действие'),
                    this._al.getSchemeField()
                ]));
            }.bind(this), {})
            .click(null, function(field){
                field.DOM.find('.link-open').click();
                return false; 
            }.bind(this));
    
        return error;
    },
    errorTestGroup: function(fieldName, errorText){
        var flagList = this.get(fieldName);
        
        if (!flagList){
            return;
        }
        
        var error = this._createErrorScheme(errorText);
        
        flagList.afterSync(function(){
            var change = function(){
                this.errorList.remove(error);

                if (flagList.count() === 0){
                    this.errorList.add([error]);
                }
            }.bind(this);

            flagList.on('add', change);
            flagList.on('remove', change);
            flagList.on('replace', change);

            change();
        }.bind(this));    
    },
    errorTestFn: function(fieldName, testFn, errorText){
        var error = this._createErrorScheme(errorText);
    
        this.on('set:'+fieldName, function(ev){
            this.errorList.remove(error);
            
            if (!testFn(ev.value, ev.lastValue)){
                this.errorList.add([error]);
            }
        });
    },
    errorTestValue: function(fieldName, testValue, errorText){
        this.errorTestFn(fieldName, function(value){
            return value !== testValue;
        }, errorText);
    },
    errorTestModule: function(moduleName, errorText){
        var error = this._createErrorScheme(errorText);
    
        admin.watcher.waitItem('project', function(project){
            project.afterSync(function(){
                project.on('activate:module:'+moduleName, function(ev){
                    if (ev.active){
                        this.errorList.remove(error);
                    }else{
                        this.errorList.add([error]);
                    }
                }.bind(this));

                if (project.isActiveModule(moduleName)){
                    this.errorList.remove(error);
                }else{
                    this.errorList.add([error]);
                }
            }.bind(this));
        }.bind(this));
    },
    getObjectEditField: function(){
        return this.editorBlk;
    },
    initialize: function(){
        SyncedItem.prototype.initialize.apply(this, arguments);
        
        this.editorBlk = null;
        this.parentObject = null;
        this.errorList = new SchemeCollection([]);
        this.errorList.on('add', function(ev){
            ev.array.forEach(function(field){
                admin.global.Project.projectErrors.add([field.prj]);
            }, this);
        }, this);
        this.errorList.on('remove', function(ev){
            admin.global.Project.projectErrors.remove(ev.field.prj);
        });
        
        this.on('destroy', function(){
            this.errorList.forEach(function(field){
                admin.global.Project.projectErrors.remove(field.prj);
            }, this);
        }, this);

        this.on('destroy', function(){
            this._actionLists().forEach(function(actionList){
                actionList.destroy();
            }, this);
        }, this);

        if (this.moduleName){
            this.errorTestModule(this.moduleName, 'Необходимый модуль выключен');
        }
        
        this.on('before-clone', function(ev){
            this.cloneAttrs().forEach(function(idx){
                ev.attr[idx] = ev.attr[idx].clone(ev.options);
            }, this);
        }, this);
        
        this.on('after-clone', function(ev){
            //Setup args
            var args = ev.clone._listArgs();
            
            ev.clone._actionLists().forEach(function(actionList){
                actionList.addArgs(args);
            }, this);
            
            //Clone inside arguments in lists
            var cloneargs = args.map(function(arg){
                return {arg: arg, clone: arg.clone(ev.options)};
            }.bind(this));
            
            //update arguments
            ev.clone._updateArgs(cloneargs);
        }, this);
        
        this.on('added-collection', function(event){
            if (event.collection instanceof admin.ActionList){
                event.collection.afterSync(function(){
                    this._al = event.collection;

                    this._actionLists().forEach(function(actionList){
                        actionList.addArgs(this._al.args());
                    }, this);
                    
                    this._al.on('add-args', function(ev){
                        this._actionLists().forEach(function(actionList){
                            actionList.addArgs([ev.item]);
                        }, this);
                    }, this);
                    
                    this._al.on('remove-args', function(ev){
                        this._actionLists().forEach(function(actionList){
                            actionList.removeArgs(ev.item);
                        }, this);
                    }, this);

                    this.on('destroy', function(){
                        this._al.off('add-args', null, this);
                        this._al.off('remove-args', null, this);
                    }, this);
                }.bind(this));
            }
        }.bind(this));
    }
});

admin.ActionList = SyncedList.extend({
    className: 'ActionList',
    moduleName: 'common',
    collectionInstance: ActionClass,
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#BlkListTpl'))
            .linkCollection('.blk-list', this.createSchemeCollection());    
    },
    _updateArgs: function(cloneargs){
        var args = this.args();
        args.forEach(function(arg, i){
            args[i] = arg.changeClone( cloneargs );
        }, this);

        this.getCollection().forEach(function(actionClass){
            actionClass._updateArgs(cloneargs);
        }, this);
        
        this.callEventListener('update-args', {cloneargs: cloneargs});
    },
    changeClone: function(cloneargs){
        this._updateArgs(cloneargs);

        return this;
    },
    afterSync: function(fn){
        SyncedData.prototype.afterSync.call(this, function(){
            this.watcher.afterSync(this.getCollection(), function(){
                this.watcher.afterSync(this.getArgs(), fn);
            }.bind(this));
        }.bind(this));
    },
    getWatchedEvents: function(){
        return ['set', 'add', 'remove', 'add-args', 'remove-args', 'sort', 'removed-nulls'];
    },
    addArgs: function(actionArray, silence){
        actionArray.forEach(function(action){
            if (!(action instanceof admin.ActionArg)){
                console.error('Adding wrong argument');
                return;
            }
            
            if (!this.hasArgs(action)){
                this.get('args').push( action );
                
                action.on('destroy', function(){
                    this.removeArgs(action);
                }, this);
                
                this.callEventListener('add-args', {collection: this, item: action}, silence);
            }
        }, this);
    },
    removeArgs: function(action, silence){
        var idx = this.get('args').indexOf(action);
        if (idx !== -1){
            this.get('args').splice(idx, 1);
            
            action.off('destroy', null, this);
            
            this.callEventListener('remove-args', {collection: this, item: action, index: idx}, silence);

            return true;
        }
    },
    hasArgs: function(item){
        return this.get('args').indexOf(item) !== -1;
    },
    forEach: function(fn, self){
        return this.getCollection().forEach(fn, self);
    },
    getArgs: function(){
        return this.get('args');
    },
    createSchemeArgs: function(methodName){
        if (!methodName){
            methodName = 'getSchemeField';
        }

        var sendArgs = Array.prototype.slice.call(arguments, 1);

        var SCollection = new SchemeCollection([]);

        this.on('replace', function(){
            window.setTimeout(function(){
                SCollection.removeAll();
                SCollection.add( this.getCollection().map(function(action){
                    if (action && action[methodName]){
                        return action[methodName].apply(action, sendArgs);
                    }
                    return null;
                }) );
            }.bind(this), 0);
        }.bind(this));

        this.on('add', function(event){
            SCollection.add([event.item[methodName].apply(event.item, sendArgs)]);
        }.bind(this));

        this.on('remove', function(event){
            SCollection.remove(event.item[methodName].apply(event.item, sendArgs));
        }.bind(this));

        this.on('sort', function(event){
            SCollection.sort(event, function(action, SC){return SC === action[methodName].apply(action, sendArgs);});
        }.bind(this));

        var SCe = function(event){
            this.sort(event, function(SC, action){return SC === action[methodName].apply(action, sendArgs);});
        }.bind(this);

        SCollection.on('sort', SCe);

        this.on('destroy', function(){
            SCollection.off('sort', SCe);
        }.bind(this));

        window.setTimeout(function(){
            SCollection.removeAll();
            SCollection.add(this.getCollection().map(function(action){
                if (action && action[methodName]){
                    return action[methodName].apply(action, sendArgs);
                }
                return null;
            }));
        }.bind(this), 0);

        return SCollection;
    },
    args: function(){
        return this.get('args');
    },
    getLocalsByType: function(type){
        var args = this.args();
        var result = [];
        args.forEach(function(arg){
            result = result.concat(arg.filterByType(type));
        }, this);
        return result;
    },
    onSelectArg: function(arg){
        this.watcher.watch(arg);
        this.addArgs([arg]);
    },
    onPaste: function(){
        admin.fields.CopyBuffer.forEach(function(action){
            var clone = action.clone();
            clone._updateArgs( admin.fields.CopyBufferArgs );
            
            this.add([ this.watcher.watch( clone ) ]);
        }, this);
    },
    onCopy: function(){
        admin.fields.CopyBuffer = [];
        admin.fields.CopyBufferArgs = [];
        
        this.forEach(function(action){
            admin.fields.CopyBuffer.push( action );
        });

        this.args().forEach(function(arg){
            admin.fields.CopyBufferArgs.push({
                arg: arg,
                clone: null
            });
        }, this);
        
        admin.fields.PasteField.object.set({count: admin.fields.CopyBuffer.length});
    },
    createButtonField: function(name, list){
        return this.destrLsn(new CreateButtonField(name, list?list:admin.fields.NewAction, {onSelect: this.onSelect.bind(this)}));
    },
    createCopyButtonField: function(name, list){
        return this.destrLsn(new CreateCopyButtonField(name, list?list:admin.fields.NewAction, {onSelect: this.onSelect.bind(this), onCopy: this.onCopy.bind(this), onPaste: this.onPaste.bind(this)}));
    },
    createButtonLocalsField: function(name, list){
        return this.destrLsn(new CreateButtonLocalsField(name, list?list:admin.fields.NewArguments, {onSelect: this.onSelectArg.bind(this)}));
    },
    createLocalsSchemeCollection: function(methodName){
        if (!methodName){
            methodName = 'getSchemeField';
        }

        var sendArgs = Array.prototype.slice.call(arguments, 1);

        var SCollection = new SchemeCollection([]);

        var SCe = function(event){
            window.setTimeout(function(){
                SCollection.removeAll();
                var result = [];
                this.args().forEach(function(arg){
                    result.push(arg[methodName].apply(arg, sendArgs));
                }, this);
                
                SCollection.add(result);
            }.bind(this), 0);
        }.bind(this);

        this.on('add-args', SCe);
        this.on('remove-args', SCe);

        SCe();

        return SCollection;
    },
    getLocalsSchemeField: function(){
        return this.destrLsn(new SchemeField('#ActionArgsFieldTpl'))
            .linkCollection('.blk-list-locals', this.createLocalsSchemeCollection());
    },
    getLocalsSchemeFieldDark: function(){
        return this.destrLsn(new SchemeField('#ActionArgsFieldDarkTpl'))
            .linkCollection('.blk-list-locals', this.createLocalsSchemeCollection());
    },
    createAttrs: function(project){
        this.set({
            collection: [],
            args: []
        });
        
        this.add(this._init.col);
        this.addArgs(
            this._init.args
        );
    },
    initialize: function(collection, args){
        SyncedList.prototype.initialize.call(this);

        if (collection === undefined){
            collection = [];
        }

        if (args === undefined){
            args = [];
        }

        this._init = {
            col: collection,
            args: args
        };

        this.on('before-clone', function(ev){
            var attr = ev.attr;
            attr.collection = [];
            attr.args = attr.args.slice(0);
        }, this);
        
        this.on('after-clone', function(ev){
            //clone list action elements
            this.getCollection().forEach(function(action){
                ev.clone.add([action.clone()]);
            });
            
            //clone arguments in each elements (if need)
            ev.clone.getCollection().forEach(function(action){
                if (action._updateArgsAfter){
                    action._updateArgsAfter();
                }
            });
        }, this);

        this.on('delete-sync', function(){
            this.getCollection().forEach(function(attr){
                if (attr && attr.deleteSync){
                    attr.deleteSync();
                }
            });
        }.bind(this));

        this.on('set:collection', function(event){
            this.callEventListener('replace', {
                lastValue: event.lastValue?event.lastValue.map(function(item){
                    item.callEventListener('removed-collection', {collection: this, item: item});
                    return item;
                }.bind(this)):null,
                value: event.value.map(function(item){
                    if (item){
                        item.callEventListener('added-collection', {collection: this, item: item});
                        return item;
                    }else{
                        return null;
                    }
                }.bind(this)),
                target: this
            });
        }.bind(this));

        this.on('set:args', function(event){
            this.args().forEach(function(action){
                action.on('destroy', function(){
                    this.removeArgs(action);
                }, this);
            }, this);
        }.bind(this));
    }    
});

admin.ActionArg = SyncedItem.extend({
    className: 'ActionArg',
    moduleName: 'common',
    _schemeSBlk: null,
    changeClone: function(cloneargs){
        var f = cloneargs.find(function(o){
            return this === o.arg;
        }.bind(this));

        return f?f.clone:this;
    },
    onSelect: function(){
        return this;
    },
    createSchemeField: function(){
        var schemeBlk = this.destrLsn(new SchemeField('#ArgFieldTpl'))
            .linkInputValue('.blki-name', this, 'name');

        return schemeBlk;
    },
    createSelectSchemeField: function(){
        var schemeBlk = this.destrLsn(new SchemeField('#ArgSelectFieldTpl'))
            .linkTextValue('.blki-name', this, 'name')
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(this);
            }.bind(this));

        return schemeBlk;
    },
    getSelectSchemeField: function(){
        if (this._schemeSBlk){
            return this._schemeSBlk;
        }
            
        this._schemeSBlk = this.createSelectSchemeField();
            
        return this._schemeSBlk;
    },
    getType: function(){
        return this.get('type');
    },
    filterByType: function(type){
        return this.get('type') === type?[this]:[];
    },
    createAttrs: function(project){
        this.set( this._init );
    },
    isCustomArg: function(){
        return false;
    },
    initialize: function(name, type){
        SyncedItem.prototype.initialize.call(this);

        this._init = {name: name, type: type};
    }
});

admin.ActionArgRemove =  admin.ActionArg.extend({
    className: 'ActionArgRemove',
    isCustomArg: function(){
        return true;
    },
    createSchemeField: function(){
        var schemeBlk = this.destrLsn(new SchemeField('#ArgFieldRemoveTpl'))
            .click('.remove', function(){
                this.deleteSync();
                return false;
            }.bind(this))
            .linkInputValue('.blki-name', this, 'name');

        return schemeBlk;
    },
});

admin.ActionArgAttribute = admin.ActionArg.extend({
    className: 'ActionArgAttribute',
    moduleName: 'common',
    init: function(){
        this.get('arg').afterSync(function(){
            this.set({name: this.get('arg').get('name')+' → '+this.get('namep')});
        }.bind(this));
    },
    initialize: function(name, attr, arg, type){
        SyncedItem.prototype.initialize.call(this);

        this._init = {namep: name, attr: attr, arg: arg, type: type};
    }
});

admin.ActionArgNameAttribute = admin.ActionArgAttribute.extend({
    className: 'ActionArgNameAttribute',
    moduleName: 'common',
    init: function(){
        this.get('arg').afterSync(function(){
            this.set({name: this.get('arg').get('name')+' → '+this.get('namep')});
        }.bind(this));
    },
    initialize: function(name, attr, arg, type){
        SyncedItem.prototype.initialize.call(this);

        this._init = {namep: name, attr: attr, arg: arg, type: type};
    }
});

admin.ActionListSort = admin.ActionList.extend({
    className: 'ActionListSort',
    add: function(actionArray){
        admin.ActionList.prototype.add.call(this, actionArray);
        
        
    },
    remove: function(action){
        admin.ActionList.prototype.remove.call(this, action);
        
        
    },
    initialize: function(collection, name){
        admin.ActionList.prototype.initialize.call(this, collection);
        
        this._sortName = name;
    }
});

admin.CustomField = ActionClass.extend({
    className: 'CustomField',
    moduleName: 'common',
    changeClone: function(cloneargs){
        var i = this.get('item');
        
        var f = cloneargs.find(function(o){
            return i === o.arg;
        }.bind(this));

        if (f){
            console.warn('CustomField item change to', f.arg.id, f.clone.get('name'));
            
            this.set({item: f.clone});
        }

        return this;
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#CustomField'))
            .linkTextValue('.blki-name', this.name, 'name')
            .openFieldClick('.link-open', function(){
                var item = this.get('itemType');
                if (item instanceof admin.ActionArgClass){
                    var type = item.getType();
                    var col = new SchemeCollection([
                        this.get('actionClass').createLocalsField(type)
                    ]);
                    
                    admin.global.ObjectAllFlag.forEach(function(obj){
                        if (obj.get('class') === type){
                            col.add([obj.getSchemeField()]);
                        }
                    });
                    
                    return makeSchemeFieldList(col);
                }
                
                if (item instanceof admin.ActionArg){
                    var type = item.getType();
                    return makeSchemeFieldList(new SchemeCollection([
                        this.get('actionClass').createLocalsField(type),
                        admin.fields.ArgumentRelation[type]
                    ]));
                }
                
                return false;
            }.bind(this), {onSelect: function(item){
                this.set({item: item});
            }.bind(this)})
            .openFieldClick('.link-edit', function(){
                if (this.get('item'))
                    return this.get('item').getEditor();
                return false;
            }.bind(this),{})
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
        this.set(this._init);
    },
    initialize: function(itemType, actionClass){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {itemType: itemType, item: null, name: '', actionClass: actionClass};
    },
    init: function(){
        var itemType = this.get('itemType');
        this.name = (new zz.data());
        
        if (!itemType){
            this.deleteSync();
            return;
        }
        
        itemType.on('delete-sync', function(){
            this.deleteSync();
        });
        
        itemType.afterSync(function(){
            this.addNameListenerEvent('item', this.name, 'name', 'Выбрать '+itemType.get('name'), 'name');
            this.addLocalsListener('item', itemType.get('type'));
        }.bind(this));
    }
});

admin.TriggerClass = ActionClass.extend({
    initialize: function(target){
        ActionClass.prototype.initialize.apply(this, arguments);
        
        this._init = {target: target};
    },
});