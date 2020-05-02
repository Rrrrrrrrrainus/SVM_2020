
import jwt from 'jsonwebtoken'

// defone the jwt token
export function decode(){
    var code = jwt.decode(localStorage.jtwToken)
    return code
}

// check if the token is expired
export function checkExpired(exp){
    var dateNow = new Date();
    if(exp < (dateNow.getTime()/1000)){
        delete localStorage.jtwToken
        delete localStorage.auth
        return false
    }
    else{
        return true
    }
    
}