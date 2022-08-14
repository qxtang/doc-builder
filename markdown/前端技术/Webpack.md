# Webpack

- 是一个 JavaScript 的模块打包工具
- 基于入口文件，自动地递归解析入口所需要加载的所有资源，然后用不同的 loader 来处理不同的文件，用 Plugin 来扩展 webpack 的功能
- 通过分析模块之间的依赖，最终将所有模块打包成一份或者多份代码包，供 HTML 直接引用
- 实质上，Webpack 仅仅提供了 打包功能 和一套 文件处理机制，然后通过生态中的各种 Loader 和 Plugin 对代码进行预编译和打包
- 因此 Webpack 具有高度的可拓展性，能更好的发挥社区生态的力量

# 概念

- Entry: 入口文件，Webpack 会从该文件开始进行分析与编译；
- Output: 出口路径，打包后创建 bundler 的文件路径以及文件名；
- Module: 源码目录中的每一个文件，在 Webpack 中任何文件都可以作为一个模块，会根据配置的不同的 Loader 进行加载和打包；
- Chunk: webpack 打包过程中的产物，在进行模块的依赖分析的时候，代码分割出来的代码块，可以根据配置，将所有模块代码合并成一个或多个代码块，以便按需加载，提高性能；
- Loader: 模块加载器，进行各种文件类型的加载与转换，比如 babel-loader 将 jsx 转为 React.createElement；
- Plugin: 拓展插件，可以通过 Webpack 相应的事件钩子，介入到打包过程中的任意环节，从而对代码按需修改；
- Bundle: webpack 打包出来的文件，webpack 最终输出的东西，可以直接在浏览器运行。在抽离 css(当然也可以是图片、字体文件之类的)的情况下，一个 chunk 是会输出多个 bundle 的，但是默认情况下一般一个 chunk 也只是会输出一个 bundle

# 工作流程

- 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数
- 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译
- 确定入口：根据配置中的 entry 找出所有的入口文件，生成依赖关系图
- 编译模块，发广播：按文件类型，调用相应的 Loader 对模块进行编译，并在合适的时机点触发广播事件，Plugin 收听这些事件执行相应方法，再找出该模块依赖的模块，递归执行本步骤
- 输出资源：将编译后的所有代码包装成一个个代码块（Chunk），并按依赖和配置确定输出内容，这个步骤，仍然可以通过 Plugin 进行文件的修改，是可以修改输出内容的最后机会
- 保存：最后，根据 output 配置，把文件内容一一写入到文件系统，完成

# 文件指纹

- hash：所有的 bundle 使用同一个 hash 值，跟每一次 webpack 打包的过程有关
- chunkhash：根据每一个 chunk 的内容进行 hash，同一个 chunk 的所有 bundle 产物的 chunkhash 值是一样的。因此若其中一个 bundle 的修改，同一 chunk 的所有产物 hash 也会被修改
- contenthash：与文件内容本身相关
- 注意：开发环境热更新下只能使用 hash 或者不使用 hash。在生产环境中我们一般使用 contenthash 或者 chunkhash，因为在热更新模式下，会导致 chunkhash 和 contenthash 计算错误

# Plugin

```javascript
// 示例
class MyPlugin {
  // 构造方法
  constructor (options) {
    console.log('MyPlugin constructor:', options);
  }
  // 应用函数
  apply (compiler) {
    // Compiler 对象包含了 Webpack 环境所有的的配置信息，可以简单地把它理解为 Webpack 实例

    // 绑定钩子事件
    compiler.plugin('compilation', compilation => {

      // Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等
      console.log('MyPlugin')
    ));
  }
}

module.exports = MyPlugin
```

- https://www.webpackjs.com/contribute/writing-a-plugin/
- 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果

## 钩子

- https://www.webpackjs.com/api/compiler-hooks/
- https://www.webpackjs.com/api/compilation-hooks/

# Loader

- 模块加载器，进行各种文件类型的加载与转换，比如 babel-loader 将 jsx 转为 React.createElement
- webpack 只认识 JavaScript，Loader 将资源转化成 Webpack 可以理解的内容形态
- 通常是一个函数
  ```javascript
  module.exports = function (source, sourceMap?, data?) {
    // source：为 loader 的输入，可能是文件内容，也可能是上一个 loader 处理结果
    // sourceMap：可选参数，代码的 sourcemap 结构
    // data：可选参数，其它需要在 Loader 链中传递的信息
    return source;
  };
  ```
