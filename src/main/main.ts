/* eslint-disable no-unused-expressions */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { Socket } from 'node:net';
import electron, {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { ToadScheduler } from 'toad-scheduler';
import { v4 as uuidv4 } from 'uuid';
import JobSchedule from 'renderer/entity/JobSchedule';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import db from './datastore';
import log from './log';
import addJobTask from './jobTask';

// const isDevelopment = process.env.NODE_ENV !== 'production';

const { globalShortcut } = electron;

const scheduler = new ToadScheduler();

db.defaults({ jobSchedules: [] }).write();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.platform === 'darwin') {
  const exeName = path.basename(process.execPath);
  app.setLoginItemSettings({
    openAtLogin: true, // 自启动
    openAsHidden: false,
    path: process.execPath,
    args: ['--processStart', `"${exeName}"`],
  });
}

// 开机自启动，非开发模式，mwp，2023.08.01
// if (!isDevelopment) {
// if (process.platform === 'darwin') {
//   const exeName = path.basename(process.execPath);
//   app.setLoginItemSettings({
//     openAtLogin: true,
//     path: process.execPath,
//     args: [
//       '--processStart',
//       `"${exeName}"`,
//       '--process-start-args',
//       '"--hidden"',
//     ],
//   });
// }
// }
// if (app.isPackaged) {
//   console.log('====================');
//   // const exeName = path.basename(process.execPath);
//   app.setLoginItemSettings({
//     openAtLogin: true,
//     openAsHidden: false,
//     path: process.execPath,
//     args: [path.resolve(process.argv[1])],
//     // args: [
//     //   '--processStart',
//     //   `"${exeName}"`,
//     //   // '--process-start-args',
//     //   // '"--hidden"',
//     // ],
//   });
// } else {
//   console.log('--------------------');
//   app.setLoginItemSettings({
//     openAtLogin: true,
//   });
// }
const jobSocketClientMap: Map<string, any> = new Map();

ipcMain.on('open-directory-dialog', (event) => {
  dialog
    .showOpenDialog({
      filters: [{ name: '文件类型', extensions: ['csv'] }],
      properties: ['openFile', 'multiSelections'],
    })
    .then((results) => {
      event.sender.send('selected-path', results.filePaths);
    })
    .catch((err) => log.error(err));
});

// db crud
ipcMain.on('lowdb-insert', async (event, arg) => {
  const data: JobSchedule = arg[0];
  data.jobId = uuidv4();
  data.isInSchedule = true;
  data.isSocketConnected = false;
  db.get('jobSchedules').push(data).write();
  // 添加定时任务
  addJobTask(data, scheduler, jobSocketClientMap);
});

ipcMain.on('lowdb-delete', async (event, arg) => {
  const id = arg[0];
  db.get('jobSchedules').remove({ jobId: arg[0] }).write();
  if (scheduler.existsById(id)) {
    scheduler.removeById(id);
  }
});

ipcMain.on('lowdb-update', async (event, args) => {
  const data = args[0];
  data.isInSchedule = true;
  log.info('lowdb-update', data);
  db.get('jobSchedules').find({ jobId: data.jobId }).assign(data).write();
  // 修改定时任务
  log.info(scheduler.existsById(data.jobId));
  if (scheduler.existsById(data.jobId)) {
    // 移除定时任务
    if (jobSocketClientMap.has(data.jobId)) {
      const socketClient: Socket = jobSocketClientMap.get(data.jobId);
      if (socketClient) {
        socketClient.destroy();
      }
      jobSocketClientMap.delete(data.jobId);
    }
    log.info('lowdb-update remove scheduler');
    scheduler.removeById(data.jobId);
  }
  addJobTask(data, scheduler, jobSocketClientMap);
});

ipcMain.on('lowdb-query', async (event) => {
  const datas = db.get('jobSchedules').value();
  event.sender.send('query-reply', datas);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

// 托盘功能，mwp，2023.07.31
// eslint-disable-next-line no-unused-vars
let tray = null;
const trayFun = (win: any) => {
  // const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  // let icon = null;
  // if (isDevelopment) {
  //   // 开发环境
  //   // icon = nativeImage.createFromPath(path.join(app.getAppPath(), '/icon.png'));
  //   icon = nativeImage.createFromPath(
  //     path.join(__dirname, '../../assets/icon.png')
  //   );
  // } else {
  //   // 正式环境
  //   icon = nativeImage.createFromPath(
  //     path.join(path.dirname(app.getPath('exe')), '/icon.png')
  //   );
  // }
  const icon = nativeImage.createFromPath(getAssetPath('icon.png'));
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出应用',
      type: 'normal',
      click: () => {
        console.log('退出应用');
        if (process.platform !== 'darwin') {
          // app.quit();
          app.exit();
        }
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('实验室氧碳软件');
  tray.on('click', () => {
    console.log('图标点击了');
    win.show();
  });
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: true,
      // devTools: false
    },
    autoHideMenuBar: true,
    // frame: false,
    resizable: false,
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });
  // 最小化到托盘，mwp，2023.07.31
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  // mainWindow.on('closed', () => {
  //   // mainWindow = null;
  // });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
  // 调用托盘功能方法，mwp，2023.07.31
  trayFun(mainWindow);
};

const initSchedule = async () => {
  log.info('initSchedule ---- start!');
  const datas: JobSchedule[] = db.get('jobSchedules').value();
  log.info(`initSchedule ---> ${JSON.stringify(datas)}`);
  if (datas.length !== 0) {
    for (let index = 0; index < datas.length; index += 1) {
      const data = datas[index];
      if (scheduler.existsById(data.jobId)) {
        scheduler.removeById(data.jobId);
      }
      addJobTask(data, scheduler, jobSocketClientMap);
    }
  }
  // 添加测试job
  log.info('initSchedule ---- end!');
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', (event: any) => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  // event.preventDefault();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
    // init schedule
    initSchedule();
    globalShortcut.register('CommandOrControl+Shift+L', () => {
      const focusWin = BrowserWindow.getFocusedWindow();
      focusWin && focusWin.webContents.toggleDevTools();
    });
  })
  .catch(console.log);
