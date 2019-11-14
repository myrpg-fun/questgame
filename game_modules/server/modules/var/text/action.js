module.exports = function (server){
    server.TextGenerateIDAction = server.ActionClass.extend({
        className: 'TextGenerateIDAction',
        run: function(args){
            console.log('Text GenerateID Action');

            var length = this.get('length')*1;
            var alphabet = this.get('abc');
            
            var text = '';
            for (var i=0;i<length;i++){
                text = text + alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            
            this.get('ftext').set({
                text: text
            });
        }
    });

    server.TextTestAction = server.ActionClass.extend({
        className: 'TextTestAction',
        run: function(){
            console.log('Text Test Action');
            
            if (!this.get('ftext')){
                return;
            }
            
            var textObject = this.get('textObject'), text;
            
            if (textObject){
                if (textObject instanceof server.Text){
                    text = textObject.getText();
                }else{
                    text = textObject;
                }
            }else{
                text = this.get('text')+'';
            }
            
            var ftext = this.get('ftext').getText();
            
            if (ftext === text){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });
};