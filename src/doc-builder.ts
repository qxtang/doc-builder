#!/usr/bin/env node

import { IConfig, IDirTree } from './types';

const arg = require('arg');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const markdownIt = require('markdown-it')({
  html: true,
});
const liveServer = require('live-server');
const pkgName = require('../package.json').name.toUpperCase();

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
  favicon: './resource/favicon.ico',
  root: '',
};

const config: IConfig = (function () {
  let cfgByFile: IConfig = {};

  if (args['--config']) {
    const filepath = path.join(cwd, args['--config']);
    cfgByFile = require(filepath);
  }

  const result = {
    watch: args['--watch'] || cfgByFile.watch || DEFAULT_CONFIG.watch,
    port: args['--port'] || cfgByFile.port || DEFAULT_CONFIG.port,
    host: args['--host'] || cfgByFile.host || DEFAULT_CONFIG.host,
    output: args['--output'] || cfgByFile.output || DEFAULT_CONFIG.output,
    input: args['--input'] || cfgByFile.input || DEFAULT_CONFIG.input,
    resource: args['--resource'] || cfgByFile.resource || DEFAULT_CONFIG.resource,
    title: args['--title'] || cfgByFile.title || DEFAULT_CONFIG.title,
    favicon: args['--favicon'] || cfgByFile.favicon || DEFAULT_CONFIG.favicon,
    root: args['--root'] || cfgByFile.root || DEFAULT_CONFIG.root,
  };

  return result;
})();

const isDev = config.watch;
const inputPath = path.join(cwd, config.input);
const outputPath = path.join(cwd, config.output);
const resourcePath = path.join(inputPath, config.resource);

let buildTimer = null;

// 获取文件树
const getDirTree = (dir): Array<IDirTree> => {
  const fn = (dir) => {
    const res = [];
    const filenames = fs.readdirSync(dir);

    filenames.forEach((filename) => {
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
  return res;
};

// 生成文件树 json
const genDirTreeJson = async (dirTree: Array<IDirTree>) => {
  fs.writeFileSync(path.join(outputPath, 'dir_tree.json'), JSON.stringify(dirTree), { encoding: 'utf-8' });
};

// 根据文件树执行渲染
const renderDirTree = async (dirTree: Array<IDirTree>) => {
  const renderByFileInfoArr = (fileInfoArr: Array<IDirTree> = []) => {
    fileInfoArr.forEach((info) => {
      const isDir = !!info.dirname;

      if (!isDir) {
        const markdown = fs.readFileSync(path.join(info.path, info.filename), { encoding: 'utf-8' });
        const html = markdownIt.render(markdown);
        const extname = path.extname(info.filename);
        const basename = info.filename.substring(0, info.filename.indexOf(extname));

        ejs.renderFile(
          path.resolve(__dirname, 'ejs/tpl.ejs'),
          {
            root: config.root ? `/${config.root}` : config.root,
            html: html,
            title: config.title,
            basename: basename,
            favicon: config.favicon,
          },
          function (err, str) {
            if (err) {
              console.log(`[${pkgName}]: render ejs error:`, err);
              return;
            }

            const isPathExists = fs.pathExistsSync(info.output_path);

            if (!isPathExists) {
              fs.mkdirSync(info.output_path);
            }

            fs.writeFileSync(path.join(info.output_path, `${basename}.html`), str, { encoding: 'utf-8' });
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
    // console.log(e);
  }
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

      exec('git clone https://gitee.com/qx9/doc-builder-tpl.git .', { cwd }, function (err) {
        if (err) {
          throw new Error(err);
        }
        fs.removeSync(path.join(cwd, '.git'));

        exec('npm install', { cwd }, function (err) {
          if (err) {
            throw new Error(err);
          }

          console.log(`[${pkgName}]: \n初始化成功！\nnpm run dev --启动本地服务\nnpm run build --打包`);
        });
      });
    } catch (e) {
      console.log(`[${pkgName}]: 初始化失败：`, e);
    }

    return;
  }

  console.log(`[${pkgName}]: start ${isDev ? 'dev' : 'build'}`);

  // reset output
  fs.removeSync(outputPath);
  fs.mkdirSync(outputPath);

  await doBuild();

  if (isDev) {
    // watch input
    chokidar.watch([inputPath, __dirname], { depth: 10 }).on('change', async (filename) => {
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
