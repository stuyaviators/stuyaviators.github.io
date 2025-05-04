// fadeIntro.js
function runFadeIn() {
    const main = document.getElementById("main");
    if (main) {
      main.classList.add("fade");
      requestAnimationFrame(() => {
        main.classList.add("fade-in");
      });
    }
  }
  
  window.runFadeIn = runFadeIn;
  