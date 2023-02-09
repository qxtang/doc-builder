const { exec } = require('child_process');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const less = require('less');
const ora = require('ora');
const chalk = require('chalk');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const path = require('path');
const babel = require('@babel/core');

const CWD = process.cwd();
const OUTPUT_PATH = path.join(CWD, 'bin');
const SRC_PATH = path.join(CWD, 'src');

const { Command } = require('commander');
const program = new Command();

program.option('-w, --watch', 'watch', false);
program.parse(process.argv);
const options = program.opts();
const isWatch = options.watch;

let compiling = false;
let requestWhileCompiling = false;

const logger = {
  info: (...args) => {
    console.log(`\n\r[${new Date().toLocaleString()}]`, chalk.blueBright(...args));
  },
  error: (...args) => {
    console.log(`\n\r[${new Date().toLocaleString()}] ERROR:`, chalk.redBright(...args));
  }
};

const compileTs = async () => {
  return new Promise((resolve, reject) => {
    exec(
      'npx tsc',
      {
        cwd: CWD
      },
      function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      }
    );
  });
};

const compileLess = async () => {
  return new Promise((resolve, reject) => {
    const autoPrefixPlugin = new LessPluginAutoPrefix({ browsers: ['cover 99.5%'] });
    const lessInput = fs.readFileSync(path.join(SRC_PATH, 'resource/style.less'), { encoding: 'utf-8' });
    const lessOutputPath = path.join(OUTPUT_PATH, 'resource/style.css');

    less.render(
      lessInput,
      {
        compress: true,
        plugins: [autoPrefixPlugin]
      },
      (err, output) => {
        if (err) {
          reject(err);
        }

        fs.writeFileSync(lessOutputPath, output.css, { encoding: 'utf-8' });
        resolve();
      }
    );
  });
};

const compileScript = async () => {
  return new Promise((resolve, reject) => {
    const code = fs.readFileSync(path.join(SRC_PATH, 'resource/script.js'), { encoding: 'utf-8' });
    const output = path.join(OUTPUT_PATH, 'resource/script.js');

    babel.transform(
      code,
      {
        presets: [
          [
            '@babel/env',
            {
              targets: 'cover 99.5%'
            }
          ]
        ]
      },
      function (err, result) {
        if (err) {
          reject(err);
        }
        fs.writeFileSync(output, result.code, { encoding: 'utf-8' });
        resolve();
      }
    );
  });
};

const moveTpl = async () => {
  return new Promise((resolve) => {
    fs.copySync(path.join(SRC_PATH, 'ejs'), path.join(OUTPUT_PATH, 'ejs'));
    fs.copySync(path.join(SRC_PATH, 'resource'), path.join(OUTPUT_PATH, 'resource'));
    fs.copySync(path.join(SRC_PATH, 'default_index.md'), path.join(OUTPUT_PATH, 'default_index.md'));
    resolve();
  });
};

const reset = () => {
  fs.removeSync(OUTPUT_PATH);
  fs.mkdirSync(OUTPUT_PATH);
};

const doCompile = async () => {
  if (compiling) {
    requestWhileCompiling = true;
  }

  const fn = async () => {
    compiling = true;
    const spinner = ora('COMPILING').start();

    if (!isWatch) {
      reset();
    }

    if (!fs.existsSync(OUTPUT_PATH)) {
      fs.mkdirSync(OUTPUT_PATH);
    }

    try {
      await compileTs();
      await moveTpl();
      await compileLess();
      await compileScript();

      spinner.color = 'green';
      spinner.succeed('COMPILE SUCCESS');
    } catch (err) {
      spinner.color = 'red';
      spinner.fail(`COMPILE ERROR: ${err}`);
      process.exit(1);
    } finally {
      compiling = false;

      if (requestWhileCompiling) {
        requestWhileCompiling = false;
        await fn();
      }
    }
  };

  if (!compiling) {
    await fn();
  }
};

(async () => {
  logger.info(`COMPILE START: ${isWatch ? 'dev' : 'build'}`);
  await doCompile();
})();

if (isWatch) {
  chokidar.watch(SRC_PATH, { depth: 10 }).on('change', async (filename) => {
    logger.info('src file change:', filename);

    await doCompile();
  });
}
