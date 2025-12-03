import React, { useRef, useEffect, useState } from "react";
const cn = (...classes) => classes.filter(Boolean).join(" ");

const ThreeDHoverGallery = ({
  images = [
    "https://images.pexels.com/photos/26797335/pexels-photo-26797335/free-photo-of-scenic-view-of-mountains.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/12194487/pexels-photo-12194487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/32423809/pexels-photo-32423809/free-photo-of-aerial-view-of-kayaking-at-robberg-south-africa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/32296519/pexels-photo-32296519/free-photo-of-rocky-coastline-of-cape-point-with-turquoise-waters.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/32396739/pexels-photo-32396739/free-photo-of-serene-motorcycle-ride-through-bamboo-grove.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  ],
  itemWidth = 12,
  itemHeight = 20,
  gap = 1.2,
  perspective = 50,
  hoverScale = 15,
  transitionDuration = 1.25,
  backgroundColor,
  grayscaleStrength = 1,
  brightnessLevel = 0.5,
  activeWidth = 45,
  enableKeyboardNavigation = true,
  autoPlay = false,
  autoPlayDelay = 3000,
  className,
  style,
  onImageClick,
  onImageHover,
  onImageFocus,
}) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);

  // ✅ Auto-play with pause on hover
  useEffect(() => {
    if (autoPlay && images.length > 0 && !isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);

      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) =>
          prev === null ? 0 : (prev + 1) % images.length
        );
      }, autoPlayDelay);

      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }

    if ((!autoPlay || isHovered) && autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, [autoPlay, autoPlayDelay, images.length, isHovered]);

  // ✅ Handlers
  const handleImageClick = (index, image) => {
    setActiveIndex(activeIndex === index ? null : index);
    onImageClick?.(index, image);
  };

  const handleImageHover = (index, image) => {
    setIsHovered(true);
    setActiveIndex(index);
    onImageHover?.(index, image);
  };

  const handleContainerLeave = () => {
    setIsHovered(false);
    setActiveIndex(null); // ✅ Reset all when leaving the gallery
  };

  const handleImageFocus = (index, image) => {
    setFocusedIndex(index);
    onImageFocus?.(index, image);
  };

  const handleKeyDown = (event, index) => {
    if (!enableKeyboardNavigation) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleImageClick(index, images[index]);
        break;
      case "ArrowLeft":
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : images.length - 1;
        containerRef.current?.children[prevIndex]?.focus();
        break;
      case "ArrowRight":
        event.preventDefault();
        const nextIndex = index < images.length - 1 ? index + 1 : 0;
        containerRef.current?.children[nextIndex]?.focus();
        break;
      default:
        break;
    }
  };

  // ✅ Styles
  const getItemStyle = (index) => {
    const isActive = activeIndex === index;
    const isFocused = focusedIndex === index;
    const baseWidthPx = 10;

    return {
      width: isActive
        ? `${activeWidth}vw`
        : `calc(${itemWidth}vw + ${baseWidthPx}px)`,
      height: `calc(${itemHeight}vw + ${itemHeight}vh)`,
      backgroundImage: `url(${images[index]})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor,
      cursor: "pointer",
      filter:
        isActive || isFocused
          ? "inherit"
          : `grayscale(${grayscaleStrength}) brightness(${brightnessLevel})`,
      transform: isActive
        ? `translateZ(calc(${hoverScale}vw + ${hoverScale}vh))`
        : "none",
      transition: `transform ${transitionDuration}s cubic-bezier(.1, .7, 0, 1),
                   filter 0.8s ease,
                   width ${transitionDuration}s cubic-bezier(.1, .7, 0, 1)`,
      willChange: "transform, filter, width",
      zIndex: isActive ? 100 : "auto",
      margin: isActive ? "0 0.45vw" : "0",
      outline: isFocused ? "2px solid #3b82f6" : "none",
      outlineOffset: "2px",
      borderRadius: "0.5rem",
    };
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[50vh] w-full overflow-hidden bg-background",
        className
      )}
      style={backgroundColor ? { backgroundColor, ...style } : style}
      onMouseLeave={handleContainerLeave} // ✅ Reset when mouse leaves container
    >
      <div
        ref={containerRef}
        className="flex justify-center items-center w-full"
        style={{
          perspective: `calc(${perspective}vw + ${perspective}vh)`,
          gap: `${gap}rem`,
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative will-change-transform rounded-lg shadow-lg"
            style={getItemStyle(index)}
            tabIndex={enableKeyboardNavigation ? 0 : -1}
            onClick={() => handleImageClick(index, image)}
            onMouseEnter={() => handleImageHover(index, image)}
            onFocus={() => handleImageFocus(index, image)}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="button"
            aria-label={`Image ${index + 1} of ${images.length}`}
            aria-pressed={activeIndex === index}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreeDHoverGallery;