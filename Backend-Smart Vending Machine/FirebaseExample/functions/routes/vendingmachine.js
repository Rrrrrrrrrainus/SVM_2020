const routes = require('express').Router();
// const express = require('express');
var firebase = require('firebase');
const crypto = require('crypto');
var jsonwebtoken = require('jsonwebtoken')
const moment = require('moment');

/**
 * Function description: add a vending machine
 * @param {request}: request from frontend
 *                   longitude: longitude of vm
 *                   latitude: latitude of vm
 *                   email: user login email
 *                   days: amount of days
 *                   real_vm: amount of vm in database
 * @param {response}: response data to frontend
 * @return {jsondata}: vm_id of the vm
*/

routes.post('/addvm', (request, response) => {
    let token = request.body.token;
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    jsonwebtoken.verify(token, 'f', function(err, decoded) {
      if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    });

    let latitude = request.body.latitude
    let name = request.body.name
    let longitude = request.body.longitude
    var email=request.body.email;
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var refer = firebase.database().ref('users');

    var ref_vm = firebase.database().ref('users/'+hash);
    var ref_vm_set = firebase.database().ref('users/'+hash);
    var vm_id = 0
    var real_vm = 0
    ref_vm.once("value", function(snapshot) {       
            vm_id = snapshot.child('vm_number').val()+1
            real_vm = snapshot.child('vm_real').val()
            console.log([vm_id,real_vm])
    }).then(function(){
        firebase.database().ref('users/' + hash+'/vm/'+vm_id).set({
            vm_id: vm_id,
            latitude: latitude,
            longitude:  longitude,
            sales: 0,
            name: name,
            products: []
        }).then(function(){
            ref_vm_set.update({
                vm_real : real_vm+1,
                vm_number : vm_id
            }).catch(function(error){

            }).then(function(){
                response.send(''+vm_id)
            })
        })})
});

/**
 * Function description: delete a vending machine
 * @param {request}: request from frontend
 *                   longitude: longitude of vm
 *                   latitude: latitude of vm
 *                   email: user login email
 *                   days: amount of days
 *                   real_vm: amount of vm in database
 * @param {response}: response data to frontend
 * @return {jsondata}: vm_id of the vm
*/

routes.post('/updatevm', (request, response) => {
    let token = request.body.token;
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    jsonwebtoken.verify(token, 'f', function(err, decoded) {
      if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    });

    let latitude = request.body.latitude
    let longitude = request.body.longitude
    let name = request.body.name
    var email=request.body.email;
    var vm_id = request.body.vm_id
    let hash = crypto.createHash('md5').update(email).digest("hex")

    firebase.database().ref('users/' + hash+'/vm/'+vm_id).update({
        latitude: latitude,
        longitude:  longitude,
        name: name
    }).then(function(){
        response.send('update success!')
    }).catch(function(error){
        if(error){
            console.log('update fail: '+ error);
        }
    });
});

/**
 * Function description: update a vending machine
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of vm
 * @param {response}: response data to frontend
 * @return {string}: message
*/

routes.delete('/deletevm',(request,response)=>{
    let token = request.body.token;
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    jsonwebtoken.verify(token, 'f', function(err, decoded) {
      if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    });

    let vm_id = request.body.vm_id
    let email=request.body.email;
    let hash = crypto.createHash('md5').update(email).digest("hex")
    firebase.database().ref('users/'+hash+'/vm/'+vm_id).remove()
                .then(function(){
                    let vm_num = -1
                    firebase.database().ref('users/'+hash).once('value',function(snapshot){
                        vm_num = snapshot.child("vm_real").val()
                    }).then(function(){
                        firebase.database().ref('users/'+hash).update({
                            vm_real:vm_num-1
                        })
                        console.log(vm_num)

                        response.send('Delete Success')
                    })
                }).then(function(){
                    firebase.database().ref('vendingmachines/'+hash+'/vm/'+vm_id).remove()
                })
                .catch(function(error){
                    console.log('Remove fail: '+ error);
                });
})

/**
 * Function description: get all vm's info
 * @param {request}: request from frontend
 *                   email: user login email
 * @param {response}: response data to frontend
 * @return {jsondata}: all vm
*/

