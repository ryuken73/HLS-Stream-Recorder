import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Controls from '../components/HLSRecorder/Controls';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as hlsRecorderActions from '../modules/hlsRecorders';
import * as statisticsActions from '../modules/statistics';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state, ownProps) 
  const {channelNumber} = ownProps;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const channelStat = state.statistics.channelStats[channelNumber];

  return {
    ...ownProps,
    source: hlsPlayer.source,
    channelName: hlsRecorder.channelName,
    duration: hlsRecorder.duration,
    channelDirectory: hlsRecorder.channelDirectory,
    url: hlsRecorder.url,
    recorder: hlsRecorder.recorder,
    recorderStatus: hlsRecorder.recorderStatus,
    inTransition: hlsRecorder.inTransition,
    scheduleFunction: hlsRecorder.scheduleFunction,
    scheduleStatus: hlsRecorder.scheduleStatus,
    autoStartSchedule: hlsRecorder.autoStartSchedule,
    localm3u8: hlsRecorder.localm3u8,
    source: hlsPlayer.source,
    mountPlayer: hlsPlayer.mountPlayer,
    channelStat: channelStat
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayerActions: bindActionCreators(hlsPlayersActions, dispatch),
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch),
    StatisticsActions: bindActionCreators(statisticsActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);