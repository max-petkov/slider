slider({
  gap: 16,
});

function slider(config) {
  const gap = !config.gap ? 16 : config.gap;

  generateArea();
  generateAdditionalSlides();
  generateSlider();

  function generateSlider() {
    let animationFrame = null;

    const options = {
      perPage: 9,
      perMove: 1,
      start: 18,
      wheelSleep: 100,
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
    splide.mount();

    // Animation
    const slides = document.querySelectorAll(".splide__slide");
    const originalSlides = document.querySelectorAll(
      ".splide__slide:not(.splide__slide--clone)"
    );
    const track = document.querySelector(".splide__track");
    const area = document.querySelector(".area");
    const leftPositionArea = Number(area.getBoundingClientRect().left);
    const rightPositionArea = Number(area.getBoundingClientRect().right);

    animate();

    function animate() {
      const firstSlide = slides[originalSlides.length];
      const lastSlide = slides[originalSlides.length + originalSlides.length - 1];


      slides.forEach((slide, i) => {
        const widthSlide = Number(slide.getBoundingClientRect().width);
        const leftPositionSlide = Number(slide.getBoundingClientRect().left);
        const insideArea =
          widthSlide + leftPositionSlide > leftPositionArea &&
          leftPositionSlide < rightPositionArea;
        const rightPositionTrack = track.getBoundingClientRect().right;
        const percent = progress(
          Number(leftPositionSlide.toFixed(0)),
          -1 * widthSlide + gap,
          rightPositionTrack - gap
        ).toFixed(0);

        const scale = gsap.utils.clamp(0.6, 1, Math.abs(1 - percent * 0.01));
        const dir = getPositionRelativeToCenter(slide);
        const translateX = Number(percent) * dir;

        const scaleXValue = scale;
        const translateXValue = (translateX * scale) / 0.19;

        if (insideArea) {
          // Style Elements which are inside the area

          slide.children[0].style.setProperty(`--translateX`, translateXValue + "px");
          slide.children[0].style.setProperty(`--scale`, scaleXValue);
          slide.classList.add("inside");
        
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
          } else {
            slide.children[0].style.setProperty(`--scale`, 0.6);
            slide.children[0].style.setProperty(`--translateX`, (120 * dir) + "px");
          }
        }
      });

        requestAnimationFrame(animate);
    }
  }

  function generateAdditionalSlides() {
    const slides = document.querySelectorAll(".splide__slide");
    const list = document.querySelector(".splide__list");

    for (let i = 0; i < 3; i++) {
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
    const slideWidth = parseInt(
      getComputedStyle(slides[0]).getPropertyValue("--min-w")
    );

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

  function calculateGap(scale, minGap, maxGap) {
    return minGap + (1 - scale) * (maxGap - minGap);
  }

  function progress(value, min, max) {
    // 🚀 it will return values from 100 to 0 to 100
    const midpoint = (min + max) / 2;
    if (value <= midpoint) {
      return 100 - ((value - min) / (midpoint - min)) * 100;
    } else {
      return ((value - midpoint) / (max - midpoint)) * 100;
    }
  }

  function direction(value, min, max) {
    const midpoint = (min + max) / 2;
    if (value <= midpoint) {
      return 2 * ((value - midpoint) / (max - midpoint)) - 1;
    } else {
      return -1 + 2 * ((value - min) / (midpoint - min));
    }
  }

  function exec(cb) {
    const start = performance.now();
    cb();
    const end = performance.now();
    console.log(end - start, "ms");
  }
}
