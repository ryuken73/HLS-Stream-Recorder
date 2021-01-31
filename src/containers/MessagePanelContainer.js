// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MessagePanel from '../components/MessagePanel';
import * as statisticsActions from '../modules/statistics';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  return {
    ...ownProps,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    StatisticsActions: bindActionCreators(statisticsActions, dispatch)  
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagePanel);
