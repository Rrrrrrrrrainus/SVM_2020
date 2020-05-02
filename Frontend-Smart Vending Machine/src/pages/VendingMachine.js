import React from 'react';
import  MainLayout from '../components/Layout/MainLayout'
import {Line,Pie } from 'react-chartjs-2';
import userImage from 'assets/img/products/2.jpeg';
import { NumberWidget } from 'components/Widget';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import "../styles/_modalText.scss"
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { forwardRef } from 'react';
import axios from 'axios'
import {decode,checkExpired} from '../components/Authendication'
import { getColor } from '../utils/colors';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardImg,
  CardTitle,
  CardBody,
  CardText,
  Table,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Spinner
} from 'reactstrap';
import Page from 'components/Page';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
  };

  // single vending machine page that shows one vending machine information
class VendingMachine extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
   this.state = {
    columns: [
      {title: 'Name', field: 'name' ,editable:'onAdd'},
      {title: 'Net Sales', field:'sales',type:'numeric',editable: 'never'},
      {title: 'Price', field:'price',type:'numeric'},
      {title: 'Inventory', field: 'inventory', },
      {title: 'Purchase URL', field: 'purchase_url', width: 50 },
      
    ],
    data: [
    ],
    data2:[],
    filted:false,
    modal:false,
    modal2:false,
    vm_data: {
      name:"",
      vm_id:0,
      longitude:0,
      latitude:0,
      sales:0,
      status:'Online'
    },
    
    add_product : {
      token: localStorage.jtwToken,
      email:undefined,
      vm_id:undefined,
      name:"",
      sales:"",
      price:"",
      inventory:"",
      purchase_url:""
    },
    products:{
      token: localStorage.jtwToken,
      email:undefined,
      vm_id:undefined
    },
    update_product:{
      token: localStorage.jtwToken,
      email:undefined,
      vm_id:undefined,
      name:"",
      price:"",
      inventory:"",
      purchase_url:""
    },
    delete_product:{
      token: localStorage.jtwToken,
      email:undefined,
      vm_id:undefined,
      name:""
    },
    price:{
      product:undefined,
      price:undefined,
      url:undefined
    },
    similar:{
      email: undefined,
      vm_id:undefined,
      item:undefined,
      days:7
    },
    url_list:[],
    count:undefined,
      monthly_sale:undefined,
      pre_monthly_sale:undefined,
      monthly_purchase:undefined,
      pre_monthly_purchase:undefined,
      monthly_profit:undefined,
      pre_monethly_profit:undefined,
      weekly_revenue: {
        labels: [0,0,0,0,0,0,0],
        datasets: [
          {
            label: 'Net Sales',
            borderColor: '#6a82fb',
            data: [],
            borderWidth: 1,
            fill:true
          }],},

          pie_sale:{
            datasets: [
              {
                data: [],
                backgroundColor: [
                ],
                label: 'Product Sales',
              },
            ],
            labels: []
          },

        colors:[getColor('primary'),
        getColor('secondary'),
        getColor('success'),
        getColor('info'),
        getColor('danger'),
        getColor('blue'),
        getColor('purple'),
        getColor('pink'),
        getColor('red'),
        getColor('indigo'),
        getColor('orange'),
        getColor('yellow'),
        getColor('green'),
        getColor('teal'),
        getColor('cyan'),
        getColor('white'),
        getColor('gray'),
        getColor('gray-dark'),
        getColor('light'),
        getColor('dark')
      ],
      similar_product:undefined
    }
    this._source = axios.CancelToken.source();
  }


  // function that closes the price modal
  closemodule(){
    document.getElementById('search').hidden = false
    document.getElementById('info').hidden = true
    document.getElementById('similar').hidden = true
    this.toggle()
  }

  // filter function that checks 0 inventory product
  // it also allows update/add/delete operations
  filter(){
    if (this._isMounted) {
    if(this.state.filted){
      this.setState(prevState => {
        var data2 = [...prevState.data2];
        var data = [...prevState.data]
        var filted = prevState.filted
        data = data2
        data2 = []
        filted = false
        return { ...prevState, data2,data,filted}}
        )
    }
    else{
    this.setState(prevState => {
      var data2 = [...prevState.data2];
      var data = [...prevState.data]
      var filted = prevState.filted
      var list = []
      for (var i = 0; i<data.length;i++){
        if(data[i].inventory === 0 || data[i].inventory === '0'){
          list.push(data[i])
        }
      }
      data2 = data
      data = list
      filted = true
      return { ...prevState, data2,filted,data}}
      )}}
  }

  // price modal toggle function
  toggle(){
    var empty={
      product:undefined,
      price:undefined,
      url:undefined
    }
    if (this._isMounted) {
    this.setState({
      modal: !this.state.modal,
      price:empty
  },()=>{
    if(this.state.modal === false){
      this._source.cancel('Operation canceled due to new request.')
      this._source = axios.CancelToken.source();
    }
  })}
  };

  // input error modal toggle function
  toggle2(){
    this.setState(prevState =>{
      var modal2 = prevState.modal2
      modal2 = ! this.state.modal2
      return { ...prevState,modal2}
    })
   }

   // row click event that displays price modal
  clickPrice(data){
    var temp = ""
    for(var i = 0; i < this.state.url_list.length; i++){
      if(this.state.url_list[i].name === data.name){
        temp = this.state.url_list[i].purchase_url
      }
    }
    const url = {
      purchase_url:temp
    }
    if (this._isMounted) {
    this.setState(prevState => {
      var similar = {...prevState.similar};
      similar.email = this.state.products.email
      similar.vm_id = this.state.products.vm_id
      similar.item =data.name
      return { ...prevState, similar }},()=>{
        this.similarHandler()
        this.toggle()
        this.priceHandler(url)}
      )
      }
  }


  // function that reads information from url
  getUrlVars() { 
    var vars = {}; 
    window.location.href.replace(/[?&]+([^=&]+)=([-]*[a-zA-z0-9]*[.]*[a-zA-z0-9]*)/gi, function(m,key,value) { 
       vars[key] = value; 
    })
    return vars; 
  }

  // request checks session
  loginHandler = (e) =>{
    const data = {
      id:localStorage.id,
      email:localStorage.lemail
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/checktoken",data)
     .then(response => {
       if(response.data === 'NO'){
         delete localStorage.id
         delete localStorage.jtwToken
        window.location.href='/?login=false';
       }
       }).catch(error => {console.log(error)})
  }

  // request that gets all product info
  getHandler = (e) =>{
    axios.post("https://vending-insights-smu.firebaseapp.com/vm/getallproduct",this.state.products)
     .then(response => {
      if (this._isMounted) {
        if(response.data !== null){
            var products = response.data
            var product_info = []
            var keys = Object.keys(products)
            var temp = {}
            var temp_list = []
            for(var i = 0; i < keys.length; i++) { 
                var key = (keys[i]) ; 
                var product = products[key]
                temp = {"name":product.name,'purchase_url':product.purchase_url}
                temp_list.push(temp)
                product.purchase_url  = product.purchase_url.substring(0,20)
                product_info.push(product)
            }
            this.setState(prevState => {
                var data = [...prevState.data];
                var url_list = [...prevState.url_list]
                url_list = temp_list
                data = product_info
                return { ...prevState, data,url_list};
              });}}
        }).catch(error => {console.log(error)})
}

// finds similar product based on recent 7 days information
similarHandler = (e) =>{
  axios.post("https://vending-insights-smu.firebaseapp.com/analysis/similar",this.state.similar)
   .then(response => {
    if (this._isMounted) {
     if(response.data.choice !== -1){
       this.setState(prevState => {
        var similar_product = prevState.similar_product;
        similar_product = response.data.products[response.data.choice]
        
        return { ...prevState, similar_product };
      },()=>{
      document.getElementById('similar').hidden = false
    }
      );
     }
     else{
      this.setState(prevState => {
       var similar_product = prevState.similar_product;
       similar_product = "Sorry, we cannot find any similar product."
       
       return { ...prevState, similar_product };
     },()=>{
     document.getElementById('similar').hidden = false
   }
     );
    }}
     
      }
      
      ).catch(error => {console.log(error)})
}

// gets recent 7 days sale 
saleHandler = (e) =>{
  const data = {
    email:this.state.products.email,
    vm_id: this.state.vm_data.vm_id,
    days: 7
  }
  
  axios.post("https://vending-insights-smu.firebaseapp.com/analysis/getsevendaysvmsales",data)
   .then(response => {
    if (this._isMounted) {
          this.setState(prevState => {
            var revenue = {...prevState.weekly_revenue};
            for(var i = 6; i >-1; i--) { 
                var date = response.data.days[i].month +'/'+ response.data.days[i].day
                revenue.labels[i] = date
            }
            revenue.labels = revenue.labels.reverse()
            revenue.datasets[0].data = response.data.sale.reverse()
            return { ...prevState, revenue };

           })}
     }).catch(error => {console.log(error)})
}

// get each product's sale in recent 7 days
pieHandler = (e) =>{
  const data = {
    email:this.state.products.email,
    vm_id: this.state.vm_data.vm_id,
    days: 7
  }
  axios.post("https://vending-insights-smu.firebaseapp.com/vm/pie",data)
   .then(response => {
    if (this._isMounted) {
          this.setState(prevState => {
            var pie = {...prevState.pie_sale};
            var keys = Object.keys(response.data)
            for(var i = 0; i < keys.length; i++) { 
              var key = keys[i]
              pie.labels.push(key)
              pie.datasets[0].data.push(response.data[key])
              pie.datasets[0].backgroundColor.push(this.state.colors[i])

            }
            return { ...prevState, pie };

           })}
      }).catch(error => {console.log(error)})
}

// get monthly information for number widget
infoHandler = (e) =>{
  let today = new Date()

  const info = {
    year: today.getFullYear(),
    month:today.getMonth()+1,
    email: this.state.products.email,
    token:localStorage.jtwToken,
    vm_id: this.state.vm_data.vm_id
  }
  axios.post("https://vending-insights-smu.firebaseapp.com/vm/vminfo2",info)
   .then(response => {
    if (this._isMounted) {
         this.setState({
           count:response.data.count,
           monthly_sale:response.data.total_sale,
             pre_monthly_sale: parseFloat((100*response.data.total_sale/response.data.previous_total_sale).toFixed(2)),
             monthly_purchase: response.data.purchase_count,
             pre_monthly_purchase: parseFloat((100*response.data.purchase_count/response.data.previous_purchase_count).toFixed(2)),
             monthly_profit: response.data.profit,
             pre_monethly_profit:parseFloat((100*response.data.profit/response.data.previous_profit).toFixed(2))
         })
         if(response.data.previous_total_sale === 0 || response.data.previous_total_sale === null){
          this.setState(prevState => {
            var pre_monthly_sale = prevState.pre_monthly_sale;
            pre_monthly_sale = 100
            return { ...prevState, pre_monthly_sale };
          })
         }
         if(response.data.total_sale === null){
          this.setState(prevState => {
            var monthly_sale = prevState.monthly_sale;
            monthly_sale = 0
            return { ...prevState, monthly_sale };
          })
         }
         if(response.data.previous_purchase_count === 0 || response.data.previous_purchase_count === null){
          this.setState(prevState => {
            var pre_monthly_purchase = prevState.pre_monthly_purchase;
            pre_monthly_purchase = 100
            return { ...prevState, pre_monthly_purchase };
          })
         }
         if(response.data.previous_profit === 0 || response.data.previous_profit === null){
          this.setState(prevState => {
            var pre_monethly_profit = prevState.pre_monethly_profit;
            pre_monethly_profit = 100
            return { ...prevState, pre_monethly_profit };
          })
         }}
      }).catch(error => {console.log(error)})
}
// request that gets the price based on url
  priceHandler = (url,e) =>{
    axios.post("https://vending-insights-smu.firebaseapp.com/getprice",url,
    { cancelToken: this._source.token })
    .then(response => {
      if (this._isMounted) {
      if(response.data.msg !== undefined){
        document.getElementById('search').hidden = true
        document.getElementById('error').hidden = false
      }
      else{
        this.setState(prevState => {
              var price = {...prevState.price};
              price.product= response.data.title
              price.price = response.data.price
              price.url = url.purchase_url
              return { ...prevState, price };

             },()=>{
               var s = document.getElementById('search')
               if(s){
                document.getElementById('search').hidden = true
                document.getElementById('info').hidden = false
               }
             })
      }
    }
        }).catch(error => {console.log(error)})
  }

  // add product request
submitHandler = (newData,e) =>{
  axios.post("https://vending-insights-smu.firebaseapp.com/vm/addproduct",this.state.add_product)
   .then(response => {
    if (this._isMounted) {
      this.setState(prevState => {
          const data = [...prevState.data];
          const data2 = [...prevState.data2]
          const url_list = [...prevState.url_list]
          var temp = {"name":newData.name,'purchase_url':newData.purchase_url}
          url_list.push(temp)
          newData.purchase_url  = newData.purchase_url.substring(0,20)
          newData.sales = 0;
          if(this.state.filted === true){
            if(newData.inventory === 0 || newData.inventory === '0'){
              data.push(newData);
            }
            data2.push(newData)
          }
          else{
          data.push(newData);
          }
          return { ...prevState, data,data2,url_list };
        });}
      }).catch(error => {console.log(error)})
}

// update product request
updateHandler = (newData,e) =>{
  axios.post("https://vending-insights-smu.firebaseapp.com/vm/updateproduct",this.state.update_product)
   .then(response => {
    if (this._isMounted) {
    this.setState(prevState => {
      var data = [...prevState.data];
      const data2 = [...prevState.data2]
      const url_list = [...prevState.url_list]
      var temp = newData.purchase_url
      newData.purchase_url = newData.purchase_url.substring(0,20)
      var list = []
      if(this.state.filted === true){
        for(var i =0;i<data.length;i++){
        if(data[i].inventory === 0 || data[i].inventory === '0'){
          list.push(data[i])
        }
      }
        data = list
        for(var j = 0;j<data2.length;j++){
          if(data2[j].name === newData.name){
            data2[j] = newData
          }
          if(url_list[j].name === newData.name){
            url_list[j].purchase_url = temp
          }
        
      }
      }
      return { ...prevState, data,data2,url_list };
    });}
      }).catch(error => {console.log(error.response)})
}

// delete product request
deleteHandler = (newData,e) =>{
  axios.delete("https://vending-insights-smu.firebaseapp.com/vm/deleteproduct",
  {data:this.state.delete_product})
   .then(response => {
      }).catch(error => {console.log(error.response)})
}

  componentWillMount(){
    if(localStorage.jtwToken){
      var code = decode()
      if(!checkExpired(code.exp)){
        window.location.href='/?session=false';
      }
      else{
        var result = this.getUrlVars()
        var temp = {}
        if(result['vm_id'] === undefined && this.props.location.data === undefined){
          window.location.href = '/dashboard'
        }
        else if(result['vm_id'] === undefined){
          temp= this.props.location.data
        }
        else{
          const sample = {
            vm_id: result['vm_id'],
            name:result['name'],
            longitude:result['longitude'],
            latitude:result['latitude'],
            sales:result['sales'],
            status:result['status']
          }
          temp = sample
        }
      this.setState(prevState => {
        var vm_data = {...prevState.vm_data};
        vm_data = temp
        var products = {...prevState.products};
        products.email = code.email
        products.vm_id = temp.vm_id
        var add_product = {...prevState.add_product};
        add_product.email = code.email
        add_product.vm_id = temp.vm_id
        var delete_product = {...prevState.delete_product};
        delete_product.email = code.email
        delete_product.vm_id = temp.vm_id
        var update_product = {...prevState.update_product};
        update_product.email = code.email
        update_product.vm_id = temp.vm_id
        return { ...prevState, vm_data,products,add_product,delete_product,update_product };
      },()=>{
        this.loginHandler()
        this.getHandler()
        this.infoHandler()
        this.saleHandler()
        this.pieHandler()
      });
      }
    }
    else{
      window.location.href='/';
    }
    
    
  }

  componentDidMount() {
    this._isMounted = true;}
    componentWillUnmount() {
      this._isMounted = false;
    }

  render() {
    

    return (
      <MainLayout breakpoint={this.props.breakpoint}> 
      <Page
        className="VendingMachine"
        title="Vending Machine"
      >
          <Row>

          <Col lg={3}>
            <NumberWidget
              title="Toal Products"
              subtitle="Number"
              number= {this.state.count}
              color="secondary"
              progress={{
                value: 100,
                label:"Products"
              }}
            />
          </Col>

          <Col lg={3}>
            <NumberWidget
              title="Monthly Net Sales"
              subtitle="This month"
              number={this.state.monthly_sale}
              color="secondary"
              progress={{
                value: this.state.pre_monthly_sale,
                label: 'Last month',
              }}
            />
          </Col>

          <Col lg={3} >
            <NumberWidget
              title="Monthly Purchases"
              subtitle="This month"
              number={this.state.monthly_purchase}
              color="secondary"
              progress={{
                value: this.state.pre_monthly_purchase,
                label: 'Last month',
              }}
            />
          </Col >
          <Col lg={3} >
          <NumberWidget
              title="Monthly Profits"
              subtitle="This month"
              number={this.state.monthly_profit}
              color="secondary"
              progress={{
                value: this.state.pre_monethly_profit,
                label: 'Last month',
              }}
            />
          </Col>
          </Row>
          <Row>
          <Col lg={6}  md="12" sm="12" xs="12">
        <MaterialTable
      minRows={10}
      icons={tableIcons}
        title="Product List"
        columns={this.state.columns}
        data={this.state.data}
        editable={{
          onRowAdd: newData =>
            new Promise(resolve => {
              setTimeout(() => {
                if (this._isMounted) {
                  var format = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
                  if(format.test(newData.name) || Number(newData.price)<0 || Number(newData.inventory)<0){
                    this.setState(prevState =>{
                      var modal2 = prevState.modal2
                      modal2 = ! this.state.modal2
                      return { ...prevState,modal2}
                    })
                  }
                  else{
                this.setState(prevState => {
                  var add_product = {...prevState.add_product};
                  add_product.name = newData.name
                  add_product.price = newData.price
                  add_product.inventory = newData.inventory
                  add_product.purchase_url = newData.purchase_url
                  return { ...prevState, add_product };
                },()=>{
                  this.submitHandler(newData)
                });}}
                resolve();
              }, 600);
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                if (this._isMounted) {
                  if(Number(newData.price)<0 || Number(newData.inventory)<0){
                      this.setState(prevState =>{
                        var modal2 = prevState.modal2
                        modal2 = ! this.state.modal2
                        return { ...prevState,modal2}
                      })
                    }
                    else{
                if (oldData) {
                  this.setState(prevState => {
                    const data = [...prevState.data];
                    const url_list = [...prevState.url_list]
                    var temp = newData.purchase_url
                    newData.url = newData.purchase_url.substring(0,20)
                    for (var j = 0;j<url_list.length;j++){
                      if(url_list[j].name === newData.name){
                        url_list[j].purchase_url = temp
                      }
                    }
                    data[data.indexOf(oldData)] = newData;
                    var update_product = {...prevState.update_product};
                    update_product.name = newData.name
                    update_product.price = newData.price
                    update_product.inventory = newData.inventory
                    update_product.purchase_url = temp
                    
                    return { ...prevState, data,update_product,url_list };
                  },()=>{this.updateHandler(newData)});
                }}}
              }, 600);
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                if (this._isMounted) {
                this.setState(prevState => {
                  const data = [...prevState.data];
                  data.splice(data.indexOf(oldData), 1);
                  var delete_product = {...prevState.delete_product};
                  delete_product.name = oldData.name
                  const url_list = [...prevState.url_list]
                  for (var j = 0;j<url_list.length;j++){
                    if(url_list[j].name === oldData.name){
                      url_list.splice(j,1)
                    }
                  }
                  return { ...prevState, data ,delete_product,url_list};
                },()=>{this.deleteHandler()});}
              }, 600);
            }),
            
        }}
        actions={[
          {
            icon: tableIcons.Filter,
            tooltip: 'Filter',
            isFreeAction: true,
            onClick: (event) => this.filter()
          }
        ]}
        options={{
            actionsColumnIndex: -1,
            pageSize: 10,
            pageSizeOptions: [5, 10, 20, 30 ,50, 75, 100 ],
            rowStyle: rowData => {
              if(rowData.inventory<=0) {
                return {backgroundColor: '#ffb3b3'};
              }
              
              return {};
            }
          }}
          onRowClick={(event,rowData) => this.clickPrice(rowData)}
          
          />
          </Col>
          
          
        <Col lg={6}  md="12" sm="12" xs="12">
        <Card>
            <CardImg top src={userImage} height = '400'/>
            <CardBody>
            <CardTitle className = "text-center" tag="h4" color="light" size="lg"  id="toggler">{this.state.vm_data.name}</CardTitle>
              <Table borderless>
                <thead>
                  <tr>
                    <th>Vending Machine ID: </th>
                    <td>{this.state.vm_data.vm_id}</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Vending Machine Location: </th>
                    <td>Longitude: {this.state.vm_data.longitude}, Latitude: {this.state.vm_data.latitude}</td>
                  </tr>
                  <tr>
                    <th>Current Net Sales: </th>
                    <td>{this.state.vm_data.sales}</td>
                  </tr>
                  <tr>
                    <th>Vending Machine Status: </th>
                    <td>Online</td>
                  </tr>
                </tbody>
              </Table>
              <CardText>
                <small className="text-muted">Owned by SW Vault</small>
              </CardText>
            </CardBody>
          </Card>
          </Col>

          </Row>
          <Row >
              <Col lg={6}  md="12" sm="12" xs="12">
          <Card>
                <CardHeader>
                    Total Revenue{' '}
                    <small className="text-muted text-capitalize">Recent 7 Days</small>
                </CardHeader>
                <CardBody>
                    <Line data={this.state.weekly_revenue}/>
                </CardBody>
                </Card>          
          </Col>

          <Col lg={6}  md="12" sm="12" xs="12"> 
            <Card>
            <CardHeader>Product Sales{' '}
                    <small className="text-muted text-capitalize">Recent 7 Days</small></CardHeader>
            <CardBody>
              <Pie id = 'pie' data = {this.state.pie_sale} redraw/>
            </CardBody>
          </Card>
            </Col>
            
          </Row>
        </Page>
        <Modal
          isOpen={this.state.modal}
        >
          <ModalHeader>
            <div className="MotalTitle">
              {this.state.vm_data.name}
            </div>
          </ModalHeader>
          <ModalBody>
            <div id='search' hidden={false}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              className='modal-body'>
              Searching&nbsp;
      <Spinner color="primary" />
            </div>
            <div id='info' hidden={true}>
              <div className="attribute">Product Name:</div>   <br />
              <div className="productDescription ">{this.state.price.product}</div>
              <br />
              <br />

              <div className="attribute">Product Price: &nbsp;</div>
              <div className="productContent ">{this.state.price.price}</div>
              <br />
              <br />
              <div className="attribute">Product URL: &nbsp;</div>

              < a className="productContent " href={this.state.price.url} rel="noopener noreferrer" target="_blank">Click Here.</a ><br />

              <br />
            </div>
            <div id = 'error' hidden = {true}>
              Cannot find product price. Please use valid URL
              <br />
            </div>
            <div id='similar' hidden={true}>
              <div className="attribute">Similar Product: &nbsp;</div>
              <div className="productContent ">{this.state.similar_product}</div>

              <br />
            </div>

          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.closemodule()
            }>
              Close
      </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={this.state.modal2}
        >
          <ModalHeader>
            Invalid Input
          </ModalHeader>
          <ModalBody>
           The input is not valid.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => this.toggle2()
            }>
              Close
          </Button>
          </ModalFooter>
        </Modal>
      </MainLayout>
    );
  }
}

export default VendingMachine;