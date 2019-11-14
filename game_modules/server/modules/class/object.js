var zz = require('../../zz');

module.exports = function (server){
    server.ObjectItem = server.SyncedData.extend({
        className: 'ObjectItem',
        changeClone: function(cloneargs){
            var i = this.attributes.item;
            
            var f = cloneargs.find(function(o){
                console.log(o.arg.id, o.arg.className);
                return i === o.arg;
            }.bind(this));
            
            if (f){
                var cl = this.clone();
                
                cl.set({item: f.clone});
                
                return cl;
            }
            
            return this;
        },
/*        changeClone: function(cloneargs){
            var i = this.get('item');
            
            var f = cloneargs.find(function(o){
                return i === o.arg;
            }.bind(this));
            
            return f?f.clone:i;
        },*/
        getValue: function(){
            return this.get('item');
        }
    });
    
    server.ObjectField = server.ObjectItem.extend({
        className: 'ObjectField'
    });
    
    server.Object = server.SyncedData.extend({
        className: 'Object',
        addFlag: function(flag){
            var flagList = this.get('flagList');
            
            if (flag instanceof server.FlagGroupClass && !flagList.has(flag)){
                flagList.add([flag]);
                flag.add([this]);
            
                this.callEventListener('add-flag', {flag: flag});
            }
        },
        removeFlag: function(flag){
            this.get('flagList').remove(flag);
            flag.remove(this);
            
            this.callEventListener('remove-flag', {flag: flag});
        },
        get: function(attr){
            var value = this.attributes[attr];
            var inf = 0;

            while (value instanceof server.ObjectItem){
                value = value.getValue();
                if (++inf>10000){
                    console.error('infinite loop here');
                    return null;
                }
            }

            return value;
        },
        setVar: function(attr, value){
            this.get('class').get('classList').forEach(function(classObj){
                if (classObj.id === attr){
                    var object = this.get(classObj.id);

                    if (object){
                        classObj.unmount({
                            target: object, object: this
                        });
                    }
                    
                    this.setAttribute(attr, value);
                    if (value){
                        classObj.mount({
                            target: value, object: this
                        });
                    }
                    
                    return true;
                }
            }, this);
        },
        init: function(project){
            this.on('destroy', function(){
                if (this.get('class')){
                    console.log('unmount object', this.get('name'), this.id);

                    this.get('class').get('classList').forEach(function(classObj){
                        var object = this.get(classObj.id);

                        if (object){
                            classObj.unmount({
                                target: object, object: this
                            });
                        }
                    }, this);
                    
                    this.get('class').get('objectList').remove(this);
                }
                
                this.callEventListener('delete-object', {});
                
                if (this.get('class')){
                    this.get('class').get('classList').forEach(function(classObj){
                        if (classObj.cloned === true){
                            var object = this.get(classObj.id);

                            if (object){
                                object.destroy();
                            }
                        }
                    }, this);
                }
            }, this);
            
/*            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new server.FlagCollectionList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);*/
            
            project.afterSync(function(){
                /*this.get('flagList').forEach(function(flag){
                    if (!flag.add){
                        console.log(flag.className);
                    }
                    
                    flag.add([this]);
                }, this);*/

                var cl = this.get('class');
                if (cl instanceof server.Class){
                    var create = this.get('_ct')?true:false;
                    console.log('mount object', this.get('name'), this.id);

                    cl.get('classList').forEach(function(classObj){
                        var object = this.get(classObj.id);

                        if (object){
                            console.log(classObj.className);
                            classObj.mount({
                                target: object, object: this, __class: cl, create: create
                            });
                        }
                    }, this);

                    cl.get('triggerList').mount({
                        target: this,
                        object: this, 
                        __class: cl, 
                        create: create
                    });
                    
                    cl.get('objectList').add([this]);
                }
                
                if (!this.get('_ct')){
                    this.callEventListener('create-object', {});
                    this.set({_ct: true});
                }
            }.bind(this));
        }
    });
};