import path from 'path';
import { IConfig, IOption } from '../types';

interface IParams {
  options: IOption;
}

const cwd = process.cwd();

export const getConfig = (params: IParams): IConfig => {
  const { options } = params;
  let cfgByFile: Partial<IConfig> = {};

  if (options.config) {
    const filepath = path.join(cwd, options.config);
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
    watch: cfgByFile.watch ?? options.watch,
    port,
    host: cfgByFile.host || options.host,
    output: cfgByFile.output || options.output,
    input: cfgByFile.input || options.input,
    resource: cfgByFile.resource || options.resource,
    title: cfgByFile.title || options.title,
    root,
    ignore: cfgByFile.ignore || (options.ignore as string).split(','),
  };

  return result;
};
