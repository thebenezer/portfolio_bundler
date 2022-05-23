import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// import Stats from 'three/examples/jsm/libs/stats.module.js';

import { gsap } from 'gsap'
// import * as dat from 'lil-gui';
// const gui=new dat.GUI();
// function guiPanel() {
//     const lightFolder = gui.addFolder('light')
//     lightFolder.add(directionalLight, 'intensity').min(0).max(5).step(0.001)
//     lightFolder.add(directionalLight.position, 'x').min(- 500).max(500).step(1)
//     lightFolder.add(directionalLight.position, 'y').min(- 500).max(500).step(1)
//     lightFolder.add(directionalLight.position, 'z').min(- 500).max(500).step(1)
//     const sceneFolder = gui.addFolder('scene')
//     sceneFolder.addColor(debugObject,'scenecolor')
//     .onChange(()=>{
//         scene.background.set(debugObject.scenecolor);
//     });
//     sceneFolder.addColor(debugObject,'ambientlight')
//     .onChange(()=>{
//         scene.children[0].color.set(debugObject.ambientlight);
//     });
//     sceneFolder.addColor(debugObject,'fogcolor')
//     .onChange(()=>{
//         scene.fog.color.set(debugObject.fogcolor);
//     });
//     sceneFolder.close()
//     const objectFolder = gui.addFolder('colors')
//     // lampFolder.add(selectiveBloomEffect.options,'intensity').min(0).max(5).step(0.01)
//     objectFolder.addColor(debugObject,'lampcolor')
//     .onChange(()=>{
//         lampLightMaterial.color.set(debugObject.lampcolor);
//     });
//     objectFolder.addColor(debugObject,'watercolor')
//     .onChange(()=>{
//         water.material.color.set(debugObject.watercolor);
//     });
//     objectFolder.addColor(debugObject,'socialcolor')
//     .onChange(()=>{
//         socialChildMaterial.color.set(debugObject.socialcolor);
//     });
//     objectFolder.close()
//     gui.close()
// }
/*
* Debug GUI
*/
const debugObject = {
    lampcolor: 0x142e39,
    watercolor: 0x00010a,
    scenecolor: 0x111522,
    ambientlight: 0x96cbfd,
    fogcolor: 0x000,
    socialcolor: 0x7fd2f5,
}

import * as CANNON from 'cannon-es'

import CharacterController from './characterController';

import { BlendFunction,KernelSize, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect} from "postprocessing";
// import { DirectionalLight } from 'three';

const canvas = document.querySelector('#canvas' );
const loadingBar= document.querySelector('.loading-bar')
const closeProj= document.querySelectorAll('.closeProj')
let stats,info,loadingManager;
let camera, scene, renderer,controls,composer;
let water,lampLightMaterial,directionalLight,socialChildMaterial;
let selectiveBloomEffect,selectiveBloomPass,bloomOptions;
let music,selectMenuSound,selectItemSound;
const clock=new THREE.Clock();
let arpImg,stpImg,plaImg,shpImg,srfImg;
let mouse = new THREE.Vector2();
let clickxy = new THREE.Vector2();

