const { useState, useEffect } = React;

const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Use visualViewport API to detect keyboard without interfering with browser behavior
    if (!window.visualViewport) {
      return; // Don't use fallback - let browser handle naturally
    }

    const initialHeight = window.visualViewport.height;

    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      const currentHeight = viewport.height;
      const heightDiff = initialHeight - currentHeight;

      if (heightDiff > 150) { // Keyboard is visible
        setKeyboardHeight(heightDiff);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.visualViewport.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
};

window.useKeyboardHeight = useKeyboardHeight;
