Error.stackTraceLimit = 40;

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var transporter = nodemailer.createTransport(sendmailTransport({
    path: '/usr/sbin/sendmail'
}));

var mailtimer = null;
var mailerrors = [];

console.error = function() {
    var msg = (arguments[0] instanceof Error?
        arguments[0].stack:
        new Error([].slice.call(arguments).join(' ')).stack
    ).toString()+"\n";
    
    mailerrors.push(msg);

    if (mailtimer === null){
        mailtimer = setTimeout(function(){
            mailtimer = null;
            
            // send email
            transporter.sendMail({
                from: '"MyRpg Debugger" <debug@myrpg.fun>',
                to: 'liz2k.b8@gmail.com',
                subject: 'Error '+(new Date).toString(),
                text: mailerrors.join("\n")
            }, function(error, info){
                if(error){
                    return console.log(error);
                }
//                console.log('Message sent: ', info);
            });
            
            mailerrors = [];
        }, 0);
    }
    
    // additionaly log
    process.stderr.write(msg);
};

var compression = require('compression');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(compression());

var fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var sslPath = './cert/';//process.env.NODE_ENV === 'development'?'./cert/':'/etc/letsencrypt/live/masterquest.online/';

var options = {
  key: fs.readFileSync(sslPath+'privkey.pem'),
  cert: fs.readFileSync(sslPath+'fullchain.pem')
//  ca: fs.readFileSync(sslPath+'ca.pem')
};

var https = require('https').createServer(options, app);

https.listen(config.port, config.host, function(){
  console.log('listening on https://'+config.host+':'+config.port);
});

var io = require('socket.io')(https);

var mysql = require('mysql');
var atpl = require('atpl');
app.engine('html', atpl.__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', true);
app.set('views', __dirname + '/templates');

var uuid = {v1: require('uuid/v1')};
var recursivedir = require('recursive-readdir');
var path = require('path');
var formidable = require('formidable');
var async = require('async');

var im = require('imagemagick');

im.convert.path = config.imagic;

var sql = {
    my: null,
    query: function(){
        return sql.my.query.apply(sql.my, arguments);
    }
};

function handleDisconnect(db_config) {
//    if (sql === null){
    sql.my = mysql.createConnection(db_config); // Recreate the connection, since
//    }

    sql.my.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    sql.my.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect(db_config);                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect(config.mysql);

var __serverdir = path.join(__dirname, 'game_modules/server');

var auth = require(path.join(__serverdir, 'auth'))(io, sql);
var users = new auth('_auth');

var sessions = require(path.join(__serverdir, 'session'))(io, sql);
var project = require(path.join(__serverdir, 'project'))(io, sql, sessions);

/*app.use(function(req, res, next) {
  req.headers['if-none-match'] = 'no-match-for-this';
  next();    
});*/
var __publicdir = path.join(__dirname, 'public');

app.use(express.static(__publicdir));
//app.use(cookieParser);

app.get('/', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});

    var prjs = [];
    var usess = [];
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );

    async.waterfall([
        function(сallback) {
            sql.query('SELECT p.`name`, p.`image`, p.`lat`, p.`lng`, p.`id`, p.`hashid` FROM `projects` p \n\
                        WHERE p.`type` in ("open") ORDER BY p.`id` DESC',
            сallback);
        },
        function(rows, fields, callback){
            for(var i in rows){
                rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                prjs.push(rows[i]);
            }

            if (user){
                sql.query('SELECT p.`name`, p.`image`, us.`session_id` FROM `users_session` us \n\
                    JOIN `projects` p ON p.`id` = us.`project_id` \n\
                    WHERE us.`user_id` = ?',
                [user.get('id')], callback);
            }else{
                callback(null, [], null);
            }
        },
        function(rows, fields, callback){
            for(var i in rows){
                rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                usess.push(rows[i]);
            }

            atpl.renderFile(__dirname + '/game_modules/pages', 'index.html', { config: config, projects: prjs, usess: usess, user: user?user.getAttributes():null, id: req.params.id }, false, function(err, result) {
                if (err){
                    console.error(err);
                }
                
                res.end(result);
            });
        }], function(err){
            console.error(err);
    });
});