let characterControllerInstance,raycaster,camRaycaster,interractObjects=[],INTERSECTED;

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

    // info = document.querySelector('#info' );
    // stats = new Stats();
    // info.appendChild( stats.dom );
    // stats.dom.style='position:absolute;top:50%;right:0;'
    scene = new THREE.Scene();

    // LOADING SCREEN
    setupLoadingScreen();

    // ***** PHYSICS WORLD ****** //
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -20, 0), // m/s²
        broadphase: new CANNON.SAPBroadphase(world),
        allowSleep: true
    })
    // Contact material
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

    // ***** CAMERA ****** //
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 500;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);

    // ***** AUDIO ****** //
    setupGlobalAudio();

    // ***** LIGHTS ****** //
    // scene.add( new THREE.AmbientLight( 0xfffefe, 0.5 ) );
    directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    // directionalLight.castShadow = true

    // directionalLight.shadow.mapSize.width = 2048
    // directionalLight.shadow.mapSize.height = 2048

    // directionalLight.shadow.camera.near = 1
    // directionalLight.shadow.camera.far = 200

    // directionalLight.shadow.camera.top = 50
    // directionalLight.shadow.camera.right = 50
    // directionalLight.shadow.camera.bottom = - 50
    // directionalLight.shadow.camera.left = - 50

    directionalLight.position.set(-20, 70, 33)
    // DirectionalLight.
    scene.add(directionalLight)

    // const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    // directionalLightCameraHelper.visible = true
    // scene.add(directionalLightCameraHelper)

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
    // renderer.toneMappingExposure=1
    renderer.setPixelRatio( Math.min(window.devicePixelRatio,2) );
    renderer.setSize( window.innerWidth, window.innerHeight );

    bloomOptions = {
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
    // selectiveBloomEffect.selection.add(box2)
    selectiveBloomEffect.ignoreBackground=true

    selectiveBloomPass = new EffectPass(
        camera,
        selectiveBloomEffect
    );
    composer.addPass(selectiveBloomPass);
    
    // ***** TEXTURE ****** //
    const textureLoader = new THREE.TextureLoader(loadingManager)
    const loader = new GLTFLoader(loadingManager);
    // const backgroundTexture = textureLoader.load(require('../assets/skies/night.jpg'))
    // backgroundTexture.mapping=THREE.EquirectangularReflectionMapping
    // backgroundTexture.encoding = THREE.sRGBEncoding;
    
    const bakedTexture = textureLoader.load(require('../assets/VRWorld/baked5.webp'))
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding;

    const bakedDirTexture = textureLoader.load(require('../assets/VRWorld/DirectionTexture.webp'))
    bakedDirTexture.flipY = false
    bakedDirTexture.encoding = THREE.sRGBEncoding;

    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
    const bakedDirMaterial = new THREE.MeshBasicMaterial({ map: bakedDirTexture })
    const doorLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff,side:THREE.DoubleSide })
    lampLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF })

    arpImg =require('../assets/projectImages/pinboards.webp')
    stpImg =require('../assets/projectImages/stip.webp')
    plaImg =require('../assets/projectImages/planes.webp')
    shpImg =require('../assets/projectImages/shop.webp')
    srfImg =require('../assets/projectImages/surf.webp')
    const proj1_texture = textureLoader.load(arpImg)
    const proj2_texture = textureLoader.load(stpImg)
    const proj3_texture = textureLoader.load(plaImg)
    const proj4_texture = textureLoader.load(shpImg)
    const proj5_texture = textureLoader.load(srfImg)

    proj1_texture.flipY = proj2_texture.flipY = proj3_texture.flipY = proj4_texture.flipY = proj5_texture.flipY = false
    proj1_texture.encoding = THREE.sRGBEncoding;
    proj2_texture.encoding = THREE.sRGBEncoding;
    proj3_texture.encoding = THREE.sRGBEncoding;
    proj4_texture.encoding = THREE.sRGBEncoding;
    proj5_texture.encoding = THREE.sRGBEncoding;

    const proj1_Material = new THREE.MeshBasicMaterial({ map: proj1_texture })
    const proj2_Material = new THREE.MeshBasicMaterial({ map: proj2_texture })
    const proj3_Material = new THREE.MeshBasicMaterial({ map: proj3_texture })
    const proj4_Material = new THREE.MeshBasicMaterial({ map: proj4_texture })
    const proj5_Material = new THREE.MeshBasicMaterial({ map: proj5_texture })

    
   
    // scene.background=backgroundTexture
    scene.background = new THREE.Color( 0x000);
    scene.fog = new THREE.FogExp2( debugObject.fogcolor,1);

    // Ocean
    const geometry = new THREE.PlaneGeometry( 2000, 2000 );
    const material = new THREE.MeshBasicMaterial( {color: debugObject.watercolor,
    side:THREE.DoubleSide} );
    water = new THREE.Mesh( geometry, material );
    water.rotation.x=-Math.PI/2
    water.position.y=-0.2
    scene.add( water );

    
    
    //World Model
    loader.load( require('../assets/VRWorld/portfolio_v3_bigItems.glb').default, function ( gltf ) {
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
                if(center.y<2){
                    boxBody.userData={name:"land"}
                }
                
                world.addBody(boxBody)
            }
            if (child.name.includes('doorLight')) {
                child.material = doorLightMaterial
            }
            else if (child.name.includes('lampLight')) {
                child.material = lampLightMaterial
                selectiveBloomEffect.selection.add(child)
            }
            else if (child.name.includes('portalLight')) {
                child.material = doorLightMaterial
            }
            else if (child.name.includes('proj1')) {
                child.material = proj1_Material
                child.material.side=THREE.DoubleSide
            }
            else if (child.name.includes('proj2')) {
                child.material = proj2_Material
                child.material.side=THREE.DoubleSide
            }
            else if (child.name.includes('proj3')) {
                child.material = proj3_Material
                child.material.side=THREE.DoubleSide
            }
            else if (child.name.includes('proj4')) {
                child.material = proj4_Material
                child.material.side=THREE.DoubleSide
            }
            else if (child.name.includes('proj5')) {
                child.material = proj5_Material
                child.material.side=THREE.DoubleSide
            }
        })
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
    loader.load( require('../assets/VRWorld/portfolio_v4_smalllItems.glb').default, function ( gltf ) {
        gltf.scene.traverse((child)=>
        {
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

                if (child.name.includes('Cube088')) {
                    boxBody.userData={name:"portal1"}
                    // console.log(child.name)
                }else if (child.name.includes('Cube079')) {
                    boxBody.userData={name:"portal2"}
                    // console.log(child.name)
                }
                if (child.name.includes('social')) {
                    socialChildMaterial=child.material
                    child.material.color.set(debugObject.socialcolor)
                    child.material.emissive.set(0xfefefe)
                    child.material.emissiveIntensity=(0.2)
                    // console.log(child.material)
                    world.addBody(boxBody)
                }
                else if (child.name.includes('Circle')) {
                    child.material = bakedDirMaterial;
                    // child.position.y=-5
                }
                else{
                    child.material = bakedDirMaterial;
                    world.addBody(boxBody)
                    // if(boxBody.index=) 
                    // console.log(child.name,boxBody.index)

                }

            }
        })
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );


    //Character Model
    loader.load( require('../assets/Character/character3.glb').default, function ( gltf ) {
        const character = gltf.scene;
        // gltf.scene.traverse((child)=>
        // {
        //     // child.material = characterMaterial;
        //     // child.material=landMaterial
        //         // child.castShadow=true
        // })
        character.scale.set(0.2,0.2,0.2)
        scene.add( character );
        setupOrbitControls();
        characterControllerInstance=new CharacterController(character,gltf.animations,camera,controls,world)
    }, undefined, function ( e ) {
        console.error( e );
    });
     
    // guiPanel()

    window.addEventListener( 'resize', onWindowResize,false );
    document.addEventListener('keypress',(event)=>onEnterOpen(event),false)
    closeProj.forEach(close => {
        close.addEventListener( 'click', onClose, false );
    });

    setUpRayInterractions();
    canvas.addEventListener( 'click', onClickEventHandler, false );
    // canvas.addEventListener( 'click', onClickOpen, false );
    // canvas.addEventListener( 'touchstart', onDocumentTouchStart, false );
    // canvas.addEventListener( 'touchend', onDocumentTouchEnd, false );
}

