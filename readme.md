# DOC-BUILDER

- 极速零配置，将任意文件夹中的 markdown 文档翻译成 html 站点，根据文件夹结构自动生成菜单
- 支持无限级菜单，全站搜索
- 响应式设计支持移动端访问；非单页，利于 SEO、首屏加载快
- [Preview 示例预览](https://qxtang.github.io/my-book/)

## 安装

```sh
$ npm install -g @qxtang/doc-builder
```

## 使用

- 任意文件夹中创建并编写你的 markdown 文件
- `doc-builder -w` 启动本地服务
- `doc-builder` 打包

## 命令行参数

```txt
-w, --watch            本地服务模式 (default: false)
--config <config>      声明配置文件 (default: "")
--port <port>          本地服务模式端口号 (default: "8181")
--host <host>          本地服务模式 host (default: "127.0.0.1")
--output <output>      输出文件夹 (default: "dist")
--input <input>        输入文件夹 (default: ".")
--resource <resource>  存放图片等资源的文件夹，路径相对于输入文件夹，打包时会一并复制，当然也可以使用自己的图床 (default: "resource")
--title <title>        站点主标题 (default: "doc-builder")
--root <root>          站点根目录，例如你的站点要部署在 https://abc.com/path/，则需要设置为 "path" (default: "")
--ignore <ignore>      需要忽略的文件夹或文件列表，英文逗号分隔，在配置文件中则为数组 (default: "node_modules,dist")
-h, --help             display help for command
```

## 使用配置文件

- 配置文件中的配置优先级高于命令行配置
- 创建文件 builder.config.js

  ```javascript
  // builder.config.js

  module.exports = {
    watch: false,
    port: 8181,
    host: '127.0.0.1',
    output: 'your dist',
    input: 'your input',
    resource: 'your resource',
    title: 'your title',
    root: 'your path',
    ignore: [],
  };
  ```

- 传入 `doc-builder --config=builder.config.js`

## 其他

- 自定义站点首页（关于页），创建并编辑 index.md 即可
- 会自动忽略以小数点 `.` 开头的文件或文件夹

## 与 GitHub Actions 结合食用更佳！❤

- [示例仓库](https://github.com/qxtang/my-book)
- 给你的仓库添加一个权限点足够的 secrets，创建并编辑 actions 配置文件 `.github\workflows\CI.yml`

  ```yml
  name: CI
  on:
    push:
      branches:
        - main # 你的分支

  jobs:
    main:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v2
          with:
            persist-credentials: false

        - name: Install and Build
          run: |
            npm install @qxtang/doc-builder@latest
            npx doc-builder --title="your title" --root="your path" --ignore=node_modules,dist

        - name: Deploy
          uses: JamesIves/github-pages-deploy-action@v4.3.0
          with:
            token: ${{ secrets.ACCESS_TOKEN }} # 仓库 secrets 名称
            branch: gh-pages # 发布站点的分支
            folder: dist # 输出文件夹
            clean: true
            clean-exclude: |
              .nojekyll
  ```

- 只需要在仓库编辑你的文档，保存推送，啥也不用干，自动部署
