import ControllerTouchInput from './touchInput'

export default class CharacterInput {
    constructor() {
        this._Init();    
    }
  
    _Init() {
        this._inputTouch=new ControllerTouchInput();    
        this.keysPressed = {ArrowUp:false,ArrowDown:false,ArrowLeft:false,ArrowRight:false, ' ':false};
        this.shiftToggle=false;
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

        if (this.keysPressed['ArrowDown']) {
            if (this.keysPressed['ArrowRight']) {
                directionOffset  = Math.PI / 4 
            } else if (this.keysPressed['ArrowLeft']) {
                directionOffset = - Math.PI / 4 
            }
        } else if (this.keysPressed['ArrowUp']) {
            if (this.keysPressed['ArrowRight']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 
            } else if (this.keysPressed['ArrowLeft']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 
            } else {
                directionOffset = Math.PI 
            }
        } else if (this.keysPressed['ArrowRight']) {
            directionOffset = Math.PI / 2 
        } else if (this.keysPressed['ArrowLeft']) {
            directionOffset = - Math.PI / 2 
        }

        return directionOffset
    }
    _onKeyDown(e){
        this.shiftToggle=e.shiftKey;
        // if(e.key == ' '){
        //     this.keysPressed[e.key]=true
        // }
        if (e.key in this.keysPressed){
            this.keysPressed[e.key]=true;
        }
        // e.preventDefault();
        // switch (e.key) {
        //     case 'ArrowUp': // w
        //         this.keysPressed[e.key] = true;
        //         break;
        //     case 'ArrowDown': // a
        //         this.keysPressed[e.key] = true;
        //         break;
        //     case 'ArrowRight': // s
        //         this.keysPressed[e.key] = true;
        //         break;
        //     case 'ArrowLeft': // d
        //         this.keysPressed[e.key] = true;
        //         break;
        //     case ' ': // SPACE
        //         this.keysPressed[e.key]=true
        //         break;
        //     case 'Shift': // SHIFT
        //     this.shiftToggle = true;
        //     break;
        // }
    }
    _onKeyUp(e){
        this.shiftToggle=e.shiftKey;
        if (e.key in this.keysPressed){
            this.keysPressed[e.key]=false;
        }
        // switch (e.key) {
        //     case 'ArrowUp': // w
        //         this.keysPressed[e.key] = false;
        //         break;
        //     case 'ArrowDown': // a
        //         this.keysPressed[e.key] = false;
        //         break;
        //     case 'ArrowRight': // s
        //         this.keysPressed[e.key] = false;
        //         break;
        //     case 'ArrowLeft': // d
        //         this.keysPressed[e.key] = false;
        //         break;
        //     case ' ': // SPACE
        //         this.keysPressed[e.key]=false
        //         break;
        //     case 'Shift': // SHIFT
        //     this.shiftToggle = false;
        //     break;
        // }
    }


  };