function render() {
    const dt = clock.getDelta();
    // Update physics
    if(characterControllerInstance){
        // characterControllerInstance.body.addEventListener('collide', collisionJumpCheck)
        characterControllerInstance.world.step(1/120,dt);
        characterControllerInstance.update(dt)
        raycaster.set(new THREE.Vector3(characterControllerInstance.character.position.x,characterControllerInstance.character.position.y+4,characterControllerInstance.character.position.z),new THREE.Vector3(0,-1,0))
        rayCheck();
        requestAnimationFrame( render2 );
    }
    else{
        renderer.render(scene, camera);
        requestAnimationFrame( render );

    }
}
function render2() {
    const dt = clock.getDelta();
    characterControllerInstance.world.step(1/120,dt);
    characterControllerInstance.update(dt)
    raycaster.set(new THREE.Vector3(characterControllerInstance.character.position.x,characterControllerInstance.character.position.y+4,characterControllerInstance.character.position.z),new THREE.Vector3(0,-1,0))
    rayCheck();
    composer.render();
    requestAnimationFrame( render2 );
}


function onClickEventHandler( event ) {
// Optimization needed in checking so many objects
    event.preventDefault();
    if(INTERSECTED){
        clickxy.x=event.clientX;
        clickxy.y=event.clientY;
        mouse.x = ( ( clickxy.x - renderer.domElement.offsetLeft ) / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( ( clickxy.y - renderer.domElement.offsetTop ) / renderer.domElement.clientHeight ) * 2 + 1;
        camRaycaster.setFromCamera(mouse,characterControllerInstance.camera)
        const selected = camRaycaster.intersectObjects( interractObjects, false );
        // console.log(clickxy, mouse,selected.length)
        if ( selected.length > 0 && INTERSECTED == selected[ 0 ].object ) {
            onClickOpen();    
        }
    }
}
// function onDocumentTouchStart( event ) {

//     event.preventDefault();
//     var touches = event.changedTouches;
//     clickxy.x=touches[0].pageX;
//     clickxy.y=touches[0].pageY;
//     mouse.x = ( (clickxy.x- renderer.domElement.offsetLeft) / renderer.domElement.clientWidth  ) * 2 - 1;
//     mouse.y = - ( (clickxy.y- renderer.domElement.offsetTop) / renderer.domElement.clientHeight  ) * 2 + 1;
//     // mouse.x = ( touches[0].pageX / window.innerWidth ) * 2 - 1;
// }
// function onDocumentTouchEnd(){
//     mouse = new THREE.Vector2();
// }

function rayCheck(){
    const intersects = raycaster.intersectObjects( interractObjects, false );

    if ( intersects.length > 0 ) {
        // console.log(intersects)

        if ( INTERSECTED != intersects[ 0 ].object ) {
            selectItemSound.play()
            INTERSECTED = intersects[ 0 ].object;
            // console.log(INTERSECTED)
            gsap.to(INTERSECTED.scale, { duration: 0.5, ease: "ease.in(1)", z: INTERSECTED.userData.scaleZ+1 });

        }

    } else {
        if ( INTERSECTED ){
            gsap.to(INTERSECTED.scale, { duration: 0.5, ease: "back.in(1)", z: INTERSECTED.userData.scaleZ });
        } 
        INTERSECTED = null;
    }

}
document.querySelector('.instructions_icon').addEventListener('click',()=>{
    selectItemSound.play()
    gsap.to('.instructions',{zIndex:5,opacity:1,duration:0.5})
});

// OPENING AND CLOSING WORKS
function onClose(){
    selectItemSound.play()
    gsap.to('.box, .library, .lab, .next, .prev, .instructions',{zIndex:-1,opacity:0,duration:0.5})
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
        // console.log(INTERSECTED.name)
        if(INTERSECTED.userData.group=='projects'){
            selectMenuSound.play()
            currentSlideID = INTERSECTED.userData.i;
            isAnimating=false
            setActiveSlide(currentSlideID, 0);
            gsap.to('.box',{zIndex:5,opacity:1,duration:0.5})
            gsap.to('.next, .prev',{zIndex:5,opacity:1,duration:0.5})
        }
        else if(INTERSECTED.userData.group=='buildings'){
            selectMenuSound.play()
            const element= document.querySelector('.'+INTERSECTED.name)
            gsap.to(element,{zIndex:5,opacity:1,duration:0.5})   
        }
        else{
            selectItemSound.play()
            if (INTERSECTED.name=='twitter') {
                window.open("https://twitter.com/th_ebenezer", "_blank");
            }else if(INTERSECTED.name=='github'){
                window.open("https://github.com/thebenezer", "_blank"); 
            }else if(INTERSECTED.name=='linkedin'){
                window.open("https://www.linkedin.com/in/thebenezer/", "_blank");
            }
            else{
                window.location.href = "mailto:thebenezer.mail@gmail.com?subject=Contacting from Portfolio";
            }
        }
    }
    // console.log(INTERSECTED)
}


