import SourceConfig from './SourceConfig';
import HandleConfig from './HandleConfig';
import TargetConfig from './TargetConfig';

class JobSchedule {
  public code: string;

  public title: string;

  public rule: string;

  public sourceConfig: SourceConfig;

  public handleConfig: HandleConfig;

  public targetConfig: TargetConfig;

  public remark: string;

  constructor(
    code: string,
    title: string,
    rule: string,
    sourceConfig: SourceConfig,
    handleConfig: HandleConfig,
    targetConfig: TargetConfig,
    remark: string
  ) {
    this.code = code;
    this.title = title;
    this.rule = rule;
    this.sourceConfig = sourceConfig;
    this.handleConfig = handleConfig;
    this.targetConfig = targetConfig;
    this.remark = remark;
  }
}

export default JobSchedule;
