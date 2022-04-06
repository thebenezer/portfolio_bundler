// import { gsap } from 'gsap'

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
