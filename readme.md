# DOC-BUILDER

将任意文件夹中的 markdown 生成 html 文档站点，根据文件名生成菜单，[demo](https://qxtang.github.io/mj/)

## 安装

```sh
mkdir project && cd project && mkdir docs && npm init
npm install @qxtang/doc-builder
```

## 使用

- 在 docs 文件夹中创建并编写你的 markdown 文档
- 向 package.json 添加

  ```jsonc
  "scripts": {
    "dev": "doc-builder -w", // 本地运行
    "build": "doc-builder" // 打包
  }
  ```

## 自定义配置

- 目录下创建文件 builder.config.js

  ```javascript
  // builder.config.js
  module.exports = {
    port: 8181, // 本地运行端口号，默认值 8181
    host: '127.0.0.1', // 本地运行 host，默认值 127.0.0.1
    output: 'dist', // 输出文件夹，默认值 'dist'
    input: 'docs', // 存放 markdown 文件的文件夹，默认值 'docs'
    resource: 'resource', // 存放图片等资源的文件夹，路径相对于 input，打包时会一并复制，默认值 'resource'（即位置为 docs\resource）
  };
  ```

- 执行时传入 `doc-builder --config=builder.config.js`

## 可选命令行参数

- `-w` 启动本地服务
- `--port` 本地运行端口号
- `--host` 本地运行 host
- `--config` 声明配置文
- `--input` 存放 markdown 文件的文件夹
- `--output` 输出文件夹
- `--resource` 存放图片等资源的文件夹，相对于 input
