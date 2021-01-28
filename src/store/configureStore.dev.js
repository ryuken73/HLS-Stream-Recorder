import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { connectRouter } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import * as modules from '../modules';

const history = createHashHistory();

const configureStore = (initialState) => {
  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });
  
  // Router Middleware
  const router = routerMiddleware(history);
  
  // get reducers
  const reducers = combineReducers({
    router: connectRouter(history),
    ...modules
  });


  const middlewares = [thunk, logger, router];
  
  const devtools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const composeEnhancers = devtools || compose;

  const store = createStore(reducers, initialState, composeEnhancers(
    applyMiddleware(...middlewares)
  ));

  // if (module.hot) {
  //   module.hot.accept(
  //     '../reducers',
  //     // eslint-disable-next-line global-require
  //     () => store.replaceReducer(require('../reducers').default)
  //   );
  // }
  return store;
  // const configure = (preloadedState) => createStore(reducers, preloadedState, composeEnhancers(
  //   applyMiddleware(...middlewares)
  // ));
}


export default {configureStore, history};