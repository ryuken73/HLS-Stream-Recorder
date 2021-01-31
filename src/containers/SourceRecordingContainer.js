import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SourceRecording from '../components/HLSRecorder/SourceRecording';
import * as hlsPlayersActions from '../modules/hlsPlayers';


function mapStateToProps(state, ownProps) {
  // console.log('$$$$$', state)
  const {channelNumber} = ownProps;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  return {
    ...ownProps,
    title: hlsPlayer.source.title,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SourceRecording);