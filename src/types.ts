export interface IConfig {
  watch?: boolean;
  port?: number;
  host?: string;
  output?: string;
  input?: string;
  resource?: string;
  title?: string;
  favicon?: string;
  root?: string;
}

export interface IDirTree {
  id: string;
  filename?: string;
  dirname?: string;
  basename: string;
  path: string;
  relative_path: string;
  output_path: string;
  children?: IDirTree[];
}
