/* global THREE, Maths */
class LowPolyPlane {
  constructor (opts) {
    this.t = 0
    this.point = null
    this.group = new THREE.Group()
    opts.scene.add(this.group)
    this.camera = opts.camera

    const radius = 1 // RADIUS OF SPHERE = READIUS OF VERT INTERSECT
    this.maxOpac = 0.1 // MAX OPACITY OF PLANE

    const matconfig = {
      color: '#fff',
      transparent: true,
      opacity: 0,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true
    }

    const material = new THREE.MeshPhongMaterial(matconfig)
    const geometry = new THREE.PlaneGeometry(60, 60, 20, 20)
    geometry.mergeVertices()
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.z = -10

    // setup for intersecting spheres
    this.sphereGeo = new THREE.SphereBufferGeometry(radius, 4, 4)
    this.sphereMat = new THREE.MeshNormalMaterial({ visible: false })
    this.spheres = []
    // setup raycaster
    this.rc = new THREE.Raycaster()
    this.ms = new THREE.Vector2()
    window.addEventListener('mousemove', (e) => this._onMsMv(e), false)

    // setup verticies
    this.initVerts = []
    this.mesh.geometry.vertices.forEach((vert, i) => {
      vert.z = Math.random() * 5 // position vert randomly
      this.initVerts.push(vert.z) // record initial vert position
      // prep to clone world vert position
      this.mesh.updateMatrixWorld()
      const clone = vert.clone()
      clone.applyMatrix4(this.mesh.matrixWorld)
      // create intersecting sphere at cloned vert
      const sphere = new THREE.Mesh(this.sphereGeo, this.sphereMat)
      sphere.position.copy(clone)
      sphere.userData.index = i
      this.spheres.push(sphere)
      this.group.add(sphere)
    })
    this.mesh.geometry.verticesNeedUpdate = true
    this.group.add(this.mesh)
  }

  _onMsMv (e) {
    this.ms.x = (e.clientX / window.innerWidth) * 2 - 1
    this.ms.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  _mvVerts () {
    this.rc.setFromCamera(this.ms, this.camera) // raycaster
    const hits = this.rc.intersectObjects(this.spheres)
    if (hits.length > 0) {
      const i = hits[0].object.userData.index
      const vert = this.mesh.geometry.vertices[i]

      const clone = vert.clone()
      if (this.point) vert.copy(this.point)
      this.point = clone

      this.mesh.geometry.verticesNeedUpdate = true
    }
  }

  _oscVerts () {
    this.mesh.geometry.vertices.forEach(v => {
      if (this.tilted) {
        v.z += Math.sin(Date.now() * Maths.randomFloat(0, 0.00003)) * 0.05
      } else {
        v.x += Math.sin(Date.now() * Maths.randomFloat(0, 0.00003)) * 0.05
        v.y += Math.cos(Date.now() * Maths.randomFloat(0, 0.00003)) * 0.05
      }
    })
    this.mesh.geometry.verticesNeedUpdate = true
  }

  update () {
    this.group.rotation.z += 0.0002
    this._oscVerts()

    // fade in...
    if (this.mesh.material.opacity < this.maxOpac) {
      this.mesh.material.opacity += 0.0005
    }

    if (!this.tilted) {
      this._mvVerts()
    } else if (this.group.rotation.x > -1.9) {
      // transition into postTilt
      this.t -= 0.02
      this.group.rotation.x = Maths.easeInCubic(this.t)
    }
  }

  preTilt () {
    this.mesh.geometry.vertices.forEach(v => { v.z = Math.random() * 5 })
    this.mesh.geometry.verticesNeedUpdate = true
    this.tilted = false
    this.t = 0
    this.group.rotation.x = 0
    this.mesh.material.opacity = this.maxOpac
  }

  tilt () { this.tilted = true }

  postTilt () {
    this.tilted = true
    this.group.rotation.x = -1.9
    this.mesh.material.opacity = this.maxOpac
  }
}

if (typeof module !== 'undefined') module.exports = LowPolyPlane
