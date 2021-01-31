import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HLSPlayer from '../components/HLSRecorder/HLSPlayer';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as statisticsActions from '../modules/statistics';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const {config} = state.hlsPlayers;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  return {
    player: hlsPlayer.player,
    source: hlsPlayer.source,
    type: hlsPlayer.type,
    channelName: hlsPlayer.channelName,
    preservePlaybackRate: hlsPlayer.preservePlaybackRate,
    width: hlsPlayer.width,
    height: hlsPlayer.height,
    controls: hlsPlayer.controls,
    hideControls: hlsPlayer.hideControls,
    autoplay: hlsPlayer.autoplay,
    bigPlayButton: hlsPlayer.bigPlayButton,
    bigPlayButtonCentered: hlsPlayer.bigPlayButtonCentered,
    inactivityTimeout: hlsPlayer.inactivityTimeout,
    enableOverlay: hlsPlayer.enableOverlay,
    overlayContent: hlsPlayer.overlayContent,
    enableAutoRefresh: hlsPlayer.enableAutoRefresh,
    mountPlayer: hlsPlayer.mountPlayer,
    LONG_BUFFERING_MS_SECONDS: config.LONG_BUFFERING_MS_SECONDS
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch),
    StatisticsActions: bindActionCreators(statisticsActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HLSPlayer);