# DOC-BUILDER

- 将任意文件夹中的 markdown 文档翻译成 html 站点，根据文件夹结构自动生成菜单，零配置
- 支持无限级菜单
- 响应式设计支持移动端访问；非单页，利于 SEO、首屏加载快
- [Preview 示例预览](https://qxtang.github.io/my-book/)

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
--ignore <ignore>      需要忽略的文件夹或文件列表，英文逗号分隔，在配置文件中为数组 (default: "")
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
    ignore: [];
  }
  ```

- 执行时传入 `doc-builder --config=builder.config.js`

## PWA 支持

项目根目录下创建并编辑 manifest.json 即可

## 其他

会自动忽略以小数点 `.` 开头的文件夹和文件

## 与 GitHub Actions 结合食用更佳！❤

- [示例仓库](https://github.com/qxtang/my-book)
- 在 github 仓库下添加 actions 配置文件 `.github\workflows\CI.yml`

  ```yml
  name: CI
  on:
    push:
      branches:
        - main # 编写 markdown 的分支

  jobs:
    main:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v2
          with:
            persist-credentials: false

        - name: Install and Build # 安装与打包
          run: |
            npm install @qxtang/doc-builder@latest
            npx doc-builder --input=. --root=your-path --ignore=node_modules,dist

        - name: Deploy
          uses: JamesIves/github-pages-deploy-action@releases/v3
          with:
            ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
            BRANCH: gh-pages # 发布站点的分支
            FOLDER: dist # 输出文件夹
  ```

- 只需要在仓库编辑你的文档，推送保存，啥也不用干，自动部署
