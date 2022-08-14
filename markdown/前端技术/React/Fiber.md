# Fiber

- 是 React 核心算法的重新实现，是 React 团队两年多研究的结晶，是对 reconciliation 的重新编写，重新实现了 reconciler（协调器）
- 目标是提高其对动画、布局和手势等领域的适用性
- 允许将更新分解成更小的任务，达到增量渲染，将渲染工作拆分为块并将其分散到多个帧上，更新不会长时间阻止主线程（比如用户输入，动画之类）
- 其他主要功能包括能够在新更新到来时暂停，中止或重用工作
- 注意：并不会减少总工作量或更新所需的时间

# 为什么 Fiber

- 旧版 React 在处理 UI 时，使用栈递归遍历树结构，整个过程同步无法被打断，如果树结构太大层级很深，会一直占用浏览器主线程，可能导致动画丢帧，看起来断断续续（JS 线程和 GUI 线程是互斥的）
- 改变了之前 react 的组件渲染机制，新的架构使原来同步渲染的组件可以异步化，可中途中断渲染，执行更高优先级的任务。释放浏览器主线程，保证任务在浏览器空闲的时候执行

# Fiber 架构思想

- 浏览器现有 api：requestIdleCallback （闲时调用）来实现异步渲染，但 React 为了照顾绝大多数的浏览器，自己实现了 requestIdleCallback
- 两个阶段：Reconciliation 与 Commit。Reconciliation 阶段对应早期版本的 diff 过程，Commit 阶段对应早期版本的 patch 过程，以 render 为界
- 阶段一（Reconciliation）：生成 Fiber 树，得出需要更新的节点信息。这一步是一个渐进的过程，可以被打断。阶段一可被打断的特性，让优先级更高的任务先执行，从框架层面大大降低了页面掉帧的概率
- 阶段二（Commit）：需要更新的节点一次过批量更新，这个过程不能被打断
- Reconciliation 如果遇到更高优先级事件，则进行打断，渲染到一半的组件，会从头开始渲染，在 Reconciliation 阶段，一些生命周期可能会重新执行，例如
  - componentWillMount
  - componentWillReceiveProps
  - shouldComponentUpdate
  - componentWillUpdate
- 这些生命周期函数则会在 Commit 阶段调用
  - componentDidMount
  - componentDidUpdate
  - componentWillUnmount

# Fiber 树

React 在 render 第一次渲染时，会通过 React.createElement 创建一颗 Element 树，可以称之为 Virtual DOM Tree，由于要记录上下文信息，加入了 Fiber，每一个 Element 会对应一个 Fiber Node，将 Fiber Node 链接起来的结构成为 Fiber Tree。Fiber Tree 一个重要的特点是链表结构，将递归遍历编程循环遍历，然后配合 requestIdleCallback API, 实现任务拆分、中断与恢复

# workInProgress Fiber 树

在 React 中最多会同时存在两棵 Fiber 树，当前显示在页面是 current Fiber 树，在内存中构建的 Fiber 树称为 workInProgress Fiber 树，workingProgress Fiber 这棵树是在内存中构建的，构建完成才统一替换，这样不会产生不完全的真实 dom。一旦更新完成，react 会直接将 current 树替换成 workingProgress Fiber 树，以便快速完成 DOM 的更新。也是 react 提升性能的一部分

# Fiber 数据结构

```typescript
interface FiberNode {
  stateNode: any; // 节点实例
  child: any; // 子节点
  sibling: any; // 兄弟节点
  return: any; // 父节点
}
```

# Fiber 为什么使用链表

- React 使用单链表树遍历算法实现在没有递归的情况下遍历树，树形结构并不满足中途暂停
- 对异步友好，它使暂停遍历并使阻止堆栈增长成为可能
- 目前的虚拟 DOM 是树结构，当任务被打断后，树结构无法恢复之前的任务继续执行，所以需要一种新的数据结构，即链表，链表可以包含多个指针，可以轻易找到下一个节点，继而恢复任务的执行
- Fiber 采用的链表中包含三个指针，parent 指向其父 Fiber 节点，child 指向其子 Fiber 节点，sibling 指向其兄弟 Fiber 节点。一个 Fiber 节点对应一个任务节点

# Fiber 为什么深度优先

- 查找 context 的消费节点，当 context 改变之后, 需要找出依赖该 context 的所有子节点
