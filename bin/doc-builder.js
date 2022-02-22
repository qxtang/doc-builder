const arg = require('arg');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const markdownIt = require('markdown-it')();
const liveServer = require('live-server');

const args = arg({
  '--config': String,
  '--watch': Boolean,
});
const cwd = process.cwd();
const configPath = path.join(cwd, args['--config'] || 'builder.config.js');
const config = require(configPath);

const isDev = args['--watch'];
const inputPath = path.join(cwd, config.input || '/notes');
const outputPath = path.join(cwd, config.output || '/dist');

console.log('args:', args);

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
        console.log(`render ejs error:`, err);
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
        console.log(`render index ejs error:`, err);
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
  console.log(`----- START ${isDev ? 'DEV' : 'BUILD'} -----`);

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
  console.log(`----- BUILD FINISH -----`);
})();

if (isDev) {
  chokidar.watch(inputPath, { depth: 10 }).on('change', async (filename) => {
    const basename = path.basename(filename);
    const extname = path.extname(filename);
    console.log('change:', basename);

    await copyResource();

    if (extname === '.md') {
      const allFileName = await getAllFileName();
      const menuConfig = await getMenuConfig(allFileName);

      renderByFileName(basename, menuConfig);
      renderIndex(menuConfig);
    }
  });

  liveServer.start({
    port: config.port || 8080,
    host: config.host || '0.0.0.0',
    root: outputPath,
    open: false,
    logLevel: 0,
  });
}
