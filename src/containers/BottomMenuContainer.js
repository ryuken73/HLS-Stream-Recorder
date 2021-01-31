import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BottomMenu from '../components/BottomMenu';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as hlsRecorderActions from '../modules/hlsRecorders';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state, ownProps) 
  const {recorders} = state.hlsRecorders;
  const scheduleStatusAllStop = [...recorders.values()].every(recorder => recorder.scheduleStatus==="stopped");
  const recorderStatusAllStop = [...recorders.values()].every(recorder => recorder.recorderStatus==="stopped");
  const scheduleStatusAllSame = [...recorders.values()].every((recorder,i,values) => recorder.scheduleStatus===values[0].scheduleStatus);
  const recorderStatusAllSame = [...recorders.values()].every((recorder,i,values) => recorder.recorderStatus===values[0].recorderStatus);
  const recorderStatusAnyInTransition = [...recorders.values()].some(recorder => recorder.inTransition===true);
  const {config} = state.hlsRecorders;
  return {
    ...ownProps,
    scheduleStatusAllStop,
    recorderStatusAllStop,
    scheduleStatusAllSame,
    recorderStatusAllSame,
    recorderStatusAnyInTransition,
    intervalsForSelection: config.intervalsForSelection
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayerActions: bindActionCreators(hlsPlayersActions, dispatch),
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BottomMenu);