import path from 'path';
import { IConfig, IOption } from '../types';

export const CWD = process.cwd();
export const APP_NAME = 'doc-builder';

export const getConfig = (options: IOption): IConfig => {
  let cfgByFile: Partial<IConfig> = {};

  if (options.config) {
    const filepath = path.join(CWD, options.config);
    cfgByFile = require(filepath);
  }

  const port: number = (function () {
    if (!isNaN(Number(cfgByFile.port))) {
      return Number(cfgByFile.port);
    }
    return Number(options.port);
  })();

  const _root = cfgByFile.root || options.root;
  const root = _root ? `/${_root}` : _root;

  const result = {
    port,
    host: cfgByFile.host || options.host,
    output: cfgByFile.output || options.output,
    input: cfgByFile.input || options.input,
    resource: cfgByFile.resource || options.resource,
    title: cfgByFile.title || options.title,
    root,
    ignore: cfgByFile.ignore || options.ignore.split(','),
  };

  return result;
};
