import React, { useContext }from 'react';
import './MainSection.css';
import { AuthContext } from '../Contexts';
import { Route, Switch, Redirect } from 'react-router-dom';
import Landing from './main/Landing';
import User from './main/User';

import GuestSearchesList from './main/GuestSearchesList';
// import GuestSearchResult from './main/GuestSearchResult';

import Explorations from './main/UserSearchesList';
import JobForm from './main/UserCreateNewSearch';
import JobResults from './main/UserSearchResult';
import NotFound from './main/NotFound';

function PrivateRoute({ component: Component, ...rest}) {
  const { cognitoPayload, isLoading } = useContext(AuthContext);
  return (
    !isLoading ?
    <Route 
      {...rest}
      render={
        props => cognitoPayload ? <Component {...props}/> : <Redirect to={{ pathname:"/", state: { from: props.location } }} />
      }
    />
    : null
  )
}

function MainSection() {
  return (
    <section id="main-section">
      <Switch>
        <Route path="/" exact component={ Landing }/>
        <Route path="/view-searches" exact component={ GuestSearchesList }/>
        {/* <Route path="/view-searches/search-results" exact component={ GuestSearchResult }/> */}
        <PrivateRoute path="/user" component={ User }/>
        <PrivateRoute path="/new-job" component={ JobForm }/>
        <PrivateRoute path="/searches/search-results" component={ JobResults }/>
        <PrivateRoute path="/searches" component={ Explorations }/>
        <Route path="/404" component={ NotFound }/>
        <Redirect to="/404"/>
      </Switch>
    </section>
  );
}

export default MainSection;
