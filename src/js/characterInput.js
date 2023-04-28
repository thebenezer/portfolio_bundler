import ControllerTouchInput from './touchInput'
import * as THREE from 'three';
const DIRECTIONS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                    'w','a','s','d'];

export default class CharacterInput {
    constructor() {
        this._Init();    
    }
  
    _Init() {
        this._inputTouch=new ControllerTouchInput();    
        this.keysPressed = {ArrowUp:false,ArrowDown:false,ArrowLeft:false,ArrowRight:false, ' ':false,w:false,a:false,s:false,d:false};
        this.shiftToggle=false;
        this.clock = new THREE.Clock();
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }
    _directionOffset() {
        if(this._inputTouch.touchInputToggle){
            // console.log(this._inputTouch.dir)
            return this._inputTouch.dir
        }

        // Keyboard Controls
        var directionOffset = 0 // w

        if (this.keysPressed['ArrowDown']||this.keysPressed['s']) {
            if (this.keysPressed['ArrowRight']||this.keysPressed['d']) {
                directionOffset  = Math.PI / 4 
            } else if (this.keysPressed['ArrowLeft']||this.keysPressed['a']) {
                directionOffset = - Math.PI / 4 
            }
        } else if (this.keysPressed['ArrowUp']||this.keysPressed['w']) {
            if (this.keysPressed['ArrowRight']||this.keysPressed['d']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 
            } else if (this.keysPressed['ArrowLeft']||this.keysPressed['a']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 
            } else {
                directionOffset = Math.PI 
            }
        } else if (this.keysPressed['ArrowRight']||this.keysPressed['d']) {
            directionOffset = Math.PI / 2 
        } else if (this.keysPressed['ArrowLeft']||this.keysPressed['a']) {
            directionOffset = - Math.PI / 2 
        }

        return directionOffset
    }


    _onKeyDown(e){
        this.shiftToggle=e.shiftKey;
        if(e.key == ' '){
            this.keysPressed[e.key]=true
        }
        if (e.key in this.keysPressed){
            this.keysPressed[e.key]=true;
            if (!this.clock.running) {
                this.clock.start()
            }
            // console.log(this.clock)
        }
    }
    _onKeyUp(e){
        this.shiftToggle=e.shiftKey;
        if (e.key in this.keysPressed){
            this.keysPressed[e.key]=false;
            if(DIRECTIONS.every(key => this.keysPressed[key] == false)){
                this.clock.stop()
            }
        }
        }


  };