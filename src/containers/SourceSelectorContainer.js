import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SourceSelector from '../components/HLSRecorder/SourceSelector';
// import * as sourceSelectorActions from '../modules/sourceSelector';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as hlsRecordersActions from '../modules/hlsRecorders';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state);
  const {channelNumber} = ownProps;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  return {
    ...ownProps,
    sources: state.app.sources,
    source: hlsPlayer.source,
    recorderStatus: hlsRecorder.recorderStatus
  }
}

function mapDispatchToProps(dispatch) {
  return {
    // SourceSelectorActions: bindActionCreators(sourceSelectorActions, dispatch),
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch),
    HLSRecordersActions: bindActionCreators(hlsRecordersActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SourceSelector);