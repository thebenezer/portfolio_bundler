import '../css/style.css'
// import './vendor.js';

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as dat from 'lil-gui';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'
import CharacterController from './characterController';


const hitSound = new Audio(require('../assets/hit.mp3'));


const gui=new dat.GUI();
/*
* Debug GUI
*/
const debugObject = {
    deepcolor: 0x142e39,
    surfacecolor: 0x98caf0,
    scenecolor: 0x111522,
    ambientlight: 0x96cbfd
}

/*
* Canvas
*/
const canvas = document.querySelector('#canvas' );
let stats,info,plane;
let camera, scene, renderer,controls;
let world,raycaster,yAxis=new THREE.Vector3(0,1,0),INTERSECTED,interractObjects=[];

let character;
let characterControllerInstance;

let mouse = new THREE.Vector2();
let clickxy = new THREE.Vector2();

const clock=new THREE.Clock();

hasWebGL();
function hasWebGL() {
    const gl =canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
        init();
        requestAnimationFrame(render);
    } else {
        console.log("Your browser does not support webGL");
    }
}

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
    // renderer.toneMapping = THREE.ACESFilmicToneMapping
    // renderer.toneMappingExposure=0.05
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


    // ***** LOADERS ****** //
    const textureLoader = new THREE.TextureLoader()
    const loader = new GLTFLoader();
     // ***** TEXTURES ****** //
     const backgroundTexture = textureLoader.load(require('../assets/skies/Night2.png'))
     backgroundTexture.mapping=THREE.EquirectangularReflectionMapping
     backgroundTexture.encoding = THREE.sRGBEncoding;
     const bakedTexture = textureLoader.load(require('../assets/VRWorld/baked3.jpg'))
     bakedTexture.flipY = false
     bakedTexture.encoding = THREE.sRGBEncoding;
 
     const characterTexture = textureLoader.load(require('../assets/Character/Baked.png'))
     characterTexture.flipY = false
     characterTexture.encoding = THREE.sRGBEncoding;


    // ***** SCENE & FOG ****** //
    scene = new THREE.Scene();
    scene.background = backgroundTexture;
    // scene.background = new THREE.Color( debugObject.scenecolor );
    scene.fog = new THREE.FogExp2( 0x111522,0.005);
    

    // ***** CAMERA ****** //
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 400;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);


    // ***** LIGHTS ****** //
    scene.add( new THREE.AmbientLight( debugObject.ambientlight, 0.1 ) );
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
    directionalLight.castShadow = true

    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048

    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 200

    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.bottom = - 50
    directionalLight.shadow.camera.left = - 50

    directionalLight.position.set(-50, 70, 70)
    gui.add(directionalLight, 'intensity').min(0).max(5).step(0.001)
    gui.add(directionalLight.position, 'x').min(- 500).max(500).step(1)
    gui.add(directionalLight.position, 'y').min(- 500).max(500).step(1)
    gui.add(directionalLight.position, 'z').min(- 500).max(500).step(1)
    scene.add(directionalLight)

    const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    directionalLightCameraHelper.visible = false
    scene.add(directionalLightCameraHelper)

    // ***** RAYCASTER ****** //
    raycaster = new THREE.Raycaster();
    raycaster.near=0
    raycaster.far=5
    let geo=new THREE.PlaneBufferGeometry(5, 5);
    const proj1 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    proj1.rotation.x = - Math.PI * 0.5
    proj1.position.set(6, 1,-25)
    proj1.name='proj1'
    const proj2 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    proj2.rotation.x = - Math.PI * 0.5
    proj2.position.set(12, 1,-41)
    proj2.name='proj2'
    const proj3 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    proj3.rotation.x = - Math.PI * 0.5
    proj3.position.set(-2, 1, -52)
    proj3.name='proj3'
    const proj4 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    proj4.rotation.x = - Math.PI * 0.5
    proj4.position.set(-17, 1, -41)
    proj4.name='proj4'
    const proj5 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    proj5.rotation.x = - Math.PI * 0.5
    proj5.position.set(-11, 1, -23)
    proj5.name='proj5'


    geo=new THREE.PlaneBufferGeometry(9, 9);
    const lightHouse = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    lightHouse.rotation.x = - Math.PI * 0.5
    lightHouse.position.set(22, 1, 77)
    lightHouse.name='lightHouse'

    const lab = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    lab.rotation.x = - Math.PI * 0.5
    lab.position.set(-24, 1, 47.7)
    lab.name='lab'

    const library = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    library.rotation.x = - Math.PI * 0.5
    library.position.set(-43, 3.5, 10.6)
    library.name='library'


    geo=new THREE.PlaneBufferGeometry(3, 3);
    const social1 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    social1.rotation.x = - Math.PI * 0.5
    social1.position.set(37.9, 1, 32)
    social1.name='social1'
    const social2 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    social2.rotation.x = - Math.PI * 0.5
    social2.position.set(43.5, 1, 32)
    social2.name='social2'
    const social3 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    social3.rotation.x = - Math.PI * 0.5
    social3.position.set(49.1, 1, 32)
    social3.name='social3'
    const social4 = new THREE.Mesh(geo,new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff }));
    social4.rotation.x = - Math.PI * 0.5
    social4.position.set(54.7, 1, 32)
    social4.name='social4'


    scene.add(proj1,proj2,proj3,proj4,proj5,lightHouse,lab,library,social1,social2,social3,social4)
    interractObjects.push(proj1,proj2,proj3,proj4,proj5,lightHouse,lab,library,social1,social2,social3,social4)

    // const ocean = new THREE.PlaneBufferGeometry( 1024, 1024 );
    // plane = new THREE.Mesh( ocean, new THREE.MeshStandardMaterial({color: 0x0077be}) );
    // plane.rotation.x= -Math.PI *0.5;
    // // plane.receiveShadow = true;
    // scene.add( plane );

        guiPanel()


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


    // Baked material
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

    const characterMaterial = new THREE.MeshBasicMaterial({ map: characterTexture })
    
    const landMaterial=new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 1,
    })

    // ***** MODELS ****** //
    //World Model
    loader.load( require('../assets/VRWorld/portfolio1.glb').default, function ( gltf ) {
        gltf.scene.traverse((child)=>
        {
            child.material = bakedMaterial;
            if (child.type==='Mesh'){

                const box=new THREE.Box3().setFromObject(child)
                let size=new THREE.Vector3()
                let center=new THREE.Vector3()
                box.getSize(size)
                box.getCenter(center)
                // const helper = new THREE.Box3Helper( box, 0x00ffff );
                // scene.add( helper );

                const boxShape = new CANNON.Box(size.divideScalar(2))
                const boxBody = new CANNON.Body({
                mass: 0,
                position: center,
                shape: boxShape,
                })
                world.addBody(boxBody)
                // child.material=landMaterial
                child.receiveShadow=true
                child.castShadow=true
            }
        })
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    //Character Model
    loader.load( require('../assets/Character/character3.glb').default, function ( gltf ) {
        character = gltf.scene;
        gltf.scene.traverse((child)=>
        {
            // child.material = characterMaterial;
            // child.material=landMaterial
                // child.castShadow=true
        })
        character.scale.set(0.2,0.2,0.2)
        scene.add( character );
        setupOrbitControls();
        characterControllerInstance=new CharacterController(character,gltf.animations,camera,controls,world)
    }, undefined, function ( e ) {
        console.error( e );
    });

    
    
    window.addEventListener( 'resize', onWindowResize,false );
    canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
    canvas.addEventListener( 'touchstart', onDocumentTouchEnd, false );

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
        characterControllerInstance.update(dt)

        raycaster.set(new THREE.Vector3(characterControllerInstance.character.position.x,characterControllerInstance.character.position.y+2,characterControllerInstance.character.position.z),new THREE.Vector3(0,-1,0))
        rayCheck();
    }
    
    renderer.render( scene, camera );
    stats.update();
    requestAnimationFrame( render );
}
function rayCheck(){
    const intersects = raycaster.intersectObjects( interractObjects, false );

        if ( intersects.length > 0 ) {
            // console.log(intersects)

            if ( INTERSECTED != intersects[ 0 ].object ) {
                if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

                INTERSECTED = intersects[ 0 ].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 ); 
                console.log(INTERSECTED.name)
                INTERSECTED.position.y+=1

            }

        } else {

            if ( INTERSECTED ){
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED.position.y-=1
            } 

            INTERSECTED = null;

        }

}


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
    // controls.maxDistance = 10;
    // controls.maxPolarAngle = Math.PI/2;
    controls.update();

}

function onDocumentMouseMove( event ) {

    event.preventDefault();
    clickxy.x=event.clientX;
    clickxy.y=event.clientY;
    mouse.x = ( ( clickxy.x - renderer.domElement.offsetLeft ) / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( ( clickxy.y - renderer.domElement.offsetTop ) / renderer.domElement.clientHeight ) * 2 + 1;

}
function onDocumentTouchEnd( event ) {

    event.preventDefault();
    var touches = event.changedTouches;
    clickxy.x=touches[0].pageX;
    clickxy.y=touches[0].pageY;
    mouse.x = ( (clickxy.x- renderer.domElement.offsetLeft) / renderer.domElement.clientWidth  ) * 2 - 1;
    mouse.y = - ( (clickxy.y- renderer.domElement.offsetTop) / renderer.domElement.clientHeight  ) * 2 + 1;
    // mouse.x = ( touches[0].pageX / window.innerWidth ) * 2 - 1;
}

function guiPanel() {
    gui.addColor(debugObject,'scenecolor')
    .onChange(()=>{
        scene.background.set(debugObject.scenecolor);
    });
    gui.addColor(debugObject,'ambientlight')
    .onChange(()=>{
        scene.children[0].color.set(debugObject.ambientlight);
    });
    gui.close()
}
