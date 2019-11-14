module.exports = function (server){
    server.catch = function(fn){
        try{ fn(); }catch(e){ 
            console.error(e);
        }
    };
    
    server.setTimeout = function(fn, timeout){
        return setTimeout(function(){
            try{ fn(); }catch(e){ 
                console.error(e);
            }
        }, timeout);
    };
};