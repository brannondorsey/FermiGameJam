// Handles rendering of galaxy and all things Three.js
class Galaxy {
			
	constructor() {

		if (!Detector.webgl) Detector.addGetWebGLMessage()

		this.hyg = null
		this.container = null
		this.stats = null
		this.geometry = null
		this.stars = null
		this.mouse = null
		this.camera = null 
		this.controls = null
		this.scene = null
		this.renderer = null
		this.raycaster = null
		this.clock = null
	}

	load() {
		return new Promise((resolve, reject) => {
			this._loadHYG()
			    .then(db => {
			       
			        this.hyg = db
			        console.log(`Loaded ${this.hyg.length} stars`)
			       
			        this.hyg = this.hyg.filter(star => (star.dist < 100000 && star.proper !== 'Sol'))
			        this.hyg.sort((a, b) => (a.dist < b.dist) ? -1 : 1 )
			       
			        resolve()
			        
			        this._init()
			        this._animate()
			    
			    }).catch(err => reject(err))
		})
	}

	_init() {
		let moveSpeed = 1000
	    let scale = 100
	    let pointSize = 1
	    let far = 1000000
	    this.container = document.getElementById( 'threejs-container' )
	    this.camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.01, far )
	    this.camera.position.z = 1000

	    this.clock = new THREE.Clock()
	    this.controls = new THREE.FlyControls( this.camera )
	    this.controls.movementSpeed = moveSpeed
	    this.controls.domElement = this.container
	    this.controls.rollSpeed = Math.PI / 24
	    this.controls.autoForward = false
	    this.controls.dragToLook = true

	    this.raycaster = new THREE.Raycaster();
	    this.mouse = new THREE.Vector2();

	    this.scene = new THREE.Scene();
	    // this.scene.fog = new THREE.Fog( 0x050505, 2000, far )

	    let particles = this.hyg.length;
	    this.geometry = new THREE.BufferGeometry()

	    let positions = new Float32Array(particles * 3)
	    let colors = new Float32Array(particles * 3)

	    for (let i = 0; i < positions.length; i += 3) {

	        positions[i]     = this.hyg[i / 3].x * scale;
	        positions[i + 1] = this.hyg[i / 3].y * scale;
	        positions[i + 2] = this.hyg[i / 3].z * scale;

	        colors[i]     = 255;
	        colors[i + 1] = 255;
	        colors[i + 2] = 255;

	    }

	    this.geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	    this.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3 ));

	    this.geometry.computeBoundingSphere();

	    let material = new THREE.PointsMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );

	    this.stars = new THREE.Points(this.geometry, material);
	    this.scene.add(this.stars);

	    this.renderer = new THREE.WebGLRenderer({ antialias: false });
	    // this.renderer.setClearColor(this.scene.fog.color);
	    this.renderer.setPixelRatio(window.devicePixelRatio);
	    this.renderer.setSize( window.innerWidth, window.innerHeight );

	    this.container.appendChild( this.renderer.domElement );

	    this.stats = new Stats();
	    this.container.appendChild( this.stats.dom );

	    let windowResize = new THREEx.WindowResize(this.renderer, this.camera)
	    document.addEventListener( 'mousemove', (e) => {
	    	this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		    this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
	    }, false );
	}

	_animate() {

    	requestAnimationFrame(animate)

    	render()
    	this.stats.update()
	}

	_render() {

		let INTERSECTED
		let PARTICLE_SIZE = 20

	    // raycasting
	    this.raycaster.setFromCamera(this.mouse, this.camera)
	    let intersects = this.raycaster.intersectObject(this.stars)
	    let attributes = this.geometry.attributes
	    if (intersects.length > 0) {

	        if (INTERSECTED != intersects[0].index) {
	            attributes.color.array[INTERSECTED] = PARTICLE_SIZE;
	            INTERSECTED = intersects[ 0 ].index;
	            attributes.color.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
	            attributes.color.needsUpdate = true;
	        }

	    } else if ( INTERSECTED !== null ) {
	        attributes.color.array[ INTERSECTED ] = PARTICLE_SIZE;
	        attributes.color.needsUpdate = true;
	        INTERSECTED = null;
	    }

	    this.controls.update(this.clock.getDelta());
	    this.renderer.render( this.scene, this.camera );
	}

	_loadHYG() {
	    return new Promise((resolve, reject) => {
	        Papa.parse('data/hygdata_v3.csv', {
	            download: true,
	            header: true,
	            dynamicTyping: true,
	            complete: (results) => resolve(results.data),
	            error: (err) => reject(err)
	         })
    	})
	}
}

