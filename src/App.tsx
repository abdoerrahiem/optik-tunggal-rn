/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 */

import React from 'react';
import { store } from './redux';
import { Provider } from 'react-redux';
import moment from 'moment';
import 'moment/locale/id';
import './lib/utilities/numeral';
import './lib/utilities/localization';
import Router from './router/Router';

const App = () => {
  moment.locale('id');

  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}

export default App;
