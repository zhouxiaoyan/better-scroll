//这个配置用于做上拉加载功能
export function pullUpMixin(BScroll) {
  BScroll.prototype._initPullUp = function () {
    // must watch scroll in real time
    this.options.probeType = 3

    this.pullupWatching = false
    this._watchPullUp()
  }
//这个函数里绑定scroll事件。并且被调用。绑定事件也是在特定的事件绑定所以放在一个函数中。
  BScroll.prototype._watchPullUp = function () {
    if (this.pullupWatching) {
      return
    }
    this.pullupWatching = true
    const {threshold = 0} = this.options.pullUpLoad
//监听scroll事件，检查是不是到底了
    this.on('scroll', checkToEnd)
//checkToend事件传入的事件是一个对象如{x:0;y:-300}；为什么？threshold顶部下拉的距离
    function checkToEnd(pos) {
      if (this.movingDirectionY === 1 && pos.y <= (this.maxScrollY + threshold)) {
        this.trigger('pullingUp')
        //触发pullingUp事件。这里没有定义返回。
        this.pullupWatching = false
        this.off('scroll', checkToEnd)//解绑
      }
    }
  }

  BScroll.prototype.finishPullUp = function () {
    if (this.isInTransition) {
      this.once('scrollEnd', () => {
        this._watchPullUp()
      })
    } else {
      this._watchPullUp()
    }
  }
}
