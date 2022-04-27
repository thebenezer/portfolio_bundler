import { gsap } from 'gsap'

const music = new Audio(require('../assets/sounds/MistintheMorning.mp3'));
const selectMenuSound = new Audio(require('../assets/sounds/mainselectsound.wav'));
const selectItemSound = new Audio(require('../assets/sounds/itemselectsound.wav'));
selectItemSound.volume=1
var isPlayingMusic =false;


const equilizer = document.querySelector('.equilizer');
const bars = document.querySelectorAll('.bar');
equilizer.addEventListener('click',()=>{
    selectItemSound.play()
    bars.forEach(bar => {
        bar.classList.toggle('animate')
    });
    //toggleMusic
    if(!isPlayingMusic){
        music.play();
        // gsap.to(music,{volume:0.5, duration:1})
        music.loop =true;
        music.playbackRate = 1;
        isPlayingMusic =true;
    }
    else{
        // gsap.to(music,{volume:0, duration:1})
        // gsap.delayedCall(2,()=>{
            music.pause();
        // })
        isPlayingMusic =false;
    }
    
})

const hamburger = document.querySelector('.hamburger');
const line1 = document.querySelector('.line1');
const line2 = document.querySelector('.line2');
const line3 = document.querySelector('.line3');

const navitems=document.querySelectorAll('.navitem');
const timeline=gsap.timeline();
timeline.pause()
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
    // const selectItemSound2 = new Audio(require('../assets/sounds/itemselectsound.wav'));
    selectItemSound.play()
    console.log('hi')
})})

if(isMobileTablet()){
    document.getElementById('zone_joystick').style.display='flex'; 
    document.getElementById('interractButton').style.display='block'; 
    document.getElementById('jumpButton').style.display='block'; 
}
function isMobileTablet(){
    var check = false;
    (function(a){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) 
            check = true;
    })(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}
// let openBook_cont= document.querySelector(".bookIMG_container");
// let openBookImg= document.querySelector(".openBookImg");
// let closeBook= document.querySelector(".closeBook");
// let books= document.querySelectorAll(".book");
// books.forEach(open => {
//         open.addEventListener( 'click', openBook, false );
//     });
// closeBook.addEventListener( 'click', ()=>{
//     gsap.to(openBookImg,{scaleX:0,duration:0.25});
//     gsap.to(openBook_cont,{zIndex:-1,duration:0.5});
// }, false );


// function openBook(){
//     gsap.to(openBook_cont,{zIndex:5,duration:0});
//     gsap.to(openBookImg,{scaleX:1,duration:0.5});
// }
// var slides = document.querySelectorAll(".box");
// var navPrev = document.querySelector(".go-prev");
// var navNext = document.querySelector(".go-next");
// var slidesNum = slides.length;
// // console.log(slidesNum)
// var isAnimating = false;
// init();

// function init() {
// 	gsap.set(slides, {
// 		left: "-100%"
// 	});
// 	navPrev.addEventListener("click", gotoPrevSlide);
// 	navNext.addEventListener("click", gotoNextSlide);
// 	gotoSlide(0, 0,'next');
// }

// function gotoPrevSlide() {
// 	var slideToGo = currentSlideID - 1;
// 	if (slideToGo <= -1) {
// 		slideToGo = slidesNum - 1;
// 	}
// 	// stopAutoPlay();
// 	gotoSlide(slideToGo, 0.5, "prev");
// }

// function gotoNextSlide() {
// 	var slideToGo = currentSlideID + 1;
// 	if (slideToGo >= slidesNum) {
// 		slideToGo = 0;
// 	}
// 	// stopAutoPlay();
// 	gotoSlide(slideToGo, 0.5, "next");
// }

// function gotoSlide(slideID, _time, _direction) {
//     console.log(currentSlideID)
// 	if (!isAnimating) {
// 		isAnimating = true;
// 		prevSlideID = currentSlideID;
// 		currentSlideID = slideID;
// 		var prevSlide = slides[prevSlideID];
// 		var currentSlide = slides[currentSlideID];
// 		if (_direction == "next") {
// 			gsap.to(prevSlide, {
//                 duration:_time,
// 				left: "-100%"
// 			});
// 			gsap.fromTo(currentSlide, {
//                 duration:_time,
// 				left: "100%"
// 			}, {
//                 duration:_time,
// 				left: "0"
// 			});
// 		} else {
// 			gsap.to(prevSlide, {
//                 duration:_time,
// 				left: "100%"
// 			});
// 			gsap.fromTo(currentSlide, {
//                 duration:_time,
// 				left: "-100%"
// 			}, {
//                 duration:_time,
// 				left: "0"
// 			});
// 		}
// 		gsap.delayedCall(_time, function() {
// 			isAnimating = false;
// 		});
// 	}
// }
