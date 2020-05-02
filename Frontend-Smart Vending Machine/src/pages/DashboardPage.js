import Page from 'components/Page';
import { NumberWidget } from 'components/Widget';
import MapContainer from 'components/Maps/Maps'
import { getColor } from 'utils/colors';
import axios from 'axios'
import React from 'react';
import  MainLayout from '../components/Layout/MainLayout'
import { Line,Bar } from 'react-chartjs-2';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
} from 'reactstrap';
import {decode,checkExpired} from '../components/Authendication'


// main dashboard page
class DashboardPage extends React.Component {
  _isMounted = false;
  constructor(props){
    // defines monthly data and graph data
    super(props);
    this.state={
      year: undefined,
      month:undefined,
      email: undefined,
      token:localStorage.jtwToken,
      count:undefined,
      non_count:undefined,
      monthly_sale:undefined,
      pre_monthly_sale:undefined,
      monthly_purchase:undefined,
      pre_monthly_purchase:undefined,
      monthly_profit:undefined,
      pre_monethly_profit:undefined,
      bar_data:{labels: ['January','February','March','April','May','June','July','August','September',
    'October','November','December'],
      datasets: [
        {
          label: 'Annual Net Sales',
          backgroundColor: getColor('primary'),
        borderColor: getColor('primary'),
        borderWidth: 1,
          data: [0,0,0,0,0,0,0,0,0,0,0,0],
          
        }]
    },
    profit_data: {
      labels: ['January','February','March','April','May','June','July','August','September',
    'October','November','December'],
      datasets: [
        {
          label: 'Net Profits',
          borderColor: getColor('red'),
          backgroundColor: getColor('red'),
          data: [0,0,0,0,0,0,0,0,0,0,0,0],
          borderWidth: 1,
          fill:true
        }],},
    weekly_revenue: {
      labels: [0,0,0,0,0,0,0],
      datasets: [
        {
          label: 'Net Sales',
          borderColor: '#6a82fb',
          backgroundColor: getColor('purple'),
          data: [0,0,0,0,0,0,0],
          borderWidth: 1,
          fill:false
        }],},
  }
}
  componentDidMount() {
    this._isMounted = true;
    window.scrollTo(0, 0);
  }

  // when loading the page, check session, then call all requests
  componentWillMount(){
    if(localStorage.jtwToken){
      var code = decode()
      if(!checkExpired(code.exp)){
        window.location.href='/?session=false';
      }
      else{
        let today = new Date()
        this.setState({
          year:today.getFullYear(),
          month:today.getMonth()+1,
          email:code.email,
        },()=>{
          this.loginHandler()
            this.getHandler()
            this.saleHandler()
            this.barHandler()
            this.profitHandler()
        })
        
      }
    }
    else{
      window.location.href='/';
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // request that returns seven days company sale
  saleHandler = (e) =>{
    const data = {
      email:this.state.email
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/analysis/recentsevendayscompanysale",data)
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

  // request that returns company annual sale 
  barHandler = (e) =>{
    const data = {
      email:this.state.email,
      year: 2020
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/analysis/recentsevendayscompanymonthsale",data)
     .then(response => {
      if (this._isMounted) {
            this.setState(prevState => {
              var bar = {...prevState.bar_data};
              bar.datasets[0].data = response.data.sale
              return { ...prevState, bar };
  
             })}
       }).catch(error => {console.log(error)})
  }

  // request that returns company annual profit
  profitHandler = (e) =>{
    const data = {
      email:this.state.email,
      year: '2020'
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/analysis/getyearprofitbyuser",data)
     .then(response => {
      if (this._isMounted) {
            this.setState(prevState => {
              var profit = {...prevState.profit_data};
              profit.datasets[0].data = response.data
              return { ...prevState, profit };
  
             })}
       }).catch(error => {console.log(error)})
  }

  // request that checks session
  loginHandler = (e) =>{
    const data = {
      id:localStorage.id,
      email:localStorage.lemail
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/checktoken",data,{
      headers: {
        'Access-Control-Allow-Origin': '*'
      }})
     .then(response => {
       if(response.data === 'NO'){
         delete localStorage.id
         delete localStorage.jtwToken
        window.location.href='/?login=false';
       }
       }).catch(error => {console.log(error)})
  }

  // request that returns monthly data 
  getHandler = (e) =>{
    
    const info = {
      year: this.state.year,
      month:this.state.month,
      email: this.state.email,
      token:localStorage.jtwToken
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/vm/vminfo",info)
     .then(response => {
      if (this._isMounted) {
           this.setState({
             
             count:response.data.count,
             non_count:100,
             monthly_sale:response.data.total_sale,
             pre_monthly_sale: parseFloat((100*response.data.total_sale/response.data.previous_total_sale).toFixed(2)),
             monthly_purchase: response.data.purchase_count,
             pre_monthly_purchase: parseFloat((100*response.data.purchase_count/response.data.previous_purchase_count).toFixed(2)),
             monthly_profit: response.data.profit,
             pre_monethly_profit:parseFloat((100*response.data.profit/response.data.previous_profit).toFixed(2))
           })
           // if the data returns as 0 or null, handles it to be properly displayed
           if(response.data.count === 0 || response.data.count === null){
            this.setState(prevState => {
              var non_count = prevState.non_count;
              non_count = 100
              return { ...prevState, non_count };
            })
           }
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


  render() {

    return (
      <MainLayout breakpoint={this.props.breakpoint}> 
      <Page
        className="DashboardPage"
        title="Dashboard"
        breadcrumbs={[{ name: 'Dashboard', active: true }]}
      >
        <Row>
          <Col lg={3} md={6} sm={6} xs={12}>
            <NumberWidget
            // number widget component that shows a monthly data
              title="Total Vending Machines"
              number={this.state.count}
              color="secondary"
              progress={{
                value: this.state.non_count,
                label: 'Active',
              }}
            />
          </Col>

          <Col lg={3} md={6} sm={6} xs={12}>
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

          <Col lg={3} md={6} sm={6} xs={12}>
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
          </Col>

          <Col lg={3} md={6} sm={6} xs={12}>
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
        <Col lg="7" md="12" sm="12" xs="12" >
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
          
          <Col lg="5" md="12" sm="12" xs="12" > 
            <MapContainer
            // call map class to show Google map API
            ></MapContainer>
          </Col>

          
        </Row>
        <Row>
        <Col xl={6} lg={12} md={12}>
          <Card>
            <CardHeader>Annual Net Sales</CardHeader>
            <CardBody>
              <Bar data = {this.state.bar_data}/>
            </CardBody>
          </Card>
        </Col>
        <Col xl={6} lg={12} md={12}>
          <Card>
            <CardHeader>Annual Profits</CardHeader>
            <CardBody>
              <Bar data = {this.state.profit_data}/>
            </CardBody>
          </Card>
        </Col>
        </Row>

      </Page>
      </MainLayout>
    );
  }
}
export default DashboardPage;