- 通过 return 语句返回处理结果，除此之外 Loader 还可以以 callback 方式返回更多信息，供下游 Loader 或者 Webpack 本身使用，callback 签名：
  ```javascript
  this.callback(
    // 异常信息，Loader 正常运行时传递 null 值即可
    err: Error | null,
    // 转译结果
    content: string | Buffer,
    // 源码的 sourcemap 信息
    sourceMap?: SourceMap,
    // 任意需要在 Loader 间传递的值
    // 经常用来传递 ast 对象，避免重复解析
    data?: any
  );
  ```

## 常见 loader

- image-loader：加载并且压缩图片文件
- file-loader: 加载文件资源，如 字体 / 图片 等，具有移动/复制/命名等功能、把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件
- url-loader: 通常用于加载图片，可以将小图片直接转换为 Date Url，减少请求；和 file-loader 类似，但是能在文件很小的情况下以 base64 的方式把文件内容注入到代码中去
- babel-loader: 加载 js / jsx 文件， 将 ES6 / ES7 代码转换成 ES5，抹平兼容性问题；
- ts-loader: 加载 ts / tsx 文件，编译 TypeScript；
- style-loader: 将 css 代码以 style 标签形式插入

## 处理顺序

- 从右向左

# webpack 分包

## 默认的分包规则

- 同一个 entry 下触达到的模块组织成一个 chunk
- 异步模块单独组织为一个 chunk
- entry.runtime 单独组织成一个 chunk

## 配置 splitChunks

```javascript
module.exports = {
  splitChunks: {
    // 表示选择哪些 chunks 进行分割，可选值有：async，initial和all
    chunks: 'async',
    // 表示新分离出的chunk必须大于等于minSize，默认为30000，约30kb。
    minSize: 30000,
    // 表示一个模块至少应被minChunks个chunk所包含才能分割。默认为1。
    minChunks: 1,
    // 表示按需加载文件时，并行请求的最大数目。默认为5。
    maxAsyncRequests: 5,
    // 表示加载入口文件时，并行请求的最大数目。默认为3。
    maxInitialRequests: 3,
    // 表示拆分出的chunk的名称连接符。默认为~。如chunk~vendors.js
    automaticNameDelimiter: '~',
    // 设置chunk的文件名。默认为true。当为true时，splitChunks基于chunk和cacheGroups的key自动命名。
    name: true,
    // cacheGroups 下可以可以配置多个组，每个组根据test设置条件，符合test条件的模块，就分配到该组。模块可以被多个组引用，但最终会根据priority来决定打包到哪个组中。默认将所有来自 node_modules目录的模块打包至vendors组，将两个以上的chunk所共享的模块打包至default组。
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
    },
  },
};
```

## Runtime（运行时代码） 分包

- Webpack 5 之后还能根据 entry.runtime 配置单独打包运行时代码
- 除业务代码外，Webpack 编译产物中还需要包含一些用于支持 webpack 模块化、异步加载等特性的支撑性代码，这类代码在 webpack 中被统称为 runtime

# rollup 和 webpack 区别

- webpack 拆分代码， 按需加载；
- Rollup 所有资源放在同一个地方，一次性加载，利用 tree-shake 特性来剔除项目中未使用的代码，减少冗余
- 对于应用使用 webpack，对于类库使用 Rollup，rollup 适用于基础库的打包，如 vue、react
- 如果你需要代码拆分(Code Splitting)，或者你有很多静态资源需要处理，再或者你构建的项目需要引入很多 CommonJS 模块的依赖，那么 webpack 是个很不错的选择。
- 如果您的代码库是基于 ES2015 模块的，而且希望你写的代码能够被其他人直接使用，你需要的打包工具可能是 Rollup。

# Tree-Shaking

## 含义

- 基于 ES Module 规范的死码删除技术
- 在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾被其它模块使用，并将其删除，以此实现打包产物的优化

## 实现原理

- https://juejin.cn/post/7019104818568364069

## 实现 Tree Shaking 技术的必要条件

- 在 CommonJs、AMD、CMD 等旧版本的 JavaScript 模块化方案中，导入导出行为是高度动态，难以预测的
- 而 ESM 方案则从规范层面规避这一行为，它要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量
- 所以，ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用
