import React, { Component } from 'react';
import axios from 'axios'
import { Map, Marker, InfoWindow,GoogleApiWrapper } from 'google-maps-react';
import {decode} from '../Authendication'

const mapStyles = {
  width: '94%',
  height: '100%'
};

// Map class that shows a Google Map API
export class MapContainer extends Component {
  _isMounted = false;

  // define properties
    constructor(props) {
        super(props);
        this.state = {
          showingInfoWindow: false,
          activeMarker: {},
          selectedPlace: {},
          markers: [],
          selectMarker:{},
          vm: {},
        }
        this.getvm = {
          token:localStorage.jtwToken,
          email:undefined
        }
        this.vm = []
        // binding this to event-handler functions
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
      }

      // check session token
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
      
      // get vending machine information
      getHandler(){
        axios.post("https://vending-insights-smu.firebaseapp.com/vm/getallvm",this.getvm)
         .then(response => {
                if(response.data !== null){
                var vms = response.data
                this.vm = vms
                var keys = Object.keys(vms)
                for(var i = 0; i < keys.length; i++) { 
                    var key = (keys[i]) ; 
                    var vm_info = vms[key]
                    var marker = this.state.markers
                    marker.push(
                      <Marker
                        onClick = { this.onMarkerClick }
                        title = { 'Changing Colors Garage' }
                        position = {{ lat: Number(vm_info.latitude), lng: Number(vm_info.longitude)}}
                        name = { 'Changing Colors Garage' }
                        id = {key}
                        key = {i}
                      />)
                      if (this._isMounted) {
                  this.setState(marker)}
                }}
            }).catch(error => {console.log(error)})
      }

      // handle marker click event
      onMarkerClick = (props, marker, e) => {
        if (this._isMounted) {
        this.setState({
          selectedPlace: props,
          activeMarker: marker,
          showingInfoWindow: true,
          selectMarker: this.vm[marker.id]
        });}
      }
      // handle map click event
      onMapClick = (props) => {
        if (this._isMounted) {
        if (this.state.showingInfoWindow) {
          this.setState({
            showingInfoWindow: false,
            activeMarker: null
          });
        }}
      }
      
      // react life cycle
      componentWillMount(){
        if(localStorage.jtwToken){
          var code = decode()
          this.getvm.email = code.email
          this.loginHandler()
          this.getHandler()
        }
        
      }
      componentDidMount() {
        this._isMounted = true;}
        componentWillUnmount() {
          this._isMounted = false;
        }

  render() {

    return (
      <Map
        google={this.props.google}
        zoom={14}
        style={mapStyles}
        onClick = { this.onMapClick }
        options={{streetViewControl: true}}
        initialCenter={{
         lat: 32.845158,
         lng: -96.768737
        }}
      >
        {this.state.markers}
        <InfoWindow
          marker = { this.state.activeMarker }
          visible = { this.state.showingInfoWindow }
        >
          <div>
      ID: {this.state.selectMarker.vm_id} <br />
      Name: {this.state.selectMarker.name} <br />
      Latitude: {this.state.selectMarker.latitude} longitude: {this.state.selectMarker.longitude} <br/>
      Net Sales: {this.state.selectMarker.sales} Status: Online <br/>
      <a href = {'/vendingmachine/?vm_id=' + this.state.selectMarker.vm_id+'?name='+this.state.selectMarker.name+
      '?longitude='+this.state.selectMarker.longitude
    +'?latitude='+this.state.selectMarker.latitude+'?sales='+this.state.selectMarker.sales+'?status='+this.state.selectMarker.status}
><button >More Information</button></a>
              
          </div>
        </InfoWindow>
      </Map>
    );
  }
}

// export map class with GoogleApi
export default GoogleApiWrapper({
  apiKey: ''
})(MapContainer);