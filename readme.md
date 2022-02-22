# DOC-BUILDER

将 markdown 生成 html 文档

## 安装

```sh
npm install doc-builder
```

## 使用

- 目录下创建文件 builder.config.js

  ```javascript
  module.exports = {
    port: 8181,             // 本地运行端口号，默认值 8181
    host: '127.0.0.1',      // 本地运行 host，默认值 127.0.0.1
    output: '/dist',        // 输出文件夹，默认值 '/dist'
    input: '/notes',        // 存放 markdown 文件的文件夹，默认值 '/notes'
    resource: '/resource',  // 存放图片等资源的文件夹，相对于 input，默认值 '/resource'
  };
  ```

- 本地运行 `doc-builder --config=builder.config.js -w`
- 打包出 html `doc-builder --config=builder.config.js`

## 命令行参数

- `-w` 启动本地服务
- `--config` 声明配置文件，非必传
