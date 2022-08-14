# 参考

- https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/

# 为什么 hooks

- 类组件的性能消耗比较大，因为类组件需要创建类组件的实例，而且不能销毁
- 函数式组件性能消耗小，因为函数式组件不需要创建实例，渲染的时候就执行一下，得到返回的 react 元素后就直接把中间量全部都销毁
- 复用状态逻辑：Hook 使你在无需修改组件结构的情况下复用状态逻辑，可以将含有 state 的逻辑从组件中抽象出来，这将可以让这些逻辑容易被测试，在组件之间复用状态逻辑很难，如果要增加职责的话，就要加一层 HOC，容易形成“嵌套地狱”，一个套一个
- 复杂 class 组件会变得难以理解，比如 componentDidMount 和 componentWillUnmount 是区分开的，Hook 可以将组件中相互关联的部分拆分成更小的函数
- class 比普通函数更难理解和使用，尤其是 this
- 代码组织上，hooks 将业务逻辑聚合后，整个工程可阅读性大大增加
- 友好渐进式的，项目中可以同时使用 class 和 hooks

# vue 中 mixin 的缺点

- 难以追溯的方法与属性（不知道这个属性或方法是谁的）

# hook 为什么不能放在循环、条件、嵌套函数执行（为什么顺序调用对 React Hooks 很重要？）

- Not Magic, just Arrays
- Hook 通过数组实现的，每次 useState 都会改变下标，React 需要利用调用顺序来正确更新相应的状态，否则会引起调用顺序的错乱，从而造成意想不到的错误
- 能确保 Hook 在每一次渲染中都按照同样的顺序被调用，让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确
- React 依靠 Hook 调用的顺序来知道哪个 state 对应哪个 useState，Hook 的调用顺序在每次渲染中都是相同的，只要 Hook 的调用顺序在多次渲染之间保持一致，React 就能正确地将内部 state 和对应的 Hook 进行关联
- Hook 需要在我们组件的最顶层调用
- Hooks 重渲染时是依赖于固定顺序调用，来保证被正确识别，依赖数组来维护，有一个 setter 数组和一个索引，该索引在每个 hooks 被调用时递增，并在组件 render 时重置
- 用数组解构语法来命名 useState() 返回的 state 变量，但这些变量不会连接到 React 组件上，数据的存储是独立于组件之外的
- 步骤
  - 初始化：创建两个空数组 setters 与 states，创建一个指针设置为 0
  - 首次渲染：每当 useState() 被调用时，如果它是首次渲染，它会通过 push 将一个 setter 方法（绑定了指针“cursor”位置）放进 setters 数组中，同时，也会将另一个对应的状态放进 states 数组中去
  - 后续渲染：每次的后续渲染都会重置指针“cursor”的位置，并会从每个数组中读取对应的值
  - 处理设置事件：每个 setter 对应一个指针位置的引用，当触发任何 setter 调用的时候，会去改变状态数组中对应索引的值
- 开发工作中可以使用 eslint 配置相关规则发现这一错误

# hooks 实现为什么用数组不用 map

- 使用 key 值取映射 hook 的话，自定义的 hook 被多个组件调用的话，很难不保证之前有没有同名的 key 在其他组件内
- 用 Symbol：不能很好地复用了，因为 key 值的唯一性使得总是同一个 key 调用了 hook

# React 如何区分 Class 组件和 Function 组件

假设这个类叫 Greeting

- instanceof 检查 Greeting 是否是 React.Component 的继承类
- 检查 `Greeting.prototype.isReactComponent` 属性

# hooks 特性

- Effect 拿到的总是定义它的那次渲染中的 props 和 state，在任意一次渲染中，props 和 state 是始终保持不变的，它们都属于一次特定的渲染，同样，每次渲染都有它自己的 Effects
- 可通过 ref 来保存值，实现在所有的渲染帧中共享
- React 会记住我们设置的 effect 函数，并且会在每次 DOM 更改后、浏览器绘制屏幕后，去调用，这使得应用更流畅，不会阻塞屏幕的更新，上一次的 effect 会在重新渲染后被清除
- 依赖项不要对 React 撒谎：effect 中用到的所有组件内的值都应该包含在依赖中
- 可以使用 setState 的函数形式，获取上一次调用对应 setter 时传的状态值
- 如果某些函数仅在 effect 中调用，可以把它们的定义移到 effect 中，这样可以不再需要去考虑依赖
- 如果一个函数没有使用组件内的任何值，可以把它提到组件外面去定义成纯函数，然后就可以自由地在 effects 中使用（或者把它包装成 useCallback）
- useEffect 第一个参数，不能返回 Promise，所以不能传递异步函数，可以自己在里面声明再执行

# 定时器的例子

```jsx
// 先点击 alert，再点击几次 add 增加 count，3 秒后弹出的是点击 alert 时的状态
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>add</button>
      <button onClick={handleAlertClick}>alert</button>
    </div>
  );
}

// 而如果是在类组件中，则会正确弹出状态的当前值
// 因为类组件的状态保存在实例属性上，状态改变实例不会销毁
```

# hooks 缺点

- 响应式的 useEffect 写函数组件时，你不得不改变一些写法习惯。你必须清楚代码中 useEffect 和 useCallback 的“依赖项数组”的改变时机。有时候，你的 useEffect 依赖某个函数的不可变性，这个函数的不可变性又依赖于另一个函数的不可变性，这样便形成了一条依赖链。一旦这条依赖链的某个节点意外地被改变了，你的 useEffect 就被意外地触发了

