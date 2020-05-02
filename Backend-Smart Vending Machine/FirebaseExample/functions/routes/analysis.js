const routes = require('express').Router();
var firebase = require('firebase');
const crypto = require('crypto')

/**
 * Function description: retrieve several days' sales data of a vending machine of a user
 * @param {request}: request from frontend
 *                   vm_id: vending machine id
 *                   email: user login email
 *                   days: amount of days
 * @param {response}: response data to frontend
 * @return {jsondata}: a dictionary with two key-value pairs
 *                     recent_sevendays_date_list: a list of recent seven days
 *                     days_sales_list: a list of sales of each day
*/
routes.post('/getsevendaysvmsales', (request, response)=>{
    var email = request.body.email;
    var vm_id = request.body.vm_id;
    var days = request.body.days;

    let hash = crypto.createHash('md5').update(email).digest("hex")
    var ref = firebase.database().ref('transactions/'+hash+'/daily');
    var recent_sevendays_date_list = fun_date(days);
    
    var orders_list;
    var days_sales_list = [];

    for(var i=0; i<days; i++){
        days[i] = 0;
    }
    console.log(recent_sevendays_date_list);
    ref.once('value', function(snapshot){
        // get one day orders list
        orders_list = snapshot.val();
    }).then(()=>{
        // orders_list keys are items' names, like "Coke"
        console.log(orders_list);
        for(var i=0; i<recent_sevendays_date_list.length; i++){
            if(!orders_list){
                days_sales_list.push(0);
                continue
            }
            var year_order = orders_list[recent_sevendays_date_list[i]['year']];
            if(year_order === undefined) {
                days_sales_list.push(0);
                continue
            };
            var month_order = year_order[recent_sevendays_date_list[i]['month']];
            if(month_order === undefined) {
                days_sales_list.push(0);
                continue
            };
            var day_order = month_order[recent_sevendays_date_list[i]['day']];
            if(day_order === undefined) {
                days_sales_list.push(0);
                continue
            };

            var today_sales_amount = 0;

            for(var key of Object.keys(day_order)){
                // key is the order_id
                var thevmid = key.split('_')[1];
                if(parseInt(thevmid) === parseInt(vm_id)){
                    
                    today_sales_amount = today_sales_amount + parseInt(day_order[key]['order_amount']);
                }
                console.log(today_sales_amount);
            }
            days_sales_list.push(today_sales_amount);

        }
        var jsondata = {'days':recent_sevendays_date_list,'sale':days_sales_list};
        response.send(jsondata); 
    })

});

/**
 * Function description: retrieve several days' sales data of a company
 * @param {request}: request from frontend
 *                   vm_id: vending machine id
 *                   email: user login email
 *                   days: amount of days
 * @param {response}: response data to frontend
 * @return {jsondata}: a dictionary with two key-value pairs
 *                     recent_sevendays_date_list: a list of recent seven days
 *                     days_sales_list: a list of sales of each day
*/
routes.post('/recentsevendayscompanysale', (request, response)=>{
    var email = request.body.email;
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var recent_sevendays_date_list = fun_date(7);
    // var year = request.body.year;
    var orders_list;
    firebase.database().ref('transactions/'+hash+'/daily/').once("value", function(snapshot) {
        orders_list = snapshot.val()
    }).then(function(){
        if(orders_list==undefined){
            response.send({'days':recent_sevendays_date_list,"sale":[0,0,0,0,0,0,0]})
        }else{
        var sales_list = [];
        for(var i=0; i<recent_sevendays_date_list.length; i++){
            var year_order = orders_list[recent_sevendays_date_list[i]['year']];
            if(year_order == undefined) {
                sales_list.push(0);
                console.log('day1')
                continue
            };
            var month_order = year_order[recent_sevendays_date_list[i]['month']];
            if(month_order == undefined) {
                sales_list.push(0);
                console.log('day2')
                continue
            };
            var day_order = month_order[recent_sevendays_date_list[i]['day']];
            if(day_order == undefined) {
                console.log('day3')
                sales_list.push(0);
                continue
            };
            sales_list.push(parseInt(day_order['day_total_sale']));
        }
        response.send({'days':recent_sevendays_date_list,'sale':sales_list}) }
    });
});