//############# NON THREE ###################
const navlinksWorks = document.querySelector('.navlinks-works');
const navlinksAbout = document.querySelector('.navlinks-about');
var slides = document.querySelectorAll(".box");
var navPrev = document.querySelector(".prev");
var navNext = document.querySelector(".next");
var slidesNum = slides.length;
// console.log(slidesNum)
var prevSlideID = null;
var currentSlideID = 0;
var isAnimating = false;
init2();

navlinksWorks.addEventListener('click',()=>{
    // selectItemSound.play()
    currentSlideID = 0;
    isAnimating=false
    setActiveSlide(currentSlideID, 0);
    gsap.to('.box',{zIndex:5,opacity:1,duration:0.5})
    gsap.to('.next, .prev',{zIndex:5,opacity:1,duration:0.5})
});
navlinksAbout.addEventListener('click',()=>{
    // selectItemSound.play()
    gsap.to('.library',{zIndex:5,opacity:1,duration:0.5})
});



function init2() {
	gsap.set(slides, {
		left: "-100%"
	});
	navPrev.addEventListener("click", gotoPrevSlide);
	navNext.addEventListener("click", gotoNextSlide);
	gotoSlide(0, 0,'next');
}

function gotoPrevSlide() {
    selectItemSound.play()
	var slideToGo = currentSlideID - 1;
	if (slideToGo <= -1) {
		slideToGo = slidesNum - 1;
	}
	// stopAutoPlay();
	gotoSlide(slideToGo, 0.5, "prev");
}

