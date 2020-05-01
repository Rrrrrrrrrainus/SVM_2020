import React from 'react';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Container from 'react-bootstrap/Container';

// import DatePicker from "react-datepicker";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Label,
  Input,
  Button,
  Form,
  FormGroup,
} from 'reactstrap';

import Page from 'components/Page';

// var email = 'jinxund@smu.edu'
// var vm_id = 46

class Simulator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // item: '',
      // amount: 1,
      // price: 1.5,
      // email: 'jinxund@smu.edu',
      // id: 1,
      // amount: 10,
      // date: Date.now(),

      item: '',
      amount: 1,
      unit_price: 0,
      vm_id: 1,
      // yuc@smu.edu
      email: 'yuc@smu.edu',
      total_price: 0,
      restock_price: 1,
      restock_total_price: 0,

      vm_id_array:[],

      date: '',

      year: 2020,
      month: 3,
      day: 1,

      allvm: '',

      // orderInfo:{
      //     orderItem: '',
      //     orderAmount: 1,
      //     price: 3,
      // },

      itemArray: [
          {
              id: 1,
              item: "Coke-testing", 
              price: 2
          }
      ],

    }
  }

  dateChangeHandler = (event) => {
    var date = event.target.value;
    var list = date.split("-");
    this.setState({ 
      date: date,
      year: list[0],
      month: list[1],
      day: list[2]
    });
    console.log(this.state);
  }
  onSubmitId = () =>{
    var allvm;
    axios.post('https://vending-insights-smu.firebaseapp.com/vm/getallvm',{
      email: this.state.email
    })
    .then(response=>{
      if(response.data !== null){
        allvm = response.data
      }else{
        console.log('fail to get all vm datas')
      }
    })
    .then(()=>{
      this.setState({
        vm_id_array: Object.keys(allvm),
        allvm: allvm
      })
      
      console.log(allvm)
      console.log(this.state)
    }).then(()=>{
      // var vm_id_list = Object.keys(this.state.allvm)
      // // var 
      // this.setState({

      // })
    })
  }

  emailChangeHandler = (event) =>{
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  itemChangeHandler = (event) =>{
    this.setState({
      [event.target.name]: event.target.value,
    }, ()=>{
      this.setState({
        unit_price: this.state.allvm[this.state.vm_id]['products'][this.state.item]['price'],
      }, ()=>{
        this.setState({
          total_price: this.state.amount * this.state.unit_price
        })
      })
    });
  }

  amountChangeHandler = (event) =>{
    this.setState({
      [event.target.name]: event.target.value,
    }, ()=>{
      this.setState({
        total_price: this.state.amount * this.state.unit_price,
        restock_total_price: this.state.amount * this.state.restock_price
      })
    });
  }

  /**
   * 
   * we need a json to store
   * {
   *  item: 'Coke',
   *  price: 3,
   * }
   * 
   * */ 
  vmidChangeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    }, ()=>{
      // when vm_id change, the product list also change
      var product_list = Object.keys(this.state.allvm[event.target.value]['products']);
      var item_array = [];
      for(var i=0; i<product_list.length; i++){
        item_array.push({
          id: product_list[i],
          item: product_list[i],
          unit_price: this.state.allvm[event.target.value]['products'][product_list[i]]['price'],
        })
      }
      this.setState({
        itemArray: item_array
      })
    });
  }

  restockPriceChangeHandler = (event) =>{
    this.setState({
      [event.target.name]: event.target.value,
    }, ()=>{
      this.setState({
        restock_total_price: this.state.amount * this.state.restock_price
      })
    });
    
    console.log(this.state.restock_price);
  }

  restockTotalPriceChangeHandler = (event) =>{
    this.setState({
      [event.target.name]: event.target.value,
    });
    console.log(this.state.restock_total_price);
  }


  confirmPurchase = () => {
    console.log(this.state.item)
    console.log(this.state.amount)

    axios.post('https://vending-insights-smu.firebaseapp.com/vm/updatetransaction', this.state)
      .then(response => {
        if (response.data === 'update success') {
          alert('purchase done!')
        } else {
          alert('fail to purchase!')
        }
      });
    
  }
  
  confirmRestock = () => {
    console.log(this.state.item)
    console.log(this.state.amount)

    axios.post('https://vending-insights-smu.firebaseapp.com/vm/getstock', this.state)
      .then(response => {
        if (response.data === 'restock success') {
          alert('restock success!');
        } else {
          alert('restock fail!');
        }
      });

    // axios.post('https://vending-insights-smu.firebaseapp.com/vm/updatetransaction', this.state)
    //   .then(response => {
    //     if (response.data == 'update success') {
    //       alert('purchase done!')
    //     } else {
    //       alert('fail to purchase!')
    //     }
    //   });
    
  }

  render() {
    return (
      <Container>
      <Page title="Simulator">
        {/* <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>hello</Col>
        </Row> */}
        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Email</CardHeader>
              <CardBody>
                <TextField
                  id="half-width-text-field"
                  placeholder='xxx@smu.edu'
                  margin="normal"
                  fullWidth
                  name='email'
                  // value='yuc@smu.edu'
                  onChange={this.emailChangeHandler}
                  
                />
                <Button
                  fullwidth="true"
                  variant="contained"
                  color="primary"
                  onClick={this.onSubmitId}
                >
                  submit
              </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Vending Machine ID</CardHeader>
              <CardBody>
                <FormControl>
                  <InputLabel id="demo-simple-select-label">id</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name='vm_id'
                    value={this.state.vm_id}
                    onChange={this.vmidChangeHandler}>
                    {/* <MenuItem value={'1'}>id</MenuItem> */}
                    {
                      this.state.vm_id_array.map((row, index)=>{
                      return(
                        <MenuItem key={row} value={row}>{row}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Vending Machine Item</CardHeader>
              <CardBody>
                <FormControl>
                  <InputLabel id="demo-simple-select-label">Item</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    onChange={this.itemChangeHandler}
                    value={this.state.item}
                    name='item'>
                    {
                      this.state.itemArray.map((row, index)=>{
                      return(
                        <MenuItem key={row.id} value={row.item}>{row.item}</MenuItem>
                        )
                      })
                    }
                    
                  </Select>
                  <TextField 
                    id="standard-required-1" 
                    label="unit_price" 
                    value={this.state.unit_price}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="filled"
                    />
                  
                  <TextField 
                    id="standard-required-2" 
                    label="restock_price" 
                    name="restock_price"
                    type="number"
                    onChange={this.restockPriceChangeHandler}
                    // variant="filled"
                    />
                </FormControl>
                
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Product Amount</CardHeader>
              <CardBody>
                <TextField
                  // id="half-width-text-field"
                  placeholder={''+this.state.amount}
                  margin="normal"
                  name="amount"
                  value={this.state.amount}
                  onChange={this.amountChangeHandler}
                  
                  type="number"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Total price</CardHeader>
              <CardBody>
                <TextField 
                    id="standard-required-2" 
                    label="total_price"
                    value={this.state.total_price}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="filled"
                />
                
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Restock Total price</CardHeader>
              <CardBody>
                <TextField 
                    id="standard-required-2" 
                    label="restock_total_price"
                    value={this.state.restock_total_price}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="filled"
                />
                
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>Date</CardHeader>
              <CardBody>
                <Form>
                  <FormGroup>

                    <Label for="date">DateTime</Label>
                    <Input
                      type="date"
                      name="date"
                      id='dt'
                      value={this.state.date}
                      placeholder="datetime placeholder"
                      onChange={this.dateChangeHandler} />
                  </FormGroup>
                </Form>
                <Button
                  fullwidth="true"
                  variant="contained"
                  color="primary"
                  onClick={this.confirmPurchase}
                >
                  Place Order
                 </Button>
                 <Button
                  fullwidth="true"
                  variant="contained"
                  color="secondary"
                  onClick={this.confirmRestock}
                >
                  Restock
                 </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        

      </Page>
      </Container>
    );
  }
}

export default Simulator;

