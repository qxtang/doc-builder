/**
 * @description 打印客户日志封装
 */
const logger = {
  info: (...args: any) => {
    console.log(`\x1B[1m[${new Date().toLocaleString()}] - DOC-BUILDER:\x1B[22m`, ...args);
  },
  error: (...args: any) => {
    console.log(`\x1B[1m[${new Date().toLocaleString()}] - DOC-BUILDER - ERROR:\x1B[22m`, ...args);
  },
};

export default logger;
