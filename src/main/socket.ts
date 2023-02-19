import net, { NetConnectOpts, Socket } from 'node:net';
import log from './log';
import db from './datastore';

const createSocketClient = (
  port: number,
  ip: any,
  data?: any,
  jobSocketClientMap?: any
) => {
  const netOptions: NetConnectOpts = {
    port,
    host: ip,
  };
  const socketClient: Socket = net.createConnection(netOptions);
  socketClient.setKeepAlive(true);
  socketClient.setNoDelay(true);
  socketClient.on('connect', () => {
    log.info(`${ip}:${port}-socket连接成功！`);
    data.isSocketConnected = true;
    db.get('jobSchedules').find({ jobId: data.jobId }).assign(data).write();
  });
  socketClient.on('data', (msg) => {
    log.info(`${ip}:${port}-socket连接接收数据: ${msg}！`);
  });
  socketClient.on('error', () => {
    log.info(`${ip}:${port}-socket连接错误！`);
    data.isSocketConnected = false;
    db.get('jobSchedules').find({ jobId: data.jobId }).assign(data).write();
    jobSocketClientMap.delete(data.jobId);
  });
  socketClient.on('end', () => {
    log.info(`${ip}:${port}-socket客户端被关闭了`);
    data.isSocketConnected = false;
    db.get('jobSchedules').find({ jobId: data.jobId }).assign(data).write();
    jobSocketClientMap.delete(data.jobId);
  });
  return socketClient;
};

export default createSocketClient;
