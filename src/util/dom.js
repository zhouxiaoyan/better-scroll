let elementStyle = document.createElement('div').style
//获取到一个新建元素的style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  //把兼容的几个transfrom属性值放在一个对象中。然后循环分别获取元素上的transform属性的值 。如果不等于undefined  就返回key。也就是说一个元素
  //dom.style方式获取的样式虽然只能是内联样式。但是只要是这个元素存在的样式属性。即使没有设置，都会是存在的。最终返回key值  然不是value值。

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
//除了判断是哪个浏览器前缀  还判断是不是支持transition
  return false
})()

function prefixStyle(style) {
  //判断是否有前缀。如果vendor是false的话  就返回false。如果是standard的话说明是标准的
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }
//如果不是标准的 说明需要加前缀。前缀就是传入的style第一个字母大写。获取字母第一个用charAt(0)。然后后面的字符用substr（1）。在加上前缀。
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
//也就是说上面的代码是用来判断浏览器内核的。方便Css3加前缀。

export function addEvent(el, type, fn, capture) {
  el.addEventListener(type, fn, {passive: false, capture: !!capture})
}
//包装了一下监听事件，换了接口

export function removeEvent(el, type, fn, capture) {
  el.removeEventListener(type, fn, {passive: false, capture: !!capture})
}

export function offset(el) {
  let left = 0
  let top = 0
//offsetleft和offsettop是相对于元素的offsetparent的距离。而元素的offsetparent是指这个元素的父级元素中position 设置为
  //relative或者position的那个离自己最近的父级元素。如果没有这样的元素。那么就是根节点。变量名不变，但是数据可变
  while (el) {
    left -= el.offsetLeft
    top -= el.offsetTop
    el = el.offsetParent
  }

  return {
    left,
    top
  }
}

let transform = prefixStyle('transform')
//一些判断浏览器性质的变量。是不是有touch，是不是支持transition等等。
export const hasPerspective = prefixStyle('perspective') in elementStyle
export const hasTouch = 'ontouchstart' in window
export const hasTransform = transform !== false
export const hasTransition = prefixStyle('transition') in elementStyle

export const style = {
  transform,
  transitionTimingFunction: prefixStyle('transitionTimingFunction'),
  transitionDuration: prefixStyle('transitionDuration'),
  transitionDelay: prefixStyle('transitionDelay'),
  transformOrigin: prefixStyle('transformOrigin'),
  transitionEnd: prefixStyle('transitionEnd')
}

export const TOUCH_EVENT = 1
export const MOUSE_EVENT = 2
//touch事件和mouse事件存储在eventType中。并且标记为1和2.
export const eventType = {
  touchstart: TOUCH_EVENT,
  touchmove: TOUCH_EVENT,
  touchend: TOUCH_EVENT,

  mousedown: MOUSE_EVENT,
  mousemove: MOUSE_EVENT,
  mouseup: MOUSE_EVENT
}
//SVGElement 是什么意思？ 所以表示的是Svg元素
//<svg id='svgelement' xmlns='http://www.w3.org/2000/svg' version='1.1'>
  //<rect id='foo' width='30' height='40' fill='black'/>
//</svg>
//<div id='dd'></div>
//<script>
  //var dd = document.getElementById('dd');
  //var foo = document.getElementById('foo');
  //console.log(foo instanceof window.SVGElement);这个返回的是true
//console.log(dd instanceof window.SVGElement);这个返回的是false 
//console.log(foo.getBoundingClientRect().top);//8
//console.log(foo.offsetTop);//undefined
//console.log(dd.getBoundingClientRect().top);//162
//console.log(dd.offsetTop);//162
//总结：综上所述 对于svg元素。获取它的top,left值。只能用 getboundingClientRect.对于其他元素都行。
//getboundingClientRect返回值是一个 DOMRect 对象，DOMRect 对象包含了一组用于描述边框的只读属性——
//left、top、right和bottom，单位为像素。除了 width 和 height 外的属性都是相对于视口的左上角位置而言的。

export function getRect(el) {
  if (el instanceof window.SVGElement) {
    var rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight
    }
  }
}

export function preventDefaultException(el, exceptions) {
  for (let i in exceptions) {
    if (exceptions[i].test(el[i])) {
      return true
    }
  }
  return false
}
//模拟事件首先通过document.createEvent()方法创建event对象，接收一个参数，即表示要创建的事件类型的字符串：

//UIEvents（DOM3中的UIEvent）鼠标和键盘事件；
//MouseEvents（DOM3中的MouseEvent）鼠标事件；
//MutationEvents（DOM3中的MutationEvent）变动事件；
//HTMLEvents（没有DOM3中对应的事件）HTML事件；
//其次在创建了event对象之后，还需要使用与事件有关的信息对其进行初始化。每种类型的event对象都有一个特殊的方法，为它传入适当的数据就可以初始化该event对象。用event.init......()此类行的方法。

//最后就是触发事件。这需要使用dispatchEvent()方法，接收一个参数，即表示要触发的event对象。
export function tap(e, eventName) {
  let ev = document.createEvent('Event')
  ev.initEvent(eventName, true, true)
  ev.pageX = e.pageX
  ev.pageY = e.pageY
  e.target.dispatchEvent(ev)
}

export function click(e) {
  var target = e.target

  if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
    let ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event')
    // cancelable 设置为 false 是为了解决和 fastclick 冲突问题
    ev.initEvent('click', true, false)
    ev._constructed = true
    target.dispatchEvent(ev)
  }
}

export function prepend(el, target) {
  //获取到第一个子元素，然后插入到这个子元素之前  就可以将一个元素插入另一个元素之前了
  if (target.firstChild) {
    before(el, target.firstChild)
  } else {
    target.appendChild(el)
  }
}

export function before(el, target) {
  target.parentNode.insertBefore(el, target)
}
