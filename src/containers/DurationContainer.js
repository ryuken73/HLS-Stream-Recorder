import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Duration from '../components/HLSRecorder/Duration';
import * as hlsRecorderActions from '../modules/hlsRecorders';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);

  return {
    ...ownProps,
    channelName: hlsRecorder.channelName,
    duration: hlsRecorder.duration,
    channelDirectory: hlsRecorder.channelDirectory,
    url: hlsRecorder.url,
    recorder: hlsRecorder.recorder,
    inTransition: hlsRecorder.inTransition,
    scheduleFunction: hlsRecorder.scheduleFunction,
    autoStartSchedule: hlsRecorder.autoStartSchedule,
    recorderStatus: hlsRecorder.recorderStatus,
  }
}

function mapDispatchToProps(dispatch) {
  return {HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Duration);