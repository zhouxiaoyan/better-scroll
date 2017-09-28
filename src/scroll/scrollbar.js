import { style } from '../util/dom'

const INDICATOR_MIN_LEN = 8

export function scrollbarMixin(BScroll) {
  BScroll.prototype._initScrollbar = function () {
    const {fade = true} = this.options.scrollbar
    this.indicators = []
    let indicator

    if (this.options.scrollX) {
     //如果是横轴的话。那么这个indicator（提示器）对象如下。
      indicator = {
        el: createScrollbar('horizontal'),//创建了滚动条
        direction: 'horizontal',
        fade
      }
//创建之后appendto这个this.wrappe中。
      this._insertScrollBar(indicator.el)
//Indicator构造函数  传入了better-scroll对象以及这个scrollbar对象。new出来的对象放入数组indicators中。
      this.indicators.push(new Indicator(this, indicator))
    }

    if (this.options.scrollY) {//scrollY和scrollx不是两个分支，可以同时存在。所以可能实例化连个INdicator，放入数组中保存。
      indicator = {
        el: createScrollbar('vertical'),
        direction: 'vertical',
        fade
      }
      this._insertScrollBar(indicator.el)
      this.indicators.push(new Indicator(this, indicator))
    }

    this.on('refresh', () => {
      for (let i = 0; i < this.indicators.length; i++) {
        this.indicators[i].refresh()
      }
    })

    if (fade) {
      this.on('scrollEnd', () => {
        for (let i = 0; i < this.indicators.length; i++) {
          this.indicators[i].fade()
        }
      })

      this.on('scrollCancel', () => {
        for (let i = 0; i < this.indicators.length; i++) {
          this.indicators[i].fade()
        }
      })

      this.on('scrollStart', () => {
        for (let i = 0; i < this.indicators.length; i++) {
          this.indicators[i].fade(true)
        }
      })

      this.on('beforeScrollStart', () => {
        for (let i = 0; i < this.indicators.length; i++) {
          this.indicators[i].fade(true, true)
        }
      })
    }
  }

  BScroll.prototype._insertScrollBar = function (scrollbar) {
    this.wrapper.appendChild(scrollbar)
  }

  BScroll.prototype._removeScrollBars = function () {
    for (var i = 0; i < this.indicators.length; i++) {
      let indicator = this.indicators[i]
      indicator.remove()
    }
  }
}

//创建滚动条
function createScrollbar(direction) {
  let scrollbar = document.createElement('div')
  let indicator = document.createElement('div')
//创建了两个div。并且添加了样式。除了添加固定的样式外，还添加了class。
  scrollbar.style.cssText = 'position:absolute;z-index:9999;pointerEvents:none'
  indicator.style.cssText = 'box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px;'
//根据不同的方向又差别化了样式和样式名
  indicator.className = 'bscroll-indicator'

  if (direction === 'horizontal') {
    scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0'
    indicator.style.height = '100%'
    scrollbar.className = 'bscroll-horizontal-scrollbar'
  } else {
    scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px'
    indicator.style.width = '100%'
    scrollbar.className = 'bscroll-vertical-scrollbar'
  }

  scrollbar.style.cssText += ';overflow:hidden'
  scrollbar.appendChild(indicator)
//scrollbar添加了indicator

  return scrollbar
}

function Indicator(scroller, options) {
  //options是对象indicator = {el: createScrollbar('horizontal'),//创建了滚动条 direction: 'horizontal',fade}.
  //而scoller指的better-scrooll对象   把这个对象上的一些属性值  放在另一个对象中进行处理。
  this.wrapper = options.el
  this.wrapperStyle = this.wrapper.style
  this.indicator = this.wrapper.children[0]
  this.indicatorStyle = this.indicator.style
  this.scroller = scroller
  this.direction = options.direction
  if (options.fade) {
    this.visible = 0
    this.wrapperStyle.opacity = '0'
  } else {
    this.visible = 1
  }
}

Indicator.prototype.refresh = function () {
  //设置scrollbar内部的div的transitionduration值
  this.transitionTime()
  this._calculate()
  this.updatePosition()
}

Indicator.prototype.fade = function (visible, hold) {
  if (hold && !this.visible) {
    return
  }

  let time = visible ? 250 : 500

  visible = visible ? '1' : '0'

  this.wrapperStyle[style.transitionDuration] = time + 'ms'

  clearTimeout(this.fadeTimeout)
  this.fadeTimeout = setTimeout(() => {
    this.wrapperStyle.opacity = visible
    this.visible = +visible
  }, 0)
}

