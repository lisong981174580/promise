# Promise实现原理

> 本篇文章主要在于探究 Promise 的实现原理，带领大家一步一步实现一个 Promise, 如果对 Promise 的用法不了解，可以查阮一峰老师的 ES6 Promise 教程。

接下来，带你一步一步实现一个 Promise

## 1. Promise 基本结构

构造函数 Promise 必须接受一个函数作为参数，我们称该函数为 handle，handle 又包含 resolve 和 reject 两个参数，它们是两个函数。

```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('FULFILLED')
  }, 1000)
})
```

定义一个判断一个变量是否为函数的方法，后面会用到

```js
// 判断变量否为function
const isFunction = variable => typeof variable === 'function'
```

首先，我们定义一个名为 MyPromise 的 Class，它接受一个函数 handle 作为参数

```js
class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise must accept a function as a parameter')
    }
  }
}
```

再往下看

## 2. Promise 状态和值

Promise 对象存在以下三种状态： Pending(进行中)、Fulfilled(已成功)、Rejected(已失败)

状态只能由 Pending 变为 Fulfilled 或由 Pending 变为 Rejected ，且状态改变之后不会在发生变化，会一直保持这个状态。

Promise的值是指状态改变时传递给回调函数的值


> 上文中handle函数包含 resolve 和 reject 两个参数，它们是两个函数，可以用于改变 Promise 的状态和传入 Promise 的值

```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('FULFILLED')
  }, 1000)
})
```

这里 resolve 传入的 "FULFILLED" 就是 Promise 的值

resolve 和 reject

* resolve : 将 Promise 对象的状态从 Pending(进行中) 变为 Fulfilled(已成功)
* reject : 将 Promise 对象的状态从 Pending(进行中) 变为 Rejected(已失败)
* resolve 和 reject 都可以传入任意类型的值作为实参，表示 Promise 对象成功（Fulfilled）和失败（Rejected）的值

了解了 Promise 的状态和值，接下来，我们为 MyPromise 添加状态属性和值

> 首先定义三个常量，用于标记Promise对象的三种状态

```js
// 定义Promise的三种状态常量
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
```

再为 MyPromise 添加状态和值，并添加状态改变的执行逻辑

```js
class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise must accept a function as a parameter')
    }
    // 添加状态
    this._status = PENDING
    // 添加状态
    this._value = undefined
    // 执行handle
    try {
      handle(this._resolve.bind(this), this._reject.bind(this)) 
    } catch (err) {
      this._reject(err)
    }
  }
  // 添加resovle时执行的函数
  _resolve (val) {
    if (this._status !== PENDING) return
    this._status = FULFILLED
    this._value = val
  }
  // 添加reject时执行的函数
  _reject (err) { 
    if (this._status !== PENDING) return
    this._status = REJECTED
    this._value = err
  }
}
```

这样就实现了 Promise 状态和值的改变。下面说一说 Promise 的核心: then 方法

## 3. Promise 的 then 方法

Promise 对象的 then 方法接受两个参数：

```js
promise.then(onFulfilled, onRejected)
```

### 参数可选

onFulfilled 和 onRejected 都是可选参数。

* 如果 onFulfilled 或 onRejected 不是函数，其必须被忽略

onFulfilled 特性

* 当 promise 状态变为成功时必须被调用，其第一个参数为 promise 成功状态传入的值（ resolve 执行时传入的值）
* 在 promise 状态改变前其不可被调用
* 其调用次数不可超过一次

onRejected 特性

如果 onRejected 是函数：

* 当 promise 状态变为失败时必须被调用，其第一个参数为 promise 失败状态传入的值（ reject 执行时传入的值）
* 在 promise 状态改变前其不可被调用
* 其调用次数不可超过一次

### 多次调用

then 方法可以被同一个 promise 对象调用多次

* 当 promise 成功状态时，所有 onFulfilled 需按照其注册顺序依次回调
* 当 promise 失败状态时，所有 onRejected 需按照其注册顺序依次回调

### 返回

then 方法必须返回一个新的 promise 对象

```js
promise2 = promise1.then(onFulfilled, onRejected);
```
因此 promise 支持链式调用

```js
promise1.then(onFulfilled1, onRejected1).then(onFulfilled2, onRejected2);
```

这里涉及到 Promise 的执行规则，包括“值的传递”和“错误捕获”机制：

1、如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：

* 若 x 不为 Promise ，则使 x 直接作为新返回的 Promise 对象的值， 即新的onFulfilled 或者 onRejected 函数的参数.
* 若 x 为 Promise ，这时后一个回调函数，就会等待该 Promise 对象(即 x )的状态发生变化，才会被调用，并且新的 Promise 状态和 x 的状态相同。

下面的例子用于帮助理解：

```js
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})
promise2 = promise1.then(res => {
  // 返回一个普通值
  return '这里返回一个普通值'
})
promise2.then(res => {
  console.log(res) //1秒后打印出：这里返回一个普通值
})
```

```
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})
promise2 = promise1.then(res => {
  // 返回一个Promise对象
  return new Promise((resolve, reject) => {
    setTimeout(() => {
     resolve('这里返回一个Promise')
    }, 2000)
  })
})
promise2.then(res => {
  console.log(res) //3秒后打印出：这里返回一个Promise
})
```

2、如果 onFulfilled 或者onRejected 抛出一个异常 e ，则 promise2 必须变为失败（Rejected），并返回失败的值 e，例如：

```
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
promise2 = promise1.then(res => {
  throw new Error('这里抛出一个异常e')
})
promise2.then(res => {
  console.log(res)
}, err => {
  console.log(err) //1秒后打印出：这里抛出一个异常e
})
```

3、如果onFulfilled 不是函数且 promise1 状态为成功（Fulfilled）， promise2 必须变为成功（Fulfilled）并返回 promise1 成功的值，例如：

```
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
promise2 = promise1.then('这里的onFulfilled本来是一个函数，但现在不是')
promise2.then(res => {
  console.log(res) // 1秒后打印出：success
}, err => {
  console.log(err)
})
```

4、如果 onRejected 不是函数且 promise1 状态为失败（Rejected），promise2必须变为失败（Rejected） 并返回 promise1 失败的值，例如：

```
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('fail')
  }, 1000)
})
promise2 = promise1.then(res => res, '这里的onRejected本来是一个函数，但现在不是')
promise2.then(res => {
  console.log(res)
}, err => {
  console.log(err)  // 1秒后打印出：fail
})
```

根据上面的规则，我们来为 完善 MyPromise

修改 constructor : 增加执行队列

由于 then 方法支持多次调用，我们可以维护两个数组，将每次 then 方法注册时的回调函数添加到数组中，等待执行

