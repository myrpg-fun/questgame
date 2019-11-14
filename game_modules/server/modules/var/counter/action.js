module.exports = function (server){
    server.CounterSetAction = server.ActionClass.extend({
        className: 'CounterSetAction',
        calculate: function(){
            var text = this.get('counter');
            var fields = this.get('customFields');

            var patt = /(\{[dm]\})|([+*/^-])|([\d.]+)|(\{r\})/gmi;
            var match, i = 0;
            var result = 0;
            var n = 0, op = '+';
            while (match = patt.exec(text)){
                //console.log(match);
                
                if (match[2]){
                    op = match[2];
                }else{
                    if (match[1]){
                        if (fields[i]){
                            var c = fields[i];
                            if (c instanceof server.CustomDialogTextField){
                                c = c.getValue();
                            }
                            
                            if (c instanceof server.ActionArg){
                                c = c.getValue();
                            }
                            
                            if (c instanceof server.Counter){
                                n = c.getCount();
                            }
                            
                            if (c instanceof server.Timer){
                                n = c._toMs(c.getTime())/1000;
                            }
                        }else{
                            continue;
                        }
                        i++;
                    }

                    if (match[3]){
                        n = parseFloat(match[3]);
                    }

                    if (match[4]){
                        n = Math.random();
                    }

                    //console.log(op, n);

                    switch(op){
                        case '+':
                            result += n;
                            break;
                        case '-': 
                            result -= n;
                            break;
                        case '/': 
                            result /= n;
                            break;
                        case '*': 
                            result *= n;
                            break;
                        case '^': 
                            result = Math.pow(result, n);
                            break;
                    }                    
                }
            }
            
            return result;
        },
        run: function(){
            console.log('Counter Set Action');
            
            /*var countObject = this.get('counterObject'), count;
            
            if (countObject){
                if (countObject instanceof server.Counter){
                    count = countObject.getCount();
                }else{
                    count = countObject;
                }
            }else{
                count = this.get('counter')*1;
            }*/
            
            //var count = this.calculate();
            
            //console.log(count);
            
            this.get('fcounter').set({
                count: this.calculate()
            });
        }
    });

    /*server.CounterAddAction = server.ActionClass.extend({
        className: 'CounterAddAction',
        run: function(args){
            console.log('Counter Add Action');
            
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
            
            switch (this.get('operator')){
                case '+':
                    count = this.get('fcounter').getCount() + count;
                    break;
                case '-':
                    count = this.get('fcounter').getCount() - count;
                    break;
                case '/':
                    count = this.get('fcounter').getCount() / count;
                    break;
                case '*':
                    count = this.get('fcounter').getCount() * count;
                    break;
                case 'pow':
                    count = Math.pow(this.get('fcounter').getCount(), count);
                    break;
            }
            
            console.log(count);
            
            this.get('fcounter').set({
                count: Math.round(count*1000000000000)/1000000000000
            });
        }
    });*/

    server.CounterRandomAction = server.ActionClass.extend({
        className: 'CounterRandomAction',
        run: function(args){
            console.log('Counter Random Action');
            
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
            
            this.get('fcounter').set({
                count: Math.floor(Math.random()*count)
            });
        }
    });

    server.CounterTestAction = server.ActionClass.extend({
        className: 'CounterTestAction',
        run: function(){
            console.log('Counter Test Action');
            
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
            
            var fcount = this.get('fcounter').getCount();
            
            console.log('test', fcount, count, fcount === count);
            
            var yes = false;
            switch (this.get('test')){
                case '=':
                    yes = (fcount === count);
                    break;
                case '<':
                    yes = (fcount < count);
                    break;
                case '>':
                    yes = (fcount > count);
                    break;
                case '<=':
                    yes = (fcount <= count);
                    break;
                case '>=':
                    yes = (fcount >= count);
                    break;
                case '!=':
                    yes = (fcount !== count);
                    break;
            }
            
            if (yes){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });

    server.CounterEachAction = server.ActionClass.extend({
        className: 'CounterEachAction',
        run: function(){
            console.log('Counter Each Action');
            
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
            
            var cnt = 1;
            var time = Date.now()+1000;//1000 ms timeout
            
            var tmpcounter = this.get('eachcounter');
            if (!tmpcounter){
                tmpcounter = this.watcher.watch(new server.Counter(0));
                this.set({eachcounter: tmpcounter});
                this.setupArg('arg', tmpcounter);
            }
            
            for (var i=0; i < count && time > Date.now(); i++, cnt++){
                tmpcounter.setCount(cnt);
                this.get('action').run();
            }
        }
    });
};