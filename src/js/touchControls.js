// alert('hi');
import nipplejs from 'nipplejs';

// CommonJS
var joystick = nipplejs.create({
    zone: joystickDOM,                  // active zone
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
bindNipple();
function bindNipple() {
    joystick.on('start end', function(evt, data) {
      console.log(evt)
      switch(evt.type){
        case 'start':keysPressed['ArrowUp']=true;break;
        case 'end':keysPressed['ArrowUp']=false;break;
      }
      // keysPressed['ArrowUp']
    }).on('move',function(evt, data){
        // data.direction.x=
        console.log(data);

    });
  }

// let joystick = nipplejs.create(manager);

// var joysticks = {
//       zone: joystickDOM,
//       mode: 'static',
//       position: {
//         left: '100px',
//         top: '100px'
//       },
//       color: 'blue'
//   };
//   var joystick;
// //   createNipple('static');
//   joystick = nipplejs.create(joysticks);
  