/**
 * Function description: retrieve one year sales data of a company
 * @param {request}: request from frontend
 *                   email: user login email
 *                   year: the year number
 * @param {response}: response data to frontend
 * @return {jsondata}: a dictionary with two key-value pairs
 *                     mesg: the year that is requested
 *                     sale: sales data in month list of the year
*/
routes.post('/recentsevendayscompanymonthsale', (request, response)=>{
    var email = request.body.email;
    var months = [...Array(12).keys()]
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var year = request.body.year;
    var orders_list;
    firebase.database().ref('transactions/'+hash+'/daily/'+year).once("value", function(snapshot) {
        orders_list = snapshot.val()
    }).then(function(){
        if(orders_list==undefined){
            response.send({"sale":[0,0,0,0,0,0,0,0,0,0,0,0]})
        }else{
        console.log(orders_list)
        var sales_list = [];
        for(var i=0; i<months.length; i++){
            var month_order = orders_list[months[i]+1];
            if(month_order == undefined) {
                sales_list.push(0);
                console.log('day1')
                continue
            };
            sales_list.push(parseInt(month_order['month_total_sale']));
        }
        var jsondata = {'mesg':'yea','sale':sales_list};
        response.send(jsondata);
    }
    });
});

/**
 * Function description: retrieve one year profit data of a user
 * @param {request}: request from frontend
 *                   email: user login email
 *                   year: the year number
 * @param {response}: response data to frontend
 * @return {profit_list}: a list of profit data of each month in a year
 * 
*/
routes.post('/getyearprofitbyuser', (request, response)=>{
    // should return an array with 12 months' profit
    var email = request.body.email;
    var year = request.body.year;

    let hash = crypto.createHash('md5').update(email).digest("hex")

    // get the total_stock_price
    var month_stock_list;
    var month_sale_list;
    var stock_price_list = [];
    var sale_price_list = [];
    var profit_list = [];

    firebase.database().ref('transactions/' + hash + '/dailystock/' + year).once("value", function(snapshot){
        month_stock_list = snapshot.val();
    }).then(function(){
        for(var month=1; month<=12; month++){
            if (month_stock_list === null){
                stock_price_list.push(0);
                continue;
            }
            var days_orders = month_stock_list[month];
            if (days_orders === undefined){
                stock_price_list.push(0);
                continue;
            }
            var month_total_price = month_stock_list[month]['month_total_price'];
            stock_price_list.push(month_total_price);
        }
        console.log(stock_price_list);
    }).then(function(){
        // get the total_sale_price
        firebase.database().ref('transactions/' + hash + '/daily/' + year).once("value", function(snapshot){
            month_sale_list = snapshot.val();
        }).then(function(){
            for(var month=1; month<=12; month++){
                if(month_sale_list === null){
                    sale_price_list.push(0);
                    continue;
                }
                var days_orders = month_sale_list[month];
                if (days_orders === undefined){
                    sale_price_list.push(0);
                    continue;
                } 
                var month_total_price = month_sale_list[month]['month_total_price'];
                sale_price_list.push(month_total_price);
            }
            console.log(sale_price_list)
        }).then(function(){
            for(var i=0; i<12; i++){
                profit_list.push(sale_price_list[i] - stock_price_list[i]);
            }
            response.send(profit_list);
        })
    }).catch(function(error){
        response.send('get year profit failed: ' + error);
    })
})

/**
 * Function description: calculate recent several days of dates
 * @param {date_diff}: the amount of recent days requested
 * @return {date_list}: a list of dates
 * 
*/
function fun_date(date_diff){
    var date1 = new Date()
    var  time1= date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
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
    
    return date_list.reverse();
}

