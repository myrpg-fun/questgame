var Authorization = zz.data.extend({
    initialize: function(authSocket){
        zz.data.prototype.initialize.apply(this, arguments);
        
        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires+"; path=/";
        }

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
        
        this.set({
            cookieName: '_auth',
            authorized: 0,
            sessid: 0,
            userid: 0,
            name: ''
        });
        
        var self = this;
        var regCallback = null, 
            logCallback = null;
        
        authSocket.on('auth_logged', function(msg){
            setCookie(self.get('cookieName'), msg.sessid, 7);
            self.set({
                authorized: 1
            });
            self.set(msg);
            self.callEventListener('login', msg);
        }.bind(this));

        authSocket.on('auth_clear', function(){
            setCookie(self.get('cookieName'), '', -1000);
            self.set({
                authorized: 0,
                sessid: 0,
                id: 0,
                name: ''
            });
            self.callEventListener('logout', this);
        }.bind(this));

        authSocket.on('auth_loginCallback', function(msg){
            if (logCallback){
                logCallback(msg.error, msg.parameters);

                logCallback = null;
            }
        }.bind(this));

        authSocket.on('auth_registrationCallback', function(msg){
            if (regCallback){
                regCallback(msg.error, msg.parameters);

                regCallback = null;
            }
        }.bind(this));
        
        self.login = function(login, password, callback){
            authSocket.emit('auth_login', {login: login, password: password});
            logCallback = callback;
        };
        
        self.logout = function(){
            authSocket.emit('auth_logout', {});
        };
        
        self.registration = function(login, name, password, callback){
            authSocket.emit('auth_registration', {login: login, name: name, password: password});
            regCallback = callback;
        };
        
        self.removeSession = function(id){
            authSocket.emit('auth_session_remove', {sessid: id});
        };
    }
});

function authDOMinit(auth, Modal){
    auth.on('login', function(user){
        $('.auth-logout').removeClass('hide');
        $('.auth-login').removeClass('hide').addClass('hide');
        $('.account-icon').attr('src', user.avatar);
        $('.account-name').html(user.name);
        $('.level-name').html(Math.floor(user.level)+' уровень');
        $('.level-up').attr('style', 'width:'+Math.round((user.level - Math.floor(user.level))*100)+'%');
    });

    auth.on('logout', function(){
        $('.auth-logout').removeClass('hide').addClass('hide');
        $('.auth-login').removeClass('hide');
        if (!$('.account').hasClass('hide')){
            $('.account').addClass('hide');
        }
    });

    var loginData = (new zz.data).set({
        email: '',
        name: '',
        password: '',
        error: ''
    });

    function seterror(err){
        loginData.set({error: err});
    };

    var registerSf = new SchemeField('#register')
        .linkInputValue('.blki-email', loginData, 'email')
        .linkInputValue('.blki-name', loginData, 'name')
        .linkInputValue('.blki-password', loginData, 'password')
        .linkTextValue('.blk-error', loginData, 'error')
        .click('.reg-button', function(F, SfDOM){
            seterror('');
            auth.registration(loginData.get('email'), loginData.get('name'), loginData.get('password'), function(err, param){
                switch (err){
                    case null:
                            loginData.set({
                                email: '',
                                name: '',
                                password: '',
                                error: ''
                            });
                            Modal.showModal(
                                new SchemeField('#registrationComplete')
                                    .click('.reg-button', function(){
                                        Modal.clearModal();
                                        auth.callEventListener('login-action', {});
                                    })
                            );
                        break;
                    case 'AuthRegisterEmptyEmail':
                            seterror('Введите Email');
                        break;
                    case 'AuthRegisterEmptyName':
                            seterror('Введите ваше имя');
                        break;
                    case 'AuthRegisterEmptyPassword':
                            seterror('Введите пароль');
                        break;
                    case 'AuthRegisterWrongEmail':
                            seterror('Не верная почта');
                        break;
                    case 'AuthRegisterUserExistError':
                            seterror('Пользователь с такой почтой уже зарегистрирован');
                        break;
                    default:
                        if (/^Error: queryMx ENOTFOUND/.test(err)){
                            seterror('Почты не существует');
                            break;
                        }

                        seterror(err);
                        break;
                }
            });
        });

    $('a[href="/register"]').click(function(){
        seterror('');
        Modal.showModal(registerSf);

        return false;
    });

    var loginSf = new SchemeField('#login')
        .linkInputValue('.blki-email', loginData, 'email')
        .linkInputValue('.blki-password', loginData, 'password')
        .linkTextValue('.blk-error', loginData, 'error')
        .click('.reg-button', function(F, SfDOM){
            seterror('');
            auth.login(loginData.get('email'), loginData.get('password'), function(err, param){
                switch (err){
                    case null:
                            loginData.set({
                                email: '',
                                name: '',
                                password: '',
                                error: ''
                            });
                            Modal.clearModal();
                            auth.callEventListener('login-action', {});
                        break;
                    case 'AuthLoginEmptyEmail':
                            seterror('Введите Email');
                        break;
                    case 'AuthLoginEmptyPassword':
                            seterror('Введите пароль');
                        break;
                    case 'AuthLoginWrongEmail':
                            seterror('Не верная почта');
                        break;
                    case 'AuthLoginUserExistError':
                            seterror('Не верный логин или пароль');
                        break;
                    default:
                        if (/^Error: queryMx ENOTFOUND/.test(err)){
                            seterror('Почты не существует');
                            break;
                        }

                        seterror(err);
                        break;
                }
            });
        });

    $('a[href="/login"]').click(function(){
        seterror('');
        Modal.showModal(loginSf);

        return false;
    });

    $('a[href="/account"]').click(function(){
        $('.account').toggleClass('hide');

        return false;
    });

    $('.account .logout').click(function(){
        auth.logout();

        return false;
    });

    var sid = null;
    var removeSessionSf = new SchemeField('#remove_session')
        .click('.btn-remove-session', function(F, SfDOM){
            auth.removeSession(sid.data('id'));
            
            sid.parents('a').remove();
            
            Modal.clearModal();
            sid = null;
        })
        .click('.btn-cancel', function(F, SfDOM){
            Modal.clearModal();
            sid = null;
        });
    
    $('.project .remove-session').click(function(){
        sid = $(this);
        
        Modal.showModal(removeSessionSf);

        return false;
    });
}