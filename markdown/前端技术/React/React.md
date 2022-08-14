# React

# 渲染原理

## 虚拟 dom

- 使用 javascript 对象表示 DOM 结构的树形数据结构
- 这个树结构包含整个 DOM 结构的信息
- 真实 DOM 的内存表示，一种编程概念
- 为框架带来了跨平台的能力，抽象了原本的渲染过程，实现了跨平台的能力
- 结合 diff 算法，可以减少 JavaScript 操作真实 DOM 的带来的性能消耗

虚拟 dom 优势：

- 直接操作/频繁操作 DOM 的性能差
- 虚拟 DOM 不会立马进行排版与重绘操作
- 虚拟 DOM 进行频繁修改，然后一次性比较并修改真实 DOM 中需要改的部分，最后在真实 DOM 中进行排版与重绘，减少过多 DOM 节点排版与重绘损耗
- 虚拟 DOM 有效降低大面积真实 DOM 的重绘与排版，因为最终与真实 DOM 比较差异，可以只渲染局部

## key 的作用

- Keys 是一个辅助标识，用于追踪列表中被修改的元素
- 在 diff 算法中，会借助元素的 key 值来判断该元素是不是新创建的，而减少不必要的重新渲染

## reconciliation（协调）

- 当根节点为不同类型的元素时，React 会拆卸原有的树并且建立起新的树。
- 当对比两个相同类型的 React 元素时，React 会保留 DOM 节点，仅比对及更新有改变的属性。
- 当一个组件更新时，组件实例会保持不变，因此可以在不同的帧保持 state 一致。React 将更新该组件实例的 props 以保证与最新的元素保持一致，并且调用该实例的 componentWillReceiveProps()、componentWillUpdate()、componentDidUpdate()
- 当子元素拥有 key 时，React 使用 key 来匹配原有树上的子元素以及最新树上的子元素，使得树的转换效率得以提高
- Key 应该具有稳定，可预测，以及列表内唯一的特质，不稳定的 key（比如通过 Math.random() 生成的）会导致许多组件实例和 DOM 节点被不必要地重新创建，这可能导致性能下降和子组件中的状态丢失
- 也可以使用元素在数组中的下标作为 key。这个策略在元素不进行重新排序时比较合适，如果有顺序修改，diff 就会变慢

## diff 过程

- 比对新老虚拟 dom 的变化，然后将变化的部分更新到视图上
- 把树形结构按照层级分解，只比较同级元素
- 给列表结构的每个单元添加唯一的 key 属性，方便比较
- 对比不同类型的元素
- 对比同一类型的元素
- 对比同类型的组件元素
- 对子节点进行递归

## 为什么有 diff

在某一时间节点调用 React 的 render() 方法，会创建一棵由 React 元素组成的树。在下一次 state 或 props 更新时，相同的 render() 方法会返回一棵不同的树。React 需要基于这两棵树之间的差别来判断如何有效率的更新 UI 以保证当前 UI 与最新的树保持同步。

## diff 为什么不能用下标

- 当基于下标的组件进行重新排序时，组件 state 可能会遇到一些问题。由于组件实例是基于它们的 key 来决定是否更新以及复用，如果 key 是一个下标，那么修改顺序时会修改当前的 key，导致非受控组件的 state（比如输入框）可能相互篡改，会出现无法预期的变动

# Refs

- 通过 ref，允许访问 dom
- 不得不直接访问时才使用，否则容易造成混乱
- Refs 是 React 提供给我们的安全访问 DOM 元素或者某个组件实例。
- Hooks 中的 useRef 可以用来保存多帧共享数据

# React 常用 api

