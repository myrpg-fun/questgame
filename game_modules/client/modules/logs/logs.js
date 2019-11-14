client.SessionLogs = ActionClass.extend({
    className: 'SessionLogs',
    init: function(){
        this.on('set:logs', function(ev){
            var text = '';
            this.get('logs').forEach(function(log){
                var d = (new Date(log.time));
                text += '<div style="color:'+log.color+'">['+d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes()+ ":" + d.getSeconds()+'] <strong>'+log.text+'</strong></div>';
            }, this);
            
            $('#logs').html(text).scrollTop($('#logs')[0].scrollHeight);
        }, this);

        $('#logs').removeClass('hidden');
    }
});

