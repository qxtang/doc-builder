#!/usr/bin/env node

const arg = require('arg');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const markdownIt = require('markdown-it')();
const liveServer = require('live-server');
const pkgName = require('../package.json').name.toUpperCase();

const args = arg({
  '--config': String,
  '--watch': Boolean,

  // Aliases
  '-w': '--watch',
});

const cwd = process.cwd();
const configPath = (function () {
  if (args['--config']) {
    return path.join(cwd, args['--config']);
  } else {
    return path.resolve(__dirname, './default.config.js');
  }
})();
const config = require(configPath);

const isDev = args['--watch'];
const inputPath = path.join(cwd, config.input || '/notes');
const outputPath = path.join(cwd, config.output || '/dist');
const PORT = config.port || 8080;
const HOST = config.host || '0.0.0.0';

const getAllFileName = async () => {
  let result = fs.readdirSync(inputPath);
  result = result.filter((filename) => {
    const extname = path.extname(filename);
    return extname === '.md';
  });
  return result;
};

const getMenuConfig = async (allFileName) => {
  const result = allFileName.map((filename) => {
    const extname = path.extname(filename);
    const basename = filename.substring(0, filename.indexOf(extname));
    return basename;
  });

  return result;
};

const renderByFileName = (filename, menuConfig) => {
  const markdown = fs.readFileSync(`${inputPath}/${filename}`, { encoding: 'utf-8' });
  const html = markdownIt.render(markdown);
  const extname = path.extname(filename);
  const basename = filename.substring(0, filename.indexOf(extname));

  ejs.renderFile(
    path.resolve(__dirname, './tpl.ejs'),
    {
      data: html,
      menu: menuConfig,
      title: basename,
    },
    function (err, str) {
      if (err) {
        console.log(`[${pkgName}]: render ejs error:`, err);
        return;
      }

      fs.writeFileSync(`${outputPath}/${basename}.html`, str, { encoding: 'utf-8' });
    }
  );
};

const renderIndex = (menuConfig) => {
  ejs.renderFile(
    path.resolve(__dirname, './index.ejs'),
    {
      menu: menuConfig,
    },
    function (err, str) {
      if (err) {
        console.log(`[${pkgName}]: render index ejs error:`, err);
        return;
      }

      fs.writeFileSync(`${outputPath}/index.html`, str, { encoding: 'utf-8' });
    }
  );
};

const copyResource = async () => {
  fs.copySync(`${inputPath}/resource`, `${outputPath}/resource`);
};

// main
(async function () {
  console.log(`[${pkgName}]: start ${isDev ? 'dev' : 'build'}`);

  // reset
  fs.removeSync(outputPath);
  fs.mkdirSync(outputPath);
  fs.copySync(path.resolve(__dirname, './resource'), `${outputPath}/resource`);
  await copyResource();

  // build
  const allFileName = await getAllFileName();
  const menuConfig = await getMenuConfig(allFileName);

  allFileName.forEach((filename) => {
    renderByFileName(filename, menuConfig);
  });

  renderIndex(menuConfig);
  console.log(`[${pkgName}]: build finish`);
})();

if (isDev) {
  chokidar.watch(inputPath, { depth: 10 }).on('change', async (filename) => {
    const basename = path.basename(filename);
    const extname = path.extname(filename);
    console.log(`[${pkgName}]: file change:`, basename);

    await copyResource();

    if (extname === '.md') {
      const allFileName = await getAllFileName();
      const menuConfig = await getMenuConfig(allFileName);

      renderByFileName(basename, menuConfig);
      renderIndex(menuConfig);
    }
  });

  liveServer.start({
    port: PORT,
    host: HOST,
    root: outputPath,
    open: false,
    logLevel: 0,
  });

  console.log(`[${pkgName}]: run at http://${HOST}:${PORT}`);
}