- React.PureComponent：React.PureComponent 与 React.Component 完全相同，但是在 shouldComponentUpdate() 中实现时，使用了 props 和 state 的浅比较，可以提高性能
- React.memo：是一个高阶组件，与 React.PureComponent 类似，但是他用于包裹函数式组件，而不是类组件；如果函数式组件在给定相同的 props 的情况下渲染相同的结果，你可以在调用 React.memo 将其包装起来，以便在某些情况下通过记忆结果来提高性能。 这意味着 React 将跳过组件渲染，并重用最后渲染的结果。
- React.createRef：创建一个 ref ，它可以通过 ref 属性附加到 React 元素
- React.forwardRef：创建一个 React 组件，将它接收的 ref 属性转发给组件树中的另一个组件。接受渲染函数作为参数。React 将用 props 和 ref 作为两个参数来调用这个函数。此函数应返回 React 节点
- React.lazy：定义动态加载的组件。有助于减少包大小，以延迟加载在初始渲染期间未使用的组件，要求被<React.Suspense>组件包裹。这是指定加载指示器的方式
- React.Suspense：指定加载指示器

# 异步加载

使用示例：

```jsx
const Box = React.lazy(() => import('./components/Box'));
<Suspense fallback={<div>loading...</div>}>{show && <Box />}</Suspense>;
```

## import()

- es2020 的规范
- import(module) 表达式加载模块并返回一个 promise，该 promise resolve 为一个包含其所有导出的模块对象。我们可以在代码中的任意位置调用这个表达式
- webpack 碰到之后会将其拆出来成一个 chunk，可以使用魔术注释自定义 chunk 名称，需要加载时会通过异步请求来加载这个 chunk
- 对应的 babel 语法插件：https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import/#installation

# PureComponent 的陷阱

- PureComponent 创建了默认的 shouldComponentUpdate 行为，这个默认的 shouldComponentUpdate 行为会一一比较 props 和 state 中所有的属性，只有当其中任意一项发生改变是，才会进行重绘
- PureComponent 使用浅比较判断组件是否需要重绘，即比较指针的异同
- 所以如果 props 和 state 是引用对象，比如对象、数组，修改属性或元素，不会导致重绘

# React 异常处理

- 设置编边界包裹组件，实现 componentDidCatch

# 为什么不要在 render 中 setState？

- 会造成死循环

# 为什么不要在 render 中声明组件

- 不要在 render 中声明组件，不然每次渲染都是声明的一个新的组件，组件的一些非受控状态就会丢失，比如聚焦状态，浏览器选中文字状态

# 实现组件之间代码重用，为什么推荐组合、HOC，而不是继承

- React 希望组件是按照最小可用的思想来进行封装，就是一个组件只做一件的事情，这叫单一职责原则
- 函数式编程中，函数组合是组合两个或多个函数以产生新函数的过程。将函数组合在一起就像将一系列管道拼接在一起，让我们的数据流过

# setState

## setState 如何深合并

- 方法一：使用展开运算符
- 方法二：先直接赋值，再调一次 setState({})

## setState 时发生了什么

- 将传递给 setState 的对象合并到组件的当前状态。
- 构建一个新的虚拟 dom。
- 将新树与旧数比较，计算出新旧树的节点差异，确定需要更新的真实 dom。
- 调用 render 方法更新 UI。

## setState 什么时候异步什么时候同步

- 与调用时的环境相关
- 在 合成事件 和 生命周期钩子(除 componentDidUpdate) 中，setState 是“异步”的，如果需要马上同步去获取新值，setState 可以传入第二个参数，在回调中即可获取最新值
- 在 原生事件 和 setTimeout 中，setState 是同步的，可以马上获取更新后的值
  原因: 原生事件是浏览器本身的实现，与事务流无关，自然是同步；而 setTimeout 是放置于定时器线程中延后执行，此时事务流已结束，因此也是同步；
- 在 React 的 setState 函数实现中，会根据一个变量 isBatchingUpdates 判断是直接更新 this.state 还是放到队列中回头再说，而 isBatchingUpdates 默认是 false，也就表示 setState 会同步更新 this.state，但是，有一个函数 batchedUpdates，这个函数会把 isBatchingUpdates 修改为 true，而当 React 在调用事件处理函数之前就会调用这个 batchedUpdates，造成的后果，就是由 React 控制的事件处理过程 setState 不会同步更新 this.state
- setState 在 react 生命周期和合成事件会批量覆盖执行
- 当遇到多个 setState 调用的时候会提取单次传递 setState 对象，将它们进行合并（类似 Object.assign，遇到相同 key 会覆盖前面的 key）
- setState 在原生事件，setTimeout、setInterval、promise 等异步操作中，state 会同步更新