app.get('/sitemap.xml', function(req, res){
    res.header({'Content-Type': 'text/xml'});

    var prjs = [];
    var usess = [];
    async.waterfall([
        function(сallback) {
            sql.query('SELECT p.`name`, p.`image`, p.`lat`, p.`lng`, p.`id`, p.`hashid` FROM `projects` p \n\
                        WHERE p.`type` in ("open") ORDER BY p.`id` DESC',
            сallback);
        },
        function(rows, fields, callback){
            for(var i in rows){
                prjs.push(rows[i]);
            }

            atpl.renderFile(__dirname + '/game_modules/pages', 'sitemap.xml', { config: config, projects: prjs }, false, function(err, result) {
                res.end(result);
            });
        }], function(err){
            console.error(err);
    });
});

app.get('/project/:id', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});

    if (req.params.id === 'create'){
        var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
        if (user){
            project.createNew(user, function(err, id){
                res.redirect('/project/'+id+'/admin');
            });
        }else{
            res.redirect('/project');
        }        
    }else{
        let project = null;
        var sessions = [];
        var usess = [];
        var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
        
        async.waterfall([
            function(сallback) {
                sql.query('SELECT * FROM `projects` p \n\
                    WHERE (p.`hashid` = ? AND p.`type` = "open") OR (p.`hashlink` = ? AND p.`type` = "shared")',
                [req.params.id, req.params.id], сallback);
            },
            function(rows, fields, callback){
                if (rows[0]){
                    var tags = {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;'
                    };
                    rows[0].infoescaped = rows[0].info.replace(/[&<>]/g, function(tag) {
                        return tags[tag] || tag;
                    });

                    rows[0].thumb = rows[0].image.replace(/upload\/([\w.-]+)$/gi, "resize/1280/$1");
                    
                    project = rows[0];
                    
                    var types = {
                        "walkingquest": "Прогулочный квест / приключение",
                        "strategy": "Стратегия",
                        "survival": "Игра на выживание",
                        "cooperative": "Совместная игра",
                        "competitive": "Соревновательная / спортивная игра",
                        "economic": "Экономическая игра",
                        "rpg": "Ролевая игра",
                        "autochallenge":"Игра для автомобилистов",
                    };
                    project.gametype = types[project.gametype]?types[project.gametype]:project.gametype;
                    
                    sql.query('SELECT p.`id`, p.`info`, us.`user_id` FROM `session_waitplayers` p \n\
                                LEFT JOIN `users_session` us ON us.`session_id` = p.`id` \n\
                                WHERE (p.`project_id` = ?)\n\
                               UNION SELECT us2.session_id as `id`, "Моя игра в процессе" as `info`, us2.`user_id` FROM `users_session` us2 \n\
                                WHERE (us2.`project_id` = ? AND us2.`user_id` = ?)',
                    [rows[0].hashid, rows[0].hashid, user?user.get('id'):0], callback);
                }else{
                    res.status(404).send('Not found');
                }
            },
            function(rows, fields, callback){
                sessions = rows;
                
                if (user){
                    sql.query('SELECT p.`name`, p.`image`, us.`session_id` FROM `users_session` us \n\
                        JOIN `projects` p ON p.`id` = us.`project_id` \n\
                        WHERE us.`user_id` = ?',
                    [user.get('id')], callback);
                }else{
                    callback(null, [], null);
                }
            },
            function(rows, fields, callback){
                for(var i in rows){
                    rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                    usess.push(rows[i]);
                }

                atpl.renderFile(__dirname + '/game_modules/pages', 'project_info.html', { 
                    config: config, project: project, id: req.params.id, sessions: sessions, usess: usess, user: user?user.getAttributes():null
                }, false, function(err, result) {
                    res.end(result);
                });
            }], function(err){
                console.error(err);
        });
    }
});

app.get('/project', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});
    
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
    if (user){
        var prjs = [];
        var usess = [];
        
        async.waterfall([
            function(сallback) {
                sql.query('SELECT p.`name`, p.`image`, p.`id`, up.`access`, p.`type` FROM `projects` p \n\
                            JOIN `users_projects` up ON up.`project_id` = p.`id` \n\
                            WHERE up.`user_id` = ? AND p.`type` in ("editing")',
                [user.get('id')], сallback);
            },
            function(rows, fields, callback){
                for(var i in rows){
                    rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                    prjs.push(rows[i]);
                }
                
                if (user){
                    sql.query('SELECT p.`name`, p.`image`, us.`session_id` FROM `users_session` us \n\
                        JOIN `projects` p ON p.`id` = us.`project_id` \n\
                        WHERE us.`user_id` = ?',
                    [user.get('id')], callback);
                }else{
                    callback(null, [], null);
                }
            },
            function(rows, fields, callback){
                for(var i in rows){
                    rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                    usess.push(rows[i]);
                }

                atpl.renderFile(__dirname + '/game_modules/pages', 'project.html', { config: config, projects: prjs, usess: usess, user: user?user.getAttributes():null }, false, function(err, result) {
                    res.end(result);
                });
            }], function(err){
                console.error(err);
        });
    }else{
        res.redirect('/');
    }
});

