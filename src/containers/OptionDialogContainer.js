// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import OptionDialog from '../components/OptionDialog';
import * as optionDialogActions from '../modules/options';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {config, optionsDialogOpen} = state.options
  return {
    ...ownProps,
    config,
    dialogOpen: optionsDialogOpen
  }
}

function mapDispatchToProps(dispatch) {
  return {OptionDialogActions: bindActionCreators(optionDialogActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(OptionDialog);