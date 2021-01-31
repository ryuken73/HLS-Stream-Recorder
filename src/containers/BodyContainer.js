import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Body from '../components/Body';
import * as bodyActions from '../modules/body';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  return {
    ...ownProps,
    channels: state.body.channels,
    sources: state.app.sources
  }
}

function mapDispatchToProps(dispatch) {
  return {BodyActions: bindActionCreators(bodyActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Body);