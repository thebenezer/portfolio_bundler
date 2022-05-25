import * as THREE from 'three';
const DIRECTIONS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
import * as CANNON from 'cannon-es'
import CharacterInput from './characterInput'
import { gsap } from 'gsap'
const portalAnimation=gsap.timeline().pause();
portalAnimation.to('.portalOverlay',{display:'block',duration:0})
portalAnimation.to('.portalOverlay',{duration:0.5,width:'100%',height:"100%",borderRadius:0})

export default class CharacterController{

    // temporary data
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion= new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()
    lastActiveIsland 
    // constants
    fadeDuration= 0.2
    runVelocity = 10
    walkVelocity = 5
    canJump = true

    constructor(character,animations,camera,orbitControls,world){
        // this.canJump = true
        this._input=new CharacterInput();    
        this.character = character;
        this.actions = {};
        this.mixer = new THREE.AnimationMixer( character );
        this.setupCharacterAnimations(animations );
        this.currentAction='idle'
        this.camera = camera;
        // console.log(this.hitSound)
    
        // this.footstepSound = new Audio(require('../assets/sounds/footsteps.wav'));
        // this.footstepSound.loop =true;
        // this.footstepSound.volume=0.5


        this.world = world;
        // Cannon.js body
        const shape = new CANNON.Box(new CANNON.Vec3(0.2, 0.5, 0.2))
        // const shape = new CANNON.Sphere(1.5)

        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(-3.7321603111458113, 1.9534421246363518, 32.22759970714397),
            // position: new CANNON.Vec3(-45, 1.9534421246363518, -26),
            shape: shape,
            allowSleep: false,
            linearDamping:0.99,
            angularDamping:1
            // material: defaultMaterial
        })
        this.world.addBody(this.body)
        
        this.oldObjectPosition = new THREE.Vector3();
        this.character.getWorldPosition(this.oldObjectPosition);

        this.camera.position.x=this.character.position.x;
        this.camera.position.y=this.character.position.y+3;
        this.camera.position.z=this.character.position.z+5;
        this.orbitControls = orbitControls;
        this.updateCameraTarget();
        this.body.addEventListener('collide',(e)=>{
            this.canJump=true
            // console.log(e.contact.bj.index,e.contact.bj.position)

            if(e.contact.bj.userData){
                if(e.contact.bj.userData.name=='land')
                    this.lastActiveIsland=e.contact.bj
                else if(e.contact.bj.userData.name=='portal1'){
                    portalAnimation.play()
                    gsap.delayedCall(0.5,()=>{
                        gsap.to(this.body.position,{duration:0,x:13.5,y:2.5,z:70})
                    })
                    gsap.delayedCall(1,()=>{
                        portalAnimation.reverse()
                    })
                    
                }
                else if(e.contact.bj.userData.name=='portal2'){
                    portalAnimation.play()
                    gsap.delayedCall(0.5,()=>{
                        gsap.to(this.body.position,{duration:0,x:-45,y:2.5,z:-26})
                    })
                    gsap.delayedCall(1,()=>{
                        portalAnimation.reverse()
                    })
                    
                }
                // console.log('last:',e.contact.bj)
            }
        });

    }

    update(delta) {
        if(this.character.position.y<-4){
            let lastPos=new THREE.Vector3().copy(this.lastActiveIsland.position)
            let tempPos = new THREE.Vector3().copy(this.character.position);
            // console.log(tempPos)

            var dir = new THREE.Vector3(); // direction to move fallen character
            dir.subVectors( lastPos,tempPos ).normalize();

            tempPos.addScaledVector(dir,5);
            this.camera.position.x+=this.body.position.x=tempPos.x
            this.camera.position.z+=this.body.position.z=tempPos.z
            this.body.position.y=2.4
            
            // this.camera.position.y -=7
        }
        this.character.getWorldPosition(this.oldObjectPosition);
        let directionPressed =DIRECTIONS.some(key => this._input.keysPressed[key] == true)
        var play = 'idle';
        if(this.body.position.y<2.4){
            directionPressed = false
            play = 'fall'
        }
        else{
            if ((directionPressed && this._input.shiftToggle)||this._input._inputTouch.touchRun) {
                play = 'run'
            }else if(this._input._inputTouch.touchInputToggle){
                play = 'walk'
                
            } else if (directionPressed) {
                play = 'walk'
                this._input.clock.getElapsedTime()
                if (this._input.clock.elapsedTime>2) {
                    play = 'run'  
                } 
            }
        }
        if((this._input.keysPressed[' ']||this._input._inputTouch.touchJump) && this.canJump){
            // this.camera.position.y =this.character.position.y
            // moveY = 7*delta*100  
            // console.log(this.character.position)
            this.body.velocity.y=15
            this.canJump=false
            this._input._inputTouch.touchJump=false;
            play = 'fall'
            // console.log(this.body.position)
        }

        this.fadeToAction(play)
        this.mixer.update(delta)

        // let moveX=0,moveZ=0,moveY=0;
        
        if (this.currentAction == 'run' || this.currentAction == 'walk') {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.character.position.x), 
                    (this.camera.position.z - this.character.position.z))
            // diagonal movement angle offset
            var directionOffset = this._input._directionOffset()

            // rotate character
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.body.quaternion.copy(this.character.quaternion)
            // this.character.quaternion.rotateTowards(this.body.quaternion, 0.1)
            this.character.quaternion.rotateTowards(this.rotateQuarternion, delta*10)
            

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            // this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
            // console.log(this.walkDirection)

            
            // run/walk velocity
            const velocity = this.currentAction == 'run' ? this.runVelocity : this.walkVelocity
     
            // move character & camera
            this.body.velocity.x=-this.walkDirection.x * velocity
            this.body.velocity.z=-this.walkDirection.z * velocity
        }
        // else{
        //     this.body.velocity.lerp(this.body.velocity,1,new CANNON.Vec3(0,0,0))
        // }
        this.character.position.x = this.body.position.x
        this.character.position.y = this.body.position.y-0.5
        this.character.position.z = this.body.position.z
        this.updateCameraTarget()
        this.orbitControls.update();// only required if controls.enableDamping = true, or if controls.autoRotate = true 

    }
    updateCameraTarget() {
        // move camera
    
        if (this.camera.position.y<this.character.position.y+0.5){
            this.camera.position.y=this.character.position.y+0.5
        }
        // update camera target
        this.cameraTarget.x = this.character.position.x
        this.cameraTarget.y = this.character.position.y+2
        this.cameraTarget.z = this.character.position.z
        this.orbitControls.target = this.cameraTarget

        const newObjectPosition = new THREE.Vector3();
        this.character.getWorldPosition(newObjectPosition);

        const delta = newObjectPosition.clone().sub(this.oldObjectPosition);

        this.camera.position.add(delta);
    }

    fadeToAction( actionName ) {

        const previousAction = this.currentAction;
        this.currentAction = actionName;
    
        if ( previousAction !== this.currentAction ) {
    
            this.actions[previousAction].fadeOut(0.5);
            this.actions[this.currentAction]
            .reset()
            .setEffectiveTimeScale( 1 )
            .setEffectiveWeight( 1 )
            .play();
        }
    }

    setupCharacterAnimations( animations ) {
        // const states = [ 'catch','death','fall','guard','hit','hit_guard','idle','interact','jump_start','pull','push','put','run','throw','walk'];
        for ( let i = 0; i < animations.length; i ++ ) {
            const clip = animations[ i ];
            const action = this.mixer.clipAction( clip );
            this.actions[ clip.name ] = action;    
        }
        this.currentAction = 'idle' ;
        this.actions[this.currentAction].play();
    }

}