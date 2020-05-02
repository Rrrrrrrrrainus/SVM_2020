import Avatar from 'components/Avatar';
import { UserCard } from 'components/Card';
import React from 'react';
import axios from 'axios'
import {
  MdClearAll,
  MdExitToApp,
  MdHelp,
  MdPersonPin
} from 'react-icons/md';
import {
  Button,
  ListGroup,
  ListGroupItem,
  // NavbarToggler,
  Nav,
  Navbar,
  NavItem,
  NavLink,
  Popover,
  PopoverBody,
} from 'reactstrap';
import bn from 'utils/bemnames';
import default_user from '../../assets/img/users/default_user.png'

import {decode} from '../Authendication'

const bem = bn.create('header');


// header class that shows profile and help page buttons and user card
class Header extends React.Component {
  _isMounted = false;
  state = {
    isOpenUserCardPopover: false,
    email:undefined,
    token: localStorage.jtwToken,
    image: default_user
  };


// function that handles display of user card
  toggleUserCardPopover = () => {
    if (this._isMounted) {
    this.setState({
      isOpenUserCardPopover: !this.state.isOpenUserCardPopover,
    });}
  };

  // funciton that handles sidebar control button
  handleSidebarControlButton = event => {
    event.preventDefault();
    event.stopPropagation();

    document.querySelector('.cr-sidebar').classList.toggle('cr-sidebar--open');
  };

  // before showing the page, call gethandler to get user info
  componentWillMount(){
    if(this.state.email === undefined){
      var code = decode()
      this.setState({
        email:code.email
      },()=>{
        this.getHandler()
      })
  }
  }

  // if component will unmount, cancel all axios requests
  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getHandler = (e) =>{
    const auth = {
      email:this.state.email,
      token: this.state.token
    }
    axios.post("https://vending-insights-smu.firebaseapp.com/getimage",auth)
     .then(response => {
      if (this._isMounted) {
       if(response.data.image !==undefined && response.data.image !==0&& response.data.image !== "default image"){
       this.setState({image:response.data.image},()=>{
          document.getElementById('avatar').src = this.state.image
       })}}
        }).catch(error => {console.log(error)})
}
// funciton that deletes token and redirects to login page
  signOut(){
    delete localStorage.jtwToken
    delete localStorage.auth
    window.location.href='/'
  }

  render() {

    return (
      <Navbar light expand className={bem.b('bg-white')}>
        <Nav navbar className="mr-2">
          <Button outline onClick={this.handleSidebarControlButton}>
            <MdClearAll size={25} />
          </Button>
        </Nav>
        <Nav navbar>
        </Nav>

        <Nav navbar className={bem.e('nav-right')}>
          <NavItem className="d-inline-flex">
            <NavLink id="Popover1" className="position-relative">
              
            </NavLink>
          </NavItem>
          <NavItem tag="button"   className="border-light mr-2" onClick={()=>window.location.href='/profile'}>
          <MdPersonPin /> Profile
          </NavItem>
          <NavItem tag="button"  className="border-light mr-2" onClick={()=>window.location.href='/help'}>
          <MdHelp /> Help
          </NavItem>
          

          <NavItem>
            <NavLink id="Popover2">
              <Avatar
                id = 'avatar'
                onClick={this.toggleUserCardPopover}
                className="can-click"
              />
            </NavLink>
            <Popover
              placement="bottom-end"
              isOpen={this.state.isOpenUserCardPopover}
              toggle={this.toggleUserCardPopover}
              target="Popover2"
              className="p-0 border-0"
              style={{ minWidth: 250 }}
            >
              <PopoverBody className="p-0 border-light">
                <UserCard
                  
                  title={this.state.email}
                  avatar = {this.state.image}
                  className="border-light"
                >
                  <ListGroup flush>
                    
                    <ListGroupItem tag="button" action className="border-light" onClick= {()=>this.signOut()}>
                      <MdExitToApp /> Signout
                    </ListGroupItem>
                  </ListGroup>
                </UserCard>
              </PopoverBody>
            </Popover>
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
}

export default Header;
