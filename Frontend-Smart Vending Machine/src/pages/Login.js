import React,{useEffect} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Image from '../assets/img/bg/img2.jpeg';
import axios from 'axios';
import {decode,checkExpired} from '../components/Authendication'

function Copyright() {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
          SW Vault{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }

const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url(${Image})`,
    backgroundRepeat: 'repeat',
    backgroundColor:
      theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

// defines function that reads values from url
function getUrlVars() { 
  var vars = {}; 
  window.location.href.replace(/[?&]+([^=&]+)=([-]*[a-zA-z0-9]*[.]*[a-zA-z0-9]*)/gi, function(m,key,value) { 
     vars[key] = value; 
  })
  return vars; 
}

// login page that allows user to login account
export default function SignInSide() {
  const classes = useStyles();

const [user,setUser]  = React.useState({
  email:undefined,
    password:""
});

  const [state,setState]  = React.useState({
    data:false,
    check:false,
    login:false,
    change:false
  });

  const [error,setError]  = React.useState({
    email_error:"",
    emailiserror:false,
    password_error:"",
    passiserror:false
  });

  // user input change handler
    const changeHandler = (e) => {
      setUser({...user, [e.target.name]: e.target.value})

    }
// check box change handler
    function checkHandler(event, isChecked, value){
      setState(prevState => {
        var check = prevState.check;
        var change = prevState.change
        change = true
        check = isChecked
        return { ...prevState, check,change};
      }
      )
    }

    // request that sends login info and directs to main dashboard
    // it will also check input validation before sending the request
    const submitHandler = (e) =>{
      if(user.email === ""){
        setError(prevState => {
          var email_error = prevState.email_error;
          var emailiserror = prevState.emailiserror;
          email_error = "Your email address cannot be empty"
          emailiserror = true
          return { ...prevState, email_error,emailiserror };
        });
      }
      if(user.password === ""){
        setError(prevState => {
          var password_error = prevState.password_error;
          var passiserror = prevState.passiserror;
          password_error = "Your password cannot be empty"
          passiserror = true
          return { ...prevState, password_error,passiserror };
        });
      }
      if(error.emailiserror && user.email !== ""){
        setError(prevState => {
          var email_error = prevState.email_error;
          var emailiserror = prevState.emailiserror;
          email_error = ""
          emailiserror = false
          return { ...prevState, email_error,emailiserror };
        });
      }
      if(error.passiserror&& user.password !== ""){
        setError(prevState => {
          var password_error = prevState.password_error;
          var passiserror = prevState.passiserror;
          password_error = ""
          passiserror = false
          return { ...prevState, password_error,passiserror };
        });
      }
      if(user.email !== "" && user.password !== ""){
        axios.post("https://vending-insights-smu.firebaseapp.com/login",user)
        .then(response => {
                if(response.data !== 'no'){
                    localStorage.setItem('jtwToken',response.data.token)
                    localStorage.setItem('auth',response.data.auth)
                    localStorage.setItem('id',response.data.id)
                    localStorage.setItem('lemail',user.email)
                    if(state.check){
                      localStorage.setItem('email',user.email)
                    }
                    else{
                      if(localStorage.email){
                        delete localStorage.email}
                    }
                    window.location.href = '/dashboard';
                    
                }
                else{
                  setError(prevState => {
                    var password_error = prevState.password_error;
                    var passiserror = prevState.passiserror;
                    password_error = "Your input information doesn't match, try again "
                    passiserror = true
                    return { ...prevState, password_error,passiserror };
                  });
                     
                }

            }).catch(error => {console.log(error)})
    }
  }

  // check session token, if there is a token, redirect to dashboard without login
    useEffect(() => {
      if(localStorage.email){
        if(user.email === undefined){
          document.getElementById('email').value = localStorage.email
        setUser({...user, email:localStorage.email})
        }
        if(state.change === false){
        setState({
          check:true
        })}
        
      }
      if(localStorage.jtwToken){
        var code = decode()
        if(checkExpired(code.exp)){
          window.location.href='/dashboard';
        }
        
      }
    },[state.check,user,state.change]);

    // function that checks url info
    // it will display expired session or login on another device message
    function checkSession(){
      var result = getUrlVars();
      if(result['session']){
        if(!state.data){
          setState(prevState => {
            var data = prevState.data;
            data = true
            return { ...prevState, data};
          }
          )
      }
      }
      if(result['login']){
        if(!state.login){
          setState(prevState => {
            var login = prevState.login;
            login = true
            return { ...prevState, login};
          }
          )
      }
      }
    }
  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <div hidden = {!state.data}>{checkSession()}You session is lost. Try to login again.</div>
          <div hidden = {!state.login}>{checkSession()}Your account was logged in on another device</div>
          <form className={classes.form} noValidate 
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              error ={error.emailiserror}
              helperText = {error.email_error}
              onChange= {changeHandler}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error ={error.passiserror}
                helperText = {error.password_error}
              onChange= {changeHandler}
            /><div>
            <span className='error' hidden={true} align='left' color='red'>{error.errormsg}</span></div>
            <FormControlLabel
              control={<Checkbox checked={state.check} id ='check' color="primary" onChange = {checkHandler} />}
              label="Remember me" 
            />
            <Button
            onClick = {submitHandler}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs >
                <Link href="\check_email" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="\signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}