function gotoNextSlide() {
    selectItemSound.play()
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
    // console.log(currentSlideID)
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

function setupOrbitControls() {
    // Setup orbital controls
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.listenToKeyEvents( window ); // optional
    controls.enableKeys = false;
    // controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    // controls.autoRotate = true;
    // controls.autoRotateSpeed=-0.5
    controls.minDistance = 2.4;
    controls.maxDistance = 10;
    // controls.maxPolarAngle = 3*Math.PI/4;
    controls.update();
}

function setUpRayInterractions() {
    // ***** RAYCASTER ****** //
    camRaycaster = new THREE.Raycaster();
    raycaster = new THREE.Raycaster();
    raycaster.near=0
    raycaster.far=5
    let geo=new THREE.BoxBufferGeometry(10.2, 7.85,0.1);
    let mat=new THREE.MeshPhongMaterial( { 
        color: 0xfefefe,
    })

    const proj1 = new THREE.Mesh(geo,mat);
    proj1.rotation.x = - Math.PI * 0.5
    proj1.rotation.z = - 2.532
    proj1.position.set(5.41, 1.90,-26.33)
    proj1.name='proj1'
    proj1.userData.scaleZ=1.0
    proj1.userData.i=0
    const proj2 = new THREE.Mesh(geo,mat);
    proj2.rotation.x = - Math.PI * 0.5
    proj2.rotation.z = -1.307
    proj2.position.set(11.13, 1.90,-40.922)
    proj2.name='proj2'
    proj2.userData.scaleZ=1.0
    proj2.userData.i=1
    const proj3 = new THREE.Mesh(geo,mat);
    proj3.rotation.x = - Math.PI * 0.5
    proj3.position.set(-2.12, 1.90, -51.06)
    proj3.name='proj3'
    proj3.userData.scaleZ=1.0
    proj3.userData.i=2
    const proj4 = new THREE.Mesh(geo,mat);
    proj4.rotation.x = - Math.PI * 0.5
    proj4.rotation.z = -1.821
    proj4.position.set(-15.26, 1.90, -41.01)
    proj4.name='proj4'
    proj4.userData.scaleZ=1.0
    proj4.userData.i=3
    const proj5 = new THREE.Mesh(geo,mat);
    proj5.rotation.x = - Math.PI * 0.5
    proj5.rotation.z = -0.607
    proj5.position.set(-9.82, 1.90, -26.55)
    proj5.name='proj5'
    proj5.userData.scaleZ=1.0
    proj5.userData.i=4
    proj1.userData.group='projects'
    proj2.userData.group='projects'
    proj3.userData.group='projects'
    proj4.userData.group='projects'
    proj5.userData.group='projects'

    // geo=new THREE.BoxBufferGeometry(9, 9,2);
    const lightHouse = new THREE.Mesh(geo, mat);
    lightHouse.rotation.x = - Math.PI * 0.5
    lightHouse.position.set(22, 1.90, 77)
    lightHouse.name='lightHouse'
    lightHouse.userData.scaleZ=1

    const lab = new THREE.Mesh(geo, mat);
    lab.rotation.x = - Math.PI * 0.5
    lab.rotation.z = 1.571
    lab.position.set(-26.27, 1.90, 53.14)
    // gui.add(lab.position,'x').min(-30).max(-20).step(0.01)
    // gui.add(lab.position,'z').min(52.5).max(53.5).step(0.01)
    // gui.add(lab.rotation,'z').min(1.52).max(1.597).step(0.001)
    lab.name='lab'
    lab.userData.scaleZ=1

    const library = new THREE.Mesh(geo, mat);
    library.rotation.x = - Math.PI * 0.5
    library.rotation.z = 1.571
    library.position.set(-42.12, 4.3, 10.67)
    
    library.name='library'
    library.userData.scaleZ=3.5
    lightHouse.userData.group='buildings'
    lab.userData.group='buildings'
    library.userData.group='buildings'


    geo=new THREE.BoxBufferGeometry(3, 3,0.1);
    const social1 = new THREE.Mesh(geo, mat);
    social1.rotation.x = - Math.PI * 0.5
    social1.position.set(37.9, 1.90, 32)
    social1.name='twitter'
    social1.userData.scaleZ=1
    const social2 = new THREE.Mesh(geo, mat);
    social2.rotation.x = - Math.PI * 0.5
    social2.position.set(43.5, 1.90, 32)
    social2.name='github'
    social2.userData.scaleZ=1
    const social3 = new THREE.Mesh(geo, mat);
    social3.rotation.x = - Math.PI * 0.5
    social3.position.set(49.1, 1.90, 32)
    social3.name='linkedin'
    social3.userData.scaleZ=1
    const social4 = new THREE.Mesh(geo, mat);
    social4.rotation.x = - Math.PI * 0.5
    social4.position.set(54.7, 1.90, 32)
    social4.name='mail'
    social4.userData.scaleZ=1
    social1.userData.group='socials'
    social2.userData.group='socials'
    social3.userData.group='socials'
    social4.userData.group='socials'

    scene.add(proj1,proj2,proj3,proj4,proj5,lab,library,social1,social2,social3,social4)
    interractObjects.push(proj1,proj2,proj3,proj4,proj5,lab,library,social1,social2,social3,social4)
    


}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    composer  .setSize( window.innerWidth, window.innerHeight );

}

