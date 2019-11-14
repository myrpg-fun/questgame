zz = {
    Class: function(){}
};

if (!Array.prototype.diff) {
    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };
}

if (!Function.prototype.extend) {
    Function.prototype.extend = function(methods){
        if (!methods.hasOwnProperty('initialize')){
            var parent = this.prototype;
            methods.initialize = function(){
                if (parent.initialize){
                    parent.initialize.apply(this, arguments);
                }
            };
        }

        var newClass = methods.initialize;

        newClass.prototype = Object.create(this.prototype);
        //var newClass = Object.create(this);

        for (var j=0; j<arguments.length; j++){
            var mtd = arguments[j];
            
            for (var i in mtd) {
                newClass.prototype[i] = mtd[i];
            }
        }

        newClass.prototype.initialize = newClass;

        return newClass;
    };
}

//if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;

    if (this === null) {
      throw new TypeError(' this is null or not defined');
    }

    var O = Object(this);

    var len = O.length >>> 0;

    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    if (arguments.length > 1) {
      T = thisArg;
    }

    k = 0;

    while (k < len) {
      var kValue, r;
      
      if (k in O) {
        kValue = O[k];
        r = callback.call(T, kValue, k, O);
      }
      
      if (r === true){
          return true;
      }
      
      k++;
    }
    return false;
  };
//}

zz.eventType = zz.Class.extend({
    initialize: function(type, target, parameters){
        this.type = type;
        this.target = target;

        for (var i in parameters){
            this[i] = parameters[i];
        }
    }
});

zz.event = zz.Class.extend({
    initialize: function (){
        var events = {};
        var called = {};

        this.__getEvents = function(){
            return events;
        };
        this.on = this.addEventListener = function(eventName, fn, self, silence){
            if (!events[eventName])
                events[eventName] = [];

            if (!self){
                self = this;
            }

            events[eventName].push({fn:fn,self:self,ign:silence});
        };
        this.off = this.clearEventListener = function(eventName, fn, self){
            if (events[eventName]){
                events[eventName].forEach(function(value, key){
                    if ((!fn || value.fn === fn) && (!self || value.self === self)){
                        events[eventName].splice(key, 1);
                        return true; //break
                    }
                });
            }
        };
        this.callEventListener = function(eventName, evt, silence){
            if (!events[eventName])
                return false;

            if (called[eventName]){
                return;
            }
            called[eventName] = true;
            
            var event = new zz.eventType(eventName, this, evt);

            var eventsArray = events[eventName].slice(0);

            for (var i=0;i<eventsArray.length;i++){
                var ev = eventsArray[i];
                if (silence && ev.ign && ev.ign.indexOf(silence) !== -1){
                    continue;
                }
                ev.fn.call(ev.self, event);
            }
            
            called[eventName] = false;
        };
    }
});

zz.data = zz.event.extend({
    setAttribute: function(name, value, silence){
        var last = this.attributes[name];
        if (last !== value){
            this.attributes[name] = value;
            this.callEventListener('set', {
                attribute: name, value: value, lastValue: last, target: this
            }, silence);
            this.callEventListener('set:'+name, {
                attribute: name, value: value, lastValue: last, target: this
            }, silence);
        }
    },
    set: function(attrs, silence){
        for (var i in attrs){
            this.setAttribute(i, attrs[i], silence);
        }
        return this;
    },
    getAttributes: function(){
        return $.extend({}, this.attributes);
    },
    get: function(attr){
        return this.attributes[attr];
    },
    removeAttribute: function(attr, silence){
        this.callEventListener('remove-attribute', {
            attribute: attr, value: this.attributes[attr], target: this
        }, silence);
        delete this.attributes[attr];
    },
    data: function(name){
        return {name: name};
    },
    ptr: function(){
        return this;
    },
    initialize: function(){
        zz.event.prototype.initialize.apply(this, arguments);
        this.attributes = {};
    }
});

zz.collection = zz.event.extend({
    add: function(data){
        data.forEach(function(val){
            this.removeSilence(val);
            this.container.push(val);
            this.callEventListener('add', {
                value: val, target: this
            });
        }, this);
        return this;
    },
    removeAll: function(){
        var c = this.container;
        
        this.container = [];
        
        c.forEach(function(val){
            this.callEventListener('remove', {
                value: val, target: this
            });
        }, this);        
    },
    remove: function(val){
        this.callEventListener('remove', {
            value: val, target: this
        });
        this.removeSilence(val);
        return this;
    },
    removeSilence: function(val){
        var i = this.find(val);
        if (i !== null){
            this.container.splice(i,1);
        }
        return this;
    },
    find: function(val){
        for (var i=0;i<this.container.length;i++){
            if (this.container[i] === val){
                return i;
            }
        }
        return null;
    },
    forEach: function(fn, self){
        return this.container.forEach(fn, self);
    },
    initialize: function(container){
        zz.event.prototype.initialize.apply(this, arguments);
        this.container = [];
        this.add(container);
    }
});
