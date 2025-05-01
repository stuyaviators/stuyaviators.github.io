// main.js

const scriptList = [
    '/js/custom/headerFooter.js',
    // Add more as needed
  ];
  
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(src);
      s.onerror = () => reject(`Failed: ${src}`);
      document.head.appendChild(s);
    });
  }
  
  (async () => {
    for (const script of scriptList) {
      try {
        await loadScript(script);
        console.log(`Loaded ${script}`);
      } catch (e) {
        console.error(e);
      }
    }
  })();
  