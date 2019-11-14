module.exports = function (server){
    server.FunctionRunAction = server.ActionClass.extend({
        className: 'FunctionRunAction',
        run: function(){
            console.log('function run action');
            
            var func = this.get('func');
            var attr = this.getAttributes();
            
            for (var i in attr){
                console.log('argument', i, attr[i].className);
                if (attr[i] instanceof server.CustomField || attr[i] instanceof server.ActionArg){
                    console.log('argument', i, func.attributes[i]?true:false, func.attributes[i] instanceof server.ActionArg);
                    
                    func.setupArg(i, attr[i].getValue());
                }
            }

            this.get('func').get('action').run();
        }
    });
};