app.get('/project/:id/admin', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});
    
    atpl.renderFile(__dirname + '/game_modules/pages', 'admin.html', { config: config, id: req.params.id }, false, function(err, result) {
        res.end(result);
    });
});

var extmime = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
};

var testsize = ['96', '400', '1280', '1024'];//, '1024', '768', '512', '256'];
for (var x = 192; x <= 1024; x += 192){
    testsize.push(x+'');
}

app.get('/project/:id/resize/:size/:image', function(req, res){
    if (testsize.indexOf(req.params.size) === -1){
        console.log(req.params.size, typeof req.params.size, testsize.indexOf(req.params.size));
        
        res.send('Cannot GET ', 404);
        return;
    }
    
    var filepath = path.join(__publicdir, 'project', req.params.id, 'upload', req.params.image);

    if (!fs.existsSync(filepath)){
        res.send('Cannot GET ', 404);
        return;
    }
    
    var dir = path.join(__publicdir, 'project', req.params.id, 'resize');

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    
    var dir = path.join(__publicdir, 'project', req.params.id, 'resize', req.params.size);

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    
    var dir = path.join(__publicdir, 'project', req.params.id, 'resize', req.params.size, req.params.image);

    var file = new fs.ReadStream(dir);

    file.pipe(res);

    file.on('error', function(err) {
        if (err.code === 'ENOENT'){
            //create thumbnail
            var args = [
                filepath,
                '-filter',
                'Mitchell',
                '-define',
                'filter:support=2',
                '-resize',
                req.params.size,
//                        '-unsharp 0.25x0.25+8+0.065',
//                        '-dither None',
//                        '-posterize 136',
//                        '-quality 82',
/*                        '-define jpeg:fancy-upsampling=off',
                '-define png:compression-filter=5',
                '-define png:compression-level=9',
                '-define png:compression-strategy=1',
                '-define png:exclude-chunk=all',
                '-interlace none',
                '-colorspace sRGB',
                '-strip',*/
                dir
            ];

            im.convert(args, function(err, stdout, stderr){
                if (err) throw err;

                var file = new fs.ReadStream(dir);

                file.pipe(res);
                
                file.on('error', function(err) {
                    res.statusCode = 500;
                    res.end("Server Error");
                    console.error(err);
                });
                
                res.on('close', function() {
                  file.destroy();
                });
            });
        }else{
            res.statusCode = 500;
            res.end("Server Error");
            console.error(err);
        }
    });

    res.on('close', function() {
      file.destroy();
    });
});

app.post('/project/:id/upload', function(req, res){
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
    if (user){
        project.userTest(user, req.params.id, 'writer', function(err){
            if (err === null){
                var dir = path.join(__publicdir, 'project', req.params.id);
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }    

                var dir = path.join(__publicdir, 'project', req.params.id, 'upload');
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                
                var maxSize = 2*1024*1024;
                    
                var len = req.headers['content-length']
                    ? parseInt(req.headers['content-length'], 10)
                    : null;
/*                console.log('upload size', len);
                if (len > maxSize){
                    res.status(413).end(JSON.stringify({
                        error: 'big size'
                    }));
                    return;
                }*/

                var form = new formidable.IncomingForm();

                form.multiples = true;
                form.uploadDir = dir;
                //form.maxFieldsSize = 1 * 1024;
                
                var file = {
                    size: 0
                };
                form.on('progress', function(bytesReceived, bytesExpected) {
                    if (file.size > maxSize){
                        res.status(413).end(JSON.stringify({
                            error: 'too large', file: file.name
                        }));
                        req.destroy();
                        
                        fs.unlink(file.path);
                        return;
                    }
                });
                
                form.on('fileBegin', function(name, f) {
                    if (['image/jpeg', 'image/jpg', 'image/png', 'audio/mp3'].indexOf(f.type) === -1){
                        console.log(f.type);
                        res.status(415).end(JSON.stringify({
                            error: 'unsupported media type', file: f.name
                        }));
                        req.destroy();
                        return;
                    }
                    
                    file = f;
                });

                var files = [];
                form.on('file', function(name, file) {
                    console.log('save file', file.type, file.size);
                    if (file.size > maxSize){
                        res.status(413).end(JSON.stringify({
                            error: 'too large', file: file.name
                        }));
                        req.destroy();
                        
                        fs.unlink(file.path);
                        return;
                    }
                    
                    var filename = path.join(form.uploadDir, uuid.v1() + path.extname(file.name));
                    files.push({
                        upload: filename.replace(__publicdir, '').replace(/\\/gmi, '/'),
                        filename: file.name
                    });
                    
                    console.log(file.path, filename);
                    
                    fs.rename(file.path, filename, function(err){
                        if (err){
                            console.error(err);
                        }
                    });
                });

                form.on('error', function(err) {
                    console.log('An error has occured: \n' + err);
                });

                form.on('end', function() {
                    res.end(JSON.stringify({
                        uploaded: files
                    }));
                });

                form.parse(req);
            }else{
                res.end(JSON.stringify({
                    error: 'no rights'
                }));
            }
        });
    }else{
        res.end(JSON.stringify({
            error: 'no rights'
        }));
    }
});

