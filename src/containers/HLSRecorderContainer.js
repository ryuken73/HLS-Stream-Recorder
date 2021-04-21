import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HLSRecorder from '../components/HLSRecorder';
import * as hlsRecorderActions from '../modules/hlsRecorders';
import * as statisticsActions from '../modules/statistics';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const {clipStore} = state.app;

  return {
    ...ownProps,
    clipStore,
    channelName: hlsRecorder.channelName,
    duration: hlsRecorder.duration,
    channelDirectory: hlsRecorder.channelDirectory,
    url: hlsRecorder.url,
    recorder: hlsRecorder.recorder,
    inTransition: hlsRecorder.inTransition,
    scheduleFunction: hlsRecorder.scheduleFunction,
    autoStartSchedule: hlsRecorder.autoStartSchedule,
    recorderStatus: hlsRecorder.recorderStatus,
    mountRecorder: hlsRecorder.mountRecorder
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch),
    StatisticsActions: bindActionCreators(statisticsActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HLSRecorder);