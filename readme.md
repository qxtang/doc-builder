# DOC-BUILDER

- 极速零配置，将 markdown 文档翻译成站点，根据文件结构生成菜单
- 全站搜索、toc 目录
- [Preview 示例预览](https://qxtang.github.io)

## 使用

- `npm install -g @qxtang/doc-builder`
- `mkdir somedir && cd somedir && echo "# hello" > hello.md`
- `doc-builder start` 启动本地服务
- `doc-builder build` 打包
- `doc-builder -h` 查看帮助

## 使用配置文件

- 创建文件 builder.config.js

  ```javascript
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

## 与 GitHub Actions 结合

给仓库添加一个权限点足够的 secrets，创建 `.github\workflows\CI.yml`

```yml
name: CI
on:
  push:
    branches:
      - main # 分支名

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