function setupLoadingScreen(){
    // const overlayGeo= new THREE.PlaneBufferGeometry(2,2,1,1)
    // const overlayMat= new THREE.ShaderMaterial({
    //     transparent:true,
    //     uniforms:{
    //         uAlpha: { value: 1.0 }
    //     },
    //     vertexShader:`
    //         void main(){
    //             gl_Position = vec4(position , 1.0);
    //         }
    //     `,
    //     fragmentShader:`
    //         uniform float uAlpha;
    //         void main(){
    //             gl_FragColor =vec4(0.0,0.0,0.0,uAlpha);
    //         }
    //     `,
    // })
    // const overlay= new THREE.Mesh(overlayGeo,overlayMat)
    // scene.add(overlay)


    loadingManager= new THREE.LoadingManager(
        // Loaded
        ()=>{
            gsap.delayedCall(1,()=>{
                // gsap.to(overlayMat.uniforms.uAlpha,{duration: 1, value:0})
                // scene.remove(overlay)
                loadingBar.style.transform=``;
                document.querySelector('.enter-button').addEventListener('click', openPortfolio,{once:true})
                gsap.to(loadingBar,{scaleX:0,ease: "expo.in",duration:0.5})
                gsap.to('.overlay',{opacity:0.9,duration:0.5, delay: 0.5})
                gsap.to('.enter-button',{opacity:1,cursor: 'Pointer',duration:0.5, delay: 0.5})
            });
            window.scrollTo(50, 50);

            // console.log('Loaded')
        },
        // Progress
        (url, itemsLoaded, itemsTotal)=>{
            const progressRatio=itemsLoaded/itemsTotal;
            gsap.to(loadingBar,{scaleX:progressRatio,ease: "expo.out",duration:0.2})
            // loadingBar.style.transform=`scaleX(${progressRatio})`;
            // console.log(itemsLoaded/itemsTotal)
        },
        // Error
        ()=>{

        }
    )
}


