import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { connectRouter } from 'connected-react-router';
import { routerMiddleware } from 'connected-react-router';
import * as modules from '../modules';
import notify from '../lib/notifyMiddleware';
import socketBcast from '../lib/socketMiddleware';

const history = createHashHistory();

const reducers = combineReducers({
  router: connectRouter(history),
  ...modules
});

// const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, notify, socketBcast, router);

function configureStore(initialState?: counterStateType) {
  return createStore<counterStateType>(
    reducers,
    initialState,
    enhancer
  );
}

export default { configureStore, history };
 