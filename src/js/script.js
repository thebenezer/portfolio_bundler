import '../css/style.css'
// import './vendor.js';

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as dat from 'lil-gui';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'
import CharacterController from './characterController.js';


const hitSound = new Audio(require('../assets/hit.mp3'));





/*
* Debug GUI
*/
const debugObject = {
    deepcolor: 0x142e39,
    surfacecolor: 0x98caf0,
    scenecolor: 0x22243A,
    ambientlight: 0x96cbfd
}

/*
* Canvas
*/

logo.addEventListener("touchstart", handleStart, false);
logo.addEventListener("touchend", handleEnd, false);
function handleStart(e){
    e.preventDefault();
    // keysPressed.ArrowUp=true
}
function handleEnd(e){
    e.preventDefault();
    // keysPressed.ArrowUp=false
}
const clock=new THREE.Clock();
function hasWebGL() {
    const gl =canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
        init();
        requestAnimationFrame(render);
    } else {
        console.log("Your browser does not support webGL");
    }
}
hasWebGL();

function init() {

    info = document.querySelector('#info' );
    stats = new Stats();
    info.appendChild( stats.dom );

    // ***** RENDERER ****** //
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.shadowMap.enabled=true

    // ***** CAMERA ****** //
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 400;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);

    // ***** SCENE & FOG ****** //
    scene = new THREE.Scene();
    scene.background = new THREE.Color( debugObject.scenecolor );
    scene.fog = new THREE.FogExp2( 0x22243A,0.005);

    // ***** LIGHTS ****** //
    scene.add( new THREE.AmbientLight( debugObject.ambientlight, 0.2 ) );
    const light=new THREE.DirectionalLight(0xffffff,0.8);
    light.position.set(-50,50,50)
    light.castShadow=true
    const helper=new THREE.DirectionalLightHelper(light,5)
    scene.add(light)

    // ***** LOADERS ****** //
    const textureLoader = new THREE.TextureLoader()
    const loader = new GLTFLoader();


    const geometry = new THREE.PlaneBufferGeometry( 1024, 1024 );
    plane = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial({color: 0x22243a}) );
    plane.rotation.x= -Math.PI *0.5;
    // plane.receiveShadow = true;
    scene.add( plane );

    // ***** PHYSICS WORLD ****** //
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -20, 0), // m/s²
        broadphase: new CANNON.SAPBroadphase(world),
        allowSleep: true
    })
    // Default material
    const defaultMaterial = new CANNON.Material('default')
    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
            friction: 0,
            restitution: 0,
            contactEquationRelaxation : 4

        }
    )
    world.defaultContactMaterial = defaultContactMaterial
    // const floor = new THREE.Mesh(
    //     new THREE.PlaneBufferGeometry(10, 10),
    //     new THREE.MeshStandardMaterial({
    //         color: '#777777',
    //         metalness: 0.3,
    //         roughness: 0.4,
    //     })
    // )
    // floor.receiveShadow = true
    // floor.rotation.x = - Math.PI * 0.5
    // scene.add(floor)

    // const floorShape = new CANNON.Plane()
    // const floorBody = new CANNON.Body()
    // floorBody.mass = 0
    // floorBody.addShape(floorShape)
    // floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
    // floorBody.position.y=2
    // world.addBody(floorBody)
    // floor.position.copy(floorBody.position)



    // ***** TEXTURES ****** //
    const bakedTexture = textureLoader.load(require('../assets/VRWorld/Baked.jpg'))
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding;

    const characterTexture = textureLoader.load(require('../assets/Character/Baked.png'))
    characterTexture.flipY = false
    characterTexture.encoding = THREE.sRGBEncoding;


    // Baked material
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

    const characterMaterial = new THREE.MeshBasicMaterial({ map: characterTexture })


    // ***** MODELS ****** //
    //World Model
// const mod=
// console.log(mod)
    loader.load( require('../assets/VRWorld/portfolio1.glb').default, function ( gltf ) {

        gltf.scene.traverse((child)=>
        {
            child.material = bakedMaterial;
            // console.log(child)
            // child.scale.set(2,2,2)
            if (child.type==='Mesh'){
                const box=new THREE.Box3().setFromObject(child)
                let size=new THREE.Vector3()
                let center=new THREE.Vector3()
                box.getSize(size)
                box.getCenter(center)
                const helper = new THREE.Box3Helper( box, 0x00ffff );
                scene.add( helper );

                const boxShape = new CANNON.Box(size.divideScalar(2))

                const boxBody = new CANNON.Body({
                mass: 0,
                position: center,
                shape: boxShape,
                })
                world.addBody(boxBody)
                // console.log(size)
            }
            
        })
        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    //Character Model
    loader.load( require('../assets/Character/character3.glb').default, function ( gltf ) {
        character = gltf.scene;
        // character.position.set(0,14,0)
        character.scale.set(0.2,0.2,0.2)
        scene.add( character );
        setupOrbitControls();
        characterControllerInstance=new CharacterController(character,gltf.animations,camera,controls,world)
    }, undefined, function ( e ) {
        console.error( e );
    });


    
    window.addEventListener( 'resize', onWindowResize,false );

}

function collisionJumpCheck(collision){
    characterControllerInstance.canJump=true
    // const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    // if(impactStrength > 1.5)
    // {
    //     hitSound.volume = Math.random()
    //     hitSound.currentTime = 0
    //     hitSound.play()
    // }
    // console.log(characterControllerInstance.canJump,characterControllerInstance.wantsJump)
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function render() {
    // renderer.shadowMap.needsUpdate=true
    const dt = clock.getDelta();
    // Update physics
    if(characterControllerInstance){
        characterControllerInstance.body.addEventListener('collide', collisionJumpCheck)
        characterControllerInstance.world.step(1/120,dt);
        characterControllerInstance.update(keysPressed,shiftToggle,dt)
        // characterBoxMesh.position.copy(characterControllerInstance.body.position)
        // characterBoxMesh.quaternion.copy(characterControllerInstance.body.quaternion)
    }
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
    
    renderer.render( scene, camera );
    stats.update();
    requestAnimationFrame( render );
}





document.addEventListener('keydown', (e) => {
    shiftToggle=e.shiftKey;
    if(e.key == ' ' && characterControllerInstance.canJump){
        // characterControllerInstance.canJump=false
        characterControllerInstance.wantsJump=true
    }
    if (e.key in keysPressed){
        keysPressed[e.key]=true;
    }
}, false);
document.addEventListener('keyup', (e) => {
    shiftToggle=e.shiftKey;
    if (e.key in keysPressed){
        keysPressed[e.key]=false;
    }
    if(e.key == ' '){
        characterControllerInstance.wantsJump=false
        // characterControllerInstance.canJump=true
    }
}, false);



function setupOrbitControls() {
    // Setup orbital controls
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.listenToKeyEvents( window ); // optional
    controls.enableKeys = false;
    // controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    // controls.screenSpacePanning = true;
    controls.minDistance = 2.4;
    // controls.maxDistance = 20;
    // controls.maxPolarAngle = Math.PI/2;
    controls.update();

}

function guiPanel() {
    const gui=new dat.GUI();
    gui.addColor(debugObject,'scenecolor')
    .onChange(()=>{
        scene.background.set(debugObject.scenecolor);
    });
    gui.addColor(debugObject,'ambientlight')
    .onChange(()=>{
        scene.children[0].color.set(debugObject.ambientlight);
    });
    
}
