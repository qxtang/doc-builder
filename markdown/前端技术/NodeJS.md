# nodejs 特点

- 它是一个 Javascript 运行环境
- 依赖于 Chrome V8 引擎进行代码解释
- 事件驱动
- 非阻塞 I/O
- 单进程，单线程

# nodejs 解决的问题

- 并发连接
  - 异步机制、事件驱动整个过程没有阻塞新用户的连接，也不需要维护已有用户的连接。
  - 基于这样的机制，理论上陆续有用户请求连接，NodeJS 都可以进行响应，因此 NodeJS 能支持比 Java、PHP 程序更高的并发量.虽然维护事件队列也需要成本
- I/O 阻塞
  - Java、PHP 也有办法实现并行请求（子线程），但 NodeJS 通过回调函数（Callback）和异步机制会做得很自然。

# nodejs 的优缺点

优点：

- 高并发（最重要的优点）
- 适合 I/O 密集型应用

缺点：

- 不适合 CPU 密集型应用，由于 JavaScript 单线程的原因，如果有长时间运行的计算（比如大循环），将会导致 CPU 时间片不能释放，使得后续 I/O 无法发起；
- 只支持单核 CPU，不能充分利用 CPU
- 可靠性低，一旦代码某个环节崩溃，整个系统都崩溃
- 开源组件库质量参差不齐，更新快，向下不兼容

解决方案：

- Nginx 反向代理，负载均衡，开多个进程，绑定多个端口
- 开多个进程监听同一个端口，使用 cluster 模块；使用比如 pm2 之类的工具

# 应用场景

- RESTful API
- 统一 Web 应用的 UI 层
- 大量 Ajax 请求的应用

# nodejs 异常处理

- try catch，缺点明显：无法处理异步代码块内出现的异常，比如 setTimeout
- 使用 event 原生模块，监听 error 事件
- 原生模块的 callback 函数一般都会抛出错误（第一个参数）

# node 模块

## 模块规范

- Node 模块系统借鉴 CommonJS 来实现
- CommonJS 对模块的定义主要分为：模块引用、模块定义和模块标识 3 个部分

### 模块引用

- 存在 require() 方法，这个方法接受模块标识，以此引入一个模块的 API 到当前上下文中

### 模块定义

- 上下文提供了 exports 对象用于导出当前模块的方法或者变量，并且它是唯一导出的出口
- 在模块中，还存在一个 module 对象，它代表模块自身，而 exports 是 module 的属性
- 在 Node 中，一个文件就是一个模块，将方法挂载在 exports 对象上作为属性即可定义导出的方式

### 模块标识

- 就是传递给 require() 方法的参数
- 符合小驼峰命名的字符串，或者以.、..开头的相对路径，或者绝对路径
- 可以没有文件名后缀.js

## 模块实现

- 在 Node 中引入模块，需要经历 3 个步骤：路径分析、文件定位、编译执行
- Node 模块分为两类：Node 提供的模块（核心模块）、用户编写的模块（文件模块）

### 两种类型区别

- 核心模块部分在 Node 源代码的编译过程中，编译进了二进制执行文件。在 Node 进程启动时，部分核心模块已被直接加载进内存中，所以这部分核心模块引入时，文件定位和编译执行这两个步骤可以省略掉，并且在路径分析中优先判断，所以它的加载速度是最快的
- 文件模块则是在运行时动态加载，需要完整的路径分析、文件定位、编译执行过程，速度比核心模块慢

### 缓存优先特性

- Node 对引入过的模块都会进行缓存，以减少二次引入时的开销，Node 缓存的是编译和执行之后的对象

### 路径分析

- 标识符的分类：核心模块、.或..开始的相对路径、以/开始的绝对路径、非路径形式
- 核心模块：核心模块的优先级仅次于缓存加载；它在 Node 的源代码编译过程中已经编译为二进制代码，加载过程最快
- 路径形式：1、转为真实路径；2、将编译执行后的结果存放到缓存中；
- 自定义模块（非路径形式，可能是一个包的形式）：这类模块的查找是最费时的，也是所有方式中最慢的一种

### 文件定位

- 扩展名分析：允许在标识符中不包含文件扩展名，会按.js、.json、.node 的次序补足扩展名，依次尝试，调用了 fs 模块同步阻塞式地判断文件是否存在，所以如果是 .node 和 .json 文件，在传递给 require() 的标识符中带上扩展名，会加快一点速度
- 可能没有查找到对应文件，如果得到一个目录，此时将目录当做一个包来处理，查找 package.json 的 main 属性，同样进行拓展名分析
- 如果 package.json 和 main 字段没有找到，则寻找文件夹下的 index 文件，同样进行拓展名分析
- 最后都没找到则抛出查找失败的异常

### 编译执行

- .js 文件：通过 fs 模块同步读取文件后编译执行
- .node 文件：这是用 C/C++ 编写的扩展文件，通过 dlopen() 方法加载最后编译生成的文件
- .json 文件：通过 fs 模块同步读取文件后，用 JSON.parse() 解析返回结果
- 其余扩展名：它们都被当做.js 文件载入
- 每一个编译成功的模块都会将其文件路径作为索引缓存在 `Module._cache` 对象上，以提高二次引入的性能

### 模块内部全局变量的由来

require、exports、module、`__filename`、`__dirname`等变量的由来：

- 在编译的过程中，Node 对获取的 JavaScript 文件内容进行了头尾包装。在头部添加了 `(function (exports, require, module, __filename, __dirname) {\n`，在尾部添加了 `\n})`
- 这样每个模块文件之间都进行了作用域隔离

# 包结构

- package.json：包描述文件
- bin：用于存放可执行二进制文件的目录
- lib：用于存放 JavaScript 代码的目录
- doc：用于存放文档的目录
- test：用于存放单元测试用例的代码

# nodejs 事件循环

## node 事件循环与浏览器的区别

- https://juejin.cn/post/6844903761949753352

# cluster 原理

<!-- TODO -->

# pipe 原理

<!-- TODO -->

# 洋葱圈模型

- 每次当有一个请求进入的时候，每个中间件都会被执行两次
- 每个中间件都接收了一个 next 参数，在 next 函数运行之前的中间件代码会在一开始就执行，next 函数之后的代码会在内部的中间件全部运行结束之后才执行，就像一根筷子穿过一个洋葱，同一层皮会被筷子穿过两次

## 实现思路

- this.middleware 是中间件集合的数组
- koa-compose 模块的 compose 方法用来构建执行顺序

```javascript
// middleware 用来保存中间件
app.use = (fn) => {
  this.middleware.push(fn);
  return this;
};

// compose 组合函数来规定执行次序
function compose(middleware) {
  // context：上下文，next：传入的接下来要运行的函数
  return function (context, next) {
    function dispatch(i) {
      index = i;
      // 中间件
      let fn = middleware[i];
      if (!fn) return Promise.resolve();
      try {
        // 我们这边假设和上文中的例子一样，有A、B、C三个中间件
        // 通过dispatch(0)发起了第一个中间件A的执行
        // A中间件执行之后，next作为dispatch(1)会被执行
        // 从而发起了下一个中间件B的执行，然后是中间件C被执行
        // 所有的中间件都执行了一遍后，执行Promise.resolve()
        // 最里面的中间件C的await next()运行结束，会继续执行console.log("C2")
        // 整个中间件C的运行结束又触发了Promise.resolve
        // 中间件B开始执行console.log("B2")
        // 同理，中间件A执行console.log("A2")
        return Promise.resolve(
          fn(context, () => {
            return dispatch(i + 1);
          })
        );
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}
```