routes.post('/getallvm', (request, response)=>{
    
    let email = request.body.email;
    let hash = crypto.createHash('md5').update(email).digest("hex");

    var ref = firebase.database().ref('users/'+hash);

    var allvm;

    ref.once('value', function(snapshot){
        allvm = snapshot.child('vm');
    }).then(function(){
        response.send(allvm);
    }, function(error){
        response.send('Error: ' + error);
    });
})

/**
 * Function description: get all product in a vm
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 * @param {response}: response data to frontend
 * @return {jsondata}: all products in that vm
*/
routes.post('/getallproduct', (request, response)=>{
    let token = request.body.token;
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    jsonwebtoken.verify(token, 'f', function(err, decoded) {
      if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    });

    let email = request.body.email;
    let vm_id = request.body.vm_id;
    let hash = crypto.createHash('md5').update(email).digest("hex");

    var ref = firebase.database().ref('vendingmachines/'+hash+'/vm/'+vm_id);

    var allproducts;

    ref.once('value', function(snapshot){
        allproducts = snapshot.child('products');
    }).then(function(){
        response.send(allproducts);
    }, function(error){
        response.send('Error: ' + error);
    });
})

/**
 * Function description: add a product to a vm
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 *                   price: price of the product
 *                   purchase_url: purcharl url of the product
 *                   inventory: initial inventory of the product
 * @param {response}: response data to frontend
 * @return {string}: message of status
*/

routes.post('/addproduct', (request, response) => {

    var product_name = request.body.name
    var email=request.body.email;
    let vm_id = request.body.vm_id
    let inventory = Number(request.body.inventory);
    let price = Number(request.body.price);
    let purchase_url = request.body.purchase_url
    let hash = crypto.createHash('md5').update(email).digest("hex")

    firebase.database().ref('users/' + hash+'/vm/'+vm_id+'/'+'products/'+product_name).set({
        inventory: inventory,
        purchase_url: purchase_url,
        sales: 0,
        name: product_name,
        price: price
    }).then(function(){
        firebase.database().ref('vendingmachines/' + hash + '/vm/' + vm_id + '/products/' + product_name).update({
            inventory: inventory,
            purchase_url: purchase_url,
            sales: 0,
            name: product_name,
            price: price
        });
    }).then(function(){
        response.send("OKAY");
    }, function(error){
        response.send(error);
    })
});

/**
 * Function description: update a product in a vm
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 *                   product_name: name of the product
 *                   price: price of the product
 *                   purchase_url: purcharl url of the product
 *                   inventory: initial inventory of the product
 * @param {response}: response data to frontend
 * @return {string}: message of status
*/

routes.post('/updateproduct', (request, response) => {
    let token = request.body.token;
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    jsonwebtoken.verify(token, 'f', function(err, decoded) {
      if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    });

    var product_name = request.body.name
    var email=request.body.email;
    let vm_id = request.body.vm_id
    let inventory = Number(request.body.inventory);
    let price = Number(request.body.price);
    let purchase_url = request.body.purchase_url
    let hash = crypto.createHash('md5').update(email).digest("hex")

    console.log(purchase_url)

    firebase.database().ref('users/' + hash+'/vm/'+vm_id+'/'+'products/'+product_name).update({
        inventory: inventory,
        purchase_url: purchase_url,
        sales: 0,
        price: price
    }).then(function(){
    }).then(function(){
        var ref = firebase.database().ref('vendingmachines/'+hash+'/vm/'+vm_id+'/products/'+product_name);
        ref.update({
            inventory: inventory,
            purchase_url: purchase_url,
            price: price
        }).then(function(){
            response.send('update success!')
        })
    }).catch(function(error){
        if(error){
            console.log('update fail: '+ error);
        }
    });
});

/**
 * Function description: get data for pie chart
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 * @param {response}: response data to frontend
 * @return {jsondata}: list of data of product and sales
*/

