#!/usr/bin/env node

import { IOption } from './types';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import liveServer from 'live-server';
import { Command } from 'commander';
import { getConfig } from './utils/config';
import logger from './utils/logger';
import { copyTplResource, copyUserResource, genDirTreeJson, getDirTree, renderDirTree } from './utils';

const program = new Command();
program
  .option('-w, --watch', '本地服务模式', false)
  .option('--config <config>', '声明配置文件', '')
  .option('--port <port>', '本地服务模式端口号', '8181')
  .option('--host <host>', '本地服务模式 host', '127.0.0.1')
  .option('--output <output>', '输出文件夹', 'dist')
  .option('--input <input>', '输入文件夹', '.')
  .option(
    '--resource <resource>',
    '存放图片等资源的文件夹，路径相对于输入文件夹，打包时会一并复制，当然也可以使用自己的图床',
    'resource'
  )
  .option('--title <title>', '站点主标题', 'doc-builder')
  .option('--favicon <favicon>', '自定义 favicon 资源路径', '/resource/favicon.ico')
  .option('--root <root>', '站点根目录，例如你的站点要部署在 https://abc.com/path/，则需要设置为 "path"', '')
  .option('--ignore <ignore>', '需要忽略的文件夹或文件列表，英文逗号分隔，在配置文件中则为数组', 'node_modules,dist');

program.showHelpAfterError();
program.parse(process.argv);
const options = program.opts<IOption>();

const cwd = process.cwd();
const config = getConfig({ options });

const isDev = config.watch;
const inputPath = path.join(cwd, config.input);
const outputPath = (function () {
  if (isDev) {
    return path.join(__dirname, '../temp');
  }
  return path.join(cwd, config.output);
})();
const resourcePath = path.join(inputPath, config.resource);

let buildTimer: NodeJS.Timeout;

const doBuild = async () => {
  const fn = async () => {
    logger.info('building...');
    const dirTree = getDirTree({ inputPath, outputPath, config });
    await genDirTreeJson(dirTree, outputPath);
    await copyTplResource(outputPath);
    await copyUserResource({ resourcePath, outputPath, config });
    await renderDirTree({ dirTree, config, outputPath });
    logger.info('build finish');
  };

  if (buildTimer) {
    clearTimeout(buildTimer);
  }

  buildTimer = setTimeout(fn, 1000);
};

const main = async () => {
  logger.info(`start ${isDev ? 'dev' : 'build'}, your config:\n${JSON.stringify(config, null, 2)}`);

  if (!fs.existsSync(inputPath)) {
    logger.error('输入文件夹不存在:', inputPath);
    return;
  }

  // reset output
  fs.removeSync(outputPath);
  fs.mkdirSync(outputPath);

  await doBuild();

  if (isDev) {
    // watch input
    chokidar
      .watch([inputPath, __dirname], { depth: 10, ignored: /(^|[\/\\])\../ }) // ignore dotfiles
      .on('change', async (filename: string) => {
        logger.info('file change:', filename);

        await doBuild();
      });

    liveServer.start({
      port: config.port,
      host: config.host,
      root: outputPath,
      open: false,
      logLevel: 0,
    });

    logger.info(`run at http://${config.host}:${config.port}`);
  }
};

main();
