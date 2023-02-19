import path from 'path';
import { app } from 'electron';
import log from 'electron-log';

log.initialize({ preload: true });

log.transports.file.resolvePathFn = () =>
  path.join(app.getPath('userData'), 'logs/dataListener.log');

log.errorHandler.startCatching();

export default log;
