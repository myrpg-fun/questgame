module.exports = function (server){
    server.LogText = server.ActionClass.extend({
        className: 'LogText',
        run: function(){
            console.log('Log Action');

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
                        rtxt = fields[i].getTime();
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

            this.watcher.getItem('Session').get('logs').log(result, this.get('color'));
        }
    });
};