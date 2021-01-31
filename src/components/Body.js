import React from 'react';
import Box from '@material-ui/core/Box';
// import HLSRecorder from './HLSRecorder';
import HLSRecorderContainer from '../containers/HLSRecorderContainer';

const Body = (props) => {
  console.log('###', props);
  const {channels} = props;
  return (
    <Box display="flex" flexWrap="wrap" overflow="auto" ml="40px">
    {/* <Box display="flex" flexWrap="wrap" overflow="auto" mx="33px"> */}
      {channels.map(channelNumber => {
        return <HLSRecorderContainer 
                  key={channelNumber} 
                  channelNumber={channelNumber}
               ></HLSRecorderContainer>
      })}
    </Box>
  );
};

export default React.memo(Body);