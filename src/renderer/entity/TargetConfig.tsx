class TargetConfig {
  public callbackType: number;

  public ip: string;

  public port: string;

  constructor(callbackType: number, ip: string, port: string) {
    this.callbackType = callbackType;
    this.ip = ip;
    this.port = port;
  }
}

export default TargetConfig;
