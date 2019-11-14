admin.ActionArgClass = admin.ActionArg.extend({
    className: 'ActionArgClass',
    moduleName: 'common',
    filterByType: function(type){
        if (type === 'Object' && this.get('type') !== admin.global.PlayerTemplate){
            return [this].concat(this.get('type').getLocalsByType(type, [this]));
        }
        
        if (this.get('type') === type){
            return [this];
        }
        
        return this.get('type').getLocalsByType(type, [this]);
    },
    init: function(){
        this.on('set:type', function(ev){
            /*ev.value.on('set:name', function(ev){
                this.set({name: ev.value});
            }, this);*/
            
            ev.value.on('destroy', function(){
                this.destroy();
            }, this);
            
            ev.value.on('delete-sync', function(){
                this.deleteSync();
            }, this);
        }, this);
    }
});

admin.ActionArgClassRemove = admin.ActionArgClass.extend({
    className: 'ActionArgClassRemove',
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

admin.ActionArgClassItem = admin.ActionArg.extend({
    className: 'ActionArgClassItem',
    moduleName: 'common',
    changeClone: function(cloneargs){
        var clsarr = this.get('class');

        var f = cloneargs.find(function(o){
            return clsarr[0] === o.arg;
        });
        
        if (f){
            var cl = this.clone();
            
            var cls = clsarr.slice(0);
            cls[0] = f.clone;
            
            console.warn('change arg class item', this.get('name'));
            
            cl.set({class: cls});
            
            return cl;
        }

        return this;
    },
    init: function(project){
        if (!Array.isArray(this.get('class'))){
            this.set({class: [this.get('class')]});
        }

        var chNameFn = function(){
            if (this.get('item')){
                this.get('item').afterSync(function(item){
                    this.set({name: this.get('class').map(function(f){return f.get('name');}).join(' → ')+' → '+item.get('name')});
                }.bind(this));
            }
        }.bind(this);
        
        project.afterSync(function(){
            if (this.get('item')){
                this.get('item').on('set:name', chNameFn);

                this.get('item').on('destroy', function(){
                    this.destroy();
                }, this);
            }else{
                this.destroy();
            }

            this.get('class').forEach(function(cls){
                if (!cls){
                    this.deleteSync();
                }
                
                cls.on('destroy', function(){
                    this.deleteSync();
                }, this);
                cls.on('set:name', chNameFn);
            }.bind(this));
            
            chNameFn();
        }.bind(this));
    },
    initialize: function(item, classObj, id){
        SyncedItem.prototype.initialize.call(this);

        if (!id){
            id = item?item.id:0;
        }

        this._init = {name: '', item: item, id: id, class: classObj};
    }
});

ActionArgSelectClassItem = zz.data.extend({
    onSelect: function(){
        return admin.watcher.watch(
            new admin.ActionArgClassItem(this._init.item, this._init.class)
        );
    },
    getSelectSchemeField: function(){
        var schemeBlk = new SchemeField('#ArgSelectFieldTpl')
            .linkTextValue('.blki-name', this, 'name')
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(
                    this.onSelect()
                );
            }.bind(this));

        return schemeBlk;
    },
    initialize: function(item, classArg){
        zz.data.prototype.initialize.call(this);

        this._init = {item: item, class: classArg};

        classArg.forEach(function(cls){
            cls.on('destroy', function(){
                this.deleteSync();
            }, this);
            
            cls.on('set:name', function(){
                this.set({name: classArg.map(function(f){return f.get('name');}).join(' → ')+' → '+item.get('name')});
            }, this);
        }, this);
        
        this.set({name: classArg.map(function(f){return f.get('name');}).join(' → ')+' → '+item.get('name')});
    }
});

ActionArgSelectIfItem = zz.data.extend({
    onSelect: function(){
        return admin.watcher.watch(
            new admin.ActionArgClassItem(this._init.item, this._init.class, 'DialogInterface'+this._init.item.id)
        );
    },
    getSelectSchemeField: function(){
        var schemeBlk = new SchemeField('#ArgSelectFieldTpl')
            .linkTextValue('.blki-name', this, 'name')
            .click(null, function(DOMfield){
                var stack = DOMfield.window().stack();
                stack.onSelect(
                    this.onSelect()
                );
            }.bind(this));

        return schemeBlk;
    },
    initialize: function(item, classArg){
        zz.data.prototype.initialize.call(this);

        this._init = {item: item, class: classArg};
        
        this.set({name: classArg.map(function(f){return f.get('name');}).join(' → ')+' → '+item.get('name')});
    }
});
