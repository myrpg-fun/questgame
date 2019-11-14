module.exports = function (server){
    server.NotificationCloseButton = server.ActionClass.extend({
        className: 'NotificationCloseButton',
        wbpSent: true,
        setup: false
    });

    server.NotificationInventoryItem = server.ActionClass.extend({
        className: 'NotificationInventoryItem',
        wbpSent: true,
        setup: function(args){
            var item = this.get('item');
            var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('counter')*1;
            }
            
            this.set({
                icon: item.get('icon'),
                x: item.get('x'),
                y: item.get('y'),
                count: count
            });
        },
        init: function(){
            this.on('watch-player', function(ev){
                ev.player.watch(this.get('icon'));
            }.bind(this));            
            
            this.on('unwatch-player', function(ev){
                ev.player.unwatch(this.get('icon'));
            }.bind(this));            
        }
    });

    server.NotificationFieldTimer = server.ActionClass.extend({
        className: 'NotificationFieldTimer',
        wbpSent: true,
        setup: function(args){
            this.set({
                timerview: this.get('timer').getTime(),
                started: this.get('timer').isStart()
            });            
        },
    });

    server.NotificationFieldText = server.ActionClass.extend({
        className: 'NotificationFieldText',
        wbpSent: true,
        setup: function(args){
            var fields = this.get('customFields').map(function(field){
                if (field){
                    var item = field.get('item');
                    if (item){
                        return item;
                    }
                }
                return null;
            }, this);
            
            var text = this.get('text');
            
            var patt = /\{[dtmu]\}/gmi;
            var match, i = 0;
            var result = '';
            var lastIndex = 0;
            while (match = patt.exec(text)){
                var rtxt = '';
                if (fields[i]){
                    if (fields[i] instanceof server.Counter){
                        rtxt = fields[i].getCount();
                    }
                    if (fields[i] instanceof server.Text){
                        rtxt = fields[i].getText();
                    }
                    if (fields[i] instanceof server.Timer){
                        if (fields[i].isStart()){
                            rtxt = '[tmr-'+fields[i].getTimeOutStamp()+']';
                        }else{
                            rtxt = fields[i].getTime();
                        }
                    }
                    if (fields[i] instanceof server.PlayerObject){
                        rtxt = fields[i].getUserName();
                    }
                }
                result = result+text.substring(lastIndex, match.index)+rtxt;
                lastIndex = patt.lastIndex;
                i++;
            }
            result = result+text.substr(lastIndex);

            this.set({
                text: result
            });
        }
    });

    server.NotificationFieldImage = server.ActionClass.extend({
        className: 'NotificationFieldImage',
        wbpSent: true,
        setup: false,
    });

    server.NotificationFieldAudio = server.DialogFields.extend({
        className: 'NotificationFieldAudio',
        wbpSent: true,
        setup: function(args){
            var audio = this.get('audio');
            
            this.set({
                url: audio.get('url')
            });
        },
    });

    server.NotificationFieldSeparator = server.ActionClass.extend({
        className: 'NotificationFieldSeparator',
        wbpSent: true,
        setup: false,
    });
};