> 所谓合成事件就是：react 为了解决跨平台，兼容性问题，自己封装了一套事件机制，代理了原生的事件，像在 jsx 中常见的 onClick、onChange 这些都是合成事件

## 批量更新机制

- 在 合成事件 和 生命周期钩子 中，setState 更新队列时，存储的是 合并状态(Object.assign)。因此前面设置的 key 值会被后面所覆盖，最终只会执行一次更新

## 函数型式

- 由于 Fiber 及 合并 的问题，官方推荐可以传入 函数 的形式。setState(fn)，在 fn 中返回新的 state 对象即可，例如 this.setState((state, props) => newState)；
- 使用函数型式，可以用于避免 setState 的批量更新的逻辑，传入的函数将会被 顺序调用

## 注意事项

- setState 合并，在 合成事件 和 生命周期钩子 中多次连续调用会被优化为一次
- 当组件已被销毁，如果再次调用 setState，React 会报错警告，通常有两种解决办法：
  - 将数据挂载到外部，通过 props 传入，如放到 Redux 或 父级中
  - 在组件内部维护一个状态量 (isUnmounted)，componentWillUnmount 中标记为 true，在 setState 前进行判断

# 单向数据流

- 规定数据只能由外层组件向内层组件进行传递和更新。
- 组件的 props 是只读的。
- 否则容易导致数据紊乱、出现不可控操作。
- 让组件之间的关系变得简单、可预测。
- 如果数据在兄弟子组件之间共享，那么数据应该存储在父组件，并同时传递给需要数据的两个子组件。

# 高阶组件（HOC）

- 高阶组件就是一个函数，且该函数接受一个组件作为参数，并返回一个新的增强组件。
- 高阶组件自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式和编程技巧。
- 常见的有 react-redux 里的 connect 和 react-router 中的 withRouter。
- 作用：复用组件逻辑，操作状态和参数，渲染劫持
- 场景和应用：
  - 权限控制
  - 性能监控，包裹组件的生命周期，进行统一埋点
  - 日志打点
  - 双向绑定
- 可以借助 ES7 提供的 Decorators （装饰器）来让写法变得优雅，安装并配置 babel 插件：babel-plugin-transform-decorators-legacy
- 使用注意：
  - 不要在 render 方法内创建高阶组件，会导致组件每次都会被卸载后重新挂载
  - 不要改变原始组件，高阶组件应该是没有副作用的纯函数，这样破坏了对高阶组件的约定，也改变了高阶组件的初衷，使用高阶组件是为了增强而非改变

# 生命周期

1、挂载卸载过程

- constructor() `必须写super(),否则会导致this指向错误`
- componentWillMount() `即将过时不要使用`
- componentDidMount() `dom节点已经生成，可以在这里调用ajax请求`
- componentWillUnmount() `在这里移除事件订阅和定时器`

2、更新过程

- componentWillReceiveProps(nextProps) `即将过时不要使用，接受父组件改变后的props需要重新渲染`
- shouldComponentUpdate(nextProps,nextState) `性能优化`
- componentWillUpdate(nextProps,nextState) `即将过时不要使用`
- componentDidUpdate(prevProps,prevState)
- render() `插入jsx生成的dom结构，diff算法比较更新前后的新旧DOM树，找到最小的有差异的节点，重新渲染`

在 Fiber 中，reconciliation 阶段进行了任务分割，涉及到 暂停 和 重启，因此可能会导致 reconciliation 中的生命周期函数在一次更新渲染循环中被 多次调用 的情况，产生一些意外错误
新版的建议生命周期如下：

