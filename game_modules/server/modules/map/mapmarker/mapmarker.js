module.exports = function (server){
    server.MapMarker = server.SyncedData.extend({
        className: 'MapMarker',
        wbpSent: true,
        EarthRadius: 6372795,
        setIcon: function(icon){
            this.set({
                icon: [icon]
            });
        },
        addIcon: function(icon){
            var i = this.get('icon');
            i = Array.isArray(i)?[].concat(i):[i];
            
            if (i.indexOf(icon) === -1){
                i.push(icon);

                this.set({
                    icon: i
                });
            }
        },
        removeIcon: function(icon){
            var i = this.get('icon');
            var k = i.indexOf(icon);
            
            if (i.length > 1 && k !== -1){
                i.splice(k, 1);
                
                this.callEventListener('set', {
                    attribute: 'icon', value: i, lastValue: i, target: this
                });
                this.callEventListener('set:icon', {
                    attribute: 'icon', value: i, lastValue: i, target: this
                });
            }
        },
        setActive: function(active){
            this.set({
                active: active?1:0
            });
        },
        isActive: function(){
            return this.get('active');
        },
        addFlag: function(flag){
            var flagList = this.get('flagList');
            
            if (flag instanceof server.FlagGroupClass && !flagList.has(flag)){
                flagList.add([flag]);
                flag.add([this]);
            }
        },
        removeFlag: function(flag){
            this.get('flagList').remove(flag);
            flag.remove(this);
        },
        deg2rad: function(deg) {
            return deg * (Math.PI/180);
        },
        calculateTheDistance: function(lat1, lng1, lat2, lng2) {
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lng2-lng1); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ; 
            return this.EarthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Distance in m
        },
        rotateTo: function(lat, lng){
            var curll = [this.get('lat'), this.get('lng')];

            var m = Math.abs(curll[0])/90+1;

            this.set({
                rotate: 450-Math.atan2((lat-curll[0])*m, lng-curll[1]) * 180 / Math.PI
            });
        },            
        startMove: function(lat, lng, distance, time, rotate){
            this.stopMove();
            
            if (distance === 0){
                if (rotate){
                    var curll = [this.get('lat'), this.get('lng')];
                    
                    var m = Math.abs(curll[0])/90+1;
                    
                    this.set({
                        rotate: 450-Math.atan2((lat-curll[0])*m, lng-curll[1]) * 180 / Math.PI
                    });
                }
                
                return;
            }
            
            var curll = [this.get('lat'), this.get('lng')];
            
            var fulldist = this.calculateTheDistance(lat, lng, curll[0], curll[1]);
            
            if (distance > fulldist){
                time *= fulldist / distance;
                distance = fulldist;
            }
            
            if (fulldist > 0){
                if (rotate){
                    var m = Math.abs(curll[0])/90+1;
                    
                    this.set({
                        rotate: 450-Math.atan2((lat-curll[0])*m, lng-curll[1]) * 180 / Math.PI
                    });
                }
                
                curll[0] += (lat-curll[0])*distance/fulldist;
                curll[1] += (lng-curll[1])*distance/fulldist;
            
                if (time > 0){
                    this.set({
                        movetime: time,
                        movetimeend: this.sessionTimer.now() + time,
                        moveto: curll
                    });
                }else{
                    this.set({
                        lat: curll[0],
                        lng: curll[1]
                    });
                }

                //console.log('move time', time);

                this.movetimer = this.sessionTimer.setTimeout(function(){
                    this.movetimer = null;
                    this._endMove(curll[0], curll[1]);
                    this.callEventListener('marker-move:end', {marker: this, moveto: {lat: curll[0], lng: curll[1]}});
                }.bind(this), time);
            }
        },
        _endMove: function(lat, lng){
            if (this.movetimer){
                this.sessionTimer.clearTimeout(this.movetimer);
            }

            this.movetimer = null;

            var curll = {
                lat: lat,
                lng: lng
            };
            this.set(curll);
            this.removeAttribute('moveto');
            this.removeAttribute('movetimeend');
            this.removeAttribute('movetime');

            this.callEventListener('marker-move', {marker: this, moveto: curll});
            this.watcher.getItem('Session').callEventListener('marker-move', {marker: this, moveto: curll});
        },
        _restartTimer: function(){
            if (this.movetimer === null && this.get('movetimeend')){
                console.log('restart timer', this.get('name'));
                this.movetimer = this.sessionTimer.endTimeout(function(){
                    var moveto = this.get('moveto');
                    
                    this.movetimer = null;
                    this._endMove(moveto[0], moveto[1]);
                    this.callEventListener('marker-move:end', {marker: this, moveto: {lat: moveto[0], lng: moveto[1]}});
                }.bind(this), this.get('movetimeend'));
            }
        },
        stopMove: function(){
            var moveto = this.get('moveto');
            if (moveto){
                var curll = [this.get('lat')*1, this.get('lng')*1];
                var time = (this.get('movetimeend') - this.sessionTimer.now());
                if (time < 0){
                    time = 0;
                }
                
                curll = [
                    moveto[0] - (moveto[0] - curll[0])*time/this.get('movetime'),
                    moveto[1] - (moveto[1] - curll[1])*time/this.get('movetime')
                ];
                
                this._endMove(curll[0], curll[1]);
                this.callEventListener('marker-move:end', {marker: this, moveto: {lat: curll[0], lng: curll[1]}});
            }
            
            if (this.movetimer){
                this.sessionTimer.clearTimeout(this.movetimer);
            }

            this.movetimer = null;
        },
        init: function(){
            var lsnr = new zz.storeEvents(this);
            
            this.on('watch-player', function(ev){
//                console.log('watch icons', this.get('icon').map(i=>i.id));
                ev.watcher.watch(this.get('icon'));
                
                lsnr.on(ev.player.id, 'set:icon', function(e){
                    if (e.lastValue){
                        ev.watcher.unwatch(e.lastValue);
                    }
                    
                    if (e.value){
                        ev.watcher.watch(e.value);
                    }
                }, this);
            }, this);
            
            this.on('unwatch-player', function(ev){
//                console.log('unwatch icons', this.get('icon').map(i=>i.id));
                ev.watcher.unwatch(this.get('icon'));
                
                lsnr.off(ev.player.id);
            }, this);
            
            this.watcher.waitItem('SessionTime', function(st){
                this.movetimer = null;
                this.sessionTimer = st;
                
                this.watcher.on('after-sync', function(){
                    if (this.get('movetimeend')){
                        this._restartTimer();
                    }
                }, this);

                this.on('destroy', function(){
                    if (this.movetimer){
                        this.sessionTimer.clearTimeout(this.movetimer);
                    }                
                }, this);
            }.bind(this));
            
            this.on('set:flagList', function(ev){
                ev.value.forEach(function(flag){
                    flag.add([this]);
                }, this);
            }, this);
            
            this.on('set:triggerList', function(ev){
                var tl = this.get('triggerList');
                tl.mount({target: this});
            }, this);
            
            this.on('set:overlayList', function(ev){
                var tl = this.get('overlayList');
                tl.mount({target: this});
            }, this);
            
            this.on('set:active', function(ev){
                if (typeof ev.lastValue !== 'undefined'){
                    this.callEventListener('activate', {target: this, active: ev.value});
                    
                    if (!ev.value){
                        console.log('hide marker', this.get('name'));
                        if (this.watcher.getItem('AllPlayers')){
                            this.watcher.getItem('AllPlayers').unwatch(this, true);
                        }
                    }
                }
            }, this);
            
            this.on('before-clone', function(ev){
                ev.attr.flagList = this.watcher.watch(
                    new server.FlagCollectionList([])
                );
            }, this);

            this.on('after-clone', function(ev){
                var flagList = ev.clone.get('flagList');
                this.get('flagList').forEach(function(flag){
                    flagList.add([flag]);
                }, this);
            }, this);
        }
    });    
};