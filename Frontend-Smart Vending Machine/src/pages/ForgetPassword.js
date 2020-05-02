import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios'

function Copyright() {
  return (
    // regturn SW Vault copy right
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
        SW Vault{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// set up styles
const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));



// forget password page that allows user to get a new password
export default function ForgetPassword(){

  // set up values for axios requests
  const [state, setState] = React.useState({
    email:""
  })

  const [pins, setPin] = React.useState({
        email:"",
        pin:"",
        password:"",
        cpassword:""
  })


  const [error, setError] = React.useState({
    email_error:"",
    password_error:"",
    cpassword_error:"",
    pin_error:"",
    piniserror:false,
    emailiserror:false,
    cpassiserror:false,
    passiserror:false
  })

  // change handler that handles input change
    const changeHandler = (e) => {
      setState({...state, [e.target.name]: e.target.value})
      setPin({...pins, [e.target.name]: e.target.value})
      }
      const pinHandler = (e) => {
        setPin({...pins, [e.target.name]: e.target.value})
        const name = e.target.name;
        const value = e.target.value;
        validation(name,value)
      }

      // validation function that checks input validation
      const validation = (name, value)=>{
        if(name === 'password'){
          if(value.length === 0){
            setError(prevState => {
              var password_error = prevState.password_error;
              var passiserror = prevState.passiserror;
              password_error = ""
              passiserror = false
              return { ...prevState, password_error,passiserror };
            });
              if(error.cpassiserror){
                setError(prevState => {
                  var cpassword_error = prevState.cpassword_error;
                  var cpassiserror = prevState.cpassiserror;
                  cpassword_error = ""
                  cpassiserror = false
                  return { ...prevState, cpassword_error,cpassiserror };
                });
              }
          }
          else if(value.length > 15 || value.length < 8){
            setError(prevState => {
              var password_error = prevState.password_error;
              var passiserror = prevState.passiserror;
              password_error = "Your password length should between 8 and 15"
              passiserror = true
              return { ...prevState, password_error,passiserror };
            });
              if(!(value === pins.cpassword) && (pins.cpassword !== "")){
                setError(prevState => {
                  var cpassword_error = prevState.cpassword_error;
                  var cpassiserror = prevState.cpassiserror;
                  cpassword_error = "Your input doesn't match your previous password"
                  cpassiserror = true
                  return { ...prevState, cpassword_error,cpassiserror };
                });
              }
              else {
                setError(prevState => {
                  var cpassword_error = prevState.cpassword_error;
                  var cpassiserror = prevState.cpassiserror;
                  cpassword_error = ""
                  cpassiserror = false
                  return { ...prevState, cpassword_error,cpassiserror };
                });
              }
          }
          else{
            setError(prevState => {
              var password_error = prevState.password_error;
              var passiserror = prevState.passiserror;
              password_error = ""
              passiserror = false
              return { ...prevState, password_error,passiserror };
            });
              if(!(value === pins.cpassword) && (pins.cpassword !== "")){
                setError(prevState => {
                  var cpassword_error = prevState.cpassword_error;
                  var cpassiserror = prevState.cpassiserror;
                  cpassword_error = "Your input doesn't match your previous password"
                  cpassiserror = true
                  return { ...prevState, cpassword_error,cpassiserror };
                });
              }
              else {
                setError(prevState => {
                  var cpassword_error = prevState.cpassword_error;
                  var cpassiserror = prevState.cpassiserror;
                  cpassword_error = ""
                  cpassiserror = false
                  return { ...prevState, cpassword_error,cpassiserror };
                });
              }
          }
        }
        if(name === 'cpassword'){
    
          if(value.length === 0){
            setError(prevState => {
              var cpassword_error = prevState.cpassword_error;
              var cpassiserror = prevState.cpassiserror;
              cpassword_error = ""
              cpassiserror = false
              return { ...prevState, cpassword_error,cpassiserror };
            });
          }
          else if(!(value === pins.password)  && (pins.password !== "")){
            setError(prevState => {
              var cpassword_error = prevState.cpassword_error;
              var cpassiserror = prevState.cpassiserror;
              cpassword_error = "Your input doesn't match your previous password"
              cpassiserror = true
              return { ...prevState, cpassword_error,cpassiserror };
            });
          }
          else{
            setError(prevState => {
              var cpassword_error = prevState.cpassword_error;
              var cpassiserror = prevState.cpassiserror;
              cpassword_error = ""
              cpassiserror = false
              return { ...prevState, cpassword_error,cpassiserror };
            });
          }
      }
      }

      // request that checks if the email is existing in the database
      const checkHandler = (e) =>{
        console.log(state)
        axios.post("https://vending-insights-smu.firebaseapp.com/check",state)
         .then(response => {
                if(response.data.status ===  "NO"){
                  setError(prevState => {
                    var email_error = prevState.email_error;
                    var emailiserror = prevState.emailiserror;
                    email_error = "The email you input doesn't exist."
                    emailiserror = true
                    return { ...prevState, email_error,emailiserror };
                  });
                }
                else if (error.emailiserror){
                  setError(prevState => {
                    var email_error = prevState.email_error;
                    var emailiserror = prevState.emailiserror;
                    email_error = ""
                    emailiserror = false
                    return { ...prevState, email_error,emailiserror };
                    
                  });
                  sendHandler()
                }
                else{
                  sendHandler()
                }
            }).catch(error => {console.log(error)})
    }

    // once the email exists, show hidden pin fields and call request that sends change code to the email
    const sendHandler = (e) =>{

        console.log(state)
        document.getElementsByClassName("pinfield")[0].hidden = false;
        document.getElementsByClassName("pinfield")[1].hidden = false;
        document.getElementsByClassName("pinfield")[2].hidden = false;
        document.getElementById("emailb").hidden= true;
        document.getElementById("email").disabled= true;
        document.getElementById("submitb").hidden= false;
        axios.post("https://vending-insights-smu.firebaseapp.com/sendEmail",state)
         .then(response => {
                console.log(response)
            }).catch(error => {console.log(error)})
    }

    // request that setup new password
    const submitHandler = (e) =>{
      const request = {
        email: pins.email,
        pin:pins.pin,
        password: pins.password
      }

        axios.post("https://vending-insights-smu.firebaseapp.com/changePassword",request)
         .then(response => {
           console.log(response)
            if(response.data.status === 'NO'){
              setError(prevState => {
                var pin_error = prevState.pin_error;
                var piniserror = prevState.piniserror;
                pin_error = "Your pin is incorrect."
                piniserror = true
                return { ...prevState, pin_error,piniserror };
              });
            }
            else{
            window.location.href = '/';
            }
            }).catch(error => {console.log(error)})
    }
  const classes = useStyles();


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Enter Your Email Address
        </Typography>
        <form className={classes.form} noValidate 
            >
          <Grid container spacing={2}>
            
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Please Enter Your Email Address"
                name="email"
                autoComplete="email"
                error ={error.emailiserror}
              helperText = {error.email_error}
                onChange= {changeHandler}
              />
            </Grid>
            <Grid item xs={12} className = 'pinfield' hidden={true} >
              <TextField
                autoComplete="cname"
                name="pin"
                variant="outlined"
                required
                fullWidth
                id="pin"
                label="Enter Your PIN"
                autoFocus
                error ={error.piniserror}
              helperText = {error.pin_error}
                onChange= {pinHandler}
              />
            </Grid>
            <Grid item xs={12} className = 'pinfield' hidden={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="password"
                error ={error.passiserror}
              helperText = {error.password_error}
                onChange= {pinHandler}
              />
            </Grid>
            <Grid item xs={12} className = 'pinfield' hidden={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="cpassword"
                label="Comfirm New Password"
                type="password"
                id="changePassword"
                error ={error.cpassiserror}
              helperText = {error.cpassword_error}
              onChange= {pinHandler}
              />
            </Grid>
          </Grid>
          <Button
          onClick = {checkHandler}
            fullWidth
            color = 'secondary'
            variant="contained"
            id = "emailb"
            className={classes.submit}
            hidden = {false}
          >
            Send to Email
          </Button>
          <Button
          onClick = {submitHandler}
            fullWidth
            color = 'secondary'
            variant="contained"
            id = "submitb"
            className={classes.submit}
            disabled = {pins.pin === ""||pins.password === ""||pins.cpassword ===""|| error.passiserror
          ||error.cpassiserror}
            hidden = {true}
          >
            Submit
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="\" variant="body2">
                Back to Login Page
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}