import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AutoReloadDialog from '../components/AutoReloadDialog';
import * as hlsRecorderActions from '../modules/hlsRecorders';
import * as statisticsActions from '../modules/statistics';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  return {
    ...ownProps
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch),
    StatisticsActions: bindActionCreators(statisticsActions, dispatch),  
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoReloadDialog);