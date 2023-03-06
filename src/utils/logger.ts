/**
 * @description 打印客户日志封装
 */
import chalk from 'chalk';

const logger = {
  info: (...args: any) => {
    console.log(
      `\n\r[${new Date().toLocaleString()}]`,
      chalk.blueBright(...args),
    );
  },
  error: (...args: any) => {
    console.log(
      `\n\r[${new Date().toLocaleString()}] ERROR:`,
      chalk.redBright(...args),
    );
  },
};

export default logger;