routes.post('/pie', (request, response) => {
    function fun_date(date_diff){
        var date1 = new Date(),
        time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
        var date_list = [];
        for(var i=0; i<date_diff; i++){
            var date2 = new Date(date1);
            date2.setDate(date1.getDate()-i);
            var new_date = {
                year: parseInt(date2.getFullYear()),
                month: parseInt(date2.getMonth()+1),
                day: parseInt(date2.getDate())
            }
            date_list.push(new_date);
        }
        
        return date_list;
    }
    var email=request.body.email;
    let vm_id = request.body.vm_id
    let hash = crypto.createHash('md5').update(email).digest("hex")

    var days = request.body.days;

    var ref = firebase.database().ref('transactions/'+hash+'/vm/'+vm_id+'/');
    var recent_sevendays_date_list = fun_date(days);
    
    var orders_list;
    var d;
    var total_sales = 0;

    var jsondata = {}
    var list;
    firebase.database().ref('vendingmachines/'+hash+'/vm/'+vm_id+'/products').once("value", function(snapshot) {
        var data = snapshot.val()
        if(!data){
            list = Object.keys(data)
        }
    }).then(function(){
        ref.once('value', function(snapshot){
            // get one day orders list
            d = snapshot.val();
        }).then(()=>{
            for(key in d){
                if(key=='total_sale_price'||key=='total_sale'||key=='total_price'){
                    continue
                }
                var sales_list = [];
                console.log(key)
                orders_list = d[key]
                for(var i=0; i<recent_sevendays_date_list.length; i++){
    
                    var year_order = orders_list[recent_sevendays_date_list[i]['year']];
                    if(year_order === undefined) {
                        sales_list.push(0);
                        continue
                    };
                    var month_order = year_order[recent_sevendays_date_list[i]['month']];
                    if(month_order === undefined) {
                        sales_list.push(0);
                        continue
                    };
                    var day_order = month_order[recent_sevendays_date_list[i]['day']];
                    if(day_order === undefined) {
                        sales_list.push(0);
                        continue
                    };
        
                    for(var keys of Object.keys(day_order)){
                        total_sales = total_sales + parseInt(day_order[keys]['order_amount'])
                        sales_list.push(parseInt(day_order[keys]['order_amount']));
                    }
                }
                jsondata[key]=sales_list.reduce((a, b) => a + b, 0)
            }
        }).then(function(){
            response.send(jsondata)
        }).catch(function(error){
            if(error){
                console.log('update fail: '+ error);
            }
        });
    }).catch(function(error){
        if(error){
            console.log('update fail: '+ error);
        }
    });
});

/**
 * Function description: get info of this vm
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 * @param {response}: response data to frontend
 * @return {jsondata}: data displayed on the cards in vm report page
*/

