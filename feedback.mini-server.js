/**
 * Handle /feedback.html requests
 * Used feedback.server.json for server params
 */
'use strict';
const nodemailer = require('nodemailer');
var params;
try{
    params = require('./feedback.mini-server.json');
}
catch(e){}


// handle request
module.exports = function(request, response, uri) {
    if (uri.pathname!='/feedback.html') return;

    var text = 'Feedback: \n';
    for (let p in uri.query)
        text += p + ": " + uri.query[p] + "\n";

    send(uri.query.email, text, function(error) {
        if (error) {
            console.log(error);
            done(200, '<div class="email-error">Внутренняя ошибка отправки сообщения</div>', "");
        }
        else {
            done(200, '<div class="email-success">Успешно!</div>', "");
        }
    });
    
    function done(code, data, type) {
        response.writeHead(code||200, {"Content-Type": type||"text/plain"});
        response.end(data||"");
    }
    
    return true;
}


// init transporter
var transporter;
if (params && params.emailTo && params.host && params.user) {
    initTransport();
}

// or use test server
else {
    console.warn('Warning: mailing params is empty, trying to using test...');

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error(err);
            return;
        }
        
        params = Object.assign(params||{}, {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        });
        
        initTransport();
    });
}


function initTransport() {
    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
        host: params.host,
        port: params.port ||587,
        secure: params.secure ||false, // true for 465, false for other ports
        auth: {
            user: params.user, // generated ethereal user
            pass: params.pass ||'' // generated ethereal password
        }
    });
}


// from
// text
// callback_error
function send(from, text, callback_error){
    if (!transporter) {
        callback_error('Transporter was not initialized! Check connection params!');
        return;
    }
    
    // setup email data with unicode symbols
    // see for details https://nodemailer.com/message/
    let mailOptions = {
        from: params.emailFrom || params.emailTo, // sender address
        sender:from,
        //replyTo:from,
        to: params.emailTo || params.emailFrom, // list of receivers
        subject: 'Feedback', // Subject line
        text: text||'Hello world?' // plain text body
        //html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            callback_error(error);
            return;
        }
        callback_error();
        
        console.log('Message sent: %s', info.messageId); // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
}
