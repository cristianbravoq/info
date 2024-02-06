/* global HTMLElement */
/*
    CharSwap
    -----------
    by Nick Briz <nickbriz@gmail.com>
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2019

    -----------
       info
    -----------

    a vanilla js class for swapping contents of one HTMLElement with another,
    that animates the swap by cycling through random (or predefined) set of
    characters (individually for each character in the element) until it lands
    on it's new character (as dictated by the contents of the replacement)

    required options:
    from: instance of HTMLElement or querySelector of element to transition from
      (essentially the initial elements/value before transition)
    to: instance of HTMLElement or querySelector of element to transition the
      "from" element one to, this is essentially the "target" or "goal" set of
      elements

    optional options:
    set: the set of chars to use while swapping chars, either 'alphabet',
      'numerals', 'zalgo', 'blocks' or 'emoji'
    zalgo: if the set is 'zalgo', use this option to specify how many zalgo chars
      to include in a swap (the higher the more zalgo)
    colors: array of colors for use on chars during swapping, could also be set
      to 'random'
    color: the color that the final chars will have
    intervals: how many times to swap a char before landing on it's final target
      this could also be set to 'random'
    delay: delays when each char's swapping starts, picks a random value between
      0 and the number passed in as the delay value (if 0 they all start
      swapping at the same time)
    hold: how long to wait between swap intervals (the higher the slower)
    callback: optional callback that fires after all the swapping is finished,
      could also be passed into the .swap() method later

    -----------
       usage
    -----------

    let cs = new CharSwap({
      from: '#element',
      to: '#element',
      colors: ['#00c7e4','#0080c1','#ffbbff','#ff73ff','#fff','#000'],
      set: 'zalgo',
      zalgo: 3,
      intervals: 'random',
      delay: 1000,
      hold: 150
    }).swap((oldHTML, newHTML) => {
      // finished!
    })

    // swap method could also be called later
    cs.swap()

*/
class CharSwap {
  constructor (opts) {
    if (typeof opts === 'undefined') {
      this.err('constructor is missing the options object')
    } else if (typeof opts !== 'object') {
      this.err('constructor expecting options passed in as typeof object')
    } else if (typeof opts.from !== 'string' && !(opts.from instanceof HTMLElement)) {
      this.err('from: expecting a query selector string or instance of HTMLElement')
    } else if (typeof opts.to !== 'string' && !(opts.to instanceof HTMLElement)) {
      this.err('to: expecting a query selector string or instance of HTMLElement')
    }

    this.ele1 = (opts.from instanceof HTMLElement)
      ? opts.from : document.querySelector(opts.from)
    this.ele2 = (opts.to instanceof HTMLElement)
      ? opts.to : document.querySelector(opts.to)

    this.set = opts.set || 'alphabet'
    this.zmt = opts.zalgo || 3
    this.colors = opts.colors || ['#000']
    this.color = opts.color || '#000'
    this.delay = (typeof opts.delay !== 'undefined') ? opts.delay : 1000
    this.hold = (typeof opts.hold !== 'undefined') ? opts.hold : 150
    this.ivls = (typeof opts.intervals !== 'undefined') ? opts.intervals : 10
    this.callback = opts.callback

    this.dicts = {
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
      numerals: '0123456789',
      zalgo: '̶̢̛̬̝̯̘̯̻̤͕͔͍͚̗̼̜̤͎̼͍̻̝̣̬̤̟͈͎̲̿̓͋̔̔̽̑̍̏͒͊̈̏̕͝͝l̷̛͖̉̃̏̾́̔́̾̀͋̇́͂̔̓̓̒̋̓̍̓͘̚̚͝͝',
      blocks: '█▓▒░',
      emoji: [
        '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉', '😊', '😋',
        '😌', '😍', '😎', '😏', '😐', '😑', '😒', '😓', '😔', '😕', '😖', '😗',
        '😘', '😙', '😚', '😛', '😜', '😝', '😞', '😟', '😠', '😡', '😢', '😣',
        '😤', '😥', '😦', '😧', '😨', '😩', '😪', '😫', '😬', '😭', '😮', '😯',
        '😰', '😱', '😲', '😳', '😴', '😵', '😶', '😷'
      ]
    }
  }

  err (msg) { throw new Error(`CharSwap: ${msg}`) }

  _mkSpan (char) {
    let s = document.createElement('span')
    s.className = 'ch4rsw4p'
    s.setAttribute('data-int', this.ivls)
    s.textContent = char
    return s
  }

  _ranChar () {
    let chars = this.dicts[this.set]
    if (this.set === 'zalgo') {
      let str = ''
      for (let i = 0; i < this.zmt; i++) {
        let ran = Math.floor(Math.random() * chars.length)
        str += chars.substring(ran, ran + 1)
      }
      return str
    } else {
      return chars[Math.floor(Math.random() * chars.length)]
    }
  }

  _ranClr () {
    if (this.colors === 'random') {
      return '#' + Math.floor(Math.random() * 16777215).toString(16)
    } else {
      return this.colors[ Math.floor(Math.random() * this.colors.length) ]
    }
  }

  _done () {
    this.ele1.innerHTML = this.newHTML
    this.ele1.style.wordBreak = ''
    if (this.callback) this.callback(this.oldHTML, this.newHTML)
  }

  _rollSpan (span, index) {
    span.innerHTML = this._ranChar()
    span.style.color = this._ranClr()
    setTimeout(() => this._roll(span, index), this.hold)
  }

  _doneSpan (span, index) {
    this.s2go--
    let nt = this.newText[index]
    span.innerHTML = nt || ''
    span.style.color = this.color
    if (this.s2go === 0) this._done()
  }

  _roll (span, index) {
    let i = parseInt(span.getAttribute('data-int'))
    if (this.ivls === 'random') {
      // if intervals was set to 'random'
      if (Math.random() > 0.5) this._rollSpan(span, index)
      else this._doneSpan(span, index)
    } else if (i > 0) {
      // otherwise decrement interval
      span.setAttribute('data-int', --i)
      this._rollSpan(span, index)
    } else {
      // otherwise finish up span by setting to it's "to" value
      this._doneSpan(span, index)
    }
  }

  swap (callback) {
    if (typeof callback === 'function') this.callback = callback

    this.oldHTML = this.ele1.innerHTML
    this.newHTML = this.ele2.innerHTML
    this.newText = this.ele2.textContent

    this.nChrs = this.newText.split('')
    this.spans = []
    // this.ele1.innerHTML.split('')
    this.ele1.textContent.split('')
      .forEach(char => this.spans.push(this._mkSpan(char)))

    if (this.spans.length < this.nChrs.length) { // if xtra spans are needed
      let missing = this.nChrs.length - this.spans.length
      for (let i = 0; i < missing; i++) {
        this.spans.push(this._mkSpan(''))
      }
    }

    this.s2go = this.spans.length
    this.ele1.innerHTML = ''
    this.spans.forEach(s => this.ele1.appendChild(s))
    //
    this.ele1.style.wordBreak = 'break-all'
    this.spans.forEach((s, i) => {
      setTimeout(() => this._roll(s, i), Math.random() * this.delay)
    })
  }
}

if (typeof module !== 'undefined') module.exports = CharSwap
