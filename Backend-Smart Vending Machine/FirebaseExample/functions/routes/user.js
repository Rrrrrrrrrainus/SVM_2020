const routes = require('express').Router();
var firebase = require('firebase');
const crypto = require('crypto')
var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'smartvvvmachine@gmail.com',
        pass: 'swvault123'
    }
});

// var config = {
//     apiKey: "AIzaSyDEg1WylC8trdpBbfqKLRA4zB0jy0jPnic",
//     authDomain: "vending-insights-smu.firebaseapp.com",
//     databaseURL: "https://vending-insights-smu.firebaseio.com",
//     projectId: "vending-insights-smu",
//     storageBucket: "vending-insights-smu.appspot.com",
//     messagingSenderId: "571022970290",
//     appId: "1:571022970290:web:65a2eafc131f00b9d0e8ab",
//     measurementId: "G-5C2MKGRZHY"
//   };

// firebase.initializeApp(config);

/**
 * Function description: handle user login request
 * @param {request}: request from frontend
 *                  email: user's login email
 *                  password: user's login password
 * @param {response}: response send to frontend
 * @return : 'okay': login successfully
 *           'no': login fail
*/
routes.post('/login', (request, response)=>{
    var ref = firebase.database().ref('users');
    
    var password_input=request.body.password;
    password_input = crypto.createHash('md5').update(password_input).digest("hex")
    var email_input=request.body.email;
    let hash = crypto.createHash('md5').update(email_input).digest("hex")
    var password;

    ref.once("value", function(snapshot) {
       password = snapshot.child(hash).child('password').val();
    }, function (error) {
       console.log("Error: " + error.code);
       response.send('no');
    }).then(
        function(){
            if(password==password_input){
                response.send('okay');
            }else{
                response.send('no');
            }
        }
    ); 
    
 });

 /**
 * Function description: handle user signup request
 * @param {request}: request from frontend
 *                  email: user's login email
 *                  password: user's login password
 *                  name: user's registered name
 * @param {response}: response send to frontend
 * @return : 'okay': login successfully
 *           'no': login fail
*/
 routes.post('/signup', (request, response) => {
    console.log("HTTP Get Request");
    var name=request.body.name;
    var password=request.body.password;
    var email=request.body.email;

    let hash = crypto.createHash('md5').update(email).digest("hex")
    var refer = firebase.database().ref('users');
    var pass;

    refer.once("value", function(snapshot) {
        pass = snapshot.child(hash).child('password').val();
        console.log(pass);
    }).then(
        function(){
            if(pass==null){
                firebase.database().ref('users/' + hash).set({
                    username: name,
                    email: email,
                    password : crypto.createHash('md5').update(password).digest("hex"),
                    vm_number:0,
                    vm_id:0,
                });
                response.send("complete");
            }else{
                response.send("user already exist");
            }
        }
    );
});

 /**
 * Function description: generate temporary password
 * @param {length}: length of password
 * @return {result}: generated password
 * 
*/
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

/**
 * Function description: send email with temporary password to user
 * @param {request}: request from frontend
 *                  email: user's login email
 * @param {response}: response send to frontend
 * 
*/
routes.post('/sendemail', (request, response) => {
    var tempPassword = makeid(6);
    var email=request.body.email;
    var mailOptions = {
        from: 'smartvvvmachine@gmail.com',
        to: email,
        subject: 'Sending Email using Node.js',
        text: 'Your Passowrd Has Been Updated!\nTemporary Password:'+tempPassword+'\n\nSmart Vending Machine',
        html: '<div>Your Passowrd Has Been Updated!</div><div>Temporary Pin:<b>'+tempPassword+'</b></div><hr><div>Smart Vending Machine</div>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          response.send(error)
        } else {
          console.log('Email sent: ' + info.response);
          response.send("okay");
        }
    });
    let hash = crypto.createHash('md5').update(email).digest("hex")

    firebase.database().ref('temporaryPin/' + hash).set({
        email: email,
        pin: tempPassword,
    });

    setTimeout(function(){
        firebase.database().ref('temporaryPin/'+hash).remove()
                .then(function(){
                    console.log('succes');
                })
                .catch(function(error){
                    console.log('Remove fail: '+ error);
                });

    }, 8 * 10000);
});

/**
 * Function description: change user' password
 * @param {request}: request from frontend
 *                  email: user's login email
 *                  password: user's login password
 *                  pin: validation pin
 * @param {response}: response send to frontend
 *                  '200': change password successfully
 *                  'WRONG': change password fail
 * 
*/
routes.post('/changepassword', (request, response) => {
    var new_password=request.body.password;
    var email=request.body.email;
    var input_pin = request.body.pin;

    new_password = crypto.createHash('md5').update(new_password).digest("hex")
    let hash = crypto.createHash('md5').update(email).digest("hex");
    var ref_pin = firebase.database().ref('temporaryPin');
    var inner_pin;

    ref_pin.once("value", function(snapshot) {
        inner_pin = snapshot.child(hash).child('pin').val();
    },function (error){
        response.send(error);
    }).then(
        function(){
            if(input_pin!=null && inner_pin==input_pin){
                firebase.database().ref('users/' + hash).update({
                    password : new_password,
                });
                response.send("200");
                console.log(new_password);
            }else{
                response.send('WRONG')
            }
        }
    );

});

module.exports = routes;