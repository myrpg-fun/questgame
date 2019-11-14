var async = require('async');
var zz = require('./zz');
var uuid = {v1: require('uuid/v1')};
//var emailExistence = require('email-existence');
var validator = require('validator');

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var transporter = nodemailer.createTransport(sendmailTransport({
    path: '/usr/sbin/sendmail'
}));

var Warning = function(log){
    this.valueOf = this.toString = function(){
        return log;
    };
};

var UserStats = zz.data.extend({
    getStats: function(){
        var result = this.getAttributes();
        
        return result;
    },
    isAdmin: function(){
        var flags = this.get('flags');
        
        return flags.indexOf("administrator") !== -1;
    },
    addConnection: function(){
        this.callEventListener('new-user', {target: this});
        this.connections++;
    },
    removeConnection: function(){
        this.connections--;
        if (this.connections === 0){
            this.off('set');
            this.callEventListener('no-users', {target: this});
        }
    },
    initialize: function(stat){
        zz.data.prototype.initialize.apply(this, arguments);
        
        this.connections = 1;
        
        this.set(stat);
    }
});

var userFields = '`'+([
    'id', 'name', 'level', 'treasures', 'avatar', 'mapicon', 'sessid', 'email', 'flags'
].join('`,`'))+'`';

module.exports = function(io, sql){
    return function(authName){
        var self = this;
        this.users = {};

        this.checkSession = function(sessid){
            return self.users[sessid];
        };

        this.getCookieAuth = function(cookie){
            if (cookie){
                var name = authName + "=";
                var ca = cookie.split(';');
                for(var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
            }
            
            return "";
        };

        io.on('connection', function (socket) {
            var sessid = self.getCookieAuth(socket.request.headers.cookie);
            var to = null;

            var foundUser = function(msg){
                sessid = msg.sessid;
                if (self.users[sessid]){
                    self.users[sessid].addConnection();
                }else{
                    self.users[sessid] = new UserStats(msg);
                    
                    self.users[sessid].on('no-users', function(){
                        to = setTimeout(function(){
                            if (self.users[sessid]){
                                console.log('delete user', sessid);
                                var msg = self.users[sessid].getAttributes();
                                sql.query('UPDATE `users` SET `name` = ?, `level` = ?, `treasures` = ?, `avatar` = ?, `mapicon` = ?, last_login = NOW() WHERE `id` = ?', [msg.name, msg.level, msg.treasures, msg.avatar, msg.mapicon, msg.id]);
                                delete self.users[sessid];
                                sessid = null;
                            }
                        }, 60000);
                    }, this);
                    
                    self.users[sessid].on('new-user', function(){
                        if (to){
                            clearTimeout(to);
                            to = null;
                        }
                    }, this);
                    
                    self.users[sessid].testPassword = function(password, callback){
                        sql.query('SELECT `id` FROM `users` WHERE `sessid` = ? AND `password` = ? LIMIT 1', [sessid, password], function(err, rows, fields){
                            if (err){
                                callback(err);
                            }
                            
                            callback(null, rows.length > 0);
                        });
                    };
                }
                socket.authorization = self.users[sessid];

                self.users[sessid].on('set', function(){
                    socket.emit('auth_logged', self.users[sessid].getStats());
                }, this);

                socket.emit('auth_logged', self.users[sessid].getStats());
            };

            var initUser = function(err, rows) {
                if (err) throw err;

                if (rows.length === 0){
                    //not found
                    socket.emit('auth_clear', {});
                    sessid = null;
                    delete socket.authorization;
                    return false;
                }else{
                    foundUser(rows[0]);
                    return true;
                }
            };
            
            if (self.users[sessid]){
                foundUser(self.users[sessid].getAttributes());
            }else{
                sql.query('SELECT '+userFields+' FROM `users` WHERE `sessid` = ? LIMIT 1', sessid, initUser);
            }

            socket.on('disconnect', function(){
                if (sessid && self.users[sessid]){
                    delete socket.authorization;
                    self.users[sessid].removeConnection();
                }
            });

            socket.on('auth_session_remove', function(msg){
                sql.query('DELETE FROM `users_session` WHERE `session_id` = ? AND user_id = ? LIMIT 1', [msg.sessid, socket.authorization.get('id')]);
            });

            socket.on('auth_check', function(){
                sql.query('SELECT '+userFields+' FROM `users` WHERE `sessid` = ? LIMIT 1', sessid, initUser);
            });

            socket.on('auth_logout', function(){
                if (sessid && self.users[sessid]){
                    delete socket.authorization;
                    socket.emit('auth_clear', {});
                    self.users[sessid].removeConnection();
                }
            });

            socket.on('auth_login', function(msg){
                async.waterfall([function(callback){
                    //test is real email
                    if (msg.login === ''){
                        callback(new Warning('AuthLoginEmptyEmail'));
                    }else if (msg.password === ''){
                        callback(new Warning('AuthLoginEmptyPassword'));
                    }else if (!validator.isEmail(msg.login)){
                        callback(new Warning('AuthLoginWrongEmail'));
                    }else{
                        //test
                        sql.query('SELECT '+userFields+' FROM `users` WHERE `email` = ? AND `password` = ? LIMIT 1', [msg.login, msg.password], callback);
                    }
                }, function(rows, fields, callback) {
                    if (initUser(null, rows)){
                        socket.emit('auth_loginCallback', {error: null, parameters: rows[0]});
                    }else{
                        callback(new Warning('AuthLoginUserExistError'));
                    }
                }], function (error) {
                    if (error) {
                        console.log(error.toString());
                        socket.emit('auth_loginCallback', {error: error.toString(), parameters: null});
                    }
                });
            });

            socket.on('auth_registration', function(msg){
                async.waterfall([function(callback){
                    //test is real email
                    if (msg.login === ''){
                        callback(new Warning('AuthRegisterEmptyEmail'));
                    }else if (msg.name === ''){
                        callback(new Warning('AuthRegisterEmptyName'));
                    }else if (msg.password === ''){
                        callback(new Warning('AuthRegisterEmptyPassword'));
                    }else if (!validator.isEmail(msg.login)){
                        callback(new Warning('AuthRegisterWrongEmail'));
                    }else{
                        //test
                        sql.query('SELECT `id` FROM `users` WHERE `email` = ? LIMIT 1', msg.login, callback);
                    }
                }, function(rows, fields, callback) {
                    //not found, good
                    if (rows.length === 0){
                        //emailExistence.check(msg.login, callback);
                        callback(null, null);
                    }else{
                        callback(new Warning('AuthRegisterUserExistError'));
                    }
                }, function(res, callback){
                    //test
                    msg.sessid = uuid.v1();
                    var rand = Math.floor(Math.random()*11)+1;
                    sql.query('INSERT INTO `users` (`name`, `email`, `sessid`, `password`, `level`, `treasures`, `avatar`, `mapicon`, `last_login`, `flags`) VALUES (?, ?, ?, ?, 1, 0, ?, ?, NOW(), "user")', [msg.name, msg.login, msg.sessid, msg.password, '/i/avatar'+rand+'.png', '/i/icon.png'], callback);
                }, function(rows, fields, callback) {
                    //get ID
                    sql.query('SELECT '+userFields+' FROM `users` WHERE `id` = LAST_INSERT_ID()', msg.login, callback);
                }, function(rows, fields, callback) {
                    if (initUser(null, rows)){
                        if (rows.length > 0){
                            // send email
                            transporter.sendMail({
                                from: '"Мастер ролевых игр" <info@myrpg.fun>',
                                to: rows[0].email,
                                subject: 'Спасибо за регистрацию на проекте Мастер ролевых игр',
                                text: 'Спасибо за регистрацию. На данном этапе нет необходимости подтверждения вашей почты, так как проект находится в тестовом режиме. \n\nПриятных игр.'
                            }, function(error, info){
                                if(error){
                                    return console.log(error);
                                }
                                console.log('Message sent: ', info);
                            });

                            transporter.sendMail({
                                from: '"MyRpg" <info@myrpg.fun>',
                                to: 'liz2k.b8@gmail.com',
                                subject: 'Новая регистрация на проекте '+rows[0].email,
                                text: 'Новая регистрация на проекте '+rows[0].email
                            }, function(error, info){
                                if(error){
                                    return console.log(error);
                                }
                                console.log('Message sent: ', info);
                            });
                        }
                        
                        socket.emit('auth_registrationCallback', {error: null, parameters: rows[0]});
                    }
                }], function (error) {
                    if (error) {
                        console.log(error.toString());
                        socket.emit('auth_registrationCallback', {error: error.toString(), parameters: null});
                    }
                });
            });
        });
    };
};