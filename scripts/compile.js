const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const cwd = process.cwd();
const outputPath = path.join(cwd, 'bin');
const srcPath = path.join(cwd, 'src');
const chokidar = require('chokidar');
const { Command } = require('commander');
const program = new Command();

program.option('-w, --watch', 'watch', false);
program.parse(process.argv);
const options = program.opts();
const isWatch = options.watch;
let timer = null;
let lock = false;

const compileTs = () => {
  execSync(`npx tsc -p ${cwd}`);
};

const compileLess = () => {
  execSync(`npx less ${path.join(srcPath, 'resource/style.less')} ${path.join(outputPath, 'resource/style.css')} -x`);
};

const compileScript = () => {
  execSync(
    `npx babel --config-file ${path.join(cwd, 'babel.script.config.js')} ${path.join(
      srcPath,
      'resource/script.js'
    )} --out-file ${path.join(outputPath, 'resource/script.js')}`
  );
};

const moveTpl = () => {
  fs.copySync(path.join(srcPath, 'ejs'), path.join(outputPath, 'ejs'));
  fs.copySync(path.join(srcPath, 'resource'), path.join(outputPath, 'resource'));
  fs.copySync(path.join(srcPath, 'default_index.md'), path.join(outputPath, 'default_index.md'));
};

const reset = () => {
  fs.removeSync(outputPath);
  fs.mkdirSync(outputPath);
};

const main = () => {
  const fn = () => {
    if (lock) {
      return;
    }

    lock = true;
    console.log('START COMPILE:', { isWatch });

    if (!isWatch) {
      reset();
    }

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    compileTs();
    moveTpl();
    compileLess();
    compileScript();
    console.log('COMPILE FINISH');
    lock = false;
  };

  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    try {
      fn();
    } catch (e) {
      console.log('COMPILE FAIL:', e, '\n\r', e.output?.toString());
    }
  }, 500);
};

main();

if (isWatch) {
  chokidar.watch(srcPath, { depth: 10 }).on('change', async (filename) => {
    console.log('src change:', filename);

    main();
  });
}
