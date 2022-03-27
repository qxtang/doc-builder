# DOC-BUILDER

- 将任意文件夹中的 markdown 文档翻译成 html 站点，根据文件夹结构自动生成菜单，零配置
- 支持无限级菜单
- 响应式设计支持移动端访问；非单页，利于 SEO、首屏加载快
- [Preview 示例预览](https://qx9.gitee.io/mj/%E5%89%8D%E7%AB%AF%E6%8A%80%E6%9C%AF/React.html)

## 安装

```sh
$ npm install -g @qxtang/doc-builder
```

## 使用

- 在任意文件夹中创建并编写你的 markdown 文件
- `doc-builder --input=[刚才创建的文件夹] -w` 启动本地服务
- `doc-builder --input=[刚才创建的文件夹] --output=[输出文件夹]` 打包

## 可用命令行配置参数

```txt
-w, --watch            本地服务模式 (default: false)
--config <config>      自定义配置文件，配置文件中的配置优先级高于命令行配置 (default: "")
--port <port>          本地服务模式端口号 (default: "8181")
--host <host>          本地服务模式 host (default: "127.0.0.1")
--output <output>      输出文件夹 (default: "dist")
--input <input>        输入文件夹 (default: "docs")
--resource <resource>  存放图片等资源的文件夹，路径相对于输入文件夹，打包时会一并复制，默认值 resource（即位置为 docs/resource），当然也可以使用自己的图床 (default: "resource")
--title <title>        站点主标题 (default: "docs")
--favicon <favicon>    自定义 favicon 资源路径 (default: "/resource/favicon.ico")
--root <root>          站点根目录，例如你的站点要部署在 https://abc.com/path/，则需要设置为 "path" (default: "")
-h, --help             display help for command
```

## 声明配置文件

- 目录下创建文件 builder.config.js

  ```typescript
  // builder.config.js

  module.exports = {
    watch: false;
    port: 8181;
    host: '127.0.0.1';
    output: 'dist';
    input: 'docs';
    resource: 'resource';
    title: 'docs';
    favicon: '';
    root: 'your path';
  }
  ```

- 执行时传入 `doc-builder --config=builder.config.js`

## PWA 支持

项目根目录下创建并编辑 manifest.json 即可