const equilizer = document.querySelector('.equilizer');
const bars = document.querySelectorAll('.bar');
var isPlayingMusic =false;

function openPortfolio(){
    gsap.to('.overlay',{scaleY:0,duration:0.5, delay: 0.5})
    toggleMusic();
    gsap.delayedCall(1,()=>{
        gsap.to('.overlay',{display:'none',duration:0})
        gsap.to(scene.fog,{density:0.005,ease: "expo.out",duration:0.5})
        // gsap.to('.instructions',{zIndex:5,opacity:1,duration:1,delay:2})
        document.querySelector('.instructions_icon').classList.add("blink-border");
        // openFullscreen();
    })
    document.getElementById('arp').src =arpImg;
    document.getElementById('stp').src =stpImg;
    document.getElementById('pla').src =plaImg;
    document.getElementById('shp').src =shpImg;
    document.getElementById('srf').src =srfImg;
}
var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

const hamburger = document.querySelector('.hamburger');
const line1 = document.querySelector('.line1');
const line2 = document.querySelector('.line2');
const line3 = document.querySelector('.line3');

const navitems=document.querySelectorAll('.navitem');
const timeline=gsap.timeline();
timeline.pause()
timeline.to('nav',{duration:0,zIndex:3})
timeline.to('nav',{duration:0.4,ease: "back.out(1.7)",width:300})
timeline.to(navitems,{opacity:1,stagger: 0.1})
hamburger.addEventListener('click',()=>{

    if(line1.classList.contains('close')){
        timeline.reverse()
        selectItemSound.play()
    }
    else{
        selectMenuSound.play()
        timeline.play()
    }

    line1.classList.toggle('close');
    line2.classList.toggle('close');
    line3.classList.toggle('close');
});

navitems.forEach(navitem=>{navitem.addEventListener('click',()=>{
    selectItemSound.play()
})})

// ********* MUSIC **********
equilizer.addEventListener('click',toggleMusic,false)

function toggleMusic() {
    selectItemSound.play()
    bars.forEach(bar => {
        bar.classList.toggle('animate')
    });
    //toggleMusic
    if(!isPlayingMusic){
    isPlayingMusic =true;
    music.play();
        // gsap.to(music,{volume:0.5, duration:1})
        music.loop =true;
        music.playbackRate = 1;
    }
    else{
        // gsap.to(music,{volume:0, duration:1})
    isPlayingMusic =false;
    music.pause();
    }
    // isPlayingMusic =!isPlayingMusic;
}

function setupGlobalAudio(){
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );
    const audioLoader = new THREE.AudioLoader(loadingManager);

    // create a global audio source
    music = new THREE.Audio( listener );
    selectMenuSound = new THREE.Audio( listener );
    selectItemSound = new THREE.Audio( listener );
    selectItemSound.volume=0.5

    // load a music and set it as the Audio object's buffer
    audioLoader.load( require('../assets/sounds/songLow.mp3'), function( buffer ) {
        music.setBuffer( buffer );
        music.setLoop( true );
        music.setVolume( 0.5 );
    });

    audioLoader.load( require('../assets/sounds/mainselectsound.mp3'), function( buffer ) {
        selectMenuSound.setBuffer( buffer );
        selectMenuSound.setVolume( selectItemSound.volume );
    });

    audioLoader.load( require('../assets/sounds/itemselectsound.wav'), function( buffer ) {
        selectItemSound.setBuffer( buffer );
        selectItemSound.setVolume( selectItemSound.volume );
    });


}