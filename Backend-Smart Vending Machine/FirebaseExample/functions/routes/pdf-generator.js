const routes = require('express').Router();
const pdf = require('html-pdf');
const crypto = require('crypto');
var firebase = require('firebase');

const pdfTemplate = require('../document/pdfcontent.js')


// post routes - PDF generatrion and fetching of the data
routes.post('/create-pdf', (request, response)=>{
    console.log('generate pdf');

    let email = request.body.email;
    let hash = crypto.createHash('md5').update(email).digest("hex");
    var ref = firebase.database().ref('users/'+hash);

    var allvm;

    ref.once('value', function(snapshot){
        allvm = snapshot.child('vm');
    }).then(function(){
        console.log(allvm)
        pdf.create(pdfTemplate(request.body,allvm), {}).toFile('./download/result.pdf');
    }, function(error){

    });
});

routes.get('/1', (request, response)=>{
    response.send('aaaaaaa');
})

// GET - send the pdf to client
routes.get('/fetch-pdf', (request, response)=>{
    response.sendFile('result.pdf', {root: './download'});
})

module.exports = routes;