/**
 * Function description: retrieve several days' profit data of a item of a user's vending machine
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vending machine id
 *                   days: amount of days
 * @param {response}: response data to frontend
 * @return {sales_list}: a list of sales data of several days
 * 
*/
routes.post('/getsevendaysitemsales', (request, response)=>{
    var email = request.body.email;
    var item = request.body.item;
    var vm_id = request.body.vm_id;
    var days = request.body.days;

    let hash = crypto.createHash('md5').update(email).digest("hex")
    var ref = firebase.database().ref('transactions/'+hash+'/vm/'+vm_id+'/'+item);
    var recent_sevendays_date_list = fun_date(days);
    console.log(recent_sevendays_date_list)
    var orders_list;
    
    var sales_list = [];
    
    ref.once('value', function(snapshot){
        orders_list = snapshot.val();
    }).then(()=>{
        for(var i=0; i<recent_sevendays_date_list.length; i++){
            var total_sales = 0;
            if(!orders_list) {
                sales_list.push(0);
                continue
            };
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

            for(var key of Object.keys(day_order)){
                total_sales = total_sales + parseInt(day_order[key]['order_amount'])
            }
            sales_list.push(total_sales);
        }
        response.send(sales_list); 
    })

});

/**
 * Function description: calculate cosin similarity of two lists of data
 * @param {A}: first list of data
 * @param {B}: second list of data
 * @return {similarity}: similarity of two lists of data
 * 
*/
function cosinesim(A,B){
    var dotproduct=0;
    var mA=0;
    var mB=0;
    for(i = 0; i < A.length; i++){ // here you missed the i++
        dotproduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct)/((mA)*(mB)) // here you needed extra brackets
    return similarity;
}

/**
 * Function description: find two similar products in a vending machine of a user
 * @param {request}: request from frontend
 *                   email: user login email
 *                   vm_id: vending machine id
 *                   days: amount of days
 * @param {response}: response data to frontend
 * @return {jsondata}: a dictionary of return data
 *                     choice: the index of most similar product
 *                     products: names of similar products
*/
routes.post('/similar', (request, response)=>{
    var email=request.body.email;
    let vm_id = request.body.vm_id
    let hash = crypto.createHash('md5').update(email).digest("hex")
    var days = request.body.days;
    var recent_sevendays_date_list = fun_date(days);
    var orders_list;
    var list;
    var other_list = []
    var target_list = []
    var products = []
    firebase.database().ref('vendingmachines/'+hash+'/vm/'+vm_id+'/products').once("value", function(snapshot) {
        var data = snapshot.val()
        list = Object.keys(data)
    }).then(function(){
            var ref = firebase.database().ref('transactions/'+hash+'/vm/'+vm_id);
            ref.once('value', function(snapshot){
                orders_list = snapshot.val();
            }).then(()=>{
                for(var item in list){
                    var data = orders_list[list[item]]
                    var sales_list = []
                for(var i=0; i<recent_sevendays_date_list.length; i++){

                    var total_sales = 0;
                    if(data === undefined){
                        sales_list.push(0);
                        continue
                    }
                    var year_order = data[recent_sevendays_date_list[i]['year']];
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
        
                    for(var key of Object.keys(day_order)){
                        total_sales = total_sales + parseInt(day_order[key]['order_amount'])
                    }
                    sales_list.push(total_sales);
                }
                console.log(list[item])
                if(list[item] == request.body.item){
                    target_list = sales_list;
                }else{
                    other_list.push(sales_list)
                    products.push(list[item])
                }
            }
            }).then(function(){
                var small = -1;
                var best = -1;
        for (var i =0;i< other_list.length;i++){
            var s  = cosinesim(other_list[i],target_list)
            if(s===NaN){
                continue
            }else{
                if(s>small){
                    small=s;
                    best=i
                }
            }
            console.log(s)
        }
        var jsondata = {choice:best,products:products};
        response.send(jsondata);

    })
    });

});
 
module.exports = routes;