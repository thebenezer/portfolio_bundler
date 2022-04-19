import { gsap } from 'gsap'

const hamburger = document.querySelector('.hamburger');
const line1 = document.querySelector('.line1');
const line2 = document.querySelector('.line2');
const line3 = document.querySelector('.line3');

hamburger.addEventListener('click',()=>{
    if(line1.classList.contains('close')){
        gsap.to('nav',{duration:0.5,scaleX:0})
    }
    else
      gsap.to('nav',{duration:0.5,scaleX:1})

    line1.classList.toggle('close');
    line2.classList.toggle('close');
    line3.classList.toggle('close');
    // cta.classList.toggle('fade');
    // navlinks.forEach(link =>{
    //     link.classList.toggle('fade');
    // });
});
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
