require('./styles/main.sass');

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleWare } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunk from 'redux-thunk';

const createStoreWithMiddleWare = applyMiddleWare(thunk)(createStore);
import reducers from './reducers';

import App from './containers/app';

ReactDOM.render(
  <Provider store={createStoreWithMiddleWare(enableBatching(reducers))}>
    <App />
  </Provider>,
  document.querySelector('.container')
);
