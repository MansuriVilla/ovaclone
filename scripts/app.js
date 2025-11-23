document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  initSplitText();
  initSlider();
  initAbout();
});

function initAbout() {
  const section = document.querySelector(".about");
  const wrappers = document.querySelectorAll(".about_content-wrapper");
  const bgImage = document.querySelector(".about_background img");

  if (!section || wrappers.length === 0) return;

  // Set initial state
  gsap.set(wrappers, { opacity: 0, visibility: "hidden" });
  gsap.set(wrappers[0], { opacity: 1, visibility: "visible" });

  // Create main timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=" + wrappers.length * 400 + "%", // Increased duration to slow down
      pin: true,
      scrub: 1, // Added smoothing
    },
  });

  // Image Scale Animation
  tl.to(
    bgImage,
    {
      scale: 1.5,
      ease: "none",
      duration: wrappers.length,
    },
    0
  );

  // Content Switching & Text Animation
  wrappers.forEach((wrapper, i) => {
    const h2 = wrapper.querySelector("h2");
    const p = wrapper.querySelector("p");

    // Split Text Manually
    let h2Chars = [];
    let pLines = [];

    if (h2) {
      const splitH2 = new SplitText(h2, { type: "chars" });
      h2Chars = splitH2.chars;
    }

    if (p) {
      const splitP = new SplitText(p, { type: "lines" });
      // Wrap lines for mask effect
      splitP.lines.forEach((line) => {
        const wrapperDiv = document.createElement("div");
        wrapperDiv.style.overflow = "hidden";
        wrapperDiv.style.display = "block";
        line.parentNode.insertBefore(wrapperDiv, line);
        wrapperDiv.appendChild(line);
      });
      pLines = splitP.lines;
    }

    // Entrance Animation
    const startTime = i;

    if (i > 0) {
      tl.fromTo(
        wrapper,
        { opacity: 0, visibility: "hidden" },
        { opacity: 1, visibility: "visible", duration: 0.5 },
        startTime - 0.5
      );

      // Text Animations (Only for subsequent slides)
      if (h2Chars.length > 0) {
        tl.from(
          h2Chars,
          {
            opacity: 0,
            stagger: {
              from: "end",
              each: 0.05,
            },

            duration: 0.2,
            ease: "power2.out",
          },
          startTime
        );
      }

      if (pLines.length > 0) {
        tl.from(
          pLines,
          {
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            duration: 0.2,
            ease: "power2.out",
          },
          startTime
        );
      }
    }

    // Exit Animation
    if (i < wrappers.length - 1) {
      tl.to(
        wrapper,
        { opacity: 0, visibility: "hidden", duration: 0.5 },
        startTime + 0.5
      );
    }
  });
}
function initSlider() {
  const slides = document.querySelectorAll(".slide-bg");
  const contentSlides = document.querySelectorAll(".slide-content");
  const totalSlides = slides.length;
  const progressWrapper = document.querySelector(".progress_bar");
  const progressBar = document.querySelector(".progress");
  const indexItems = document.querySelectorAll(".index_item");

  if (totalSlides === 0) return;

  // Set initial state
  contentSlides[0].classList.add("active");
  if (indexItems[0]) indexItems[0].classList.add("active");

  // Set initial state for index items to be hidden
  gsap.set(indexItems, { x: 50, opacity: 0 });

  // Set initial state for slides (GSAP)
  gsap.set(slides, { scale: 1.1, opacity: 0 });
  gsap.set(slides[0], { scale: 1, opacity: 1 });
  slides[0].classList.add("active");

  // Animation functions
  const animateIndexIn = () => {
    gsap.to([indexItems, progressWrapper], {
      x: 0,
      opacity: 1,
      duration: 0.3,
      stagger: 0.1,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const animateIndexOut = () => {
    gsap.to([indexItems, progressWrapper], {
      x: 50,
      opacity: 0,
      duration: 0.3,
      stagger: {
        each: 0.1,
        from: "end", // Animate from last to first
      },
      ease: "power2.in",
      overwrite: true,
    });
  };

  // Trigger for Index Items Animation
  ScrollTrigger.create({
    trigger: ".portfolio",
    start: "top 60%",
    onEnter: animateIndexIn,
    onLeaveBack: animateIndexOut,
  });

  ScrollTrigger.create({
    trigger: ".portfolio",
    start: "top top",
    end: "+=" + totalSlides * 100 + "%",
    pin: true,
    scrub: true,
    onLeave: animateIndexOut,
    onEnterBack: animateIndexIn,
    onUpdate: (self) => {
      const progress = self.progress;
      gsap.to(progressBar, {
        height: progress * 100 + "%",
        duration: 0.1,
        ease: "none",
      });
      const slideIndex = Math.floor(progress * (totalSlides - 1) + 0.5);
      slides.forEach((slide, i) => {
        if (i === slideIndex) {
          if (!slide.classList.contains("active")) {
            slide.classList.add("active");

            // GSAP Animation for active slide
            gsap.fromTo(
              slide,
              { scale: 1.1, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                overwrite: true,
              }
            );

            contentSlides[i].classList.add("active");
            if (indexItems[i]) indexItems[i].classList.add("active");

            const splitElements =
              contentSlides[i].querySelectorAll("[data-split]");
            splitElements.forEach((el) => {
              const lines = el.querySelectorAll("div");
              if (lines.length > 0) {
                gsap.fromTo(
                  lines,
                  { yPercent: 100, opacity: 0 },
                  {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out",
                    overwrite: true,
                  }
                );
              }
            });
          }
        } else {
          if (slide.classList.contains("active")) {
            slide.classList.remove("active");

            // GSAP Animation for inactive slide
            gsap.to(slide, {
              opacity: 0,
              duration: 1,
              ease: "power2.out",
              overwrite: true,
            });

            contentSlides[i].classList.remove("active");
            if (indexItems[i]) indexItems[i].classList.remove("active");
          }
        }
      });
    },
  });
}

function initSplitText() {
  // Ignore elements inside .about as they are handled by initAbout
  const splitElements = document.querySelectorAll("[data-split]:not(.about *)");

  splitElements.forEach((element) => {
    const type = element.getAttribute("data-split");
    let splitType = "lines, words, chars"; // Default to all
    let animationProps = {};

    // Determine split type and animation properties based on data-split attribute
    if (type === "words") {
      splitType = "words";
      animationProps = {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
      };
    } else if (type === "lines") {
      splitType = "lines";
      // Animation props will be set after wrapping
    } else if (type === "chars") {
      splitType = "chars";
      animationProps = {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.02,
        ease: "back.out(1.7)",
      };
    } else if (type === "lettersmix") {
      splitType = "chars";
      // Simple entrance for lettersmix
      animationProps = {
        opacity: 0,
        duration: 2,
        stagger: 0.05,
        ease: "power2.out",
      };
    }

    const split = new SplitText(element, { type: splitType });
    const target =
      split[splitType] || split.chars || split.words || split.lines; // Fallback to whatever was split

    // Special handling for lines mask effect
    if (type === "lines") {
      split.lines.forEach((line) => {
        const wrapper = document.createElement("div");
        wrapper.style.overflow = "hidden";
        wrapper.style.display = "block"; // Ensure it takes up space

        // Insert wrapper before line
        line.parentNode.insertBefore(wrapper, line);
        // Move line into wrapper
        wrapper.appendChild(line);
      });

      animationProps = {
        yPercent: 100,
        opacity: 1, // Ensure it's visible so we see it sliding up (clipped by wrapper)
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      };
    }

    // Create the entrance animation
    const anim = gsap.from(target, {
      ...animationProps,
      paused: true, // Create it paused, ScrollTrigger will control it
    });

    // Create ScrollTrigger
    ScrollTrigger.create({
      trigger: element,
      start: "top 90%", // Adjust as needed
      animation: anim,
    });

    // Special handling for lettersmix hover effect
    if (type === "lettersmix" && split.chars) {
      const chars = split.chars;
      const originalChars = chars.map((c) => c.innerText);
      const randomChars = "ABC!@#$%^&*()<>{}[]";

      element.addEventListener("mouseenter", () => {
        chars.forEach((char, index) => {
          const original = originalChars[index];
          // Kill any existing tweens on this char to prevent conflicts
          gsap.killTweensOf(char);

          // Create a dummy object to tween for timing
          let obj = { val: 0 };
          let frameCount = 0;

          gsap.to(obj, {
            val: 1,
            duration: 0.2,
            ease: "none",
            onUpdate: () => {
              frameCount++;
              if (frameCount % 2 === 0) {
                char.innerText =
                  randomChars[Math.floor(Math.random() * randomChars.length)];
              }
            },
            onComplete: () => {
              char.innerText = original;
            },
          });
        });
      });
    }
  });
}
