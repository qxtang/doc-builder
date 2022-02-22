# DOC-BUILDER

将任意文件夹中的 markdown 生成 html 文档站点

## 安装

```sh
npm install @qxtang/doc-builder
```

## 使用

- 向 package.json 添加

```jsonc
"scripts": {
  "dev": "doc-builder -w", // 本地运行
  "build": "doc-builder" // 打包
}
```

- 创建文件夹 notes，在其中编写 markdown 文档

## 自定义配置

- 目录下创建文件 builder.config.js

  ```javascript
  // builder.config.js
  module.exports = {
    port: 8181, // 本地运行端口号，默认值 8181
    host: '127.0.0.1', // 本地运行 host，默认值 127.0.0.1
    output: '/dist', // 输出文件夹，默认值 '/dist'
    input: '/notes', // 存放 markdown 文件的文件夹，默认值 '/notes'
    resource: '/resource', // 存放图片等资源的文件夹，相对于 input，默认值 '/resource'
  };
  ```

- 执行时传入 `doc-builder --config=builder.config.js`

## 命令行参数

- `-w` 启动本地服务
- `--config` 声明配置文件，非必传
