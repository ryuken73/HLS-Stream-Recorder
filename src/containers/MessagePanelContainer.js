// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MessagePanel from '../components/MessagePanel';
import * as statisticsActions from '../modules/statistics';
import * as hlsPlayersActions from '../modules/hlsPlayers';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {config} = state.options;
  const {appStat} = state.statistics;
  const {players} = state.hlsPlayers;
  const playbackAllOff = [...players.values()].every(hlsplayer => { 
    return hlsplayer.mountPlayer === false
  })
  return {
    ...ownProps,
    config,
    appStat,
    playbackAllOff
  }
}

function mapDispatchToProps(dispatch) {
  return {
    StatisticsActions: bindActionCreators(statisticsActions, dispatch),
    HLSPlayerActions: bindActionCreators(hlsPlayersActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagePanel);
