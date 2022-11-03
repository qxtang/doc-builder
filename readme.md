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

- 任意文件夹中创建并编写你的 markdown 文件：`mkdir somedir && cd somedir`
- `doc-builder start` 启动本地服务
- `doc-builder build` 打包
- `doc-builder -h` 查看更多帮助

## 使用配置文件

- 配置文件中的配置优先级高于命令行配置
- 创建文件 builder.config.js

  ```javascript
  // builder.config.js

  module.exports = {
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

- 传入 `doc-builder build --config=builder.config.js`

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
            npx doc-builder build --title="your title" --root="your path" --ignore=node_modules,dist

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
