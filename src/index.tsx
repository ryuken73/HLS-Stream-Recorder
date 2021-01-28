import React, {Fragment} from 'react';
import { render } from 'react-dom';
// import App from './App';
import './App.global.css';
import Root from './containers/RootContainer';
import { configureStore, history } from './store/configureStore';
const store = configureStore();

render(
    <Fragment>
        <Root store={store} history={history} />
    </Fragment>,
    document.getElementById('root'));
