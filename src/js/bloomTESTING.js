import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';


import { BlendFunction,KernelSize,BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect, Selection} from "postprocessing";

const canvas = document.querySelector('#canvas' );
let stats,info;
let camera, scene, renderer,controls,composer;
let selectiveBloomEffect,selectiveBloomPass;
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
    scene = new THREE.Scene();


    // ***** RENDERER ****** //
    renderer = new THREE.WebGLRenderer({
        canvas,
        powerPreference: "high-performance",
        // antialias: false,
        // stencil: false,
        // depth: false
        });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    // renderer.toneMappingExposure=0.05
    renderer.setPixelRatio( Math.min(window.devicePixelRatio,2) );
    renderer.setSize( window.innerWidth, window.innerHeight );

    // ***** CAMERA ****** //
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 300;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);
    camera.position.set(0,3,20)
    camera.lookAt(0,0,0)
    setupOrbitControls();
    // ***** Light & FOG ****** //
    const textureLoader = new THREE.TextureLoader()

    const backgroundTexture = textureLoader.load(require('../assets/skies/bg1.png'))
    backgroundTexture.mapping=THREE.EquirectangularReflectionMapping
    backgroundTexture.encoding = THREE.sRGBEncoding;
    scene.background=backgroundTexture
    // scene.background = new THREE.Color( 0xff1522);
    // scene.fog = new THREE.FogExp2( 0x111522,1);

    // ***** LIGHTS ****** //
    scene.add( new THREE.AmbientLight( 0xfffefe, 0.5 ) );
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);


    const box1= new THREE.Mesh(new THREE.BoxBufferGeometry(1,1,1) , new THREE.MeshPhongMaterial({color:0x00ff00}))
    box1.position.set(1,0,0)
    scene.add(box1)
    const box2= new THREE.Mesh(new THREE.BoxBufferGeometry(1,1,1) , new THREE.MeshBasicMaterial({color:0x00ff00}))
    box2.position.set(-1,0,0)
    // box2.layers.enable(11)
    scene.add(box2)
    window.addEventListener( 'resize', onWindowResize,false );

    const bloomOptions = {
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.MEDIUM,
        luminanceThreshold: 0,
        luminanceSmoothing: 1,
        intensity: 2,
        height: 480
    };


    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    selectiveBloomEffect = new SelectiveBloomEffect(scene,camera,bloomOptions);
    selectiveBloomEffect.selection.add(box2)
    selectiveBloomEffect.ignoreBackground=true
    
    const loader = new GLTFLoader();

    const bakedTexture = textureLoader.load(require('../assets/VRWorld/baked3.jpg'))
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding;

    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
    const doorLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const lampLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF })
    //World Model
    loader.load( require('../assets/VRWorld/portfolio_v1.2.glb').default, function ( gltf ) {
        gltf.scene.traverse((child)=>
        {
            child.material = bakedMaterial;
            if (child.name.includes('doorLight')) {
                child.material = doorLightMaterial
            }
            else if (child.name.includes('lampLight')) {
                child.material = lampLightMaterial
                selectiveBloomEffect.selection.add(child)
            }
            else if (child.name.includes('portalLight')) {
                child.material = doorLightMaterial
                child.material.side=THREE.DoubleSide
            }
        })
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
    

    selectiveBloomPass = new EffectPass(
        camera,
        selectiveBloomEffect
    );
    composer.addPass(selectiveBloomPass);

}

function render() {
    const dt = clock.getDelta();

    // renderer.render(scene, camera);
    stats.update();
    composer.render();

    requestAnimationFrame( render );
}






function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.setSize( window.innerWidth, window.innerHeight );

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