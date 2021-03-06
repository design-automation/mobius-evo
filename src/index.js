import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import App from './App';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Amplify from 'aws-amplify'
import awsExports from './aws-exports'
Amplify.configure(awsExports);

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/">
        <App />
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
