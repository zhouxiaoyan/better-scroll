import {eventMixin} from './scroll/event'
import {initMixin} from './scroll/init'
import {coreMixin} from './scroll/core'
import {snapMixin} from './scroll/snap'
import {wheelMixin} from './scroll/wheel'
import {scrollbarMixin} from './scroll/scrollbar'
import {pullDownMixin} from './scroll/pulldown'
import {pullUpMixin} from './scroll/pullup'

import {warn} from './util/debug'
//组装构造函数。通过函数来进行组装。也就是加载的时候运行。而有点不是加载的时候通过别的函数来进行组装构造函数。而是加载的时候就加载完整的构造函数。
//也就是说模块之间也是通过函数来完成他们之间的调用的。而有的是模块之间直接调用。
function BScroll(el, options) {
  //对el的这个参数进行校验。如果是选择器就用document.querySelector（el），如果不是就是dom。如果是!this.wrapper与null，undeifined的区别
  this.wrapper = typeof el === 'string' ? document.querySelector(el) : el
  if (!this.wrapper) {
    warn('can not resolve the wrapper dom')
  }
  //获取传入的dom的子节点的第一个  如果没有报错。再就是获取到它的style。初始化
  this.scroller = this.wrapper.children[0]
  if (!this.scroller) {
    warn('the wrapper need at least one child element to be scroller')
  }
  // cache style for better performance
  this.scrollerStyle = this.scroller.style

  this._init(el, options)
}

initMixin(BScroll)
coreMixin(BScroll)
eventMixin(BScroll)
snapMixin(BScroll)
wheelMixin(BScroll)
scrollbarMixin(BScroll)
pullDownMixin(BScroll)
pullUpMixin(BScroll)

BScroll.Version = '1.3.1'

export default BScroll

