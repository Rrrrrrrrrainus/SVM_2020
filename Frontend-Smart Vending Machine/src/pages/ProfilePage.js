import Page from 'components/Page';
import React from 'react';
import '../styles/components/_form.scss'
import  MainLayout from '../components/Layout/MainLayout'
import {
  Form,
  FormGroup,
  FormText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import Button from '@material-ui/core/Button';

import axios from 'axios'
import Grid from '@material-ui/core/Grid';
import {decode,checkExpired} from '../components/Authendication'
import TextField from '@material-ui/core/TextField';
import default_user from '../assets/img/users/default_user.png'
import FileBase64 from '../components/Tobase64';


// profile page that shows user profile
export default class ProfilePage  extends React.Component{
  _isMounted = false;

  constructor(props) {
    super(props)
  this.state= {
    user:{
      email:undefined,
    username:undefined,
    address:undefined,
    image:undefined
    },
    auth: {
      email:undefined,
      token:localStorage.jtwToken
    },
    modal:false
  };
}

// function that gets base64 and display it on the page
getFiles(files){
  if (this._isMounted) {
  this.setState(prevState => {
          
    var user =  {...prevState.user}
    user.image = files[0].base64
    return { ...prevState,user };                                
  },()=>{
    document.getElementsByClassName('user_image')[0].src = this.state.user.image
  })
}
}

// read email message from token and call requests
  componentWillMount(){
    if(localStorage.jtwToken){
      
      var code = decode()
      this.setState(
        prevState => {
          
          var auth =  {...prevState.auth}
          auth.email = code.email
          return { ...prevState,auth };                                
        },() => {
          this.loginHandler()
          this.getHandler()
      });

      if(!checkExpired(code.exp)){
        window.location.href='/?session=false';
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

  // get user info and image
  getHandler = (e) =>{
    axios.post("https://vending-insights-smu.firebaseapp.com/getimage",this.state.auth)
     .then(response => {
      if (this._isMounted) {
       this.setState(prevState =>{
        var user =  {...prevState.user}
        user.email = response.data.email
        user.address = response.data.address
        user.username = response.data.username
        if(response.data.image !== 'default image'){
        user.image = response.data.image}
        return { ...prevState,user };  
       },()=>{
         document.getElementById('email').value = this.state.user.email
         document.getElementById('companyname').value = this.state.user.username
         if(this.state.user.address !== undefined){
         document.getElementById('companyaddress').value = this.state.user.address}
         
         if(this.state.user.image !== undefined && this.state.user.image !== 0 && this.state.user.image !== "default image"){
          document.getElementsByClassName('user_image')[0].src = this.state.user.image
         }
       })}
        }).catch(error => {console.log(error)})
}

toggle(){
  this.setState(prevState =>{
    var modal = prevState.modal
    modal = ! this.state.modal
    return { ...prevState,modal}
  },()=>{
    window.location.href='/dashboard';
  })
 }

// check session
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

// request that updates user account infor and image
updateHandler = (e) =>{
  const update = {
    email: this.state.auth.email,
    token:this.state.auth.token,
    username: this.state.user.username,
    address:this.state.user.address,
    image:this.state.user.image
  }
  if(update.image === undefined){
    update.image = 0
  }
  axios.post("https://vending-insights-smu.firebaseapp.com/updateuser",update)
   .then(response => {
    this.setState(prevState =>{
      var modal = prevState.modal
      modal = ! this.state.modal
      return { ...prevState,modal}
    })
      }).catch(error => {console.log(error)})
}

// input changehandler
 changeHandler = (e) => {
  if (this._isMounted) {
  const name = e.target.name;
  const value = e.target.value;
  
  this.setState(prevState =>{
    var user =  {...prevState.user}
    user[name] = value
    return { ...prevState,user };  
   })}
}

  render(){
  return (
<MainLayout>
    <Page>
      <div className = "maye">
        <div className = "text-center">
          <img className = 'user_image' src= {default_user} alt = "pic"/>
        </div>

        <div className = "Name2 text-center">
  {this.state.user.username}<br/>
        </div>
        <div className = "description">
        
        <hr/>
        <Form>
        <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                autoComplete="email"
                name="email"
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
                className = 'textfield'
                autoFocus
                disabled
                margin="normal"
                InputLabelProps= {{ shrink:true}}
                onChange = {this.changeHandler}
              />
            </Grid>
            <Grid item xs={12} >
              <TextField
                autoComplete="companyname"
                name="username"
                variant="outlined"
                required
                fullWidth
                id="companyname"
                label="Company Name"
                className = 'textfield'
                InputLabelProps= {{ shrink:true}}
                autoFocus
                onChange = {this.changeHandler}
              />
            </Grid>
            <Grid item xs={12} >
              <TextField
                autoComplete="companyaddress"
                name="address"
                variant="outlined"
                required
                fullWidth
                id="companyaddress"
               label="Company Address"
                className = 'textfield'
                InputLabelProps= {{ shrink:true}}
                autoFocus
                onChange = {this.changeHandler}
              />
            </Grid>
            </Grid>
            <br/>
            <Grid item xs={12} >
              <FormGroup>
                  <Label for="exampleFile">New Image</Label>
                  <div></div>
                  <FileBase64
                  // call filebase64 function and load image file
                  multiple={ true }
                  onDone={ this.getFiles.bind(this) } />
                  <FormText color="muted">
                    Only valid image formats are accepted.
                  </FormText>
                </FormGroup>
            </Grid>
        </Form>
        <Button 
        fullWidth
        color = 'primary'
        variant="contained"
        disabled = {this.state.user.username === "" ||this.state.user.username === undefined
      || this.state.user.address === ""|| this.state.user.address === undefined}
        onClick = {()=>this.updateHandler()}>Submit</Button>

        </div>

      <br/>
      <br/>
      </div>
      <Modal
          isOpen={this.state.modal}
        >
          <ModalBody>
           Update Successful!
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.toggle()
            }>
              Close
          </Button>
          </ModalFooter>
        </Modal>
    </Page>
    </MainLayout>
  );
  }
};

