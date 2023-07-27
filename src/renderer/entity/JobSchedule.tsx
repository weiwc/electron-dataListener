import { DateTime } from 'luxon';

class JobSchedule {
  public title: string;

  public rule: string;

  public remark: string;

  // 数据源配置
  public sourceType: number;

  public filePath: string;

  // 回调配置
  public callbackType: number;

  public ip: string;

  public port: string;

  private _jobId: string | undefined;

  public restfulPath: string;

  // 是否在 schedule 任务列表中
  private _isInSchedule: boolean | undefined;

  private _isSocketConnected: boolean | undefined;

  // 列表展示的更新时间
  public sortDate: string;

  // csv等文件的更新时间
  public fileUpdateDate: string;

  // csv中读取的最新时间
  public fileReadNewestTime: string;

  public orgName: string;

  public fileUpdateSize: number;

  constructor(
    title: string,
    rule: string,
    remark: string,
    sourceType: number,
    filePath: string,
    callbackType: number,
    ip: string,
    port: string,
    sortDate: string,
    fileUpdateDate: string,
    fileReadNewestTime: string,
    orgName: string,
    restfulPath: string,
    fileUpdateSize: number
  ) {
    this.title = title;
    this.rule = rule;
    this.remark = remark;
    this.sourceType = sourceType;
    this.filePath = filePath;
    this.callbackType = callbackType;
    this.ip = ip;
    this.port = port;
    this.sortDate = sortDate;
    this.fileUpdateDate = fileUpdateDate;
    this.fileReadNewestTime = fileReadNewestTime;
    this.orgName = orgName;
    this.restfulPath = restfulPath;
    this.fileUpdateSize = fileUpdateSize;
  }

  get jobId(): string {
    return this.jobId as string;
  }

  set jobId(val: string) {
    this.jobId = val;
  }

  get isInSchedule(): boolean {
    return this.isInSchedule as boolean;
  }

  set isInSchedule(val: boolean) {
    this.isInSchedule = val;
  }

  get isSocketConnected(): boolean {
    return this.isSocketConnected as boolean;
  }

  set isSocketConnected(val: boolean) {
    this.isInSchedule = val;
  }
}

export default JobSchedule;
