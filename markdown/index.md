# index

日照香炉生紫烟，遥看瀑布挂前川。  
飞流直下三千尺，疑是银河落九天。

```javascript
const tools = {
  debounce: (fn, wait = 500) => {
    let timer = null;
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, wait);
    };
  },
  throttle: (fn, wait = 500) => {
    let canrun = true;
    return function () {
      if (!canrun) {
        return;
      }
      canrun = false;
      setTimeout(() => {
        fn.apply(this, arguments);
        canrun = true;
      }, wait);
    };
  },
};
```

![](https://picsum.photos/id/10/300/300)
