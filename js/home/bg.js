/* global innerWidth, innerHeight, THREE, LowPolyPlane */
class indexBG {
  constructor (opts) {
    this.ele = document.querySelector(opts.ele)

    this.ele.innerHTML = `<div>
      <div id="grad-bg"></div>
    </div>`

    this.mxw = 900 // Max Width (media query)
    this.tra = 'width 0.75s ease-in, margin-left 0.75s ease-in'
    this.setupCSS()
    this.setupGradBg()
    this.setupLowPolyBg()
  }

  setupCSS () {
    const css = `
    #grad-bg {
      position: fixed; z-index:-1;
      left: 25vw; top: 12vh;
      width: 50vw; height: 75vh;
      background: #00c7e4;
      background: linear-gradient(-45deg, #00c7e4, #ffbbff);
    }

    @media (max-width: ${this.mxw}px) {
      #grad-bg {
        left: 0vw; top: 0vh;
        width: 100vw; height: 100vh;
      }
      #bg-canvas {
        border: 5vw solid #fff;
      }
    }
    `
    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = css
    document.getElementsByTagName('head')[0].appendChild(style)
  }

  setupGradBg () {
    let d = 0
    this.gbg = document.querySelector('#grad-bg')
    this.gbg.style.transition = this.tra
    this.gbg.style.zIndex = '-2'
    setInterval(() => {
      d++
      this.gbg.style.background = `linear-gradient(${d}deg, #00c7e4, #ffbbff)`
    }, 1000 / 30)
  }

  setupLowPolyBg () {
    const width = (innerWidth < this.mxw) ? innerWidth : innerWidth * 0.5
    const height = (innerWidth < this.mxw) ? innerHeight : innerHeight * 0.75
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 5

    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.domElement.style.position = 'fixed'
    this.renderer.domElement.style.top = (innerWidth < this.mxw) ? 0 : '12vh'
    this.renderer.domElement.style.left = (innerWidth < this.mxw) ? 0 : '25vw'
    this.renderer.domElement.style.zIndex = -1
    this.renderer.domElement.style.transition = this.tra
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.domElement.setAttribute('id', 'bg-canvas')
    document.body.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => this.resize())

    const plane = new LowPolyPlane({ scene, camera })
    const light = new THREE.PointLight('#fff', 1, 100)
    light.position.set(0, 0, 10)
    scene.add(light)

    const animate = () => {
      window.requestAnimationFrame(animate)

      light.position.x = 10 * Math.sin(Date.now() * 0.0006)
      light.position.y = 10 * Math.sin(Date.now() * 0.001)

      plane.update()

      this.renderer.render(scene, camera)
    }
    animate()
  }

  // ~ * ~ . _ . ~ * ~ . _ . ~ * ~ . _ . ~ * ~ . _ . ~ * ~ . _ . ~ * ~ . _ . ~

  resize () {
    const width = (innerWidth < this.mxw) ? innerWidth : innerWidth * 0.5
    const height = (innerWidth < this.mxw) ? innerHeight : innerHeight * 0.75
    this.renderer.domElement.style.top = (innerWidth < this.mxw) ? 0 : '12vh'
    this.renderer.domElement.style.left = (innerWidth < this.mxw) ? 0 : '25vw'
    this.renderer.setSize(width, height)
  }

  transitionOut () {
    this.gbg.style.width = 0
    this.renderer.domElement.style.width = 0
    this.gbg.style.marginLeft = '25vw'
    this.renderer.domElement.style.marginLeft = '25vw'
  }
}

if (typeof module !== 'undefined') module.exports = indexBG
