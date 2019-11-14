var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var transporter = nodemailer.createTransport(sendmailTransport({
    path: '/usr/sbin/sendmail'
}));

var mailtimer = null;
var mailerrors = [];

console.error = function() {
    var msg = new Error([].slice.call(arguments).join(' ')).stack.toString()+"\n";
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
                console.log('Message sent: ', info);
            });
            
            mailerrors = [];
        }, 0);
    }
    
    // additionaly log
    process.stderr.write(msg);
};

try{
    testtest.location
}catch(e){
    console.error(e);
}

console.error("This trtrtrtr you an email!");
console.info("But won't.");

//testtest.location

/*let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

transporter.sendMail({
    from: '"MasterQuest Debugger" <debug@usbflash.ru>',
    to: 'liz2k.b8@gmail.com',
    subject: 'Message',
    text: 'I hope this message gets delivered!'
}, (err, info) => {
    console.log(err);
});

/*

require("@log4js-node/smtp");
log4js.configure({
    "replaceConsole": true,
    appenders: {
        out: { type: 'console' },
        email: {
            "type": "@log4js-node/smtp",
            "recipients": "",
            "sender": '',
            "sendInterval": 5,
            "transport": "SMTP",
            "SMTP": sendmailTransport({
                path: '/usr/sbin/sendmail'
            })
        }
    },
    categories: {
        default: { appenders: [ 'out' ], level: 'info' },
        email: { appenders: [ 'email' ], level: 'error' }
    },
    "type": "logLevelFilter",
    "level": "ERROR"
});
const logger = log4js.getLogger('console'); // any category will work
console.log = logger.info.bind(logger); // do the same for others - console.debug, etc.
console.warn = logger.warn.bind(logger); // do the same for others - console.debug, etc.
console.error = logger.error.bind(logger); // do the same for others - console.debug, etc.
console.fatal = logger.fatal.bind(logger); // do the same for others - console.debug, etc.



//process.exit();


/*
var transporter = nodemailer.createTransport(sendmailTransport({
    path: '/usr/sbin/sendmail'
}));

var mailOptions = {
    from: '"MasterQuest Debugger" <debug@usbflash.ru>', // sender address
    to: 'liz2k.b8@gmail.com', // list of receivers
    subject: 'Ошибки в проекте', // Subject line
    text: ,
    html: 
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    //console.log('Message sent: ', info);
});*/