Indicator.prototype.updatePosition = function () {
  if (this.direction === 'vertical') {
    //this.scoller.y表示这个scroll内容此时此刻向上滚动的垂直距离。最大的垂直距离是MaxscrollY.
    let y = Math.round(this.sizeRatioY * this.scroller.y)

    if (y < 0) {
      //重置了里层div的height数据。但是依然要大于设置的最小值。
      this.transitionTime(500)
      const height = Math.max(this.indicatorHeight + y * 3, INDICATOR_MIN_LEN)
      this.indicatorStyle.height = `${height}px`
      y = 0
    } else if (y > this.maxPosY) {
      this.transitionTime(500)
      const height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, INDICATOR_MIN_LEN)
      this.indicatorStyle.height = `${height}px`
      y = this.maxPosY + this.indicatorHeight - height
    } else {
      this.indicatorStyle.height = `${this.indicatorHeight}px`
    }
    this.y = y

    if (this.scroller.options.useTransform) {
      this.indicatorStyle[style.transform] = `translateY(${y}px)${this.scroller.translateZ}`
    } else {
      this.indicatorStyle.top = `${y}px`
    }
  } else {
    let x = Math.round(this.sizeRatioX * this.scroller.x)

    if (x < 0) {
      this.transitionTime(500)
      const width = Math.max(this.indicatorWidth + x * 3, INDICATOR_MIN_LEN)
      this.indicatorStyle.width = `${width}px`
      x = 0
    } else if (x > this.maxPosX) {
      this.transitionTime(500)
      const width = Math.max(this.indicatorWidth - (x - this.maxPosX) * 3, INDICATOR_MIN_LEN)
      this.indicatorStyle.width = `${width}px`
      x = this.maxPosX + this.indicatorWidth - width
    } else {
      this.indicatorStyle.width = `${this.indicatorWidth}px`
    }

    this.x = x

    if (this.scroller.options.useTransform) {
      this.indicatorStyle[style.transform] = `translateX(${x}px)${this.scroller.translateZ}`
    } else {
      this.indicatorStyle.left = `${x}px`
    }
  }
}

Indicator.prototype.transitionTime = function (time = 0) {
  //其中style对象是在unitl这个工具中定义的对象。用来保存兼容的css属性。输出被其他引用。如何引用  一个是通过在同一个文件中（需要引入，才能获得变量）
  //第二个就是对象的 this。才有权利去访问其他的数据。
  this.indicatorStyle[style.transitionDuration] = time + 'ms'
}

Indicator.prototype.transitionTimingFunction = function (easing) {
  this.indicatorStyle[style.transitionTimingFunction] = easing
}

Indicator.prototype.remove = function () {
  this.wrapper.parentNode.removeChild(this.wrapper)
}

Indicator.prototype._calculate = function () {
  if (this.direction === 'vertical') {
    //在创建div的时候wrapper的top和bottom也就是高度被设置为100%了。里面的div并没有设置高度，这个函数就是设置它的高度的
    //如果方向是垂直方向。那么scrollbar的外层div的高度保存下来
    let wrapperHeight = this.wrapper.clientHeight
    //Math.round()取整，Math.random()取随机数。如何去算里面的那个滚动条的高度呢。外层div的高度其实就是我们看见的内容的高度，因为他是100%。
    //而scroollheight其实是内容的整个高度。所以这个比例乘以外层div的高度  就是内层div的高度了。如果scrooller高度没有  就默认是外层div的高。
    //这样内容越多 里层div的高越小。但是这里设了一个最小值。
    this.indicatorHeight = Math.max(Math.round(wrapperHeight * wrapperHeight / (this.scroller.scrollerHeight || wrapperHeight || 1)), INDICATOR_MIN_LEN)
    //height设置的时候要加px 所以
    this.indicatorStyle.height = `${this.indicatorHeight}px`
    //maxPosY是说这个滚动条的位置最大的时候  就是一直拉到下面最底部的时候。也就是外层div的高度减去里层div的高度。
    //maxScrollY指的是内容可以向上卷多少的高度。为负值。比如假设内容的高度是300px，包裹内容的容器高度是200px，那么这个maxscrollY就是-100px。
    this.maxPosY = wrapperHeight - this.indicatorHeight
    this.sizeRatioY = this.maxPosY / this.scroller.maxScrollY
  } else {
    let wrapperWidth = this.wrapper.clientWidth
    this.indicatorWidth = Math.max(Math.round(wrapperWidth * wrapperWidth / (this.scroller.scrollerWidth || wrapperWidth || 1)), INDICATOR_MIN_LEN)
    this.indicatorStyle.width = `${this.indicatorWidth}px`

    this.maxPosX = wrapperWidth - this.indicatorWidth

    
    this.sizeRatioX = this.maxPosX / this.scroller.maxScrollX
  }
}