```jsx
class Component extends React.Component {
  // 替换 `componentWillReceiveProps`
  // 初始化和 update 时被调用
  // 静态函数，无法使用 this
  static getDerivedStateFromProps(nextProps, prevState) {}
  // 判断是否需要更新组件
  // 可以用于组件性能优化
  shouldComponentUpdate(nextProps, nextState) {}
  // 组件被挂载后触发
  componentDidMount() {}
  // 替换
  componentWillUpdate;
  // 可以在更新之前获取最新 dom 数据
  getSnapshotBeforeUpdate() {}
  // 组件更新后调用
  componentDidUpdate() {}
  // 组件即将销毁
  componentWillUnmount() {}
  // 组件已销毁
  componentDidUnmount() {}
}
```

## 生命周期使用建议：

- 在 constructor 初始化 state
- 在 componentDidMount 中进行事件监听，并在 componentWillUnmount 中解绑事件
- 在 componentDidMount 中进行数据的请求，而不是在 componentWillMount
- 需要根据 props 更新 state 时，使用 getDerivedStateFromProps(nextProps, prevState)
- 可以在 componentDidUpdate 监听 props 或者 state 的变化
- 在 componentDidUpdate 使用 setState 时，必须加条件，否则会死循环
- getSnapshotBeforeUpdate(prevProps, prevState) 可以在更新之前获取最新的渲染数据，它的调用是在 render 之后， update 之前
- shouldComponentUpdate: 默认每次调用 setState，一定会最终走到 diff 阶段，但可以通过 shouldComponentUpdate 的生命钩子返回 false 来直接阻止后面的逻辑执行，通常是用于做条件渲染，优化渲染的性能

## react 性能优化是哪个周期函数

- shouldComponentUpdate
- 这个方法用来判断是否需要调用 render 方法重新描绘 dom。
- 因为 dom 的描绘比较消耗性能，
- 如果能在 shouldComponentUpdate 方法中能够写出更优化的逻辑，可以提高性能。

# React 中的事件处理

- 为了解决跨浏览器兼容性问题，React 会将 浏览器原生事件 封装为 合成事件 传入设置的事件处理器中。
- 这里的合成事件提供了与原生事件相同的接口，
- 它屏蔽了底层浏览器的细节差异，保证了行为的一致性。
- React 并没有直接将事件附着到子元素上，而是以单一事件监听器的方式将所有的事件发送到顶层（document）进行处理。
- 这样 React 在更新 DOM 的时候就不需要考虑如何去处理附着在 DOM 上的事件监听器，最终达到优化性能的目的。

# react 合成事件是什么，和原生事件的区别

- React 合成事件机制，React 并不是将 click 事件直接绑定在 dom 上面，而是采用事件冒泡的形式冒泡到 document 上面，然后 React 将事件封装给正式的函数处理运行和处理
- 如果 DOM 上绑定了过多的事件处理函数，整个页面响应以及内存占用可能都会受到影响
- 为了避免这类 DOM 事件滥用，同时屏蔽底层不同浏览器之间的事件系统差异，React 实现了一个中间层
- 当用户在为 onClick 添加函数时，React 并没有将 Click 事件绑定在 DOM 上面，而是在 document 处监听所有支持的事件，当事件发生并冒泡至 document 处时，React 将事件内容封装交给中间层

# constructor 中 super 与 props 参数一起使用的目的是什么

- 是 ES6 规定的，在子类的 constructor 中必须先调用 super 初始化父类才能引用 this。
- 在调用方法之前，子类构造函数无法使用 this 引用 super() 。

# 什么是受控组件

- 受控：value 和 state 绑在一起的。
- 非受控：可通过浏览器 api 获取值。

# 为什么一定要 import “react”

- JSX 实际上是 React.createElement 的语法糖，jsx 会被 babel 翻译成 React.createElement

# react 性能优化方案

- 重写 shouldComponentUpdate 来避免不必要的 dom 操作。
- 使用 production 版本的 react.js。
- 使用 key 来帮助 React 识别列表中所有子组件的最小变化。
- React.memo
- PureComponent
- useMemo、useCallback

# Context

