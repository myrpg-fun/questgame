module.exports = function (server){
    server.ObjectCreateAction = server.ActionClass.extend({
        className: 'ObjectCreateAction',
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
            while (value instanceof server.ActionArg){
                value = value.getValue();
                if (++inf>10000){
                    console.error('infinite loop here');
                    return null;
                }
            }

            return value;
        },
        run: function(){
            console.log('Object create action', this.get('name'));
            
            var locals = this.getAttributes();
/*            locals.flagList = locals.flagList.clone();
            //console.log(Object.keys(locals));
            locals.flagList.forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    locals.flagList.remove(flag);
                    locals.flagList.add([flag.getValue()]);
                }
            }, this);*/
            
            var newobj = this.get('class').createNewObject(locals);
            
            this.setupArg('arg', newobj);
        }
    });

    server.ObjectDeleteAction = server.ActionClass.extend({
        className: 'ObjectDeleteAction',
        run: function(){
            console.log('Object delete action', this.get('object').get('name'));
            
            if (this.get('object') instanceof server.Object){
                this.get('object').destroy();
            }
        }
    });
    
    server.ObjectFindAction = server.ActionClass.extend({
        className: 'ObjectFindAction',
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
            while (value instanceof server.ActionArg){
                value = value.getValue();
                if (++inf>10000){
                    console.error('infinite loop here');
                    return null;
                }
            }

            return value;
        },
        run: function(){
            console.log('object find action');
            
            //var args = Object.assign({}, args);

            var locals = this.getAttributes();
//            delete locals.flagList;
            delete locals.class;
            delete locals.arg;
            delete locals.action;
            delete locals.notfound;
            for (var i in locals){
                if (locals[i] === null){
                    delete locals[i];
                }
            }
            
            var objects = [];
            var classo = this.get('class');
            
//            console.log(Object.keys(locals).map(q=>[this.attributes[q].id, this.attributes[q].className]));
            
            classo.get('objectList').forEach(function(current){
                if (current instanceof server.Object && objects.indexOf(current) === -1/* && current.get('class') === classo*/){
                    var find = true;

                    for (var i in locals){
                        if (!current.get(i).isEqualObj(locals[i])){
                            find = false;
                            break;
                        }
                    }

                    if (find){
                        objects.push(current);
                    }
                }
            }, this);
            
            console.log('found ', objects.length);
            
            if (objects.length === 0){
                this.get('notfound').run();
            }else{
                objects.forEach(function(current){
                    this.setupArg('arg', current);

                    this.get('action').run();
                }, this);
            }
        }
    });
    
    server.ObjectSetAction = server.ActionClass.extend({
        className: 'ObjectSetAction',
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
            while (value instanceof server.ActionArg){
                value = value.getValue();
                if (++inf>10000){
                    console.error('infinite loop here');
                    return null;
                }
            }

            return value;
        },
        run: function(){
            console.log('object set action');

            var object = this.get('object');

            var locals = this.getAttributes();
            delete locals.flagList;
            delete locals.class;
            delete locals.action;
            delete locals.notfound;
            for (var i in locals){
                if (locals[i] !== null){
                    object.setVar(i, locals[i]);
                }
            }
        }
    });
    
    server.ObjectUseAction = server.ActionClass.extend({
        className: 'ObjectUseAction',
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
            while (value instanceof server.ActionArg){
                value = value.getValue();
                if (++inf>10000){
                    console.error('infinite loop here');
                    return null;
                }
            }

            return value;
        },
        run: function(){
            console.log('object use action');

            var object = this.get('object');
            this.setupArg('arg', object);
        }
    });
    
    server.ObjectTestCollectionAction = server.ActionClass.extend({
        className: 'ObjectTestCollectionAction',
        run: function(){
            console.log('object test collection action');
            
            var object = this.get('object');
            var test = false;
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                if (flag.has(object)){
                    test = true;
                    return true;
                }
            }, this);
            
            if (test){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });
    
    server.ObjectAddCollectionAction = server.ActionClass.extend({
        className: 'ObjectAddCollectionAction',
        run: function(){
            console.log('object add collection action');
            
            var object = this.get('object');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }
                
                object.addFlag(flag);
            }, this);
        }
    });
    
    server.ObjectRemoveCollectionAction = server.ActionClass.extend({
        className: 'ObjectRemoveCollectionAction',
        run: function(args){
            console.log('object add collection action');
            
            var object = this.get('object');
            this.get('flagList').forEach(function(flag){
                if (flag instanceof server.ActionArg){
                    flag = flag.getValue();
                }

                object.removeFlag(flag);
            }, this);
        }
    });    
    
    server.ObjectTestAction = server.ActionClass.extend({
        className: 'ObjectTestAction',
          _updateArgs: function(cloneargs){
            var attrs = Object.assign({}, this.attributes);
            
            console.log('before', Object.keys(attrs).map(a=>[a, attrs[a].id, attrs[a].className]));
            
            for (var i in attrs){
                if (attrs[i] && attrs[i].changeClone){
                    this.setAttribute(i, attrs[i].changeClone(cloneargs));
                }
            }

            console.log('after', Object.keys(attrs).map(a=>[a, attrs[a].id, attrs[a].className]));
        },
      run: function(){
            console.log('object test action');
            
            var object = this.get('object');
            var object2 = this.get('object2');
            
            console.log(this.attributes.object.id, this.attributes.object2.id);
            console.log(this.attributes.object.get('name'), this.attributes.object2.get('name'));
            console.log(this.attributes.object.className, this.attributes.object2.className);
            
            if (object === object2){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });
    
    server.CollectionTestAction = server.ActionClass.extend({
        className: 'CollectionTestAction',
        run: function(){
            console.log('collection test action');
            
            var object = this.get('object');
            var object2 = this.get('object2');
            
            if (object === object2){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });
};