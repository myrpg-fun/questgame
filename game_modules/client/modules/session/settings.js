client.SessionSettingMap = ActionClass.extend({
    className: 'SessionSettingMap',
    getPath: function(){
        var result = [];
        var points = this.get('points');
        
        for (var i=0; i<points.length; i=i+2){
            result.push(new google.maps.LatLng(points[i], points[i+1]));
        }
        
        return result;
    },
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingMap'))
            .init('.blk-map', function(DOMel){
                client.setTimeout(function(){
                    this.map = new google.maps.Map(DOMel[0], {
                        zoom: 16,
                        center: new google.maps.LatLng(55.997, 37.182)
                    });
                    
                    var bounds = new google.maps.LatLngBounds();
                    var polygonCoords = this.getPath();

                    for (var i = 0; i < polygonCoords.length; i++) {
                      bounds.extend(polygonCoords[i]);
                    }

                    // The Center of the Bermuda Triangle - (25.3939245, -72.473816)
                    console.log(bounds.getCenter());
                    
                    new google.maps.Polygon({
                        paths: polygonCoords,
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        map: this.map
                    });
                    
                    this.map.fitBounds(bounds);
                }.bind(this), 0);
            }.bind(this), function(){
                
            }.bind(this));
    },
    isWrongJoin: function(){
        return true;
    },
    isWrong: function(){
        return true;
    },
    setup: function(msg){},    
    init: function(){
        
    }
});

client.SessionSettingText = ActionClass.extend({
    className: 'SessionSettingText',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingText'))
            .linkTextValue('.blk-info', this, 'text');
    },
    isWrongJoin: function(){
        return true;
    },
    isWrong: function(){
        return true;
    },
    setup: function(msg){},
    init: function(){
        
    }
});

client.SessionSettingName = ActionClass.extend({
    className: 'SessionSettingName',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingName'))
            .linkInputValue('.blki-name', this, 'name')
            .linkTextValue('.blk-name', this, 'name');
    },
    isWrongJoin: function(){
        return true;
    },
    isWrong: function(){
        return this.get('name').length > 0;
    },
    setup: function(msg){
        msg.name = this.get('name');
    },
    init: function(){
        
    }
});

client.SessionSettingCounter = ActionClass.extend({
    className: 'SessionSettingCounter',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingCounter'))
            .linkInputValue('.blki-current', this, 'current')
            .linkTextValue('.blk-name', this, 'name')
            .linkTextValue('.blk-current', this, 'current');
    },
    isWrongJoin: function(){
        return true;
    },
    isWrong: function(){
        return true;
    },
    setup: function(msg){
        msg[this.id] = this.get('current')*1;
    },
    init: function(){
        
    }
});

client.SessionSettingTimer = ActionClass.extend({
    className: 'SessionSettingTimer',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingTimer'))
            .linkInputValue('.blki-date', this, 'date')
            .linkInputValue('.blki-time', this, 'time')
            .linkTextValue('.blk-date', this, 'date')
            .linkTextValue('.blk-time', this, 'time');
    },
    isWrongJoin: function(){
        return true;
    },
    isWrong: function(){
        var date = this.get('date').split('-');
        var time = this.get('time').split(':');
            
        return this.get('now')*1+3*3600000 < Date.UTC(date[0], date[1]*1-1, date[2], time[0], time[1]);
    },
    setup: function(msg){
        msg.date = this.get('date');
        msg.time = this.get('time');
    },
    init: function(){
        
    }
});

client.SessionSettingSetupField = SyncedList.extend({
    className: 'SessionSettingSetupField',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingSetupField'))
            .linkCollection('.blk-settings', this.createSchemeCollection())
            .click('.link-save', function(){
                var msg = {};
                
                var right = true;
                this.forEach(function(setting){
                    right &= setting.isWrong();
                }, this);
                
                if (!right){
                    return;
                }
                
                this.forEach(function(setting){
                    setting.setup(msg);
                }, this);
                
                client.socket.emit('settings-save', msg);
            }.bind(this))
            .click('.link-cancel', function(){
                //client.socket.emit('session-end', {});
            });
    },
    init: function(){
        
    }
});

client.SessionSettingJoinField = SyncedList.extend({
    className: 'SessionSettingJoinField',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingJoinField'))
            .linkCollection('.blk-settings', this.createSchemeCollection())
            .click('.link-join', function(){
                var msg = {};
                
                var right = true;
                this.forEach(function(setting){
                    right &= setting.isWrongJoin();
                }, this);
                
                if (!right){
                    return;
                }
                
                this.forEach(function(setting){
                    setting.setup(msg);
                }, this);
                
                client.socket.emit('join-player', msg);
            }.bind(this))
            .click('.link-cancel', function(){
                //client.socket.emit('session-end', {});
            });
    },
    init: function(){
        
    }
});

client.SessionSettingDenied = SyncedList.extend({
    className: 'SessionSettingDenied',
    createSchemeField: function(){
        return this.destrLsn(new SchemeField('#SessionSettingDenied'))
            .linkCollection('.blk-settings', this.createSchemeCollection())
            .click('.link-cancel', function(){
                //client.socket.emit('session-end', {});
            });
    },
    init: function(){
        
    }
});

