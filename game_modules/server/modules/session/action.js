module.exports = function (server){
    function timeConverter(UNIX_timestamp){
      var a = new Date(UNIX_timestamp * 1);
      var months = ['Янв','Фев','Март','Апр','Май','Июнь','Июль','Авг','Сен','Окт','Ноя','Дек'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }
    
    server.SessionShareAction = server.ActionClass.extend({
        className: 'SessionShareAction',
        update: function(){
            var text = this.get('text');
            var fields = this.get('customFields').map(function(field){
                if (field){
                    var item = field.get('item');
                    if (item){
                        return item;
                    }
                }
                return null;
            });

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
                            rtxt = timeConverter(fields[i].getTimeOutStamp());
                        }else{
                            rtxt = fields[i].getTime();
                        }
                    }
                    if (fields[i] instanceof server.PlayerObject){
                        rtxt = fields[i].getUserName();
                    }
                }
/*                console.log('textup', text.substring(lastIndex, match.index));
                console.log('textfield', rtxt);*/
                result = result+text.substring(lastIndex, match.index)+rtxt;
                lastIndex = patt.lastIndex;
                i++;
            }
            result = result+text.substr(lastIndex);

            this.watcher.getItem('Session').set({
                info: result
            });
        },
        run: function(){
            if (this.get('active')){
                this.update();
                
                this.watcher.getItem('Session').share();
            }else{
                this.watcher.getItem('Session').unshare();
            }
        }
    });

    server.SessionJoinAction = server.ActionClass.extend({
        className: 'SessionJoinAction',
        run: function(){
            if (this.get('active')){
                this.watcher.getItem('Session').waitPlayers();
            }else{
                this.watcher.getItem('Session').unwaitPlayers();
            }
        }
    });

    server.SessionBeginAction = server.ActionClass.extend({
        className: 'SessionBeginAction',
        run: function(){
            this.watcher.getItem('Session').callEventListener('begin', {session: this});
        }
    });

    server.SessionEndAction = server.ActionClass.extend({
        className: 'SessionEndAction',
        run: function(){
            this.watcher.getItem('Session').stop();
        }
    });
};