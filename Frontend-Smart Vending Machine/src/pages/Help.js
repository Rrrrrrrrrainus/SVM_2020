import React from 'react';
import  MainLayout from '../components/Layout/MainLayout'
import FAQ from '../components/FAQ'
import '../styles/components/_faq.scss'
import axios from 'axios'
import {decode,checkExpired} from '../components/Authendication'


// FAQ page that shows general FAQ questions
class Help extends React.Component {
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

    constructor(props) {
      super(props);
      // define general questions
      this.state= {
          faq:[
            {question:"What is our business value?",
            answer:"There are various vending machine companies that equip office buildings, schools, etc. in various cities and states across the United States .In order to check the inventory of the vending machines, a person must physically visit the location with products that may/may not be needed to restock the machines.  This web app is to provide remove vending analytics and order management for a company to reduce manual costs and improve inventory management while providing the clients with desired products based on the data.",
            open:false
          },
          {question:"How do I find my vending machine information?",
            answer:"There are two ways to find my vending machine information. First, you can find your vending machines on map page. After you click that, there is a button called more information. Press that button to go to your vending machine page. Second, you can go to ADD VM page and click the vending machine that you already added.",
            open:false
          },
          {question:"How can I reset my password",
            answer:"You can go to login page and click Forgot password. Then enter your email address to receive security code to reset your password.",
            open:false
          },
          {question:"What does the report mean?",
            answer:"SVM management system enables auto generating report for both individual vending machine and overall company Report. In the report, users can know which product is or not selling well and suggest similar inventory that may sell in certain markets. In addition, users can get insights of products with similar selling trend.",
            open:false
          },
        ]
      }
      }

      componentWillMount(){
        if(localStorage.jtwToken){
          
          var code = decode()
          this.loginHandler()
          if(!checkExpired(code.exp)){
            window.location.href='/?session=false';
          }
        }
        else{
          window.location.href='/';
        }
      }
      // function that handles question click event
      toggleFAQ = index =>{
          this.setState(this.state.faq.map((faq,i) => {
            if(i === index){
                faq.open = !faq.open
            } else {
                faq.open = false
            }
            return null;
          }))
      }
    
    // Call FAQ function to display all questions and answers
    render() {
    

        return (
          <MainLayout breakpoint={this.props.breakpoint}>
              <div className = "faqs">
              <h1 className = "subtitle">
          How can we help you? </h1>
          <h4 className = "aaa">
          Welcome to our support center.Here you can find the most frequently
            asked quesions. If you cannot find an answer below, you cannot find
          an answer below, please call us at 1-214-919-4196
          </h4>
                  {this.state.faq.map((faq,i) => (
                      <FAQ key = {i} faq={faq} index = {i} toggleFAQ = {this.toggleFAQ}/>
                  ))}
              </div>
          </MainLayout>
        )}

}

export default Help;