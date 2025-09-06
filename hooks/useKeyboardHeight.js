const { useState, useEffect } = React;

const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Check if visualViewport is supported
    if (!window.visualViewport) {
      // Fallback for older browsers using window resize
      const handleResize = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.clientHeight;
        const heightDiff = documentHeight - windowHeight;
        
        if (heightDiff > 150) { // Assume keyboard if height diff > 150px
          setKeyboardHeight(heightDiff);
          setIsKeyboardVisible(true);
        } else {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // Modern approach using visualViewport API
    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const heightDiff = windowHeight - viewportHeight;

      if (heightDiff > 150) { // Keyboard is likely visible
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
