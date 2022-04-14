export interface IConfig {
  watch: boolean;
  port: number;
  host: string;
  output: string;
  input: string;
  resource: string;
  title: string;
  root: string;
  ignore: Array<string>;
}

export interface IOption extends Omit<IConfig, "ignore"> {
  config: string;
  ignore: string;
}

export interface IDirTree {
  id: string;
  filename: string;
  basename: string;
  path: string;
  relative_path: string;
  output_path: string;
  dirname?: string;
  children?: IDirTree[];
  content?: string;
}
