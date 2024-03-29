import { IConfig, IOption } from './types';
import chokidar from 'chokidar';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import liveServer from 'live-server';
import { Command } from 'commander';
import { APP_NAME, CWD, getConfig } from './utils/config';
import logger from './utils/logger';
import {
  copyTplResource,
  copyUserResource,
  genDirTreeJson,
  genManifest,
  genNojekyllFile,
  getDirTree,
  printInfo,
  printIpAddrs,
  renderDirTree,
} from './utils';

class DocBuilder {
  building: boolean;
  requestWhileBuilding: boolean;

  setCommonOptions(program: Command) {
    program
      .option('--config <config>', '声明配置文件', '')
      .option('--port <port>', '本地服务模式端口号', '8181')
      .option('--host <host>', '本地服务模式 host', '0.0.0.0')
      .option('--output <output>', '输出文件夹', 'dist')
      .option('--input <input>', '输入文件夹', '.')
      .option(
        '--resource <resource>',
        '存放图片等资源的文件夹，路径相对于输入文件夹，打包时会一并复制，当然也可以使用自己的图床',
        'resource',
      )
      .option('--title <title>', '站点主标题', 'doc-builder')
      .option(
        '--root <root>',
        '站点根目录，例如你的站点要部署在 https://abc.com/path/，则需要设置为 "path"',
        '',
      )
      .option(
        '--ignore <ignore>',
        '需要忽略的文件夹或文件列表，英文逗号分隔，在配置文件中则为数组',
        'node_modules,dist',
      );

    return program;
  }

  async doBuild(options: {
    inputPath: string;
    outputPath: string;
    resourcePath: string;
    config: IConfig;
  }) {
    if (this.building) {
      this.requestWhileBuilding = true;
    }

    const fn = async () => {
      this.building = true;
      const { inputPath, outputPath, config, resourcePath } = options;

      if (!fs.existsSync(inputPath)) {
        logger.error('输入文件夹不存在:', inputPath);
        return;
      }

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
      }

      const spinner = ora('building...').start();

      try {
        const dirTree = getDirTree({
          inputPath: inputPath,
          config: config,
        });
        await genDirTreeJson(dirTree, outputPath);
        await genNojekyllFile(outputPath);
        await copyTplResource(outputPath);
        await copyUserResource({
          resourcePath: resourcePath,
          outputPath: outputPath,
          config: config,
        });
        await genManifest({
          config: config,
          outputPath: outputPath,
        });
        await renderDirTree({
          dirTree,
          config: config,
          outputPath: outputPath,
        });

        spinner.color = 'green';
        spinner.succeed(chalk.blueBright('build success'));
      } catch (err) {
        spinner.fail(chalk.redBright('build fail:', err));
        process.exit(1);
      } finally {
        this.building = false;

        if (this.requestWhileBuilding) {
          this.requestWhileBuilding = false;
          await fn();
        }
      }
    };

    if (!this.building) {
      await fn();
    }
  }

  run(): void {
    const program = new Command();

    this.setCommonOptions(program.command('start'))
      .description('启动本地服务')
      .action((options) => {
        this.start(options);
      });

    this.setCommonOptions(program.command('build'))
      .description('编译打包')
      .action((options) => {
        this.build(options);
      });

    program.name(APP_NAME).usage('[command] [options]');

    program.showHelpAfterError();
    program.parse(process.argv);
  }

  async start(options: IOption) {
    const config = getConfig(options);
    printInfo(config);
    const inputPath = path.join(CWD, config.input);
    const outputPath = path.join(__dirname, '../temp');
    const resourcePath = path.join(inputPath, config.resource);

    fs.removeSync(outputPath);
    fs.mkdirSync(outputPath);

    await this.doBuild({
      inputPath,
      outputPath,
      resourcePath,
      config,
    });

    // watch input
    chokidar
      .watch([inputPath, __dirname], {
        depth: 10,
        ignoreInitial: true,
        ignored: [
          // eslint-disable-next-line no-useless-escape
          /(^|[\/\\])\../, // ignore dotfiles
          ...config.ignore.map((i) => path.join(inputPath, i)),
        ],
      })
      .on('all', async (eventName, path) => {
        logger.info(`watch: ${eventName} ${path}`);

        await this.doBuild({
          inputPath,
          outputPath,
          resourcePath,
          config,
        });
      });

    liveServer.start({
      port: config.port,
      host: config.host,
      root: outputPath,
      open: false,
      logLevel: 0,
    });
    printIpAddrs({ host: config.host, port: config.port });
  }

  async build(options: IOption) {
    const config = getConfig(options);
    printInfo(config);
    const inputPath = path.join(CWD, config.input);
    const outputPath = path.join(CWD, config.output);
    const resourcePath = path.join(inputPath, config.resource);

    fs.removeSync(outputPath);
    fs.mkdirSync(outputPath);

    await this.doBuild({
      inputPath,
      outputPath,
      resourcePath,
      config,
    });
  }
}

export default DocBuilder;