routes.post('/vminfo2', (request, response) => {
    // let token = request.body.token;
    // if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    // jsonwebtoken.verify(token, 'f', function(err, decoded) {
    //   if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // });

    var email=request.body.email;
    let year = request.body.year;
    let month = request.body.month;
    let vm_id = request.body.vm_id;
    var previous_month = month - 1;
    var previous_year = year;
    if(month == 1){
        previous_month = 12;
        previous_year = year - 1;
    }
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var count = 0;
    var total_total = 0;
    var purchase_count = 0;
    var previous_total_total = 0;
    var previous_purchase_count = 0;
    var previous_profit = 0
    var profit = 0
    firebase.database().ref('users/' + hash+'/vm/'+vm_id+'/products').once("value", function(snapshot) {
        var data = snapshot.val();
        count = 0
        // console.log(data)
        for(key in data){
            count += 1
        }
    }).then(function(){
        firebase.database().ref('transactions/' + hash+'/daily/'+year+'/'+month).once("value", function(snapshot) { 
            total_total = 0;
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/daily/'+year+'/'+month).once("value", function(snapshot) { 
                var month_data = snapshot.val()
                for(key in month_data){
                    if(key!='month_total_sale'){
                        for(day_key in month_data[key]){
                            if(Number(day_key.split('_')[1])==vm_id){
                                for(order_key in month_data[key][day_key]){
                                    if(order_key=="order_amount"){
                                        total_total+=Number(month_data[key][day_key][order_key])
                                    }
                                    if(order_key=="total_price"){
                                        profit += Number(month_data[key][day_key][order_key])
                                    }
                                }
                                purchase_count += 1
                            }
                        }
                    }
                }
            }).then(function(){
                firebase.database().ref('transactions/' + hash+'/dailystock/'+year+'/'+month).once("value", function(snapshot) { 
                    var month_data = snapshot.val()
                    for(key in month_data){
                        if(key!='month_total_sale'){
                            for(day_key in month_data[key]){
                                if(Number(day_key.split('_')[1])==vm_id){
                                    for(order_key in month_data[key][day_key]){
                                        if(order_key=="total_price"){
                                            profit -= Number(month_data[key][day_key][order_key])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }).then(function(){

                
                firebase.database().ref('transactions/' + hash+'/daily/'+previous_year+'/'+previous_month).once("value", function(snapshot) { 
                    // previous_total_total = snapshot.child('month_total_sale').val()
                }).then(function(){
                    firebase.database().ref('transactions/' + hash+'/daily/'+previous_year+'/'+previous_month).once("value", function(snapshot) { 
                        var month_data = snapshot.val()
                        for(key in month_data){
                            if(key!='month_total_sale'){
                                // console.log(key) 
                                for(day_key in month_data[key]){
                                    if(Number(day_key.split('_')[1])==vm_id){
                                        for(order_key in month_data[key][day_key]){
                                            if(order_key=="order_amount"){
                                                previous_total_total+=Number(month_data[key][day_key][order_key])
                                                console.log(month_data[key])
                                            }
                                            if(order_key=="total_price"){
                                                previous_profit += Number(month_data[key][day_key][order_key])
                                            }
                                        }
                                        previous_purchase_count+=1
                                    }
                                }
                            }
                        }
                    }).then(function(){
                        firebase.database().ref('transactions/' + hash+'/dailystock/'+year+'/'+previous_month).once("value", function(snapshot) { 
                            var month_data = snapshot.val()
                            for(key in month_data){
                                if(key!='month_total_sale'){
                                    for(day_key in month_data[key]){
                                        if(Number(day_key.split('_')[1])==vm_id){
                                            for(order_key in month_data[key][day_key]){
                                                if(order_key=="total_price"){
                                                    previous_profit -= Number(month_data[key][day_key][order_key])
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }).then(function(){
                        response.send({count:count,total_sale:total_total,purchase_count:purchase_count,
                        previous_purchase_count:previous_purchase_count,previous_total_sale:previous_total_total,
                    previous_profit:previous_profit,profit:profit})
                    })})
                })})
            })
        })
    }).catch(function(error){
        if(error){
            console.log('update fail: '+ error);
        }
    });
});

/**
 * Function description: get info of this vm
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 * @param {response}: response data to frontend
 * @return {jsondata}: data displayed on the cards in vm report page
*/

routes.post('/vminfo', (request, response) => {

    var email=request.body.email;
    let year = request.body.year;
    let month = request.body.month;
    var previous_month = month - 1;
    var previous_year = year;
    if(month == 1){
        previous_month = 12;
        previous_year = year - 1;
    }
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var count = 0;
    var total_total = 0;
    var purchase_count = 0;
    var previous_total_total = 0;
    var previous_purchase_count = 0;
    var previous_profit = 0
    var profit = 0
    firebase.database().ref('users/' + hash+'/vm/').once("value", function(snapshot) {
        var data = snapshot.val();
        count = 0
        for(key in data){
            count += 1
        }
    }).then(function(){
        firebase.database().ref('transactions/' + hash+'/daily/'+year+'/'+month).once("value", function(snapshot) { 
            total_total = snapshot.child('month_total_sale').val()
            profit = snapshot.child('month_total_price').val()
        }).then(function(){
                firebase.database().ref('transactions/' + hash+'/dailystock/'+year+'/'+month).once("value", function(snapshot) { 
                    profit -= snapshot.child('month_total_price').val()
                }).then(function(){
            firebase.database().ref('transactions/' + hash+'/daily/'+year+'/'+month).once("value", function(snapshot) { 
                var month_data = snapshot.val()
                for(key in month_data){
                    if(key!='month_total_sale'&&key!='month_total_price'){
                        console.log(key)
                        for(day_key in month_data[key]){
                            if(day_key!='day_total_sale'&&day_key!='day_total_price'){
                                purchase_count += 1
                            }
                        }
                    }
                }
            }).then(function(){
                firebase.database().ref('transactions/' + hash+'/daily/'+previous_year+'/'+previous_month).once("value", function(snapshot) { 
                    previous_total_total = snapshot.child('month_total_sale').val()
                    previous_profit=snapshot.child('month_total_price').val()
                }).then(function(){
                    firebase.database().ref('transactions/' + hash+'/dailystock/'+year+'/'+previous_month).once("value", function(snapshot) { 
                        previous_profit -= snapshot.child('month_total_price').val()
                    }).then(function(){
                    firebase.database().ref('transactions/' + hash+'/daily/'+previous_year+'/'+previous_month).once("value", function(snapshot) { 
                        var month_data = snapshot.val()
                        for(key in month_data){
                            if(key!='month_total_sale'&&key!='month_total_price'){
                                console.log(key)
                                for(day_key in month_data[key]){
                                    if(day_key!='day_total_sale'&&day_key!='day_total_price'){
                                        previous_purchase_count += 1
                                    }
                                }
                            }
                        }
                    }).then(function(){
                        response.send({count:count,total_sale:total_total,purchase_count:purchase_count,
                        previous_purchase_count:previous_purchase_count,previous_total_sale:previous_total_total,
                        profit: profit, previous_profit:previous_profit})
                    })
                })
            })})})
        })
    }).catch(function(error){
        if(error){
            console.log('update fail: '+ error);
        }
    });
});

/**
 * Function description: update a transaction of a product
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 *                   total_price: total_price of the transaction
 *                   order_amount: order_amount of the transaction
 *                   order_year,month,day: date of the transaction
 * @param {response}: response data to frontend
 * @return {jsondata}: message of status
*/

routes.post('/updatetransaction', (request, response) => {
    var product_name = request.body.item
    var email=request.body.email;
    let vm_id = request.body.vm_id
    let total_price = Number(request.body.total_price);
    var order_id = moment(new Date())+'_'+vm_id;
    let order_amount = Number(request.body.amount);
    let order_date_year = Number(request.body.year);
    let order_date_month = Number(request.body.month);
    let order_date_day = Number(request.body.day);
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var total;
    var total2;

    // '/transactions/{hash(email)/vm/{vm_id}/{product_name}' save orders information group by product_name
    firebase.database().ref('transactions/' + hash+'/vm/'+vm_id+'/'+product_name+'/'+order_date_year+'/'+order_date_month+'/'+order_date_day
        +'/'+order_id).update({
        order_amount: order_amount,
        order_date_year: order_date_year,
        order_date_month: order_date_month,
        order_date_day: order_date_day,
        order_id: order_id,
        order_item: product_name,
        total_price: total_price
    }).then(function(){
        firebase.database().ref('transactions/' + hash+'/vm/'+vm_id).once("value", function(snapshot) { 
            total = snapshot.child('total_sale').val()
            total2 = snapshot.child('total_price').val()
        }).then(function(){
            // update a product's total sale and total sale price
            console.log(total)
            console.log(total2)

            firebase.database().ref('transactions/' + hash+'/vm/'+vm_id).update({
                total_sale: Number(total)+Number(order_amount),
                total_price: Number(total2)+Number(total_price)
            })
        })
    }).then(function(){
        var total_total;
        var total_total2;
        firebase.database().ref('transactions/' + hash).once("value", function(snapshot) { 
            total_total = snapshot.child('total_sale').val()
            total_total2 = snapshot.child('total_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash).update({
                total_sale: Number(total_total)+Number(order_amount),
                total_price: Number(total_total2)+Number(total_price)
            })
        })
    }).then(function(){
        firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year+'/'+order_date_month+'/'+order_date_day
        +'/'+order_id).update({
            order_amount: order_amount,
            order_date_year: order_date_year,
            order_date_month: order_date_month,
            order_date_day: order_date_day,
            order_id: order_id,
            order_item: product_name,
            total_price: total_price
        })
    }).then(function(){
        var total_year;
        var total_year2;
        firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year).once("value", function(snapshot) { 
            total_year = snapshot.child('year_total_sale').val()
            total_year2 = snapshot.child('year_total_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year).update({
                year_total_sale: Number(total_year)+Number(order_amount),
                year_total_price: Number(total_year2)+Number(total_price)
            })
        })
    }).then(function(){
        var total_month;
        var total_month2;
        firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year+'/'+order_date_month).once("value", function(snapshot) { 
            total_month = snapshot.child('month_total_sale').val()
            total_month2 = snapshot.child('month_total_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year+'/'+order_date_month).update({
                month_total_sale: Number(total_month)+Number(order_amount),
                month_total_price: Number(total_month2)+Number(total_price)
            })
        })
    }).then(function(){
        var total_day;
        var total_day2;
        firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year+'/'+order_date_month+'/'+order_date_day).once("value", function(snapshot) { 
            total_day2 = snapshot.child('day_total_price').val()
            total_day = snapshot.child('day_total_sale').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/daily/'+order_date_year+'/'+order_date_month+'/'+order_date_day).update({
                day_total_sale: Number(total_day)+Number(order_amount),
                day_total_price: Number(total_day2)+Number(total_price)
            })
        }).then(function(){
            response.send('update success')
        })
    }).then(function(){
        var new_sales;
        var new_inventory;
        firebase.database().ref('vendingmachines/' + hash + '/vm/' + vm_id + '/products/' + product_name).once("value", function(snapshot){
            new_sales = snapshot.child('sales').val();
            new_inventory = snapshot.child('inventory').val();
        }).then(function(){
            firebase.database().ref('vendingmachines/' + hash + '/vm/' + vm_id + '/products/' + product_name).update({
                sales: Number(new_sales) + Number(order_amount),
                inventory: Number(new_inventory) - Number(order_amount)
            })
        });
    }).then(function(){
        var new_sales = 0;
        var new_inventory = 0;
        firebase.database().ref('users/' + hash + '/vm/' + vm_id + '/products/' + product_name).once("value", function(snapshot){
            new_sales = snapshot.child('sales').val();
            new_inventory = snapshot.child('inventory').val();
        }).then(function(){
            firebase.database().ref('users/' + hash + '/vm/' + vm_id + '/products/' + product_name).update({
                sales: Number(new_sales) + Number(order_amount),
                inventory: Number(new_inventory) - Number(order_amount)
            })
        })
    }).then(function(){
        var new_sales = 0;
        firebase.database().ref('users/' + hash + '/vm/' + vm_id).once("value", function(snapshot){
            new_sales = snapshot.child('sales').val();
        }).then(function(){
            firebase.database().ref('users/' + hash + '/vm/' + vm_id).update({
                sales: Number(new_sales) + Number(order_amount)
            })
        })
    })
    .catch(function(error){
        if(error){
            response.send('update fail')
            console.log('update fail: '+ error);
        }
    });
});

/**
 * Function description: update the inventory of a product
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 *                   total_price: total_price of the transaction
 *                   order_amount: order_amount of the transaction
 *                   order_year,month,day: date of the transaction
 * @param {response}: response data to frontend
 * @return {jsondata}: message of status
*/


routes.post('/getstock', (request, response) => {
    var product_name = request.body.item
    var email=request.body.email;
    let vm_id = request.body.vm_id
    let total_price = request.body.restock_total_price;
    var order_id = moment(new Date())+'_'+vm_id;
    let order_amount = request.body.amount;
    let order_date_year = Number(request.body.year);
    let order_date_month = Number(request.body.month);
    let order_date_day = Number(request.body.day);
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var total;
    var total2;

    // console.log("total_price is ",total_price);

    firebase.database().ref('transactions/' + hash+'/stock/'+vm_id+'/'+product_name+'/'+order_date_year+'/'+order_date_month+'/'+order_date_day
        +'/'+order_id).update({
        order_amount: order_amount,
        order_date_year: order_date_year,
        order_date_month: order_date_month,
        order_date_day: order_date_day,
        order_id: order_id,
        order_item: product_name,
        total_price: total_price
    }).then(function(){
        firebase.database().ref('transactions/' + hash+'/stock/'+vm_id).once("value", function(snapshot) { 
            total = snapshot.child('total_stock').val()
            total2 = snapshot.child('total_stock_price').val()
            // console.log(total)
        }).then(function(){
            // console.log(int(total)+int(order_amount))
            firebase.database().ref('transactions/' + hash+'/stock/'+vm_id).update({
                total_stock: Number(total)+Number(order_amount),
                total_stock_price: Number(total2)+Number(total_price)
            })
        })
    }).then(function(){
        var total_total;
        var total_total2;
        firebase.database().ref('transactions/' + hash).once("value", function(snapshot) { 
            total_total = snapshot.child('total_stock').val()
            total_total2 = snapshot.child('total_stock_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash).update({
                total_stock: Number(total_total)+Number(order_amount),
                total_stock_price: Number(total_total2)+Number(total_price)
            })
        })
    }).then(function(){
        firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year+'/'+order_date_month+'/'+order_date_day
        +'/'+order_id).update({
            order_amount: order_amount,
            order_date_year: order_date_year,
            order_date_month: order_date_month,
            order_date_day: order_date_day,
            order_id: order_id,
            order_item: product_name,
            total_price: total_price
        })
    }).then(function(){
        var total_year;
        var total_year2;
        firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year).once("value", function(snapshot) { 
            total_year = snapshot.child('year_total_stock').val()
            total_year2 = snapshot.child('year_total_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year).update({
                year_total_stock: Number(total_year)+Number(order_amount),
                year_total_price: Number(total_year2)+Number(total_price)
            })
        })
    }).then(function(){
        var total_month;
        var total_month2;
        firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year+'/'+order_date_month).once("value", function(snapshot) { 
            total_month = snapshot.child('month_total_stock').val()
            total_month2 = snapshot.child('month_total_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year+'/'+order_date_month).update({
                month_total_stock: Number(total_month)+Number(order_amount),
                month_total_price: Number(total_month2)+Number(total_price)
            })
        })
    }).then(function(){
        var total_day;
        var total_day2;
        firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year+'/'+order_date_month+'/'+order_date_day).once("value", function(snapshot) { 
            total_day = snapshot.child('day_total_stock').val()
            total_day2 = snapshot.child('day_total_price').val()
        }).then(function(){
            firebase.database().ref('transactions/' + hash+'/dailystock/'+order_date_year+'/'+order_date_month+'/'+order_date_day).update({
                day_total_stock: Number(total_day)+Number(order_amount),
                day_total_price: Number(total_day2)+Number(total_price)
            })
        })
    }).then(function(){
        var new_inventory;
        firebase.database().ref('users/' + hash + '/vm/' + vm_id + '/products/' + product_name).once("value", function(snapshot){
            new_inventory = snapshot.child('inventory').val();
        }).then(function(){
            firebase.database().ref('users/' + hash + '/vm/' + vm_id + '/products/' + product_name).update({
                inventory: Number(new_inventory) + Number(order_amount)
            });
        });
    }).then(function(){
        var new_inventory;
        firebase.database().ref('vendingmachines/' + hash + '/vm/' + vm_id + '/products/' + product_name).once("value", function(snapshot){
            new_inventory = snapshot.child('inventory').val();
        }).then(function(){
            firebase.database().ref('vendingmachines/' + hash + '/vm/' + vm_id + '/products/' + product_name).update({
                inventory: Number(new_inventory) + Number(order_amount)
            })
        })
    }).then(function(){
        response.send('restock success');
    }).catch(function(error){
        if(error){
            response.send('restock fail');
            console.log('restock fail: '+ error);
        }
    });
});

/**
 * Function description: delete a product
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vm_id of the vm
 *                   product_name: product name
 * @param {response}: response data to frontend
 * @return {jsondata}: message of status
*/

routes.delete('/deleteproduct',(request,response)=>{
    let token = request.body.token;
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });
    jsonwebtoken.verify(token, 'f', function(err, decoded) {
      if (err) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    });

    let vm_id = request.body.vm_id
    let email=request.body.email;
    var product_name = request.body.name
    let hash = crypto.createHash('md5').update(email).digest("hex")
    firebase.database().ref('users/'+hash+'/vm/'+vm_id+'/products/'+product_name).remove()
    .then(function(){
        firebase.database().ref('vendingmachines/'+hash+'/vm/'+vm_id+'/products/'+product_name).remove();
        console.log('success');
        response.send('remove success')
    })
    .catch(function(error){
        console.log('remove fail: '+ error);
        response.send('remove fail');
    }); 
});

module.exports = routes;