/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, dialog, screen, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {scheduler} from './lib/scheduleManager';
import {deleteDirectoryR} from './utils/deleteDirectoryR';

// const {INSTANCE_NAME='hlsInstance1'} = config;
const exeName = path.basename(path.basename(app.getPath('exe'))).split('.')[0];
let INSTANCE_NAME;
if(exeName === 'electron' || exeName === 'HLS-Stream-Recorder'){
  INSTANCE_NAME = 'hlsInstance1';
} else {
  INSTANCE_NAME = eleName;
}

const fs = require('fs');
const userHomeDir = app.getPath('home');
const newHomeDir = path.join(userHomeDir, INSTANCE_NAME);
try {
  fs.mkdirSync(newHomeDir)
} catch(error) {
  console.log('Path already Exists: ', newHomeDir)
}
app.setPath('home', newHomeDir);

const getConfig = require('./lib/getConfig');
const config = getConfig.getCombinedConfig();

const userData = app.getPath('userData');
app.setAppLogsPath(path.join(userData, 'logs'));

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const {BLOCK_MULTI_INSTANCE=true} = config;
if(BLOCK_MULTI_INSTANCE){
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    // dialog.showErrorBox('중복실행', '이미 가동중입니다.');
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload
//     )
//     .catch(console.log);
// };

import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    // await installExtensions();
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
    installExtension(
      extensions,
      {loadExtensionOptions: {allowFileAccess: true}, forceDownload: forceDownload}
    )
    .catch(console.log);

  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // const {width,height} = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    show: false,
    width: 1800,
    height: 800,
    minWidth: 1012,
    minHeight: 800,
    // minWidth: 400,
    // minHeight: 200,
    maxWidth: 1800,
    backgroundColor: '#252839',
    title: 'HLS Stream Recorder',
    // minimizable: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true
    },
  });
  // mainWindow.maximize();
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  let confirmClose = false;
  mainWindow.on('close', (event) => {
    if(confirmClose === false){
      event.preventDefault();
      dialog.showMessageBox({
        message: 'Really Quit?',
        buttons: ['yes', 'no'],
        defaultId: 1,
        title: 'confirm close.'
      })
      .then(result => {
        console.log(result);
        if(result.response === 1){
          // cancel. do nothing. 

        } else {
          // yes. quit application.
          confirmClose = true;
          app.quit();
        }
      })
    }
  })

  // mainWindow.on('minimize', event => {
  //   // event.preventDefault();
  //   console.log('minimize clicked')
  //   // mainWindow.hide();
  //   mainWindow.setMinimizable(false)
  //   mainWindow.webContents.send('cmd-change-small-UI');
  // })

  // ipcMain.on('ready-small-UI', () => {
  //   mainWindow.setSize(400, 200, false);
  // })

  // ipcMain.on('mini-ui-mounted', () => {
  //   mainWindow.show();
  // })

  // ipcMain.on('mini-ui-umounted', () => {
  //   mainWindow.setMinimizable(true);
  //   mainWindow.setSize(1750, 800, false)
  // })


  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on('crashed', (event) => {
    console.log('app crashed');
    app.relaunch();
    app.quit();
  });


  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
  //initialize statistics store
  clearStatisticsStore();

  const electronUtil = require('./lib/electronUtil');
  const electronLog = electronUtil.initElectronLog({}); 

  const {DELETE_SCHEDULE_CRON='0,10,20,30,40,50 * * * *'} = config;

  // const scheduler = require('./lib/scheduleManager');
  const scheduleManager = scheduler(true, electronLog);
  const deleteScheduler = scheduleManager.register('deleteClips', DELETE_SCHEDULE_CRON);

  deleteScheduler.on('triggered', name => {
    // const config = getConfig.getCombinedConfig({storeName:'optionStore', electronPath:'home'});
    const {
      BASE_DIRECTORY="none", 
      CHANNEL_PREFIX="channel",
      KEEP_SAVED_CLIP_AFTER_HOURS=24
    } = config;
    console.log(`triggered: ${name} baseDirectory:[${BASE_DIRECTORY}] channel prefix:[${CHANNEL_PREFIX}] delete before hours: [${KEEP_SAVED_CLIP_AFTER_HOURS}]`);
    electronLog.log(`triggered: ${name} baseDirectory:[${BASE_DIRECTORY}] channel prefix:[${CHANNEL_PREFIX}] delete before hours: [${KEEP_SAVED_CLIP_AFTER_HOURS}]`);
    const channelNumbers = Array(20).fill(0).map((element, index) => index+1);
    const deleteJobs = channelNumbers.map(channelNumber => {
      const channelDirectory = path.join(BASE_DIRECTORY, `${CHANNEL_PREFIX}${channelNumber}`);
      const args = [
        channelNumber,
        channelDirectory,
        60 * 60 * KEEP_SAVED_CLIP_AFTER_HOURS, /* seconds */
        '*', /* dir */
        false /* test */
      ]
      return args;
    })
    sequenceExecute(deleteJobs);
  }); 

  const sequenceExecute = async deleteJobs => {
    try {
      if(deleteJobs.length > 0){
        const args = deleteJobs.shift();
        const channelNumber = args[0];
        const channelDirectory = args[1];
        const deleteBeforeSeconds = args[2]
        electronLog.info(`Delete Start...[${channelDirectory}]`);
        const results = await deleteDirectoryR(channelDirectory, deleteBeforeSeconds);
        electronLog.info('Delete End:', results);
        results.forEach(result => {
          if(result.deleted){
            deleteClipStore(result.file);
            // electronLog.info('Delete clipStore too');
          }
        })
        mainWindow.webContents.send('deleteScheduleDone', channelNumber);
        await sequenceExecute(deleteJobs);
      }
    } catch (error) {
      electronLog.error(error)
      console.error('error in delete clips')
    }

  }
  deleteScheduler.start();

};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  console.log('app quit!')
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

import Store from 'electron-store';
Store.initRenderer();
const clipStore = new Store({
  name:'clipStore',
  cwd:app.getPath('home')
})
const deleteClipStore = deletedPath => {
  // const clipStore = new Store({
  //   name:'clipStore',
  //   cwd:app.getPath('home')
  // })
  const clipId = path.basename(deletedPath);
  clipStore.delete(clipId);
}

const clearStatisticsStore = () => {
  const statisticsStore = new Store({
    name:'statisticsStore',
    cwd:app.getPath('home')
  })
  statisticsStore.clear();
}
