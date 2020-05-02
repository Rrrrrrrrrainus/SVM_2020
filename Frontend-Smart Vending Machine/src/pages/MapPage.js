import React from 'react';
import  MainLayout from '../components/Layout/MainLayout'
import MapContainer from 'components/Maps/Maps'
import {
  Row,
  Col,
} from 'reactstrap';
import Page from 'components/Page';
import {decode,checkExpired} from '../components/Authendication'

// Map page that shows a larger Google Map API
class MapPage extends React.Component {

  // check session
  componentWillMount(){
    if(localStorage.jtwToken){
      var code = decode()
      if(!checkExpired(code.exp)){
        window.location.href='/?session=false';
      }
    }
    else{
      window.location.href='/';
    }
  }

  // show map api on the page
  render() {
    return (
      <MainLayout breakpoint={this.props.breakpoint}> 
      <Page>
      <Row>
        <Col style={{height:"50rem"}}>
        
        
        <MapContainer></MapContainer>
        </Col>
      </Row>


        </Page>
      </MainLayout>
    );
  }
}

export default MapPage;
