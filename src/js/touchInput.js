// alert('hi');
import nipplejs from 'nipplejs';

export default class ControllerTouchInput {
  constructor() {
    this.joystickDOM = document.getElementById('zone_joystick');
    this.interractButton= document.getElementById('interractButton');
    // this.runButton= document.getElementById('runButton');
    this.jumpButton= document.getElementById('jumpButton');
    this.touchRun=this.touchJump=this.touchInputToggle=false
    this.dir=0
    // CommonJS
    this.joystick = nipplejs.create({
        zone: this.joystickDOM,                  // active zone
        color: '#ffffff',
        size: 100,
        threshold: 0.1,               // before triggering a directional event
        fadeTime: 500,              // transition time
        multitouch: false,
        maxNumberOfNipples: 1,     // when multitouch, what is too many?
        // dataOnly: Boolean,              // no dom element whatsoever
        position: {
            left: '50%',
            top: '50%'
        },               // preset position for 'static' mode
        mode: 'static',                   // 'dynamic', 'static' or 'semi'
        restJoystick: true,   // Re-center joystick on rest state
        restOpacity: 0.5,            // opacity when not 'dynamic' and rested
        // lockX: Boolean,                 // only move on the X axis
        // lockY: Boolean,                 // only move on the Y axis
        // catchDistance: Number,          // distance to recycle previous joystick in
                                        // 'semi' mode
        shape: 'circle',                  // 'circle' or 'square'
        // dynamicPage: Boolean,           // Enable if the page has dynamically visible elements
        // follow: true,                // Makes the joystick follow the thumbstick
    });
    this._bindNipple();
    this._setupEventListeners();
  }
  _bindNipple() {
    this.joystick.on('start end', (evt, data)=>this.toggleMovement(evt,data));
    this.joystick.on('move',(evt,data)=>this.modifyDir(evt,data));
  }
  modifyDir(evt,data){
    // data.direction.x=
    this.dir=data.angle.radian+Math.PI/2
    // console.log(data.distance);
    if(data.distance>40){
      this.touchRun=true
    }
    else{
      this.touchRun=false

    }
    // return this.dir
  }
  toggleMovement(evt,data) {
    // console.log(evt)
    this.touchInputToggle=!this.touchInputToggle
    // console.log(this.touchInputToggle)
    // console.log
    // switch(evt.type){
    //   // case 'start':keysPressed['ArrowUp']=true;break;
    //   // case 'end':keysPressed['ArrowUp']=false;break;
    // }
    // keysPressed['ArrowUp']
  }
  _setupEventListeners(){
    this.jumpButton.addEventListener('touchstart',()=>{
      this.touchJump=!this.touchJump;
    });
    this.interractButton.addEventListener('click',()=>{
      console.log('select')
      // this.touchJump=true;
    });
    // this.runButton.addEventListener('touchstart',(e)=>{
    //   // this.shifttoggle=true;
    //   e.preventDefault();

    //   // console.log('run')
    //   this.runButton.style.borderColor='blue'
    //   this.touchRun=!this.touchRun
    // });
    // this.runButton.addEventListener('touchend',(e)=>{
    //   // this.shifttoggle=true;
    //   e.preventDefault();

    //   // console.log('run')
    //   this.runButton.style.borderColor='red'
    //   this.touchRun=!this.touchRun
    // });
  }


}
