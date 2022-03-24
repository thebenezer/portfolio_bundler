import * as THREE from 'three';
const DIRECTIONS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
import * as CANNON from 'cannon-es'


export default class CharacterController{

    // temporary data
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion= new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()
    
    // constants
    fadeDuration= 0.2
    runVelocity = 9
    walkVelocity = 3

    constructor(character,animations,camera,orbitControls,world){
        this.canJump = true
        this.wantsJump=false    
        this.character = character;
        this.actions = {};
        this.mixer = new THREE.AnimationMixer( character );
        this.setupCharacterAnimations(animations );
        this.currentAction='idle'
        this.camera = camera;
        // console.log(this.hitSound)
        // this.hitSound = new Audio('./assets/hit.mp3')

        // this.hitSound.volume = Math.random()
        // this.hitSound.currentTime = 0
        // this.hitSound.play()

        this.world = world;
        // Cannon.js body
        const shape = new CANNON.Box(new CANNON.Vec3(0.2, 0.5, 0.2))
        // const shape = new CANNON.Sphere(1.5)

        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 30),
            shape: shape,
            allowSleep: false,
            linearDamping:0.99,
            angularDamping:1
            // material: defaultMaterial
        })
        this.world.addBody(this.body)
        

        this.camera.position.x=this.character.position.x;
        this.camera.position.y=this.character.position.y+3;
        this.camera.position.z=this.character.position.z+40;
        this.orbitControls = orbitControls;
        this.updateCameraTarget(0,0,0);
    }

    update( keysPressed, shiftToggle,delta) {
        // console.log(this.character.position.y)
        if(this.character.position.y<-10){
            this.body.position.y=10
            // console.log('yes')
        }

        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)
        var play = 'idle';
        if (directionPressed && shiftToggle) {
            play = 'run'
        } else if (directionPressed) {
            play = 'walk'
        }
        if(this.wantsJump && this.canJump){
            // this.camera.position.y =this.character.position.y
            // moveY = 7*delta*100
            this.body.velocity.y=10
            this.wantsJump=false
            this.canJump=false
            play='fall'
        }

        this.fadeToAction(play)
        this.mixer.update(delta)

        // console.log(this.canJump,this.wantsJump )
        let moveX=0,moveZ=0,moveY=0;
        
        if (this.currentAction == 'run' || this.currentAction == 'walk') {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.character.position.x), 
                    (this.camera.position.z - this.character.position.z))
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed)

            // rotate character
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.body.quaternion.copy(this.character.quaternion)
            // this.character.quaternion.rotateTowards(this.body.quaternion, 0.1)
            this.character.quaternion.rotateTowards(this.rotateQuarternion, delta*10)
            

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
            // console.log(this.walkDirection)

            
            // run/walk velocity
            const velocity = this.currentAction == 'run' ? this.runVelocity : this.walkVelocity
     
            // move character & camera
            moveX = -this.walkDirection.x * velocity * delta
            moveZ = -this.walkDirection.z * velocity * delta
            // this.body.interpolatedPosition.set(this.body.position.x+moveY,this.body.position.y,this.body.position.z+moveZ)
            this.body.velocity.x=-this.walkDirection.x * velocity
            // this.body.velocity.y=0.5
            this.body.velocity.z=-this.walkDirection.z * velocity
            // moveX = moveX-this.body.position.x
            // moveZ = moveZ-this.body.position.z
            // this.character.position.x += moveX
            // this.character.position.z += moveZ
            // console.log(this.camera.position) 
        }
        // else{
        //     this.body.velocity.x = 0
        //     this.body.velocity.z = 0
        //     this.body.angularVelocity.set(0,0,0)
        // }
        this.character.position.x = this.body.position.x
        this.character.position.y = this.body.position.y-0.5
        this.character.position.z = this.body.position.z
        this.updateCameraTarget(moveX, moveZ,moveY)
        this.orbitControls.update();// only required if controls.enableDamping = true, or if controls.autoRotate = true 

    }
    updateCameraTarget(moveX, moveZ,moveY) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ
        // this.camera.position.y += moveY
        // if (this.camera.position.y<this.character.position.y+1){
        //     this.camera.position.y=this.character.position.y+1
        // }
        // console.log(this.camera.position,this.character.position)
        // update camera target
        this.cameraTarget.x = this.character.position.x
        this.cameraTarget.y = this.character.position.y+2
        this.cameraTarget.z = this.character.position.z
        this.orbitControls.target = this.cameraTarget

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
    directionOffset(keysPressed) {
        var directionOffset = 0 // w

        if (keysPressed['ArrowDown']) {
            if (keysPressed['ArrowRight']) {
                directionOffset  = Math.PI / 4 
            } else if (keysPressed['ArrowLeft']) {
                directionOffset = - Math.PI / 4 
            }
        } else if (keysPressed['ArrowUp']) {
            if (keysPressed['ArrowRight']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 
            } else if (keysPressed['ArrowLeft']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 
            } else {
                directionOffset = Math.PI 
            }
        } else if (keysPressed['ArrowRight']) {
            directionOffset = Math.PI / 2 
        } else if (keysPressed['ArrowLeft']) {
            directionOffset = - Math.PI / 2 
        }

        return directionOffset
    }

}