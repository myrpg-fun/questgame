module.exports = function (server){
    server.TaskStartAction = server.ActionClass.extend({
        className: 'TaskStartAction',
        run: function(){
            console.log('task start action');
            
            this.get('task').changeStatus('start');
        }
    });
    
    server.TaskCompleteAction = server.ActionClass.extend({
        className: 'TaskCompleteAction',
        run: function(){
            console.log('task complete action');
            
            this.get('task').changeStatus('complete');
        }
    });
    
    server.TaskFailedAction = server.ActionClass.extend({
        className: 'TaskFailedAction',
        run: function(){
            console.log('task failed action');
            
            this.get('task').changeStatus('failed');
        }
    });
    
    server.TaskCancelAction = server.ActionClass.extend({
        className: 'TaskCancelAction',
        run: function(){
            console.log('task cancel action');
            
            this.get('task').changeStatus('cancel');
        }
    });
    
    server.TaskTestAction = server.ActionClass.extend({
        className: 'TaskTestAction',
        run: function(){
            console.log('task test action', this.get('test'));
            
            var yes = this.get('task').get('status') === this.get('test');
            
            if (yes){
                this.get('yes').run();
            }else{
                this.get('no').run();
            }
        }
    });
};