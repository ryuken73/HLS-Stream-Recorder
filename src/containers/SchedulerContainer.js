import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Scheduler from '../components/HLSRecorder/Scheduler';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as hlsRecorderActions from '../modules/hlsRecorders';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state, ownProps) 
  const {channelNumber} = ownProps;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const {config} = state.hlsRecorders;

  return {
    ...ownProps,
    channelName: hlsRecorder.channelName,
    recorderStatus: hlsRecorder.recorderStatus,
    inTransition: hlsRecorder.inTransition,
    scheduleStatus: hlsRecorder.scheduleStatus,
    scheduleInterval: hlsRecorder.scheduleInterval,
    intervalsForSelection: config.intervalsForSelection
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayerActions: bindActionCreators(hlsPlayersActions, dispatch),
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Scheduler);