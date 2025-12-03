// src/components/ThreeDVideoRing.jsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, easeOut, animate } from "framer-motion";

export function ThreeDVideoRing({
  videos,
  width = 280,
  height = 500,
  perspective = 1200,
  videoDistance = 450,
  initialRotation = 180,
  autoRotate = true, // New prop to enable/disable auto-rotation
  rotationSpeed = 40, // New prop: seconds for a full 360-degree rotation
  animationDuration = 1.5,
  staggerDelay = 0.1,
  hoverOpacity = 0.3,
  containerClassName = "",
  ringClassName = "",
  videoContainerClassName = "",
  draggable = true,
  mobileBreakpoint = 768,
  mobileScaleFactor = 0.7,
  inertiaPower = 0.8,
  inertiaTimeConstant = 300,
  inertiaVelocityMultiplier = 20,
}) {
  const containerRef = useRef(null);
  const ringRef = useRef(null);
  const rotationY = useMotionValue(initialRotation);
  const animationControls = useRef(null); // Ref to control the animation

  const startX = useRef(0);
  const currentRotationY = useRef(initialRotation);
  const isDragging = useRef(false);
  const velocity = useRef(0);

  const [currentScale, setCurrentScale] = useState(1);
  const [showVideos, setShowVideos] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  const angle = useMemo(() => 360 / videos.length, [videos.length]);

  // Function to start the continuous rotation animation
  const startRotationAnimation = () => {
    if (!autoRotate || animationControls.current) return; // Don't start if disabled or already running
    
    // Animate from the current rotation value to a full circle away
    animationControls.current = animate(rotationY, [rotationY.get(), rotationY.get() - 360], {
      duration: rotationSpeed,
      ease: "linear",
      repeat: Infinity,
    });
  };

  // Effect to manage the auto-rotation based on hover and drag state
  useEffect(() => {
    if (!autoRotate) return;

    // When the component is not being hovered or dragged, start the animation
    if (!isHovered && !isDragging.current) {
      startRotationAnimation();
    } else {
      // Otherwise, stop the animation
      animationControls.current?.stop();
      animationControls.current = null;
    }

    // Cleanup on unmount
    return () => animationControls.current?.stop();
  }, [isHovered, autoRotate]);


  useEffect(() => {
    const unsubscribe = rotationY.on("change", (latest) => {
      currentRotationY.current = latest;
    });
    return unsubscribe;
  }, [rotationY]);

  useEffect(() => {
    const handleResize = () => {
      const newScale = window.innerWidth <= mobileBreakpoint ? mobileScaleFactor : 1;
      setCurrentScale(newScale);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileBreakpoint, mobileScaleFactor]);

  useEffect(() => {
    setShowVideos(true);
  }, []);

  const handleDragStart = (event) => {
    if (!draggable) return;
    
    // Stop any ongoing auto-rotation when dragging starts
    animationControls.current?.stop();
    animationControls.current = null;

    isDragging.current = true;
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    startX.current = clientX;
    rotationY.stop();
    velocity.current = 0;
    if (ringRef.current) ringRef.current.style.cursor = "grabbing";

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleDrag = (event) => {
    if (!draggable || !isDragging.current) return;
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    const deltaX = clientX - startX.current;
    velocity.current = -deltaX * 0.5;
    rotationY.set(currentRotationY.current + velocity.current);
    startX.current = clientX;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    if (ringRef.current) {
      ringRef.current.style.cursor = "grab";
      currentRotationY.current = rotationY.get();
    }

    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("touchend", handleDragEnd);

    const initial = rotationY.get();
    const velocityBoost = velocity.current * inertiaVelocityMultiplier;
    
    animate(initial, initial + velocityBoost, {
      type: "inertia",
      velocity: velocityBoost,
      power: inertiaPower,
      timeConstant: inertiaTimeConstant,
      restDelta: 0.5,
      modifyTarget: (target) => Math.round(target / angle) * angle,
      onUpdate: (latest) => rotationY.set(latest),
      onComplete: () => {
        // After inertia animation finishes, restart auto-rotation if not hovered
        if (!isHovered && autoRotate) {
          startRotationAnimation();
        }
      },
    });

    velocity.current = 0;
  };

  const videoVariants = {
    hidden: { y: 200, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden select-none relative ${containerClassName}`}
      style={{ transform: `scale(${currentScale})`, transformOrigin: "center center" }}
      onMouseDown={draggable ? handleDragStart : undefined}
      onTouchStart={draggable ? handleDragStart : undefined}
      onMouseEnter={() => setIsHovered(true)} // Set hovered to true on mouse enter
      onMouseLeave={() => setIsHovered(false)} // Set hovered to false on mouse leave
    >
      <div
        style={{
          perspective: `${perspective}px`,
          width: `${width}px`,
          height: `${height}px`,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          ref={ringRef}
          className={`w-full h-full absolute ${ringClassName}`}
          style={{ transformStyle: "preserve-3d", rotateY: rotationY, cursor: draggable ? "grab" : "default" }}
        >
          <AnimatePresence>
            {showVideos && videos.map((video, index) => (
              <motion.div
                key={video.id}
                className={`w-full h-full absolute rounded-2xl overflow-hidden shadow-2xl bg-black ${videoContainerClassName}`}
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  rotateY: index * -angle,
                  z: -videoDistance * currentScale,
                  transformOrigin: `50% 50% ${videoDistance * currentScale}px`,
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={videoVariants}
                custom={index}
                transition={{ delay: index * staggerDelay, duration: animationDuration, ease: easeOut }}
              >
                <iframe
                  className="w-full h-full pointer-events-none" // pointer-events-none is crucial to allow dragging over the iframe
                  src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&loop=1&playlist=${video.videoId}&controls=0`}
                  title={`YouTube Short - ${video.id}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default ThreeDVideoRing;