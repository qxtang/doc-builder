#!/usr/bin/env node

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

  // Aliases
  '-w': '--watch',
});

const cwd = process.cwd();

const DEFAULT_CONFIG = {
  watch: false,
  port: 8181,
  host: '127.0.0.1',
  output: 'dist',
  input: 'docs',
  resource: 'resource',
  title: 'docs',
  favicon: './resource/favicon.ico',
};

const config = (function () {
  let cfgByFile = {};

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
  };

  return result;
})();

const isDev = config.watch;
const inputPath = path.join(cwd, config.input);
const outputPath = path.join(cwd, config.output);
const resourcePath = path.join(inputPath, config.resource);

const getAllFileName = async () => {
  let result = fs.readdirSync(inputPath);
  result = result.filter((filename) => {
    const extname = path.extname(filename);
    return extname === '.md';
  });
  return result;
};

const getMenuConfig = async (allFileName) => {
  let result = allFileName.map((filename) => {
    const extname = path.extname(filename);
    const basename = filename.substring(0, filename.indexOf(extname));
    return basename;
  });

  result = result.filter((i) => i !== 'index');
  return result;
};

const renderByFileName = (filename, menuConfig) => {
  const markdown = fs.readFileSync(path.join(inputPath, filename), { encoding: 'utf-8' });
  const html = markdownIt.render(markdown);
  const extname = path.extname(filename);
  const basename = filename.substring(0, filename.indexOf(extname));

  ejs.renderFile(
    path.resolve(__dirname, 'tpl.ejs'),
    {
      data: html,
      menu: menuConfig,
      title: config.title,
      basename: basename,
      favicon: config.favicon,
    },
    function (err, str) {
      if (err) {
        console.log(`[${pkgName}]: render ejs error:`, err);
        return;
      }

      fs.writeFileSync(path.join(outputPath, `${basename}.html`), str, { encoding: 'utf-8' });
    }
  );
};

const renderIndex = (menuConfig) => {
  ejs.renderFile(
    path.resolve(__dirname, 'index.ejs'),
    {
      menu: menuConfig,
      title: config.title,
      favicon: config.favicon,
    },
    function (err, str) {
      if (err) {
        console.log(`[${pkgName}]: render index ejs error:`, err);
        return;
      }

      fs.writeFileSync(path.join(outputPath, 'index.html'), str, { encoding: 'utf-8' });
    }
  );
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

// main
(async function () {
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

  // reset
  fs.removeSync(outputPath);
  fs.mkdirSync(outputPath);

  // build
  await copyTplResource();
  await copyUserResource();

  const allFileName = await getAllFileName();
  const menuConfig = await getMenuConfig(allFileName);

  renderIndex(menuConfig);
  allFileName.forEach((filename) => {
    renderByFileName(filename, menuConfig);
  });

  console.log(`[${pkgName}]: build finish`);

  if (isDev) {
    chokidar.watch(inputPath, { depth: 10 }).on('change', async (filename) => {
      const basename = path.basename(filename);
      const extname = path.extname(filename);
      console.log(`[${pkgName}]: file change:`, basename);

      await copyUserResource();

      if (extname === '.md') {
        const allFileName = await getAllFileName();
        const menuConfig = await getMenuConfig(allFileName);

        renderIndex(menuConfig);
        renderByFileName(basename, menuConfig);
      }
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
