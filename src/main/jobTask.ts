import { Socket } from 'net';
import JobSchedule from 'renderer/entity/JobSchedule';
import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import fs, { Stats } from 'fs';
import log from './log';
import createSocketClient from './socket';
import db from './datastore';
import { getNextDate } from './util';

const axios = require('axios').default;

const handleCsvSource = (data: JobSchedule) => {
  const { fileUpdateDate, fileReadNewestTime, orgName } = data;
  if (!fs.existsSync(data.filePath)) {
    log.error(`${data.filePath}文件不存在！`);
    return [];
  }
  log.info(`fileUpdateDate :${fileUpdateDate}`);
  const res: Stats = fs.statSync(data.filePath);
  // 修改时间
  const { mtime } = res;
  log.info(`mtime :${mtime}`);
  if (
    fileUpdateDate &&
    new Date(fileUpdateDate).getTime() === new Date(mtime).getTime()
  ) {
    // 如果 更新时间大于记录文件更新时间
    log.info(
      `${data.filePath}文件无改动，记录更新时间为${fileUpdateDate},文件更新时间为${mtime}！`
    );
    return [];
  }
  data.fileUpdateDate = mtime;
  const fileContext = fs.readFileSync(data.filePath, 'utf-8');
  const fileDatas = fileContext.split('\r\n').reverse();
  // 如果最新的数据时间为空，则取往前推三天的数据
  if (!fileReadNewestTime) {
    data.fileReadNewestTime = getNextDate(new Date(), -3);
  }
  log.info(`fileReadNewestTime is ${data.fileReadNewestTime}`);
  let tempNewTime;
  let tempList: string[] = [];
  const socketList: string[] = [];
  for (let index = 0; index < fileDatas.length; index += 1) {
    let line = fileDatas[index];
    line = line.replaceAll(' ', '');
    if (line) {
      // 处理数据
      log.info(line);
      const array = line.split(',');
      const [time, code, , carbon, oxygen] = array;
      const lineTime = `${time.substring(6, 10)}-${time.substring(
        3,
        5
      )}-${time.substring(0, 2)} ${time.substring(10, 22)}`;
      // 记录最新一条数据
      log.info(`lineTime is ${lineTime}`);
      if (tempNewTime) {
        tempNewTime =
          tempNewTime.getTime() < new Date(lineTime).getDate()
            ? new Date(lineTime)
            : tempNewTime;
      } else {
        tempNewTime = new Date(lineTime);
      }
      // 如果读取记录数据的时间 大于等于 当前数据的时间，跳出循环
      log.info(`fileReadNewestTime -> ${data.fileReadNewestTime}`);
      if (
        new Date(lineTime).getTime() <=
        new Date(data.fileReadNewestTime).getTime()
      ) {
        log.info('如果读取记录数据的时间 大于等于 当前数据的时间，跳出循环');
        if (tempList.length > 0) {
          socketList.push(tempList.join(';'));
          tempList = [];
        }
        break;
      }
      const socketStr = `YT:${orgName},${code},${(Number(carbon) * 2).toFixed(
        4
      )},${(Number(oxygen) * 2).toFixed(4)}`;
      tempList.push(socketStr);
      if (tempList.length === 20 || index === fileDatas.length - 1) {
        socketList.push(tempList.join(';'));
        tempList = [];
      }
    }
  }
  log.info(data);
  if (tempNewTime) {
    data.fileReadNewestTime = new Date(
      tempNewTime.getTime() - tempNewTime.getTimezoneOffset() * 60000
    );
  }
  log.info(JSON.stringify(socketList));
  return socketList;
};

const socketHandle = (data: JobSchedule, jobSocketClientMap: any) => {
  const { port, ip } = data;
  // 判断是否已建立socket连接
  let socketClient: Socket = jobSocketClientMap.get(data.jobId);
  if (!socketClient) {
    socketClient = createSocketClient(
      Number(port) as number,
      ip,
      data,
      jobSocketClientMap
    );
    jobSocketClientMap.set(data.jobId, socketClient);
  }
  if (data.isSocketConnected) {
    const socketList: string[] = handleCsvSource(data);
    socketList.forEach((socketData) => {
      socketClient.write(socketData);
    });
    log.info(data);
    db.get('jobSchedules').find({ jobId: data.jobId }).assign(data).write();
  }
  return null;
};

const restfulHandle = (data: JobSchedule) => {
  log.info('start -------------------> restfulHandle');
  const { restfulPath } = data;
  const csvList: string[] = handleCsvSource(data);
  csvList.forEach((csvData) => {
    log.info(restfulPath);
    log.info(csvData);
    axios
      .post(restfulPath, csvData)
      .then((response: any) => {
        log.info(response);
        return response;
      })
      .catch((error: any) => {
        log.info(error);
      });
  });
  log.info('end -------------------> restfulHandle');
};

// 添加定时任务
const addJobTask = (
  data: JobSchedule,
  scheduler: ToadScheduler,
  jobSocketClientMap?: any
) => {
  const task = new Task(
    data.title,
    async () => {
      // 使用data
      log.info(`AsyncTask exec --->${JSON.stringify(data)}`);
      let { callbackType } = data;
      callbackType = Number(callbackType);
      switch (callbackType) {
        case 1:
          socketHandle(data, jobSocketClientMap);
          break;
        case 2:
          restfulHandle(data);
          break;
        default:
          break;
      }
      return new Promise(() => {});
    },
    (err: Error) => {
      log.error(err);
    }
  );
  const job = new SimpleIntervalJob(
    { seconds: 5, runImmediately: true },
    task,
    {
      id: data.jobId,
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(job);
  log.info(`addJobTask --->${JSON.stringify(data)}`);
  log.info(`addJobTask --->${job.id}`);
};

export default addJobTask;
