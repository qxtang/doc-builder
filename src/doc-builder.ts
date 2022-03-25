#!/usr/bin/env node

import { IConfig, IDirTree } from './types';

import arg from 'arg';
import chokidar from 'chokidar';
import { exec } from 'child_process';
import fs from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import { promisify } from 'util';
import liveServer from 'live-server';
import markdownIt from 'markdown-it';

const execAsync = promisify(exec);

const markdownItInstance = markdownIt({
  html: true,
});
const pkgName = 'DOC-BUILDER';

const args = arg({
  '--config': String,
  '--init': Boolean,

  // 配置
  '--watch': Boolean,
  '--input': String,
  '--output': String,
  '--resource': String,
  '--port': String,
  '--host': String,
  '--title': String,
  '--favicon': String,
  '--root': String,

  // Aliases
  '-w': '--watch',
});

const cwd = process.cwd();

const DEFAULT_CONFIG: IConfig = {
  watch: false,
  port: 8181,
  host: '127.0.0.1',
  output: 'dist',
  input: 'docs',
  resource: 'resource',
  title: 'docs',
  favicon: '/resource/favicon.ico',
  root: '',
};

const config: IConfig = (function () {
  let cfgByFile: Partial<IConfig> = {};

  if (args['--config']) {
    const filepath = path.join(cwd, args['--config']);
    cfgByFile = require(filepath);
  }

  const port: number = (function () {
    if (!isNaN(Number(args['--port']))) {
      return Number(args['--port']);
    }
    if (!isNaN(Number(cfgByFile.port))) {
      return Number(cfgByFile.port);
    }
    return DEFAULT_CONFIG.port;
  })();

  const _root = args['--root'] || cfgByFile.root || DEFAULT_CONFIG.root;
  const root = _root ? `/${_root}` : _root;

  const result = {
    watch: args['--watch'] || cfgByFile.watch || DEFAULT_CONFIG.watch,
    port,
    host: args['--host'] || cfgByFile.host || DEFAULT_CONFIG.host,
    output: args['--output'] || cfgByFile.output || DEFAULT_CONFIG.output,
    input: args['--input'] || cfgByFile.input || DEFAULT_CONFIG.input,
    resource: args['--resource'] || cfgByFile.resource || DEFAULT_CONFIG.resource,
    title: args['--title'] || cfgByFile.title || DEFAULT_CONFIG.title,
    favicon: args['--favicon'] || cfgByFile.favicon || root + DEFAULT_CONFIG.favicon,
    root,
  };

  return result;
})();

const isDev = config.watch;
const inputPath = path.join(cwd, config.input);
const outputPath = path.join(cwd, config.output);
const resourcePath = path.join(inputPath, config.resource);

let buildTimer: NodeJS.Timeout;

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

    return res;
  };

  let res = fn(dir);
  res = res.filter((i) => i.dirname !== 'resource');

  res.sort((a, b) => {
    if (a.children) {
      return -1;
    } else {
      return 1;
    }
  });
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
            fs.mkdirSync(info.output_path);
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
              fs.mkdirSync(info.output_path);
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
  } catch (e) { }
};

const doBuild = async () => {
  const fn = async () => {
    const dirTree = getDirTree(inputPath);
    await copyTplResource();
    await copyUserResource();
    await renderDirTree(dirTree);
    await genDirTreeJson(dirTree);
    console.log(`[${pkgName}]: build finish`);
  };

  if (buildTimer) {
    clearTimeout(buildTimer);
  }

  buildTimer = setTimeout(fn, 2000);
};

// Main
(async function Main() {
  if (args['--init']) {
    try {
      console.log(`[${pkgName}]: 开始初始化:`, cwd);

      await execAsync('git clone https://gitee.com/qx9/doc-builder-tpl.git .', { cwd });
      fs.removeSync(path.join(cwd, '.git'));
      await execAsync('npm install', { cwd });
      console.log(`[${pkgName}]: \n初始化成功！\nnpm run dev --启动本地服务\nnpm run build --打包`);
    } catch (e) {
      console.log(`[${pkgName}]: 初始化失败：`, e);
    }

    return;
  }

  console.log(`[${pkgName}]: start ${isDev ? 'dev' : 'build'}`);

  if (!fs.existsSync(inputPath)) {
    console.log(`[${pkgName}]: 输入文件夹不存在:`, inputPath);
    return;
  }

  // reset output
  fs.removeSync(outputPath);
  fs.mkdirSync(outputPath);

  await doBuild();

  if (isDev) {
    // watch input
    chokidar.watch([inputPath, __dirname], { depth: 10 }).on('change', async (filename: string) => {
      console.log(`[${pkgName}]: file change:`, filename);

      await doBuild();
    });

    liveServer.start({
      port: config.port,
      host: config.host,
      root: outputPath,
      open: false,
      logLevel: 0,
    });

    console.log(`[${pkgName}]: run at http://${config.host}:${config.port}`);
  }
})();
