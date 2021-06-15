import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from '../components/App';
import * as appActions from '../modules/app';
import * as hlsPlayersActions from '../modules/hlsPlayers';

console.log('calling AppContainer')
function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {sources} = state.app;
  const {recorders} = state.hlsRecorders;
  const scheduleStatusAllStop = [...recorders.values()].every(recorder => recorder.scheduleStatus==="stopped");
  const recorderStatusAllStop = [...recorders.values()].every(recorder => recorder.recorderStatus==="stopped");
  return {
    ...ownProps,
    sources,
    scheduleStatusAllStop,
    recorderStatusAllStop,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    AppActions: bindActionCreators(appActions, dispatch),
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch)  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
