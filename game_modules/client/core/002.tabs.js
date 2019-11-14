client.Windows = zz.data.extend({
    refteshTabs: function(){
        for (var i = this.tabs.length-1; i>=0; i--){
            var t = this.tabs[i];
            this.tabsContainer.prepend(t.tabDOM);
            
            t.tabDOM.unbind('click').bind('click', function(t){
                t.callEventListener('click', {tab: t});
                
                if (this.windowOpen === t){
                    return false;
                }
                
                if (this.windowOpen){
                    var WO = this.windowOpen;
                    client.setTimeout(function(WO){
                        WO.DOM.each(function(){
                            if (this.parentNode){
                                this.parentNode.removeChild(this);
                            }
                        });
                        WO.callEventListener('hide', {tab: WO});
                        WO.DOM.removeClass('window-hide').removeClass('window-show');
                    }.bind(this, WO), 120);//animation
                    this.windowOpen.tabDOM.removeClass('active');
                    this.windowOpen.DOM.removeClass('window-hide').addClass('window-hide');
                }
                
                this.windowsContainer.append(t.DOM);
                this.windowOpen = t;
                t.tabDOM.removeClass('active').addClass('active');
                t.DOM.removeClass('window-show');
                client.setTimeout(function(){
                    t.callEventListener('show', {tab: t});
                    t.DOM.addClass('window-show');
                }, 0);

                return false;
            }.bind(this, t));
        }
    },
    addTab: function(tab){
        this.tabs.push(tab);
        
        this.refteshTabs();
        
        if (this.tabs.length === 1){
            tab.open();
        }
    },
    removeTab: function(tab){
        var k = this.tabs.indexOf(tab);
        if (k !== -1){
            this.tabs.splice(k, 1);
        }
        
        tab.tabDOM.unbind('click');
        tab.tabDOM.remove();
        tab.DOM.remove();
        
        this.refteshTabs();
    },
    initialize: function(tabsCont, windowsCont){
        this.tabs = [];
        this.tabsContainer = tabsCont;
        this.windowsContainer = windowsCont;
        this.windowOpen = null;
    }
});

client.WindowTab = zz.data.extend({
    open: function(){
        this.tabDOM.click();
    },
    setSchemeField: function(Field){
        var FieldDOM = Field.createFieldDOM();

        this.DOM.empty();
        this.DOM.append(FieldDOM.DOM);

        return this;
    },
    initialize: function(icon, name){
        zz.data.prototype.initialize.apply(this, arguments);
        
        this.DOM = $('<div class="window"></div>');
        this.tabDOM = $('<a class="tab-link"><i class="icon '+icon+'"></i><span class="tabbar-label">'+name+'</span></a>');
    }
});

