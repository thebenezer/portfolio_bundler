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
  toggleMovement(evt,data) {
    this.joystickDOM.classList.remove('highlight')
    this.touchInputToggle=!this.touchInputToggle
  }
  modifyDir(evt,data){
    this.joystickDOM.classList.add('highlight')
    this.dir=data.angle.radian+Math.PI/2
    if(data.distance>40){
      this.touchRun=true
    }
    else{
      this.touchRun=false
    }
  }

  _setupEventListeners(){
    this.jumpButton.addEventListener('touchstart',()=>{
      this.touchJump=!this.touchJump;
      this.jumpButton.classList.add('highlight')
    },false);
    this.jumpButton.addEventListener('touchend',()=>{
      this.jumpButton.classList.remove('highlight')
    },false);
    // this.interractButton.addEventListener('click',()=>{
      // console.log('select')
      // this.touchJump=true;
    // },false);
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
