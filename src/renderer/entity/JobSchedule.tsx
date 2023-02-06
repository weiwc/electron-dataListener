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

  constructor(
    title: string,
    rule: string,
    remark: string,
    sourceType: number,
    filePath: string,
    callbackType: number,
    ip: string,
    port: string
  ) {
    this.title = title;
    this.rule = rule;
    this.remark = remark;
    this.sourceType = sourceType;
    this.filePath = filePath;
    this.callbackType = callbackType;
    this.ip = ip;
    this.port = port;
  }
}

export default JobSchedule;
