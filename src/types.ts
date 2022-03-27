export interface IConfig {
  watch: boolean;
  port: number;
  host: string;
  output: string;
  input: string;
  resource: string;
  title: string;
  favicon: string;
  root: string;
}

export interface IOption extends IConfig {
  config: string;
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
}
