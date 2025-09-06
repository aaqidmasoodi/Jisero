const { memo, useState, useRef, useEffect } = React;

const LazyImage = memo(({ src, alt, className, fallback = null }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={className}>
      {!isInView ? (
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse w-full h-full rounded-full" />
      ) : hasError ? (
        fallback || (
          <div className="bg-gray-300 dark:bg-gray-600 flex items-center justify-center w-full h-full rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )
      ) : (
        <>
          {!isLoaded && (
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse w-full h-full rounded-full absolute inset-0" />
          )}
          <img
            src={src}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
});

window.LazyImage = LazyImage;
