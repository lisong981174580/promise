import StateMachine from 'javascript-state-machine'; // https://www.npmjs.com/package/javascript-state-machine

// 状态机模型
const fsm = new StateMachine({
  init: 'pending', // 初始化状态

  transitions: [
    {
      name: 'resolve', // 事件名称
      from: 'pending',
      to: 'fulfilled',
    },

    {
      name: 'reject', // 事件名称
      from: 'pending',
      to: 'rejected',
    },
  ],

  methods: {
    // 监听 resolve
    onResolve: function (state, data) {
      // state: 当前状态机实例; data: fsm.resolve(xxx) 传递的参数
      data.successList.forEach(fn => fn());
    },

    // 监听 reject
    onRejected: function (state, data) {
      // state: 当前状态机实例; data: fsm.rejected(xxx) 传递的参数
      data.failList.forEach(fn => fn());
    },
  },
});

// 定义 Promise
class MyPromise {
  constructor(fn) {
    this.successList = [];
    this.failList = [];

    fn(
      () => {
        // resolve 函数
        fsm.resolve(this);
      },

      () => {
        // reject 函数
        fsm.reject(this);
      }
    );
  }

  then(successFn, failFn) {
    if (typeof successFn === 'function') { 
      this.successList.push(successFn);
    }

    if (typeof failFn === 'function') {
      this.failList.push(failFn);
    }

    return this;
  }

  catch(failFn) {
    if (typeof failFn === 'function') {
      this.failList.push(failFn);
    }

    return this;
  }
}

// 测试代码
function loadImag(src) {
  return new MyPromise(function (resolve, reject) {
    let img = document.createElement('img');

    img.onload = function () {
      resolve(img);
    };

    img.onerror = function () {
      reject(img);
    };

    img.src = src;
  });
}

const src = 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg';

// 测试 loadImag
loadImag(src).then(function() {
  console.log('resolve');
}).then(function() {
  console.log('resolve2');
}).catch(function() {
  console.log('reject');
})