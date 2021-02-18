import React, {useState, useEffect} from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import Typography from '@material-ui/core/Typography';
import SectionWithFullHeightFlex from './template/SectionWithFullHeightFlex';
import {remote, webFrame} from 'electron';
import {kafka} from '../lib/kafkaSender';
const {app, getCurrentWindow} = remote;
const electronUtil = require('../lib/electronUtil');

const {
  KAFKA_TOPIC=`topic_${Date.now()}`, 
  KAFKA_KEY='none',
  IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK=30
} = require('../lib/getConfig').getCombinedConfig();

function MessagePanel(props) {
  const {logLevel="INFO", message="READY", mt="auto"} = props;
  const {setReloadDialogOpen, maxMemory, memUsageToClear, playbackAllOff} = props;
  const [memUsed, setMemUsed] = React.useState(0);
  const messageText = `[${logLevel}] ${message}`;
  const {
    setAppStatNStore=()=>{}, 
    increaseAppStatNStore=()=>{}
  } = props.StatisticsActions;
  const {
    setPlayerMountAll=()=>{}
  } = props.HLSPlayerActions;
  const [kafkaSender, setkafkaSender] = React.useState(kafka({topic:KAFKA_TOPIC}))
  const [idleTime, setIdleTime] = React.useState(0);
  const [minimized, setMinimized] = React.useState(false);

  React.useState(() => {
    // web worker test
    const workerJS = electronUtil.getAbsolutePath('lib/worker.js');
    const timer = new Worker(workerJS);
    timer.onmessage = event => {
      const {data:processMemory} = event;
      const currentMemMB = parseInt((processMemory.private/1024).toFixed(0));
      const memMBToClear = parseInt(maxMemory * memUsageToClear / 100);
      if(currentMemMB > memMBToClear){
        console.log(`### clear memory(webFrame.clearCache()): currentMem[${currentMemMB}] triggerMem[${memMBToClear}]`);
        webFrame.clearCache();
        setAppStatNStore({statName:'memClearTime', value: Date.now()});
        increaseAppStatNStore({statName:'memClearCount'});
      } 
      const reportStatus = {
        type: 'performance',
        source: 'app',
        name: 'memUsageMB',
        value: currentMemMB
      };
      kafkaSender.send({
        key: KAFKA_KEY,
        messageJson: reportStatus
      })
      // console.log(`current memory: ${currentMemMB}`)
      setMemUsed(currentMemMB);
    }

    timer.postMessage('start')

    // fix reload failure!
    window.onbeforeunload = event => {
      timer.terminate();
    } 

    const mainWindow = getCurrentWindow();
    mainWindow.on('minimize', () => {
      setMinimized(true)
    })
    mainWindow.on('restore', () => {
      setMinimized(false)
    })

    return () => {
      console.log('## destroy webworker[memory getter]');
      window.onbeforeunload = null;
      timer.terminate();
    }

  },[])

  React.useEffect(() => {
    let timer;
    if(playbackAllOff === false){
      timer = setInterval(() => {
        const idleTime = remote.powerMonitor.getSystemIdleTime();
        setIdleTime(idleTime);
        if(IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK - idleTime === 0){
          clearInterval(timer);
          setPlayerMountAll({mountPlayer: false})
          // const mainWindow = getCurrentWindow();
          // mainWindow.minimize();
          // setMinimized(true)
        }
      },1000)
    } else {
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    }
  // },[minimized])
  },[playbackAllOff])

  // React.useEffect(() => {
  //   const memChecker = setInterval(() => {
  //     process.getProcessMemoryInfo()
  //     .then(processMemory => {
  //       const currentMemMB = (processMemory.private/1024).toFixed(0);
  //       const memMBToClear = maxMemory * memUsageToClear / 100;
  //       if(currentMemMB > memMBToClear){
  //         console.log(`### clear memory(webFrame.clearCache()): currentMem[${currentMemMB}] triggerMem[${memMBToClear}]`);
  //         webFrame.clearCache();
  //         setAppStatNStore({statName:'memClearTime', value: Date.now()});
  //         increaseAppStatNStore({statName:'memClearCount'});
  //       } 
  //       const reportStatus = {
  //         type: 'performance',
  //         source: 'app',
  //         name: 'memUsageMB',
  //         value: currentMemMB
  //       };
  //       kafkaSender.send({
  //         key: KAFKA_KEY,
  //         messageJson: reportStatus
  //       })
  //       console.log(`current memory: ${currentMemMB}`)
  //       setMemUsed(currentMemMB);
  //     })
  //   },1000)
  //   return () => {
  //     console.log('## clear memChecker')
  //     clearInterval(memChecker);
  //   }
  // },[memUsageToClear]);

  const {memClearCount} = props.appStat;
  const {AUTO_RELOAD_OVER_MEM_CLEAR_COUNT_LIMIT, MEM_CLEAR_COUNT_LIMIT} = props.config;
  React.useEffect(() => {
    if(AUTO_RELOAD_OVER_MEM_CLEAR_COUNT_LIMIT && (memClearCount > MEM_CLEAR_COUNT_LIMIT)){
      // reset memClearCount
      setAppStatNStore({statName:'memClearCount', value:0});
      setReloadDialogOpen(true);
    }   
    // return async () => {
    //   const reportStatus = {
    //     type: 'performance',
    //     source: 'app',
    //     name: 'memUsageMB',
    //     value: memUsed
    //   };
    //   const result = await kafkaSender.send({
    //     key: KAFKA_KEY,
    //     messageJson: reportStatus
    //   })
    // }

  }, [memUsed])

    return (
        <SectionWithFullHeightFlex outerbgcolor={"#2d2f3b"} className="SectionWithFullHeightFlex ImageBox" flexGrow="0" width="1" mt={mt} mb="2px">
            <BorderedBox bgcolor={"#2d2f3b"} display="flex" alignContent="center" flexGrow="1">
                <Box bgcolor="#232738" display="flex" flexDirection="row" width="1">
                    <Box mx="10px">
                        <Typography variant={"caption"}>{messageText}</Typography>
                    </Box>
                    <Box ml="auto">
                        <Typography variant={"caption"}>[{memUsed}MB / {maxMemory}MB]</Typography>
                    </Box>
                    <Box ml="5px">
                        <Typography variant={"caption"}>
                          {playbackAllOff ? 
                            "[Playback All Closed!]" :
                            `[Playback off after ${IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK - idleTime} seconds]`
                          }
                        </Typography>
                    </Box>
                    <Box ml="5px">
                        <Typography variant={"caption"}>v.{app.getVersion()}</Typography>
                    </Box>
                </Box>
            </BorderedBox>
        </SectionWithFullHeightFlex>
    )
}

export default React.memo(MessagePanel)
