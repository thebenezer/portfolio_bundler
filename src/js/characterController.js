import * as THREE from 'three';
const DIRECTIONS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
import * as CANNON from 'cannon-es'
import CharacterInput from './characterInput'

export default class CharacterController{

    // temporary data
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion= new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()
    
    // constants
    fadeDuration= 0.2
    runVelocity = 10
    walkVelocity = 4

    constructor(character,animations,camera,orbitControls,world){
        this.canJump = true
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
            position: new CANNON.Vec3(-2, 5, 10.6),
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
        this.camera.position.z=this.character.position.z+10;
        this.orbitControls = orbitControls;
        this.updateCameraTarget(0,0,0);
    }

    update(delta) {
        // console.log(this.character.position.y)
        if(this.character.position.y<-10){
            this.body.position.y=10
            // console.log('yes')
        }
        this.character.getWorldPosition(this.oldObjectPosition);

        const directionPressed = DIRECTIONS.some(key => this._input.keysPressed[key] == true) || this._input._inputTouch.touchInputToggle
        var play = 'idle';
        // this.footstepSound.pause()

        if (directionPressed && (this._input.shiftToggle||this._input._inputTouch.touchRun)) {
            play = 'run'
            // this.footstepSound.playbackRate = 2; 
        } else if (directionPressed) {
            play = 'walk'
            // this.footstepSound.play()
        }
        if((this._input.keysPressed[' ']||this._input._inputTouch.touchJump) && this.canJump){
            // this.camera.position.y =this.character.position.y
            // moveY = 7*delta*100  
            this.body.velocity.y=15
            this.canJump=false
            this._input._inputTouch.touchJump=false;
            play='fall'
        }

        this.fadeToAction(play)
        this.mixer.update(delta)

        let moveX=0,moveZ=0,moveY=0;
        
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
            moveX=this.body.position.x,moveZ=this.body.position.z;

            moveX = -this.walkDirection.x * velocity * delta
            moveZ = -this.walkDirection.z * velocity * delta
            this.body.velocity.x=-this.walkDirection.x * velocity
            this.body.velocity.z=-this.walkDirection.z * velocity
        }
        else{
            this.body.velocity.lerp(this.body.velocity,1,new CANNON.Vec3(0,0,0))
        }
        this.character.position.x = this.body.position.x
        this.character.position.y = this.body.position.y-0.5
        this.character.position.z = this.body.position.z
        this.updateCameraTarget(moveX, moveZ,moveY)
        this.orbitControls.update();// only required if controls.enableDamping = true, or if controls.autoRotate = true 

    }
    updateCameraTarget(moveX, moveZ,moveY) {
        // move camera
        // this.camera.position.x += moveX
        // this.camera.position.z += moveZ
        // // this.camera.position.y += moveY
        // // if (this.camera.position.y<this.character.position.y+0.5){
        // //     this.camera.position.y=this.character.position.y+0.5
        // // }
        // // console.log(this.camera.position,this.character.position)
        // // update camera target
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