# 过度使用 useMemo 后果

- useMemo 本身也有开销
- useMemo 会「记住」一些值，同时在后续 render 时，将依赖数组中的值取出来和上一次记录的值进行比较，如果不相等才会重新执行回调函数，否则直接返回「记住」的值。这个过程本身就会消耗一定的内存和计算资源
- 如果你执行的操作开销不大，那么你就不需要记住返回值。使用 useMemo 的成本可能会超过重新评估该函数的成本
- 使用前应该先思考三个问题：
  - 传递给 useMemo 的函数开销大不大
  - 返回的值是原始值吗，如果计算出来的是基本类型的值（string、 boolean 、null、undefined 、number、symbol），那么每次比较都是相等的，下游组件就不会重新渲染；如果计算出来的是复杂类型的值（object、array），哪怕值不变，但是地址会发生变化，导致下游组件重新渲染。所以我们也需要「记住」这个值。
  - 在编写自定义 Hook 时，返回值一定要保持引用的一致性。 因为你无法确定外部要如何使用它的返回值。如果返回值被用做其他 Hook 的依赖，并且每次 re-render 时引用不一致（当值相等的情况），就可能会产生 bug。所以如果自定义 Hook 中暴露出来的值是 object、array、函数等，都应该使用 useMemo 。以确保当值相同时，引用不发生变化。

# hooks 常用 API

- useCallback：返回一个记忆函数，缓存了每次渲染时那些回调函数的实例，可以配合 React.memo 起到减少不必要的渲染的作用
- useMemo：返回一个记忆值，传递一个工厂函数和数组。useMemo 只会在数组其中一个输入发生更改时重新调用工厂函数去计算这个值。此优化有助于避免在每个渲染上进行高开销的计算。
- useRef：useRef 返回一个可变的 ref 对象，其 current 属性被初始化为传递的参数（initialValue）。返回的对象将存留在整个组件的生命周期中。useRef 在 react hook 中的作用, 正如官网说的, 它像一个变量, 类似于 this , 它就像一个盒子, 你可以存放任何东西. createRef 每次渲染都会返回一个新的引用，而 useRef 每次都会返回相同的引用
- useImperativeHandle：自定义使用 ref 时公开给父组件的实例值，往往与 forwardRef 一起使用
- useLayoutEffect：签名与 useEffect 相同，但在所有 DOM 变化后同步触发

# Hook 使用规则和注意

- 约定以 use 开头并且紧跟大写字母（因为约定的力量在于：我们不用细看实现，也能通过命名来了解一个它是什么）
- 只在最顶层使用 Hook，不要在循环，条件或嵌套函数中调用 Hook，能确保 Hook 在每一次渲染中都按照同样的顺序被调用
- 只在 React 函数中调用 Hook，不要在普通的 JavaScript 函数中调用 Hook，确保组件的状态逻辑在代码中清晰可见（Eslint 通过判断一个方法是不是大坨峰命名来判断它是否是 React 函数）

# 自定义 hooks

- 自定义 Hook 是一种自然遵循 Hook 设计的约定，而并不是 React 的特性。
- 自定义 Hook 必须以 “use” 开头，不遵循的话，由于无法判断某个函数是否包含对其内部 Hook 的调用，React 将无法自动检查你的 Hook 是否违反了 Hook 的使用规则
- 在两个组件中使用相同的 Hook 不会共享 state，自定义 Hook 是一种重用状态逻辑的机制(例如设置为订阅并存储当前值)，所以每次使用自定义 Hook 时，其中的所有 state 和副作用都是完全隔离的

# useEffect 为什么不能传入异步函数

- 理由是 effect function 应该返回一个销毁函数（effect：是指 return 返回的 cleanup 函数），如果 useEffect 第一个参数传入 async，返回值则变成了 Promise，会导致 react 在调用销毁函数的时候报错：function.apply is undefined

## 为什么这样设计

- useEffect 的返回值是要在卸载组件时调用的，React 需要在 mount 的时候马上拿到这个值，不能有延迟

## 解决

- 使用 IIFE 或者声明异步函数再执行，推荐使用 IIFE 写法，因为声明的异步函数可能有外部依赖无法及时更新

  ```jsx
  useEffect(() => {
    (async () => {
      const res = await fetch(SOME_API);
      setValue(res.data);
    })();
  }, []);
  ```

- 编写自定义 hook useAsyncEffect

  ```typescript
  // 自定义hook
  function useAsyncEffect(effect: () => Promise<void | (() => void)>, dependencies?: any[]) {
    return useEffect(() => {
      const cleanupPromise = effect();
      return () => {
        cleanupPromise.then((cleanup) => cleanup && cleanup());
      };
    }, dependencies);
  }

  // 使用
  useAsyncEffect(async () => {
    const count = await fetchData();
    setCount(count);
  }, [fetchData]);
  ```

# useEffect 实现防抖

```javascript
useEffect(() => {
  const timer = setTimeout(async () => {
    await fetchData(deps);
  }, 500);

  return () => clearTimeout(timer);
}, [deps]);
```

- 不能直接向 useEffect 传递防抖函数，因为 useEffect 常依赖 props 或者 useState 返回的值，当两种值改变后，都会触发 Function 组件重新渲染，那么 useEffect 又会重新执行一遍，生成一个新的防抖后的函数
