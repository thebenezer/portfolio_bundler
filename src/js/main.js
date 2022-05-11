import '../css/style.css'
// import './vendor.js';

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';



import { gsap } from 'gsap'
// import * as dat from 'lil-gui';
import * as CANNON from 'cannon-es'

import CharacterController from './characterController';




const hitSound = new Audio(require('../assets/hit.mp3'));
// const gui=new dat.GUI();
/*
* Debug GUI
*/
const debugObject = {
    deepcolor: 0x142e39,
    surfacecolor: 0x98caf0,
    scenecolor: 0x111522,
    ambientlight: 0x96cbfd
}
// guiPanel()

/*
* Canvas
*/
const canvas = document.querySelector('#canvas' );
const loadingBar= document.querySelector('.loading-bar')
const closeProj= document.querySelectorAll('.closeProj')
const projects= document.querySelector('.projects')
loadingBar.style.transition='transform 0.5s';

let stats,info,plane;
let camera, scene, renderer,controls;
let world,raycaster,camRaycaster,INTERSECTED,interractObjects=[],composer;

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
    scene = new THREE.Scene();

    // LOADING SCREEN
    const overlayGeo= new THREE.PlaneBufferGeometry(2,2,1,1)
    const overlayMat= new THREE.ShaderMaterial({
        transparent:true,
        uniforms:{
            uAlpha: { value: 1.0 }
        },
        vertexShader:`
            void main(){
                gl_Position = vec4(position , 1.0);
            }
        `,
        fragmentShader:`
            uniform float uAlpha;
            void main(){
                gl_FragColor =vec4(0.0,0.0,0.0,uAlpha);
            }
        `,
    })
    const overlay= new THREE.Mesh(overlayGeo,overlayMat)
    scene.add(overlay)

    // ***** RENDERER ****** //
    renderer = new THREE.WebGLRenderer({
        canvas,
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false
        });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    // renderer.toneMappingExposure=0.05
    renderer.setPixelRatio( Math.min(window.devicePixelRatio,2) );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.shadowMap.enabled=true
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


    // ***** LOADERS ****** //
    const loadingManager= new THREE.LoadingManager(
        // Loaded
        ()=>{
            gsap.delayedCall(0.5,()=>{
                gsap.to(overlayMat.uniforms.uAlpha,{duration: 1, value:0})
                loadingBar.style.transform=``;
                scene.remove(overlay)
                loadingBar.classList.add('endload')
                // gsap.to(scene.fog,{density:0.005,ease: "expo.out",duration:2})
            });
            console.log('Loaded')
        },
        // Progress
        (url, itemsLoaded, itemsTotal)=>{
            const progressRatio=itemsLoaded/itemsTotal;
            loadingBar.style.transform=`scaleX(${progressRatio})`;
            console.log(itemsLoaded/itemsTotal)
        },
        // Error
        ()=>{

        }
    )
    

    // ***** CAMERA ****** //
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 400;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);


    // ***** Light & FOG ****** //
    // scene.background = backgroundTexture;
    scene.background = new THREE.Color( debugObject.scenecolor );
    // scene.fog = new THREE.FogExp2( 0x111522,1);

    // ***** LIGHTS ****** //
    scene.add( new THREE.AmbientLight( 0x00fefe, 0.2 ) );
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.castShadow = false

    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048

    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 200

    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.bottom = - 50
    directionalLight.shadow.camera.left = - 50

    directionalLight.position.set(-50, 70, 70)
    
    scene.add(directionalLight)

    const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    directionalLightCameraHelper.visible = false
    scene.add(directionalLightCameraHelper)

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
            // contactEquationRelaxation : 4
        }
    )
    world.defaultContactMaterial = defaultContactMaterial


    // ***** TEXTURES ****** //
    const textureLoader = new THREE.TextureLoader(loadingManager)
    const loader = new GLTFLoader(loadingManager);

    const backgroundTexture = textureLoader.load(require('../assets/skies/Night2.png'))
    backgroundTexture.mapping=THREE.EquirectangularReflectionMapping
    backgroundTexture.encoding = THREE.sRGBEncoding;

    const bakedTexture = textureLoader.load(require('../assets/VRWorld/baked3.jpg'))
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding;

    const characterTexture = textureLoader.load(require('../assets/Character/Baked.png'))
    characterTexture.flipY = false
    characterTexture.encoding = THREE.sRGBEncoding;

    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
    const doorLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const lampLightMaterial = new THREE.MeshBasicMaterial({ color: 0x005CFF })

    const characterMaterial = new THREE.MeshBasicMaterial({ map: characterTexture })
    
    const landMaterial=new THREE.MeshPhongMaterial({
        color: 0xffffff,
        // metalness: 1,
        // roughness: 0,
    })


    // ***** MODELS ****** //
    //World Model
    loader.load( require('../assets/VRWorld/portfolio_v1.2.glb').default, function ( gltf ) {
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
                // child.receiveShadow=true
                // child.castShadow=true
            }
            if (child.name.includes('doorLight')) {
                child.material = doorLightMaterial
            }
            else if (child.name.includes('lampLight')) {
                child.material = lampLightMaterial
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
    setUpRayInterractions()



    window.addEventListener( 'resize', onWindowResize,false );
    // canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // canvas.addEventListener( 'click', onClickOpen, false );
    document.addEventListener('keypress',(event)=>onEnterOpen(event),false)
    canvas.addEventListener( 'touchstart', onDocumentTouchStart, false );
    canvas.addEventListener( 'touchend', onDocumentTouchEnd, false );
    closeProj.forEach(close => {
        close.addEventListener( 'click', onClose, false );
    });

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
    // renderer.shadowMap.needsUpdate=false
    const dt = clock.getDelta();
    // Update physics
    if(characterControllerInstance){
        characterControllerInstance.body.addEventListener('collide', collisionJumpCheck)
        characterControllerInstance.world.step(1/120,dt);
        characterControllerInstance.update(dt)
        
        raycaster.set(new THREE.Vector3(characterControllerInstance.character.position.x,characterControllerInstance.character.position.y+4,characterControllerInstance.character.position.z),new THREE.Vector3(0,-1,0))
        // rayCheck(dt);
        rayCheck();
    }
 
    renderer.render(scene, camera);
    stats.update();
    // composer.render();

    requestAnimationFrame( render );
}



function rayCheck(){
    const intersects = raycaster.intersectObjects( interractObjects, false );

    if ( intersects.length > 0 ) {
        // console.log(intersects)

        if ( INTERSECTED != intersects[ 0 ].object ) {
            // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            // INTERSECTED.material.emissive.setHex( 0xff0000 ); 
            // INTERSECTED.position.y+=1
            gsap.to(INTERSECTED.position, { duration: 0.5, ease: "back.out(1)", y: INTERSECTED.userData.y+1 });

        }

    } else {

        if ( INTERSECTED ){
            // INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            gsap.to(INTERSECTED.position, { duration: 0.5, ease: "back.in(1)", y: INTERSECTED.userData.y });
        } 
        // gsap.to(interractObjects, { duration: 0.5, ease: "back.in(1)", y: projy });

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
function onClose(){
    // console.log(INTERSECTED)
    // if ( INTERSECTED ){
        // gsap.to(INTERSECTED.position, { duration: 0.5, ease: "back.in(1)", y: INTERSECTED.userData.y });
        // const element= document.querySelector('.'+INTERSECTED.name)
        // console.log(element)
        // gsap.to(element,{opacity:0,duration:0.5})
        gsap.to('.box, .library, .lab',{zIndex:-1,opacity:0,duration:0.5})
        // gsap.to(projects,{zIndex:-1,duration:0.5})
        // INTERSECTED=null
    // }
}
function onEnterOpen(e) {
    e.preventDefault();
    if(e.key=='Enter'){
        onClickOpen()
    }
}
function onClickOpen(){
    // event.preventDefault();
    if (INTERSECTED) {
        console.log(INTERSECTED.name)
        if(INTERSECTED.userData.group=='projects'){
            currentSlideID = INTERSECTED.userData.i;
            isAnimating=false
            setActiveSlide(currentSlideID, 0);
            gsap.to('.box',{zIndex:2,opacity:1,duration:0.5})
        }
        else if(INTERSECTED.userData.group=='buildings'){
            const element= document.querySelector('.'+INTERSECTED.name)
            gsap.to(element,{zIndex:2,opacity:1,duration:0.5})   
        }
        else{
            if (INTERSECTED.name=='twitter') {
                window.open("https://www.twitter.org", "_blank");
            }else if(INTERSECTED.name=='github'){
                window.open("https://github.com/thebenezer", "_blank"); 
            }else if(INTERSECTED.name=='linkedin'){
                window.open("https://www.linkedin.com/in/thebenezer/", "_blank");
            }
            else{
                window.location.href = "mailto:samebenezer21@gmail.com?subject=Contacting from Portfolio";
            }
        }
    }
    // console.log(INTERSECTED)
}
function onDocumentMouseMove( event ) {

    event.preventDefault();
    clickxy.x=event.clientX;
    clickxy.y=event.clientY;
    mouse.x = ( ( clickxy.x - renderer.domElement.offsetLeft ) / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( ( clickxy.y - renderer.domElement.offsetTop ) / renderer.domElement.clientHeight ) * 2 + 1;
    camRaycaster.setFromCamera(mouse,camera)
    const intersects = camRaycaster.intersectObjects( interractObjects, false );

    if ( intersects.length > 0 ) {
        // console.log(intersects)

        if ( INTERSECTED != intersects[ 0 ].object ) {
            // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            // INTERSECTED.material.emissive.setHex( 0xff0000 ); 
            // INTERSECTED.position.y+=1
            gsap.to(INTERSECTED.position, { duration: 0.5, ease: "back.out(1)", y: INTERSECTED.userData.y+1 });

        }

    } else {

        if ( INTERSECTED ){
            // INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            gsap.to(INTERSECTED.position, { duration: 0.5, ease: "back.in(1)", y: INTERSECTED.userData.y });
        } 
        // gsap.to(interractObjects, { duration: 0.5, ease: "back.in(1)", y: projy });

        INTERSECTED = null;

    }

}
function onDocumentTouchStart( event ) {

    event.preventDefault();
    var touches = event.changedTouches;
    clickxy.x=touches[0].pageX;
    clickxy.y=touches[0].pageY;
    mouse.x = ( (clickxy.x- renderer.domElement.offsetLeft) / renderer.domElement.clientWidth  ) * 2 - 1;
    mouse.y = - ( (clickxy.y- renderer.domElement.offsetTop) / renderer.domElement.clientHeight  ) * 2 + 1;
    // mouse.x = ( touches[0].pageX / window.innerWidth ) * 2 - 1;
}
function onDocumentTouchEnd(){
    mouse = new THREE.Vector2();
}

// function guiPanel() {
//     gui.addColor(debugObject,'scenecolor')
//     .onChange(()=>{
//         scene.background.set(debugObject.scenecolor);
//     });
//     gui.addColor(debugObject,'ambientlight')
//     .onChange(()=>{
//         scene.children[0].color.set(debugObject.ambientlight);
//     });
//     gui.close()
// }
var slides = document.querySelectorAll(".box");
var navPrev = document.querySelector(".prev");
var navNext = document.querySelector(".next");
var slidesNum = slides.length;
// console.log(slidesNum)
var prevSlideID = null;
var currentSlideID = 0;
var isAnimating = false;
init2();

function init2() {
	gsap.set(slides, {
		left: "-100%"
	});
	navPrev.addEventListener("click", gotoPrevSlide);
	navNext.addEventListener("click", gotoNextSlide);
	gotoSlide(0, 0,'next');
}

function gotoPrevSlide() {
	var slideToGo = currentSlideID - 1;
	if (slideToGo <= -1) {
		slideToGo = slidesNum - 1;
	}
	// stopAutoPlay();
	gotoSlide(slideToGo, 0.5, "prev");
}

function gotoNextSlide() {
	var slideToGo = currentSlideID + 1;
	if (slideToGo >= slidesNum) {
		slideToGo = 0;
	}
	// stopAutoPlay();
	gotoSlide(slideToGo, 0.5, "next");
}

function setActiveSlide(slideID, _time){
    isAnimating = true;
    currentSlideID = slideID;
    prevSlideID = currentSlideID-1<0?4:currentSlideID-1;
    // console.log(prevSlideID,currentSlideID)
    var currentSlide = slides[currentSlideID];
    gsap.set(slides, {
        left: "-100%"
    });
    gsap.to(currentSlide, {
        duration:_time,
        left: "0%"
    });
    gsap.delayedCall(_time, function() {
        isAnimating = false;
    });
}

function gotoSlide(slideID, _time, _direction) {
    console.log(currentSlideID)
	if (!isAnimating) {
		isAnimating = true;
		prevSlideID = currentSlideID;
		currentSlideID = slideID;
		var prevSlide = slides[prevSlideID];
		var currentSlide = slides[currentSlideID];
		if (_direction == "next") {
			gsap.to(prevSlide, {
                duration:_time,
				left: "-100%"
			});
			gsap.fromTo(currentSlide, {
                duration:_time,
				left: "100%"
			}, {
                duration:_time,
				left: "0"
			});
		} else {
			gsap.to(prevSlide, {
                duration:_time,
				left: "100%"
			});
			gsap.fromTo(currentSlide, {
                duration:_time,
				left: "-100%"
			}, {
                duration:_time,
				left: "0"
			});
		}
		gsap.delayedCall(_time, function() {
			isAnimating = false;
		});
	}
}

function setUpRayInterractions() {
     // ***** RAYCASTER ****** //
     camRaycaster = new THREE.Raycaster();
     raycaster = new THREE.Raycaster();
     raycaster.near=0
     raycaster.far=5
     let geo=new THREE.BoxBufferGeometry(10, 7,2);
     let mat=new THREE.MeshPhongMaterial( { 
         color: 0xfefefe,
     })
     const proj1 = new THREE.Mesh(geo,mat);
     proj1.rotation.x = - Math.PI * 0.5
     proj1.rotation.z = - Math.PI * 0.81
     proj1.position.set(6.5, 1.0,-25)
     proj1.name='proj1'
     proj1.userData.y=1.0
     proj1.userData.i=0
     const proj2 = new THREE.Mesh(geo,mat);
     proj2.rotation.x = - Math.PI * 0.5
     proj2.rotation.z = - Math.PI * 0.42
     proj2.position.set(12.3, 1.0,-41.3)
     proj2.name='proj2'
     proj2.userData.y=1.0
     proj2.userData.i=1
     const proj3 = new THREE.Mesh(geo,mat);
     proj3.rotation.x = - Math.PI * 0.5
     proj3.position.set(-2.1, 1.0, -52.4)
     proj3.name='proj3'
     proj3.userData.y=1.0
     proj3.userData.i=2
     const proj4 = new THREE.Mesh(geo,mat);
     proj4.rotation.x = - Math.PI * 0.5
     proj4.rotation.z = - Math.PI * 0.59
     proj4.position.set(-16.5, 1.0, -41.3)
     proj4.name='proj4'
     proj4.userData.y=1.0
     proj4.userData.i=3
     const proj5 = new THREE.Mesh(geo,mat);
     proj5.rotation.x = - Math.PI * 0.5
     proj5.rotation.z = - Math.PI * 0.19
     proj5.position.set(-10.6, 1.0, -25)
     proj5.name='proj5'
     proj5.userData.y=1.0
     proj5.userData.i=4
     proj1.userData.group='projects'
     proj2.userData.group='projects'
     proj3.userData.group='projects'
     proj4.userData.group='projects'
     proj5.userData.group='projects'
 
 
 
     geo=new THREE.BoxBufferGeometry(9, 9,2);
     const lightHouse = new THREE.Mesh(geo, mat);
     lightHouse.rotation.x = - Math.PI * 0.5
     lightHouse.position.set(22, 1, 77)
     lightHouse.name='lightHouse'
     lightHouse.userData.y=1
 
     const lab = new THREE.Mesh(geo, mat);
     lab.rotation.x = - Math.PI * 0.5
     lab.position.set(-24, 1, 47.7)
     lab.name='lab'
     lab.userData.y=1
 
     const library = new THREE.Mesh(geo, mat);
     library.rotation.x = - Math.PI * 0.5
     library.position.set(-43, 3.5, 10.6)
     library.name='library'
     library.userData.y=3.5
     lightHouse.userData.group='buildings'
     lab.userData.group='buildings'
     library.userData.group='buildings'
 
 
     geo=new THREE.BoxBufferGeometry(3, 3,2);
     const social1 = new THREE.Mesh(geo, mat);
     social1.rotation.x = - Math.PI * 0.5
     social1.position.set(37.9, 1, 32)
     social1.name='twitter'
     social1.userData.y=1
     const social2 = new THREE.Mesh(geo, mat);
     social2.rotation.x = - Math.PI * 0.5
     social2.position.set(43.5, 1, 32)
     social2.name='github'
     social2.userData.y=1
     const social3 = new THREE.Mesh(geo, mat);
     social3.rotation.x = - Math.PI * 0.5
     social3.position.set(49.1, 1, 32)
     social3.name='linkedin'
     social3.userData.y=1
     const social4 = new THREE.Mesh(geo, mat);
     social4.rotation.x = - Math.PI * 0.5
     social4.position.set(54.7, 1, 32)
     social4.name='mail'
     social4.userData.y=1
     social1.userData.group='socials'
     social2.userData.group='socials'
     social3.userData.group='socials'
     social4.userData.group='socials'
 
     scene.add(proj1,proj2,proj3,proj4,proj5,lightHouse,lab,library,social1,social2,social3,social4)
     interractObjects.push(proj1,proj2,proj3,proj4,proj5,lightHouse,lab,library,social1,social2,social3,social4)
 
}