import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './app';
import { store, browserHistory } from './store/store';

const renderRoot = (app: JSX.Element) => {
  ReactDOM.render(app, document.getElementById('root'));
};

const AppContainer = require('react-hot-loader').AppContainer;
renderRoot((
  <AppContainer>
    <App store={store} history={browserHistory} />
  </AppContainer>
));

if (module.hot) {
  // app
  module.hot.accept('./app', async () => {
    // const NextApp = require('./app').App;
    const NextApp = (await System.import('./app')).App;
    renderRoot((
      <AppContainer>
        <NextApp store={store} history={browserHistory} />
      </AppContainer>
    ));
  });

  // reducers
  module.hot.accept('./store/root-reducer', () => {
    const newRootReducer = require('./store/root-reducer').default;
    store.replaceReducer(newRootReducer);
  });
}
