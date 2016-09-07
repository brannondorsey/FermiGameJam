// Handles rendering of galaxy and all things Three.js
class Galaxy {
			
	constructor(civLogManager) {

		if (!Detector.webgl) Detector.addGetWebGLMessage()

		this.hyg = new Map()
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
		this.scale = 100

		this.graphMesh = null
		this.civLog = civLogManager
	}

	load() {
		return new Promise((resolve, reject) => {
			this._loadHYG()
			    .then(db => {
			    
			        console.log(`Loaded ${db.length} stars`)			       
			        db = db.filter(star => (star.dist < 100000 && star.proper !== 'Sol'))
			       	db.forEach(s => this.hyg.set(s.id, s))

			        resolve()
			        this._init(db)
			        this._animate()
			    
			    }).catch(err => reject(err))
		})
	}

	_init(db) {
		let moveSpeed = 1000 * 10
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

	    this.raycaster = new THREE.Raycaster()
	    this.mouse = new THREE.Vector2()

	    this.scene = new THREE.Scene()
	    // this.scene.fog = new THREE.Fog( 0x050505, 2000, far )

	    let particles = db.length
	    this.geometry = new THREE.BufferGeometry()

	    let positions = new Float32Array(particles * 3)
	    let colors = new Float32Array(particles * 3)

	    for (let i = 0; i < positions.length; i += 3) {

	        positions[i]     = db[i / 3].x * this.scale;
	        positions[i + 1] = db[i / 3].y * this.scale;
	        positions[i + 2] = db[i / 3].z * this.scale;

	        colors[i]     = 255;
	        colors[i + 1] = 255;
	        colors[i + 2] = 255;
	    }

	    this.geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
	    this.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3 ))

	    this.geometry.computeBoundingSphere();

	    let material = new THREE.PointsMaterial( { 
	    	size: pointSize, 
	    	vertexColors: THREE.VertexColors,
	    	transparent: true} );

	    this.stars = new THREE.Points(this.geometry, material);
	    this.scene.add(this.stars);

	    this.renderer = new THREE.WebGLRenderer({ antialias: false });
	    // this.renderer.setClearColor(this.scene.fog.color);
	    this.renderer.setPixelRatio(window.devicePixelRatio);
	    this.renderer.setSize( window.innerWidth, window.innerHeight );

	    this.container.appendChild( this.renderer.domElement );

	    this.stats = new Stats();
	    // this.container.appendChild( this.stats.dom );

	    let windowResize = new THREEx.WindowResize(this.renderer, this.camera)
	    document.addEventListener( 'mousemove', (e) => {
	    	this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		    this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
	    }, false );
	}

	_drawLines() {

		let numCons = 3
		let cons = civLog.nDegreeConnections(null, civLog.self.starId, numCons)
		let opacity = 1.0
		let decrement = opacity / numCons
		let numLines = cons.reduce((sum, con) => sum + con.length, 0)
		let positions = new Float32Array(numLines * 3 * 2)
		let counter = 0

		// positions
		cons.forEach(degree => {
			degree.forEach(pair => {
				
				let s1 = this.hyg.get(pair[0])
				let s2 = this.hyg.get(pair[1])

				positions[counter]     = s1.x * this.scale
				positions[counter + 1] = s1.y * this.scale
				positions[counter + 2] = s1.z * this.scale

				positions[counter + 3] = s2.x * this.scale
				positions[counter + 4] = s2.y * this.scale
				positions[counter + 5] = s2.z * this.scale
				counter += 6
			})
		})

		counter = 0

		let colors = new Float32Array(numLines * 4 * 2)

		cons.forEach(con => {
			con.forEach(pair => {
				
				colors[counter]     = 1
				colors[counter + 1] = 1
				colors[counter + 2] = 1
				colors[counter + 3] = opacity
				colors[counter + 4] = 1
				colors[counter + 5] = 1
				colors[counter + 6] = 1
				colors[counter + 7] = opacity

				counter += 8
			})
			opacity -= decrement
		})

		let geometry = new THREE.BufferGeometry()
		// let material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
	    let material = new THREE.RawShaderMaterial( {
			uniforms: {
				// time: { value: 1.0 }
			},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
			transparent: true
		} );

		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
		geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4))

		geometry.computeBoundingSphere();

		if (this.graphMesh) this.scene.remove(this.graphMesh)
		this.graphMesh = new THREE.Line(geometry, material)
		this.scene.add(this.graphMesh)

		function getRandomInt(min, max) {
		  	min = Math.ceil(min)
		  	max = Math.floor(max)
		  	return Math.floor(Math.random() * (max - min)) + min
		}
	}

	_animate() {
		
    	requestAnimationFrame(() => {
    		return this._animate()
    	})

    	this._render()
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

