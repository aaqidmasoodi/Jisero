// iOS PWA Splash Screen Configuration
const iosSplashScreens = [
  // iPhone SE (1st gen)
  {
    media: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
  },
  {
    media: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
  },
  
  // iPhone 6/7/8
  {
    media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
  },
  {
    media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
  },
  
  // iPhone 6/7/8 Plus
  {
    media: "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
  },
  {
    media: "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
  },
  
  // iPhone X/XS/11 Pro
  {
    media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
  },
  {
    media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
  },
  
  // iPhone XR/11
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/iPhone_11__iPhone_XR_portrait.png"
  },
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/iPhone_11__iPhone_XR_landscape.png"
  },
  
  // iPhone XS Max/11 Pro Max
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
  },
  {
    media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
  },
  
  // iPhone 12/13/14
  {
    media: "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
  },
  {
    media: "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
  },
  
  // iPhone 14 Pro / 15 Pro / 16 Pro
  {
    media: "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
  },
  {
    media: "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"
  },
  
  // iPhone 12/13/14 Pro Max
  {
    media: "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
  },
  {
    media: "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
  },
  
  // iPhone 14 Pro Max / 15 Pro Max / 16 Pro Max
  {
    media: "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
  },
  {
    media: "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"
  },
  
  // iPhone 16 Pro
  {
    media: "screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_16_Pro_portrait.png"
  },
  {
    media: "screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_16_Pro_landscape.png"
  },
  
  // iPhone 16 Pro Max
  {
    media: "screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    href: "/splash/iPhone_16_Pro_Max_portrait.png"
  },
  {
    media: "screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    href: "/splash/iPhone_16_Pro_Max_landscape.png"
  },
  
  // iPad
  {
    media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
  },
  {
    media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"
  },
  
  // iPad 10.2"
  {
    media: "screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/10.2__iPad_portrait.png"
  },
  {
    media: "screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/10.2__iPad_landscape.png"
  },
  
  // iPad Air 10.5"
  {
    media: "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/10.5__iPad_Air_portrait.png"
  },
  {
    media: "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/10.5__iPad_Air_landscape.png"
  },
  
  // iPad Air 10.9"
  {
    media: "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/10.9__iPad_Air_portrait.png"
  },
  {
    media: "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/10.9__iPad_Air_landscape.png"
  },
  
  // iPad Mini 8.3"
  {
    media: "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/8.3__iPad_Mini_portrait.png"
  },
  {
    media: "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/8.3__iPad_Mini_landscape.png"
  },
  
  // iPad Pro 11"
  {
    media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
  },
  {
    media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/11__iPad_Pro__10.5__iPad_Pro_landscape.png"
  },
  
  // iPad Pro 11" M4
  {
    media: "screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/11__iPad_Pro_M4_portrait.png"
  },
  {
    media: "screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/11__iPad_Pro_M4_landscape.png"
  },
  
  // iPad Pro 12.9"
  {
    media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/12.9__iPad_Pro_portrait.png"
  },
  {
    media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/12.9__iPad_Pro_landscape.png"
  },
  
  // iPad Pro 13" M4
  {
    media: "screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    href: "/splash/13__iPad_Pro_M4_portrait.png"
  },
  {
    media: "screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    href: "/splash/13__iPad_Pro_M4_landscape.png"
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
