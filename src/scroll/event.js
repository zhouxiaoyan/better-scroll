export function eventMixin(BScroll) {
  BScroll.prototype.on = function (type, fn, context = this) {
    //在bscroll中绑定事件。也就是把特定事件以及它对应的函数放在bsscroll._event对象中。
    if (!this._events[type]) {
      this._events[type] = []
    }

    this._events[type].push([fn, context])
  }

  BScroll.prototype.once = function (type, fn, context = this) {
    let fired = false

    function magic() {
      this.off(type, magic)

      if (!fired) {
        fired = true
        fn.apply(context, arguments)
      }
    }
    //这也是一种适配方法，只是这里适配的是函数。
//once函数对传进来的fn进行修饰。希望他只执行一次。因为只调用一次，所以就在执行一次的时候
    //就解绑。然后执行，并用fired参数记录已经执行了。
    this.on(type, magic)
  }

  BScroll.prototype.off = function (type, fn) {
    let _events = this._events[type]
    if (!_events) {
      return
    }
//这里我觉得不好。没有必要一直循环，找到了就break，而且是把它赋值为undifined，而不是从数组中删除。
    let count = _events.length
    while (count--) {
      if (_events[count][0] === fn) {
        _events[count][0] = undefined
      }
    }
  }

  BScroll.prototype.trigger = function (type) {
    //trigger是调用函数。手动调用，而不是原生的浏览器事件调用。
    let events = this._events[type]
    if (!events) {
      return
    }

    let len = events.length
    let eventsCopy = [...events]
    for (let i = 0; i < len; i++) {
      let event = eventsCopy[i]
      let [fn, context] = event
      if (fn) {
        fn.apply(context, [].slice.call(arguments, 1))
      }
    }
  }
}