app.get('/project/:id/test', function(req, res){
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
    var prjId = req.params.id;
    if (user){
        project.userTest(user, prjId, 'tester', function(err){
            if (err === null){
                sessions.createNewSession(prjId, true, function(err, sess){
                    if (err === null){
                        res.redirect('/s/'+sess.id);
                    }
                });
            }
        });
    }else{
        res.redirect('/project/');
    }
});

app.get('/project/:id/start', function(req, res){
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
    var prjId = req.params.id;
    if (user){
        async.waterfall([
            function(сallback) {
                sql.query('SELECT * FROM `projects` p \n\
                    WHERE (p.`hashid` = ? AND p.`type` = "open") OR (p.`hashlink` = ? AND p.`type` = "shared")',
                [req.params.id, req.params.id], сallback);
            },
            function(rows, fields, callback){
                if (rows[0]){
                    sessions.createNewSession(rows[0].id, false, callback);
                }else{
                    res.status(404).send('Not found');
                }
            },function(sess){
                res.redirect('/s/'+sess.id);
            }], function(err){
                console.error(err);
        });        
    }else{
        res.redirect('/project/'+req.params.id);
    }
});

app.get('/s/:id', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});
    
    var usess = [];
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
    
    async.waterfall([
        function(callback) {
            if (user){
                sql.query('SELECT p.`name`, p.`image`, us.`session_id` FROM `users_session` us \n\
                    JOIN `projects` p ON p.`id` = us.`project_id` \n\
                    WHERE us.`user_id` = ?',
                [user.get('id')], callback);
            }else{
                callback(null, [], null);
            }
        },
        function(rows, fields, callback){
            for(var i in rows){
                rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                usess.push(rows[i]);
            }

            atpl.renderFile(__dirname + '/game_modules/pages', 'client.html', { config: config, id: req.params.id, usess: usess, user: user?user.getAttributes():null }, false, function(err, result) {
                res.end(result);
            });
        }], function(err){
            console.error(err);
    });        
});

/*app.get('/session/:id/admin', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});
    
    atpl.renderFile(__dirname + '/game_modules/admin', 'session.html', { config: config, id: req.params.id }, false, function(err, result) {
        res.end(result);
    });
});*/

app.get('/tutorial', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});
    
    var usess = [];
    var user = users.checkSession( users.getCookieAuth(req.headers.cookie) );
    
    async.waterfall([
        function(callback) {
            if (user){
                sql.query('SELECT p.`name`, p.`image`, us.`session_id` FROM `users_session` us \n\
                    JOIN `projects` p ON p.`id` = us.`project_id` \n\
                    WHERE us.`user_id` = ?',
                [user.get('id')], callback);
            }else{
                callback(null, [], null);
            }
        },
        function(rows, fields, callback){
            for(var i in rows){
                rows[i].thumb = rows[i].image.replace(/upload\/([\w.-]+)$/gi, "resize/400/$1");
                usess.push(rows[i]);
            }

            atpl.renderFile(__dirname + '/game_modules/pages', 'tutorial.html', { config: config, usess: usess, user: user?user.getAttributes():null }, false, function(err, result) {
                res.end(result);
            });
        }], function(err){
            console.error(err);
    });        
});

app.get('/chat', function(req, res){
    res.header({'Content-Type': 'text/html; charset=utf-8'});
    
    atpl.renderFile(__dirname + '/game_modules/pages', 'chat.html', { config: config }, false, function(err, result) {
        res.end(result);
    });
});
