import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware as createRouterMiddleware } from 'react-router-redux';
import { createBrowserHistory } from 'history';

import { rootReducer, RootState } from './root-reducer';

const composeEnhancers = (
  process.env.NODE_ENV === 'development' &&
  window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) || compose;

export const browserHistory = createBrowserHistory();
export const routerMiddleware = createRouterMiddleware(browserHistory);

function configureStore(initialState?: RootState) {
  // configure middlewares
  const middlewares = [
    routerMiddleware
  ];
  // compose enhancers
  const enhancer = composeEnhancers(
    applyMiddleware(...middlewares)
  );
  // create store
  return createStore(
    rootReducer,
    initialState!,
    enhancer
  );
}

// pass an optional param to rehydrate state on app start
export const store = configureStore();

// export store singleton instance
export default store;
