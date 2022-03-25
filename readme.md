# DOC-BUILDER

- 将任意文件夹中的 markdown 文档翻译成 html 站点，根据文件夹结构自动生成菜单，零配置
- 支持无限级菜单
- 响应式设计支持移动端访问；非单页，利于 SEO、首屏加载快
- [Preview 示例预览](https://qx9.gitee.io/mj/%E5%89%8D%E7%AB%AF%E6%8A%80%E6%9C%AF/React.html)

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
    resource: 'resource', // 存放图片等资源的文件夹，路径相对于输入文件夹，打包时会一并复制，默认值 'resource'（即位置为 docs\resource），当然也可以使用自己的图床
    title: 'docs', // 站点主标题，默认值 docs
    favicon: '', // 自定义 favicon 资源路径
    root: '', // 站点根目录，例如你的站点要部署在 https://abc.com/path/，则需要设置为 'path'，默认值 ''
  };
  ```

- 执行时传入 `doc-builder --config=builder.config.js`

## 命令行参数

- `--init` 初始化仓库模板
- `--watch`，`-w` 启动本地服务
- `--port` 本地运行端口号
- `--host` 本地运行 host
- `--config` 声明自定义配置文件
- `--input` 输入文件夹
- `--output` 输出文件夹
- `--resource` 存放图片等资源的文件夹，相对于 input
- `--title` 站点主标题
- `--favicon` favicon 资源路径
- `--root` 站点根目录

## PWA 支持

项目根目录下创建并编辑 manifest.json 即可
