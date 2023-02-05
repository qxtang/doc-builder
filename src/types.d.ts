export interface IConfig {
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
  isRootIndexFile?: boolean;
  isIndexFile?: boolean;
  basename: string;
  path: string;
  dirname?: string;
  children?: IDirTree[];
  content?: string;
}

export interface IEjsData {
  root: string;
  html: string;
  title: string;
  basename: string;
  tocHtml: string;
  menuHtml: string;
}
