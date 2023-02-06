class SourceConfig {
  public sourceType: number;

  public filePath: string;

  constructor(sourceType: number, filePath: string) {
    this.sourceType = sourceType;
    this.filePath = filePath;
  }
}

export default SourceConfig;
