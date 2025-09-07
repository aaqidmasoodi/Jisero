// iOS PWA Splash Screen Configuration
const iosSplashScreens = [
  // iPhone SE (1st gen)
  {
    media: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/640x1136.png"
  },
  {
    media: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/1136x640.png"
  },
  
  // iPhone 6/7/8
  {
    media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/750x1334.png"
  },
  {
    media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/1334x750.png"
  },
  
  // iPhone 6/7/8 Plus
  {
    media: "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1242x2208.png"
  },
  {
    media: "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2208x1242.png"
  },
  
  // iPhone X/XS/11 Pro
  {
    media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1125x2436.png"
  },
  {
    media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2436x1125.png"
  },
  
  // iPhone XR/11
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/828x1792.png"
  },
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/1792x828.png"
  },
  
  // iPhone XS Max/11 Pro Max
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1242x2688.png"
  },
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2688x1242.png"
  },
  
  // iPhone 12/13/14
  {
    media: "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1170x2532.png"
  },
  {
    media: "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2532x1170.png"
  },
  
  // iPhone 14 Pro / 15 Pro
  {
    media: "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1179x2556.png"
  },
  {
    media: "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2556x1179.png"
  },
  
  // iPhone 12/13/14 Pro Max
  {
    media: "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1284x2778.png"
  },
  {
    media: "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2778x1284.png"
  },
  
  // iPhone 14 Pro Max / 15 Pro Max
  {
    media: "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/1290x2796.png"
  },
  {
    media: "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/2796x1290.png"
  },
  
  // iPad
  {
    media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/1536x2048.png"
  },
  {
    media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/2048x1536.png"
  },
  
  // iPad Pro 11"
  {
    media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/1668x2388.png"
  },
  {
    media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/2388x1668.png"
  },
  
  // iPad Air
  {
    media: "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/1668x2224.png"
  },
  {
    media: "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/2224x1668.png"
  },
  
  // iPad Pro 12.9"
  {
    media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/2048x2732.png"
  },
  {
    media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/2732x2048.png"
  }
];

// Function to inject splash screen link tags
function loadIOSSplashScreens() {
  const head = document.head;
  
  iosSplashScreens.forEach(splash => {
    const link = document.createElement('link');
    link.rel = 'apple-touch-startup-image';
    link.media = splash.media;
    link.href = splash.href;
    head.appendChild(link);
  });
}

// Auto-load when script is included
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadIOSSplashScreens);
} else {
  loadIOSSplashScreens();
}
