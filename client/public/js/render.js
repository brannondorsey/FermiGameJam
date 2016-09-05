let hyg = null

loadHYG()
    .then(db => {
       
        hyg = db
        console.log(`Loaded ${hyg.length} stars`)
       
        hyg = hyg.filter(star => (star.dist < 100000 && star.proper !== 'Sol'))
        hyg.sort((a, b) => (a.dist < b.dist) ? -1 : 1 )
       
        // console.log(hyg.map(star => star.dist))
        
        init();
        animate();
    
    }).catch(err => { throw err })

function loadHYG() {
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

//-----------------------------------------------------------


if (!Detector.webgl ) Detector.addGetWebGLMessage();

let container, stats;
let camera, controls, scene, renderer, clock;
let points;

function init() {

    let magnifier = 10
    container = document.getElementById( 'threejs-container' )
    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 )
    camera.position.z = 1000

    clock = new THREE.Clock()
    controls = new THREE.FlyControls( camera )
    controls.movementSpeed = 300
    controls.domElement = container
    controls.rollSpeed = Math.PI / 24
    controls.autoForward = false
    controls.dragToLook = true

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x050505, 2000, 3500 )

    let particles = hyg.length;
    let geometry = new THREE.BufferGeometry()

    let positions = new Float32Array(particles * 3)
    let colors = new Float32Array(particles * 3)

    for (let i = 0; i < positions.length; i += 3) {

        positions[i]     = hyg[i / 3].x * magnifier;
        positions[i + 1] = hyg[i / 3].y * magnifier;
        positions[i + 2] = hyg[i / 3].z * magnifier;

        colors[i]     = 255;
        colors[i + 1] = 255;
        colors[i + 2] = 255;

    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3 ));

    geometry.computeBoundingSphere();

    let material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors } );

    points = new THREE.Points(geometry, material);
    scene.add(points);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    //

    stats = new Stats();
    container.appendChild( stats.dom );

    let windowResize = new THREEx.WindowResize(renderer, camera)

}


function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {

    var time = Date.now() * 0.001;
    // controls.movementSpeed = 0.33 * d;
    controls.update(clock.getDelta());
    // points.rotation.x = time * 0.25;
    // points.rotation.y = time * 0.5;

    renderer.render( scene, camera );

}