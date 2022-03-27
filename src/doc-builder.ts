#!/usr/bin/env node

import { IConfig, IDirTree, IOption } from './types';

import chokidar from 'chokidar';
import { exec } from 'child_process';
import fs from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import { promisify } from 'util';
import liveServer from 'live-server';
import markdownIt from 'markdown-it';
import { Command } from 'commander';

const program = new Command();
program
  .option('--init', '初始化模板项目', false)
  .option('-w, --watch', '本地服务模式', false)
  .option('--config <config>', '自定义配置文件，配置文件中的配置优先级高于命令行配置', '')
  .option('--port <port>', '本地服务模式端口号', '8181')
  .option('--host <host>', '本地服务模式 host', '127.0.0.1')
  .option('--output <output>', '输出文件夹', 'dist')
  .option('--input <input>', '输入文件夹', 'docs')
  .option(
    '--resource <resource>',
    '存放图片等资源的文件夹，路径相对于输入文件夹，打包时会一并复制，默认值 resource（即位置为 docs/resource），当然也可以使用自己的图床',
    'resource'
  )
  .option('--title <title>', '站点主标题', 'docs')
  .option('--favicon <favicon>', '自定义 favicon 资源路径', '/resource/favicon.ico')
  .option(
    '--root <root>',
    ' 站点根目录，例如你的站点要部署在 https://abc.com/path/，则需要设置为 "path"，默认值 ""',
    ''
  );

program.showHelpAfterError();
program.addHelpText(
  'after',
  `
创建项目举例:
  $ mkdir project && cd project
  $ doc-builder --init # 初始化模板项目
  $ npm run dev        # 本地服务模式
  $ npm run build      # 打包
`
);
program.parse(process.argv);
const options = program.opts<IOption>();

const execAsync = promisify(exec);
const markdownItInstance = markdownIt({
  html: true,
});
const pkgName = 'DOC-BUILDER';
const cwd = process.cwd();

const config: IConfig = (function () {
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
    favicon: cfgByFile.favicon || root + options.favicon,
    root,
  };

  return result;
})();

const isDev = config.watch;
const inputPath = path.join(cwd, config.input);
const outputPath = path.join(cwd, config.output);
const resourcePath = path.join(inputPath, config.resource);

let buildTimer: NodeJS.Timeout;

// 打印客户日志封装
const logger = {
  info: (...args: any) => {
    console.log(`[${new Date().toLocaleString()}] - [${pkgName}]:`, ...args);
  },
  error: (...args: any) => {
    console.log(`[${new Date().toLocaleString()}] - [${pkgName}] - ERROR:`, ...args);
  },
};

// 获取文件树
const getDirTree = (dir: string): Array<IDirTree> => {
  const fn = (dir: string) => {
    const res: Array<IDirTree> = [];
    const filenames = fs.readdirSync(dir);

    filenames.forEach((filename: string) => {
      const extname = path.extname(filename);
      const basename = filename.substring(0, filename.indexOf(extname));
      const relative_path = path.relative(inputPath, dir);
      const output_path = path.join(outputPath, relative_path);
      const id = path.join(relative_path, filename);

      if (extname === '.md') {
        res.push({
          id,
          filename,
          basename,
          path: dir,
          relative_path,
          output_path,
        });
      } else if (extname === '') {
        res.push({
          id,
          dirname: filename,
          filename: '',
          basename,
          path: dir,
          relative_path,
          output_path,
          children: fn(path.join(dir, filename)),
        });
      }
    });

    res.sort((a) => {
      if (a.children) {
        return -1;
      } else {
        return 1;
      }
    });

    return res;
  };

  let res = fn(dir);
  res = res.filter((i) => i.dirname !== 'resource');

  return res;
};

// 生成文件树 json
const genDirTreeJson = async (dirTree: Array<IDirTree>) => {
  fs.writeFileSync(path.join(outputPath, 'dir_tree.json'), JSON.stringify(dirTree), { encoding: 'utf-8' });
};

// 根据文件树执行渲染
const renderDirTree = async (dirTree: Array<IDirTree>) => {
  const renderByFileInfoArr = (fileInfoArr: Array<IDirTree> = []) => {
    fileInfoArr.forEach((info: IDirTree) => {
      const isDir = !!info.dirname;

      if (!isDir) {
        const markdown = fs.readFileSync(path.join(info.path, info.filename), { encoding: 'utf-8' });
        const html = markdownItInstance.render(markdown);
        const extname = path.extname(info.filename);
        const basename = info?.filename?.substring(0, info?.filename?.indexOf(extname));
        const ejsData = {
          root: config.root,
          html: html,
          title: config.title,
          basename: basename === 'index' ? '' : basename,
          favicon: config.favicon,
        };

        ejs.renderFile(path.resolve(__dirname, 'ejs/tpl.ejs'), ejsData, function (err: Error | null, str: string) {
          if (err) {
            throw err;
          }
          const isPathExists = fs.pathExistsSync(info.output_path);
          if (!isPathExists) {
            fs.mkdirSync(info.output_path, { recursive: true });
          }
          fs.writeFileSync(path.join(info.output_path, `${basename}.html`), str, { encoding: 'utf-8' });
        });

        ejs.renderFile(
          path.resolve(__dirname, 'ejs/tpl-share.ejs'),
          ejsData,
          function (err: Error | null, str: string) {
            if (err) {
              throw err;
            }
            const isPathExists = fs.pathExistsSync(info.output_path);
            if (!isPathExists) {
              fs.mkdirSync(info.output_path, { recursive: true });
            }
            fs.writeFileSync(path.join(info.output_path, `${basename}-share.html`), str, { encoding: 'utf-8' });
          }
        );
      } else {
        renderByFileInfoArr(info.children);
      }
    });
  };

  renderByFileInfoArr(dirTree);
};

// 拷贝模板资源
const copyTplResource = async () => {
  fs.copySync(path.resolve(__dirname, 'resource'), path.join(outputPath, 'resource'));
};

// 拷贝用户的资源
const copyUserResource = async () => {
  try {
    fs.copySync(resourcePath, path.join(outputPath, config.resource));
    fs.copySync(path.join(cwd, 'manifest.json'), path.join(outputPath, 'manifest.json'));
  } catch (e) {
    //
  }
};

const doBuild = async () => {
  const fn = async () => {
    const dirTree = getDirTree(inputPath);
    await copyTplResource();
    await copyUserResource();
    await renderDirTree(dirTree);
    await genDirTreeJson(dirTree);
    logger.info('build finish');
  };

  if (buildTimer) {
    clearTimeout(buildTimer);
  }

  buildTimer = setTimeout(fn, 2000);
};

const doInit = async () => {
  try {
    logger.info(`开始初始化:`, cwd);

    await execAsync('git clone https://gitee.com/qx9/doc-builder-tpl.git .', { cwd });
    fs.removeSync(path.join(cwd, '.git'));
    await execAsync('npm install', { cwd });
    logger.info(`
初始化成功
$ npm run dev 启动本地服务
$ npm run build 打包
    `);
  } catch (e) {
    logger.error(`初始化失败：`, e);
  }
};

const main = async () => {
  if (options.init) {
    await doInit();
    return;
  }

  logger.info(`start ${isDev ? 'dev' : 'build'}`);

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
    chokidar.watch([inputPath, __dirname], { depth: 10 }).on('change', async (filename: string) => {
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
