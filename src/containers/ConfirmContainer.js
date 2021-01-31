// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ConfirmDialog from '../components/ConfirmDialog';
import * as statisticsActions from '../modules/statistics';
import * as hlsPlayersActions from '../modules/hlsPlayers';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  return {
    ...ownProps
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch),
    StatisticsActions: bindActionCreators(statisticsActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmDialog);
