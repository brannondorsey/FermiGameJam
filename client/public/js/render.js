let galaxy = new Galaxy(civLog)
// galaxy.load()
//     .then(() => console.log('loaded the galaxy'))
//     .catch(err => { throw err })

// let hyg = null

// loadHYG()
//     .then(db => {
       
//         hyg = db
//         console.log(`Loaded ${hyg.length} stars`)
       
//         hyg = hyg.filter(star => (star.dist < 100000 && star.proper !== 'Sol'))
//         hyg.sort((a, b) => (a.dist < b.dist) ? -1 : 1 )
       
//         // console.log(hyg.map(star => star.dist))
        
//         init();
//         animate();
    
//     }).catch(err => { throw err })

// function loadHYG() {
//     return new Promise((resolve, reject) => {
//         Papa.parse('data/hygdata_v3.csv', {
//             download: true,
//             header: true,
//             dynamicTyping: true,
//             complete: (results) => resolve(results.data),
//             error: (err) => reject(err)
//          })
//     })
// }

// //-----------------------------------------------------------


// if (!Detector.webgl ) Detector.addGetWebGLMessage()

// let container, stats, geometry, stars, mouse
// let camera, controls, scene, renderer, raycaster, clock

// function init() {

//     let moveSpeed = 1000
//     let scale = 100
//     let pointSize = 1
//     let far = 1000000
//     container = document.getElementById( 'threejs-container' )
//     camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.01, far )
//     camera.position.z = 1000

//     clock = new THREE.Clock()
//     controls = new THREE.FlyControls( camera )
//     controls.movementSpeed = moveSpeed
//     controls.domElement = container
//     controls.rollSpeed = Math.PI / 24
//     controls.autoForward = false
//     controls.dragToLook = true

//     raycaster = new THREE.Raycaster();
//     mouse = new THREE.Vector2();

//     scene = new THREE.Scene();
//     // scene.fog = new THREE.Fog( 0x050505, 2000, far )

//     let particles = hyg.length;
//     geometry = new THREE.BufferGeometry()

//     let positions = new Float32Array(particles * 3)
//     let colors = new Float32Array(particles * 3)

//     for (let i = 0; i < positions.length; i += 3) {

//         positions[i]     = hyg[i / 3].x * scale;
//         positions[i + 1] = hyg[i / 3].y * scale;
//         positions[i + 2] = hyg[i / 3].z * scale;

//         colors[i]     = 255;
//         colors[i + 1] = 255;
//         colors[i + 2] = 255;

//     }

//     geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
//     geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3 ));

//     geometry.computeBoundingSphere();

//     let material = new THREE.PointsMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );

//     stars = new THREE.Points(geometry, material);
//     scene.add(stars);

//     renderer = new THREE.WebGLRenderer({ antialias: false });
//     // renderer.setClearColor(scene.fog.color);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize( window.innerWidth, window.innerHeight );

//     container.appendChild( renderer.domElement );

//     //

//     stats = new Stats();
//     container.appendChild( stats.dom );

//     let windowResize = new THREEx.WindowResize(renderer, camera)
//     document.addEventListener( 'mousemove', onDocumentMouseMove, false );

// }

// function onDocumentMouseMove(e) {
//     mouse.x = (e.clientX / window.innerWidth) * 2 - 1
//     mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
// }

// function animate() {

//     requestAnimationFrame( animate );

//     render();
//     stats.update();

// }

// let INTERSECTED
// let PARTICLE_SIZE = 20

// function render() {

//     // raycasting
//     raycaster.setFromCamera(mouse, camera)
//     let intersects = raycaster.intersectObject(stars)
//     let attributes = geometry.attributes
//     if (intersects.length > 0) {

//         if (INTERSECTED != intersects[0].index) {
//             attributes.color.array[INTERSECTED] = PARTICLE_SIZE;
//             INTERSECTED = intersects[ 0 ].index;
//             attributes.color.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
//             attributes.color.needsUpdate = true;
//         }

//     } else if ( INTERSECTED !== null ) {
//         attributes.color.array[ INTERSECTED ] = PARTICLE_SIZE;
//         attributes.color.needsUpdate = true;
//         INTERSECTED = null;
//     }

//     controls.update(clock.getDelta());

//     renderer.render( scene, camera );

// }