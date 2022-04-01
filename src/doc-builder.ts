#!/usr/bin/env node

import { IConfig, IDirTree, IOption } from './types';

import chokidar from 'chokidar';
import fs from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import liveServer from 'live-server';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { Command } from 'commander';

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
  .option('--ignore <ignore>', '需要忽略的文件夹或文件列表，英文逗号分隔，在配置文件中则为数组', '');

program.showHelpAfterError();
program.parse(process.argv);
const options = program.opts<IOption>();

const markdownItInstance = markdownIt({
  html: true,
});
markdownItInstance.use(markdownItAnchor, {
  level: 1,
  permalink: markdownItAnchor.permalink.ariaHidden({
    placement: 'before',
    symbol:
      '<svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg>',
  }),
});
markdownItInstance.use(require('markdown-it-table-of-contents'));

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
    ignore: cfgByFile.ignore || (options.ignore as string).split(','),
  };

  return result;
})();

const isDev = config.watch;
const inputPath = path.join(cwd, config.input);
const outputPath = (function () {
  if (isDev) {
    return path.join(__dirname, '../.temp');
  }
  return path.join(cwd, config.output);
})();
const resourcePath = path.join(inputPath, config.resource);

let buildTimer: NodeJS.Timeout;

// 打印客户日志封装
const logger = {
  info: (...args: any) => {
    console.log(`\x1B[1m[${new Date().toLocaleString()}] - ${pkgName}:\x1B[22m`, ...args);
  },
  error: (...args: any) => {
    console.log(`\x1B[1m[${new Date().toLocaleString()}] - ${pkgName} - ERROR:\x1B[22m`, ...args);
  },
};

// 获取文件树
const getDirTree = (dir: string): Array<IDirTree> => {
  const fn = (dir: string) => {
    const res: Array<IDirTree> = [];
    const filenames = fs.readdirSync(dir);

    for (const filename of filenames) {
      const extname = path.extname(filename);
      const basename = filename.substring(0, filename.indexOf(extname));
      const relative_path = path.relative(inputPath, dir);
      const output_path = path.join(outputPath, relative_path);
      const id = path.join(relative_path, filename);
      const real_path = path.join(dir, filename);
      const stat = fs.lstatSync(real_path);
      const isDirectory = stat.isDirectory();
      const isFile = stat.isFile();
      const isStartsWithDot = filename.startsWith('.');

      const isIgnore = (config.ignore as Array<string>).some((item) => {
        return path.join(inputPath, item) === real_path;
      });

      if (isStartsWithDot || isIgnore) {
        continue;
      }

      if (['.md', '.markdown'].includes(extname) && isFile) {
        res.push({
          id,
          filename,
          basename,
          path: dir,
          relative_path,
          output_path,
        });
      } else if (isDirectory) {
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
    }

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
        const markdown = fs.readFileSync(path.join(info.path, info.filename), { encoding: 'utf-8' }) + '\r\n[[toc]]';
        const html = markdownItInstance.render(markdown);
        const basename = info.basename;
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

  const hasUserIndex: boolean = dirTree.some((i) => i.basename === 'index');

  if (!hasUserIndex) {
    dirTree.push({
      id: 'index.md',
      filename: 'default_index.md',
      basename: 'index',
      path: __dirname,
      relative_path: '',
      output_path: outputPath,
    });
  }

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
  } catch (e) {
    //
  }
};

const doBuild = async () => {
  const fn = async () => {
    logger.info('building...');
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

  buildTimer = setTimeout(fn, 1000);
};

const main = async () => {
  logger.info(`start ${isDev ? 'dev' : 'build'}, your config:`, config);

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
