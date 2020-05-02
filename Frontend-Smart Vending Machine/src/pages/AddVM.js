import Page from 'components/Page';
import  MainLayout from '../components/Layout/MainLayout'
import React from 'react';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { forwardRef } from 'react';
import axios from 'axios'
import {decode,checkExpired} from '../components/Authendication'
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button
} from 'reactstrap';

// define material table icons
const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };

  // page ADDVM 
class AddVM extends React.Component{
  _isMounted = false;

  // defines values for later requests
  constructor(props) {
    super(props);
   this.state = {
     modal:false,
    auth:{
      token:localStorage.jtwToken,
      email:undefined
    },
    add_vm:{
        email:undefined,
        token:localStorage.jtwToken,
        longitude:"",
        latitude:"",
        name:""
    },

    deletevm:{
      email:undefined,
      token:localStorage.jtwToken,
        vm_id:""
    },

    updatevm:{
      email:undefined,
        token:localStorage.jtwToken,
      vm_id:"",
      longitude:0,
      latitude:0,
      name:""
  },
  // define table data
  columns: [
    { title: 'ID', field: 'vm_id', editable: 'never'},
    {title: 'Name', field: 'name' },
    { title: 'Longitude', field: 'longitude', type: 'numeric' },
    {
      title: 'Latitude',
      field: 'latitude', type:'numeric'
    },
    {title: 'Net Sales', field:'sales',type:'numeric',editable: 'never'},
    {title: 'Status', field: 'status',editable: 'never' },
    
    
  ],
  data: [
  ]
   }}

   toggle(){
    this.setState(prevState =>{
      var modal = prevState.modal
      modal = ! this.state.modal
      return { ...prevState,modal}
    })
   }

   // request that gets all vending machine information
    getHandler = (e) =>{
        axios.post("https://vending-insights-smu.firebaseapp.com/vm/getallvm",this.state.auth)
         .then(response => {
          if (this._isMounted) {
            if(response.data !== null){
                var vms = response.data
                var vm_info = []
                var keys = Object.keys(vms)
                for(var i = 0; i < keys.length; i++) { 
                    var key = (keys[i]) ; 
                    var vm = vms[key]
                    vm['status'] = 'Online'
                    vm_info.push(vm)
                }

                this.setState(prevState => {
                    var data = [...prevState.data];
                    data = vm_info
                    return { ...prevState, data };
                  });}}}
            ).catch(error => {console.log(error)})
    }
    
    // request that adds a new vending machine
    submitHandler = (newData,e) =>{
        axios.post("https://vending-insights-smu.firebaseapp.com/vm/addvm",this.state.add_vm)
         .then(response => {
          if (this._isMounted) {
            this.setState(prevState => {
                const data = [...prevState.data];
                newData.sales = 0;
                newData.status = 'Online';
                newData.vm_id = response.data*1
                data.push(newData);
                
                return { ...prevState, data };
              });}
            }).catch(error => {console.log(error)})
    }

    // requests that delete an existing vending machine
    deleteHandler = (newData,e) =>{
        axios.delete("https://vending-insights-smu.firebaseapp.com/vm/deletevm",
        {data:this.state.deletevm})
         .then(response => {
            }).catch(error => {console.log(error.response)})
    }

    // request that checks session
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

    // request that updates an existing vending machien information
    updateHandler = (newData,e) =>{
      axios.post("https://vending-insights-smu.firebaseapp.com/vm/updatevm",this.state.updatevm)
       .then(response => {
          }).catch(error => {console.log(error.response)})
  }

  // before showing the page, load the email from jwt token, then update it to all email values
  componentWillMount(){
    if(localStorage.jtwToken){
      var code = decode()
      if(!checkExpired(code.exp)){
        window.location.href='/?session=false';
      }}
      else{
        window.location.href='/';
      }
      this.setState(prevState => {
        var auth = {...prevState.auth}
        auth.email = code.email
        var add_vm = {...prevState.add_vm}
        add_vm.email = code.email
        var deletevm = {...prevState.deletevm}
        deletevm.email = code.email
        var updatevm = {...prevState.updatevm}
        updatevm.email = code.email
        return { ...prevState, auth,add_vm,deletevm,updatevm };
      },()=>{
        this.loginHandler()
         this.getHandler()
      })
    }

    componentDidMount() {
      this._isMounted = true;}
      componentWillUnmount() {
        this._isMounted = false;
      }

    // click function that loads clicked vending machine information and redirect to vending machine page 
    movetovm = (vm) =>{
      this.props.history.push({
        pathname: '/vendingmachine',
        data: vm // your data array of objects
      })
    }
    render() {
    return (
    <MainLayout> 
    <Page>
      <MaterialTable
      // material table API that displays vending machine list
      minRows={10}
      icons={tableIcons}
        title="Vending Machine List"
        columns={this.state.columns}
        data={this.state.data}
        editable={{
          // row add action
          onRowAdd: newData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                if (this._isMounted) {
                  var format = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
                  if(format.test(newData.name) || Number(newData.longitude)>180 || Number(newData.longitude)<-180
                    || Number(newData.latitude)>90 ||Number(newData.latitude)<-90){
                    this.setState(prevState =>{
                      var modal = prevState.modal
                      modal = ! this.state.modal
                      return { ...prevState,modal}
                    })
                  }
                  else{
                this.setState(prevState => {
                  var add_vm = {...prevState.add_vm}
                  add_vm.longitude = newData.longitude;
                  add_vm.latitude = newData.latitude;
                  add_vm.name= newData.name;
                  return { ...prevState, add_vm };
                },()=>{
                this.submitHandler(newData)})}}
              }, 600);
            }),
            // row update action
          onRowUpdate: (newData, oldData) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                if (oldData) {
                  if (this._isMounted) {
                    if( Number(newData.longitude)>180 || Number(newData.longitude)<-180
                    || Number(newData.latitude)>90 ||Number(newData.latitude)<-90){
                      this.setState(prevState =>{
                        var modal = prevState.modal
                        modal = ! this.state.modal
                        return { ...prevState,modal}
                      })
                    }
                    else{
                  this.setState(prevState => {
                    const data = [...prevState.data];
                    data[data.indexOf(oldData)] = newData;
                    var updatevm = {...prevState.updatevm}
                    updatevm.vm_id = newData.vm_id
                    updatevm.longitude = newData.longitude
                    updatevm.latitude = newData.latitude
                    updatevm.name = newData.name
                    
                    return { ...prevState, data,updatevm };
                  },()=>{this.updateHandler()});
                }}}
              }, 600);
            }),
            // row delete action
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                if (this._isMounted) {
                this.setState(prevState => {
                  const data = [...prevState.data];
                  var deletevm = {...prevState.deletevm}
                  deletevm.vm_id = oldData.vm_id;
                  
                  data.splice(data.indexOf(oldData), 1);
                  return { ...prevState, data,deletevm };
                },()=>{this.deleteHandler()});}
              }, 600);
            }),
            
        }}
        options={{
            actionsColumnIndex: -1,
            pageSize: 10,
            pageSizeOptions: [5, 10, 20, 30 ,50, 75, 100 ],
          }}
          // if click one row, call movetovm function
        onRowClick={(event,rowData) => this.movetovm(rowData)}
          /> 
           <Modal
          isOpen={this.state.modal}
        >
          <ModalHeader>
            Invalid Input
          </ModalHeader>
          <ModalBody>
           The input is not valid.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => this.toggle()
            }>
              Close
          </Button>
          </ModalFooter>
        </Modal>
          
          </Page></MainLayout>
    );
  }
}
  export default AddVM;