当不想在组件树中通过逐层传递 props 或者 state 的方式来传递数据时，可以使用 Context 来实现 跨层级 的组件数据传递

- React.createContext：创建一个上下文的容器(组件), defaultValue 可以设置共享的默认数据
- Provider(生产者): 和他的名字一样。用于生产共享数据的地方。生产什么呢？ 那就看 value 定义的是什么了。value:放置共享的数据
- Consumer(消费者):这个可以理解为消费者。 他是专门消费供应商(Provider 上面提到的)产生数据。Consumer 需要嵌套在生产者下面。才能通过回调的方式拿到共享的数据源。当然也可以单独使用，那就只能消费到上文提到的 defaultValue

# Link 组件和 a 标签 区别

Link 做了 3 件事情：

- 有 onclick 那就执行 onclick
- click 的时候阻止 a 标签默认事件、不会跳转和刷新页面
- 再取得跳转 href（即是 to），用 history（前端路由两种方式之一，history & hash）跳转，此时只是链接变了，并没有刷新页面

# switch 标签作用

- 有
  标签，则其中的在路径相同的情况下，只匹配第一个，这个可以避免重复匹配

# withRouter 作用

- 让被修饰的组件可以从属性中获取 history,location,match
- 路由组件可以直接获取这些属性，而非路由组件就必须通过 withRouter 修饰后才能获取这些属性了

# React 编程模型

## 宿主树

- 用于展示 UI
- 会随时间变化
- 稳定性，宿主树相对稳定
- 通用性，宿主树可以被拆分为外观和行为一致的 UI 模式

## 宿主实例

- 宿主树的节点

## 渲染器

- 渲染器决定如何与特定的宿主环境通信以及如何管理它的宿主实例
- 让开发者能以一种更好的方式操控宿主实例，而不用在意低级视图 API 范例

## React 元素

- 最小的构建单元
- 一个普通的 JavaScript 对象，用来描述一个宿主实例
- React 元素也能形成一棵树
- React 元素并不是永远存在的，它们总是在重建和删除之间不断循环
- React 元素具有不可变性。不能改变 React 元素中的子元素或者属性，如果想要在稍后渲染一些不同的东西，需要从头创建新的 React 元素树来描述它
- 类似电影中放映的每一帧

## 入口

- 告诉 React ，将特定的 React 元素树渲染到真正的宿主实例中去，例如，React DOM 的入口就是 ReactDOM.render()

## 组件

- 即返回 React 元素的函数

## 一致性

- React 将所有的工作分成了“渲染阶段”和“提交阶段”。渲染阶段是当 React 调用你的组件然后进行协调的时段，在此阶段进行干涉是安全的，提交阶段就是 React 操作宿主树的时候，而这个阶段永远是同步的

## 批量更新

- React 会在组件内所有事件触发完成后再进行批量更新，避免浪费的重复渲染

## 上下文

- 事实上，当 React 渲染时，维护了一个上下文栈

## 副作用

- React 会推迟执行 effect 直到浏览器重新绘制屏幕
- 有一个极少使用的 Hook 能够让你选择退出这种行为并进行一些同步的工作，请尽量避免使用它：useLayoutEffect

## 自定义 Hooks

- 自定义 Hooks 让不同的组件共享可重用的状态逻辑。注意状态本身是不共享的。每次调用 Hook 都只声明了其自身的独立状态。

## 渲染器

- react-dom、react-dom/server、 react-native、 react-test-renderer 都是常见的渲染器
- 不管你的目标平台是什么，react 包都是可用的，从 react 包中导出的一切，比如 React.Component、React.createElement、 React.Children 和 Hooks，都是独立于目标平台的
- 渲染器包则暴露特定平台的 API，例如 ReactDOM.render()
- react 包仅仅是让你使用 React 的特性，但是它不知道这些特性是如何实现的。渲染器包(react-dom、react-native 等)提供了 React 特性的实现以及平台特定的逻辑
- 每个渲染器都在已创建的类上设置了一个特殊的字段，这个字段叫做 updater
