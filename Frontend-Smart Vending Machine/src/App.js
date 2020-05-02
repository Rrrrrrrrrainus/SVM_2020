import GAListener from 'components/GAListener';
import PageSpinner from 'components/PageSpinner';
import React from 'react';
import componentQueries from 'react-component-queries';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import './styles/reduction.scss';

// loads all components
const LoginPage = React.lazy(() => import('pages/Login'));
const SignupPage = React.lazy(() => import('pages/Signup'));
const ForGetPage = React.lazy(() => import('pages/ForgetPassword'));
const AddVMPage = React.lazy(() => import('pages/AddVM'));
const VendingMachinePage = React.lazy(() => import('pages/VendingMachine'));
const MapPage = React.lazy(() => import('pages/MapPage'));
const DashboardPage = React.lazy(() => import('pages/DashboardPage'));
const ProfilePage = React.lazy(() => import('pages/ProfilePage'));
const LandingPage = React.lazy(() => import('../src/Landing Pge/LandingPage'));
const HelpPage = React.lazy(() => import('pages/Help'));

const getBasename = () => {
  return `/${process.env.PUBLIC_URL.split('/').pop()}`;
};

class App extends React.Component {
  // defines all routes
  render() {
    return (
      <BrowserRouter basename={getBasename()}>
        <GAListener>
          <Switch>
             <React.Suspense fallback={<PageSpinner />}>
                <Route exact path="/" component={LoginPage} />
                <Route exact path="/signup" component={SignupPage} />
                <Route exact path="/check_email" component={ForGetPage} />
            <Route exact path="/n" component = {LandingPage} />
                <Route exact path="/dashboard" component={DashboardPage} />
                <Route exact path="/addvm" component={AddVMPage} />
                <Route exact path="/map" component={MapPage} />
                <Route exact path="/vendingmachine" component={VendingMachinePage} />
                <Route exact path="/help" component={HelpPage} />
                <Route exact path="/profile" component={ProfilePage} />
              
            {/* </MainLayout> */}
            </React.Suspense>
            <Redirect to="/" />
          </Switch>
        </GAListener>
      </BrowserRouter>
    );
  }
}

const query = ({ width }) => {
  if (width < 575) {
    return { breakpoint: 'xs' };
  }

  if (576 < width && width < 767) {
    return { breakpoint: 'sm' };
  }

  if (768 < width && width < 991) {
    return { breakpoint: 'md' };
  }

  if (992 < width && width < 1199) {
    return { breakpoint: 'lg' };
  }

  if (width > 1200) {
    return { breakpoint: 'xl' };
  }

  return { breakpoint: 'xs' };
};

export default componentQueries(query)(App);
