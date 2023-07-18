slider({
  gap: 8,
  minScale: 0.56,
  wheelSleep: 50, // Higher the number less slides will be scrolled (try 1000 to see difference)
  onSelectedSlide: function(splide) {

  },
  onPaginationReady: function(splide) {
    const pagination = document.querySelector(".pagination");

    pagination.addEventListener("click", function(e) {
      const isItem = e.target.classList.contains("pagination__item");

      if(isItem) splide.go(Number(e.target.getAttribute("data-slide")));
    });
  }
});

function slider(config) {
  const gap = !config.gap ? 8 : config.gap;
  const minScale = !config.minScale ? 0.56 : config.minScale;
  const startingTotalSlides = document.querySelectorAll(".splide__slide").length;

  generateArea();
  generateAdditionalSlides();
  generateSlider();

  animate();

  function generateSlider() {
    const options = {
      perPage: startingTotalSlides,
      perMove: 1,
      start: 27,
      wheelSleep: config.wheelSleep,
      arrows: false,
      pagination: false,
      gap: gap,
      wheel: true,
      trimSpace: false,
      focus: "center",
      type: "loop",
      drag: "free",
      snap: true,
      autoWidth: true,
    };
    const splide = new Splide(".splide", options);
    splide.on("mounted", generatePagination);
    splide.mount();

    if (typeof config.onSelectedSlide === "function") {
      config.onSelectedSlide(splide);
    }

    if (typeof config.onPaginationReady === "function") {
      config.onPaginationReady(splide);
    }

  }

  function animate() {
    const slider = document.querySelector(".splide");
    const slides = document.querySelectorAll(".splide__slide");
    const originalSlides = document.querySelectorAll(".splide__slide:not(.splide__slide--clone)");
    const track = document.querySelector(".splide__track");
    const area = document.querySelector(".area");
    const leftPositionArea = Number(area.getBoundingClientRect().left);
    const rightPositionArea = Number(area.getBoundingClientRect().right);
    const widthArea = Number(area.getBoundingClientRect().width);
    let startingGap = 0;
    

    slider.style.pointerEvents = "none";
    update();
    
    
    setTimeout(function() {
      const slideLeftInside = document.querySelectorAll(".splide__slide.inside")[0];
      const slideRightOutside = slideLeftInside.previousElementSibling;
      
      startingGap =  Math.abs(gap - (slideLeftInside.children[0].getBoundingClientRect().left - slideRightOutside.children[0].getBoundingClientRect().right));
      
      slider.style.pointerEvents = "inherit";
    }, 1000);

    function update() {
      const firstSlide = slides[originalSlides.length];
      const lastSlide = slides[originalSlides.length + originalSlides.length - 1];

      slides.forEach((slide, i) => {
        const widthSlide = Number(slide.getBoundingClientRect().width);
        const leftPositionSlide = Number(slide.getBoundingClientRect().left);
        const insideArea = widthSlide + leftPositionSlide > leftPositionArea && leftPositionSlide < rightPositionArea;

        const rightPositionTrack = track.getBoundingClientRect().right;

        const percent = progress(Number(leftPositionSlide.toFixed(0)), -1 * widthSlide + gap, rightPositionTrack - gap).toFixed(0);
        const scale = gsap.utils.clamp(minScale, 1, Math.abs(1 - percent * 0.01));
        const dir = getPositionRelativeToCenter(slide);
        
        if (insideArea) {

          const progress = progress_0_100(Number(leftPositionSlide), leftPositionArea, rightPositionArea - widthSlide).toFixed(0);
          
          
          let translateX = Math.abs(slide.children[0].getBoundingClientRect().width - slide.children[0].offsetWidth);
          if(!startingGap) translateX = (translateX * (rightPositionTrack / 750) * scale) * dir;
          else translateX = gsap.utils.clamp(-1 * (startingGap), (startingGap), ((translateX * (rightPositionTrack / 750) * scale) * dir));
          
          if(progress >= 48 && progress <= 52) slide.children[0].style.setProperty(`--translateX`, 0 + "px");
          else slide.children[0].style.setProperty(`--translateX`, translateX + "px");
          
          if(progress >= 35 && progress <= 65) {
            const slideNumber = parseInt(slide.getAttribute("aria-label"));
            const paginationItem = document.querySelectorAll(".pagination__item");
            const position = slideNumber % startingTotalSlides;
            const currentActivePagination = document.querySelector(".pagination__item.active");

            if(currentActivePagination) currentActivePagination.classList.remove("active");
            paginationItem[!position ? startingTotalSlides - 1 : position - 1].classList.add("active");

            slide.classList.add("active");
          } else {
            slide.classList.remove("active");
          }


          slide.classList.add("inside");
          slide.children[0].style.setProperty(`--scale`, scale);
          slide.children[0].style.zIndex = Math.round(scale * 10);

        } else {
          // Style all Elements which are NOT inside the area
          slide.classList.remove("inside");

          if(slide === lastSlide && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(firstSlide.previousElementSibling.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(firstSlide.previousElementSibling.children[0])) + "px");
          } else if(slide === lastSlide.nextElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(firstSlide.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(firstSlide.children[0])) + "px");
          } else if(slide === lastSlide.previousSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(firstSlide.previousElementSibling.previousElementSibling.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(firstSlide.previousElementSibling.previousElementSibling.children[0])) + "px");
          } else if(slide === lastSlide.nextElementSibling.nextElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(firstSlide.nextElementSibling.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(firstSlide.nextElementSibling.children[0])) + "px");
          } else if(slide === lastSlide.previousElementSibling.previousElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, -1 * (parseInt(getTranslateX(firstSlide.nextElementSibling.nextElementSibling.children[0]))) + "px");

          } else if(slide === lastSlide.previousElementSibling.previousElementSibling.previousElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, -1 * (parseInt(getTranslateX(firstSlide.nextElementSibling.nextElementSibling.children[0]))) + "px");

          } else if(slide === lastSlide.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, -1 * (parseInt(getTranslateX(firstSlide.nextElementSibling.nextElementSibling.children[0]))) + "px");

          } else if(slide === lastSlide.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, -1 * (parseInt(getTranslateX(firstSlide.nextElementSibling.nextElementSibling.children[0]))) + "px");

          } else if(slide === lastSlide.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, -1 * (parseInt(getTranslateX(firstSlide.nextElementSibling.nextElementSibling.children[0]))) + "px");

          } else if(slide === lastSlide.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling && firstSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, -1 * (parseInt(getTranslateX(firstSlide.nextElementSibling.nextElementSibling.children[0]))) + "px");

          } else if(slide === firstSlide && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(lastSlide.nextElementSibling.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(lastSlide.nextElementSibling.children[0])) + "px");
          } else if(slide === firstSlide.previousElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(lastSlide.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(lastSlide.children[0])) + "px");
          } else if(slide === firstSlide.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(lastSlide.nextElementSibling.nextElementSibling.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(lastSlide.nextElementSibling.nextElementSibling.children[0])) + "px");
          } else if(slide === firstSlide.previousElementSibling.previousElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--scale`, getScale(lastSlide.previousElementSibling.children[0]));
            slide.children[0].style.setProperty(`--translateX`, parseInt(getTranslateX(lastSlide.previousElementSibling.children[0])) + "px");
          } else if(slide === firstSlide.nextElementSibling.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, Math.abs((parseInt(getTranslateX(lastSlide.previousElementSibling.previousElementSibling.children[0])))) + "px");

          } else if(slide === firstSlide.nextElementSibling.nextElementSibling.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, Math.abs((parseInt(getTranslateX(lastSlide.previousElementSibling.previousElementSibling.children[0])))) + "px");

          } else if(slide === firstSlide.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, Math.abs((parseInt(getTranslateX(lastSlide.previousElementSibling.previousElementSibling.children[0])))) + "px");

          } else if(slide === firstSlide.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, Math.abs((parseInt(getTranslateX(lastSlide.previousElementSibling.previousElementSibling.children[0])))) + "px");

          } else if(slide === firstSlide.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, Math.abs((parseInt(getTranslateX(lastSlide.previousElementSibling.previousElementSibling.children[0])))) + "px");

          } else if(slide === firstSlide.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling && lastSlide.classList.contains("inside")) {
            slide.children[0].style.setProperty(`--translateX`, Math.abs((parseInt(getTranslateX(lastSlide.previousElementSibling.previousElementSibling.children[0])))) + "px");

          } else {

            slide.children[0].style.zIndex = -1;
            slide.children[0].style.setProperty(`--scale`, minScale);
            slide.children[0].style.setProperty(`--translateX`, ((startingGap * dir)) + "px");
          }
          
        }
        
      });
        requestAnimationFrame(update);
    }
  }

  function generateAdditionalSlides() {
    const slides = document.querySelectorAll(".splide__slide");
    const list = document.querySelector(".splide__list");
    for (let i = 0; i < 4; i++) {
      slides.forEach((slide) => {
        const clone = slide.cloneNode(true);
        list.appendChild(clone);
      });
    }
  }

  function getPositionRelativeToCenter(element) {
    const elementRect = element.getBoundingClientRect();
    const centerPosition = window.innerWidth / 2;
    if (elementRect.left + elementRect.width / 2 < centerPosition) {
      return -1; // Element is to the left of the center.
    } else {
      return 1; // Element is to the right of the center.
    }
  }

  function generateArea() {
    const area = document.createElement("div");
    const slides = document.querySelectorAll(".splide__slide");
    const slideWidth = parseInt(getComputedStyle(slides[0]).getPropertyValue("--min-w"));
    area.style.width = slideWidth * 3 + gap * 2 + "px";
    area.classList.add("area");
    document.body.appendChild(area);
  }

  function getScale(el) {
    return getComputedStyle(el).getPropertyValue("--scale");
  }

  function getTranslateX(el) {
    return getComputedStyle(el).getPropertyValue("--translateX");
  }

  function progress(value, min, max) {
    const midpoint = (min + max) / 2;
    if (value <= midpoint) {
      return 100 - ((value - min) / (midpoint - min)) * 100;
    } else {
      return ((value - midpoint) / (max - midpoint)) * 100;
    }
  }

  function progress_0_100(val, min, max) {
    return ((val - min) / (max - min)) * 100;
  }

  function generatePagination() {
    const pagination = document.createElement("div");
    pagination.classList.add("pagination");
    
    for (let i = 0; i < startingTotalSlides; i++) {
      const item = document.createElement("div");
      item.classList.add("pagination__item");
      item.setAttribute("data-slide", i);
      
      pagination.appendChild(item);
    }
    
    document.querySelector("section").appendChild(pagination); // <= Parent need to be changed when moving script on Webflow
  }
}
