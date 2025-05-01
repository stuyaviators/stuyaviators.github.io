// fadeIntro.js
function runFadeIn() {
    document.body.classList.add("fade");
    requestAnimationFrame(() => {
      document.body.classList.add("fade-in");
    });
  }
  
  // Expose globally so main.js can call it
  window.runFadeIn = runFadeIn;
  