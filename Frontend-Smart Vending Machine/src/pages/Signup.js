import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios'


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



// signup page that allows user to create a new account
export default function SignUp(){
  const [state, setState] = React.useState({
        name:"",
        password:"",
        email:"",
        cpassword:""
  })

    const [error, setError] = React.useState({
      email_error:"",
      password_error:"",
      cpassword_error:"",
      emailiserror:false,
      cpassiserror:false,
      passiserror:false
    })

    // change handler for inputs
    const changeHandler = (e) => {
      setState({...state, [e.target.name]: e.target.value})
        const name = e.target.name;
        const value = e.target.value;
        validation(name,value)
      }

    // check input validation
    const validation = (name, value)=>{
      if(name === 'email'){
        if(value.length === 0){
          setError(prevState => {
            var email_error = prevState.email_error;
            var emailiserror = prevState.emailiserror;
            email_error = ""
            emailiserror = false
            return { ...prevState, email_error,emailiserror };
          });
        }
        else if(! value.match(/[a-zA-Z0-9.-]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}/)){
          setError(prevState => {
            var email_error = prevState.email_error;
            var emailiserror = prevState.emailiserror;
            email_error = "invalid email type"
            emailiserror = true
            return { ...prevState, email_error,emailiserror };
          });
        }
        else{
          setError(prevState => {
            var email_error = prevState.email_error;
            var emailiserror = prevState.emailiserror;
            email_error = ""
            emailiserror = false
            return { ...prevState, email_error,emailiserror };
          });
        }
     }
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
          if(!(value === state.cpassword) && (state.cpassword !== "")){
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
          if(!(value === state.cpassword) && (state.cpassword !== "")){
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
    else if(!(value === state.password)  && (state.password !== "")){
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

    // request for signup, and redirects to login page
    const submitHandler = (e) =>{
        const variable = {
          name: state.name,
          email:state.email,
          password:state.password
        }
        axios.post("https://vending-insights-smu.firebaseapp.com/signup",variable)
         .then(response => {
           console.log(response)
                if(response.data === 'ok'){
                  window.location.href = '/';
                }
            }).catch(error => {console.log(error)})
    }
  const classes = useStyles();


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} noValidate 
            >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                autoComplete="cname"
                name="name"
                variant="outlined"
                required
                fullWidth
                id="companyName"
                label="Company Name"
                autoFocus
                onChange= {changeHandler}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error ={error.emailiserror}
                helperText = {error.email_error}
                onChange= {changeHandler}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="password"
                error ={error.passiserror}
                helperText = {error.password_error}
                onChange= {changeHandler}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="cpassword"
                label="Comfirm Password"
                type="password"
                id="cpassword"
                error ={error.cpassiserror}
                helperText = {error.cpassword_error}
                onChange= {changeHandler}
                autoComplete="current-password"
              />
            </Grid>
          </Grid>
          <Button
          onClick = {submitHandler}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled = {error.emailiserror || error.passiserror || error.cpassiserror ||
            state.name === "" || state.email === "" || state.password === "" || state.cpassword === ""}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="\" variant="body2">
                Already have an account? Sign in
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