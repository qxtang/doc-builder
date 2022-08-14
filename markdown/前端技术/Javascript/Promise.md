# 参考

- https://es6.ruanyifeng.com/#docs/promise

# 描述

- 用来解决 es5 时期的回调地狱
- 实例化一个 Promise 需要传入一个函数，代码在这个函数中执行，这个函数往往接收两个参数 resolve 和 reject，当作函数来执行
- 在函数中代码执行成功了，调用 resolve 函数，可以把 Promise 的状态变为已成功，通过参数把成功的结果传递出去，能在这个 Promise 对象的 then 方法中获取，then 方法可以链式调用多次，then 方法接受一个函数作为参数，这个函数的参数就是 resolve 传递出来的结果
- 在函数中业务代码执行失败了，调用 reject 函数，可以把 Promise 的状态变为已失败，通过参数把失败的结果传递出去，能在这个 Promise 对象的 catch 方法中获取，catch 方法和 then 方法用法一致，也是接受一个函数作为参数
- 无论结果如何都会走 finally 方法
- Promise.all：接受一个数组作为参数，都是 Promise 实例，调用 Promise.all 的时候，这些实例会一起开始执行，返回一个结果数组，只有全部实例的状态是已完成，结果的状态才会是已完成，只要有一个失败，结果就是失败
- Promise.race：接受一个数组作为参数，都是 Promise 实例，返回一个结果数组，调用 Promise.race 的时候，传进去的实例是竞赛关系，哪个结果获得的快，就返回那个结果
- Promise.resolve()：直接返回一个成功状态的 Promise 对象，接受一个参数，这个参数可以是：成功的结果、Promise 实例、不带有参数
- Promise.reject()：失败，同上

# Promise 实现链式调用原理

- 每个方法其实都是返回一个新的 Promise 对象

# 手写 Promise

```jsx
// 在这里用Symbol定义三种状态，防止外部改变状态
const Pending = Symbol('Pending');
// 进行中
const Fulfilled = Symbol('Fulfilled');
// 已成功
const Rejected = Symbol('Rejected');
// 已失败
const handleValue = (promise, x, resolve, reject) => {
  // 循环引用，自己等待自己完成，会出错，用reject传递出错误原因
  if (promise === x) {
    return reject(new TypeError('检测到Promise的链式循环引用'));
  }
  // 确保递归解析中只传递出去一次值
  let once = false;
  if ((x !== null && typeof x === 'object') || typeof x === 'function') {
    try {
      // 防止重复去读取x.then
      let then = x.then;
      // 判断x是不是Promise
      if (typeof then === 'function') {
        //调用then实例方法处理Promise执行结果
        then.call(
          x,
          (y) => {
            if (once) return;
            once = true;
            // 防止Promise中Promise执行成功后又传递一个Promise过来，
            // 要做递归解析。
            handleValue(promise, y, resolve, reject);
          },
          (r) => {
            if (once) return;
            once = true;
            reject(r);
          }
        );
      } else {
        // 如果x是个普通对象，直接调用resolve(x)
        resolve(x);
      }
    } catch (err) {
      if (once) return;
      once = true;
      reject(err);
    }
  } else {
    // 如果x是个原始值，直接调用resolve(x)
    resolve(x);
  }
};
class Promise {
  constructor(executor) {
    this.status = Pending;
    //存储 Promise 的状态
    this.value = undefined;
    //存储executor函数中业务代码执行成功的结果
    this.reason = undefined;
    //存储executor函数中业务代码执行失败的原因
    this.onFulfilled = [];
    //executor函数中业务代码执行成功回调函数的集合
    this.onRejected = [];
    //executor函数中业务代码执行失败回调函数的集合
    const resolve = (value) => {
      // 只有当状态为 Pending 才会改变，来保证一旦状态改变就不会再变。
      if (this.status === Pending) {
        this.status = Fulfilled;
        this.value = value;
        // 依次调用成功回调函数
        this.onFulfilled.forEach((fn) => fn());
      }
    };
    const reject = (value) => {
      // 只有当状态为 Pending 才会改变，来保证一旦状态改变就不会再变。
      if (this.status === Pending) {
        this.status = Rejected;
        this.reason = value;
        // 依次调用失败回调函数
        this.onRejected.forEach((fn) => fn());
      }
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };
    let promise = new Promise((resolve, reject) => {
      if (this.status === Fulfilled) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            handleValue(promise, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.status === Rejected) {
        if (onRejected && typeof onRejected === 'function') {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              handleValue(promise, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        }
      }
      if (this.status === Pending) {
        this.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              handleValue(promise, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        if (onRejected && typeof onRejected === 'function') {
          this.onRejected.push(() => {
            setTimeout(() => {
              try {
                let x = onRejected(this.reason);
                handleValue(promise, x, resolve, reject);
              } catch (error) {
                reject(error);
              }
            }, 0);
          });
        }
      }
    });
    return promise;
  }
  static resolve(param) {
    if (param instanceof Promise) {
      return param;
    }
    return new Promise((resolve, reject) => {
      if (param && Object.prototype.toString.call(param) === '[object Object]' && typeof param.then === 'function') {
        setTimeout(() => {
          param.then(resolve, reject);
        }, 0);
      } else {
        resolve(param);
      }
    });
  }
  static reject(param) {
    return new Promise((resolve, reject) => {
      reject(param);
    });
  }
  static all(promises) {
    //将参数promises转为一个真正的数组
    promises = Array.from(promises);
    return new Promise((resolve, reject) => {
      const length = promises.length;
      let value = [];
      if (length) {
        value = Array.apply(null, { length: length });
        for (let i = 0; i < length; i++) {
          Promise.resolve(promises[i]).then(
            (res) => {
              value[i] = res;
              if (value.length == length) {
                resolve(value);
              }
            },
            (err) => {
              reject(err);
              return;
            }
          );
        }
      } else {
        resolve(value);
      }
    });
  }
  static race(promises) {
    //将参数promises转为一个真正的数组
    promises = Array.from(promises);
    return new Promise((resolve, reject) => {
      const length = promises.length;
      if (length) {
        for (let i = 0; i < length; i++) {
          Promise.resolve(promises[i]).then(
            (res) => {
              resolve(res);
              return;
            },
            (err) => {
              reject(err);
              return;
            }
          );
        }
      } else {
        return;
      }
    });
  }
}
```

# promise.catch 是不是微任务

- 是的
