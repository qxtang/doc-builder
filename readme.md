# DOC-BUILDER

将任意文件夹中的 markdown 生成 html 文档站点，根据文件名生成菜单，[demo](https://qxtang.github.io/mj/)

## 安装 & 初始化

```sh
npm install -g @qxtang/doc-builder
mkdir project && cd project && doc-builder --init
```

## 使用

- 在 docs 文件夹中创建并编写你的 markdown 文件
- `doc-builder -w` 启动本地服务
- `doc-builder` 打包

## 自定义配置

- 目录下创建文件 builder.config.js

  ```javascript
  // builder.config.js
  module.exports = {
    watch: false, // 是否启动本地服务，默认值 false
    port: 8181, // 本地运行端口号，默认值 8181
    host: '127.0.0.1', // 本地运行 host，默认值 127.0.0.1
    output: 'dist', // 输出文件夹，默认值 'dist'
    input: 'docs', // 输入文件夹，即存放 markdown 文件的文件夹，默认值 'docs'
    resource: 'resource', // 存放图片等资源的文件夹，路径相对于 input，打包时会一并复制，默认值 'resource'（即位置为 docs\resource）
    title: 'docs', // 站点主标题，默认值 docs
    favicon: './resource/favicon.ico', // favicon 资源路径，默认值 ./resource/favicon.ico
  };
  ```

- 执行时传入 `doc-builder --config=builder.config.js`

## 命令行参数

- `--watch`，`-w` 启动本地服务
- `--port` 本地运行端口号
- `--host` 本地运行 host
- `--config` 声明自定义配置文件
- `--input` 输入文件夹
- `--output` 输出文件夹
- `--resource` 存放图片等资源的文件夹，相对于 input
- `--title` 站点主标题
- `--favicon` favicon 资源路径

## PWA 支持

项目根目录下创建并编辑 manifest.json 即可

## 自定义首页

输入文件夹下创建并编辑 index.md 即可
