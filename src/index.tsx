import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import {
  type WindowAnimationType,
  useWindowManagerStore,
} from "./stores/windowManagerStore";

import { ExitIconSVG } from "./components/icons/exit";
import { FullScreenIconSVG } from "./components/icons/full-screen";
import { FullScreenExitIconSVG } from "./components/icons/full-screen-exit";
import { Button } from "./components/ui/button";

/**
 * Props for the Window component
 */
export type WindowProps = {
  /** Unique identifier for the window */
  id: string;
  /** Window title - can be string or React component */
  title?: string | React.ReactNode;
  /** Window content */
  children?: React.ReactNode;
  /** Initial window position */
  position?: { x: number; y: number };
  /** Initial window size */
  size?: { width: number; height: number };
  /** Content to display in the toolbar */
  toolbar?: React.ReactNode | string;
  /** Additional CSS classes for the window */
  className?: string;
  /** Custom toolbar icons */
  icons?: {
    fullscreen?: React.ReactNode;
    fullscreenExit?: React.ReactNode;
    close?: React.ReactNode;
  };
  /** Animation type for fullscreen transitions (overrides global setting) */
  animation?: WindowAnimationType;
  /** Whether to allow resizing the window */
  resize?:
    | boolean
    | "horizontal"
    | "vertical"
    | "both"
    | "left"
    | "right"
    | "top"
    | "bottom";
  /** Minimum window size */
  minSize?: { width: number; height: number };
  /** Maximum window size */
  maxSize?: { width: number; height: number };
  /** Whether to allow fullscreen mode */
  allowFullscreen?: boolean;
  /** Callback when window is closed */
  onClose?: () => void;
  /** Callback when fullscreen state changes */
  onToggleFullscreen?: (isFullscreen: boolean) => void;
  /** Callback when window is resized */
  onResize?: (size: { width: number; height: number }) => void;
};

export const Window = ({
  id,
  title = "Window",
  children,
  position = { x: 100, y: 100 },
  size = { width: 800, height: 600 },
  toolbar,
  className = "",
  animation: animationType,
  icons,
  resize = true,
  minSize = { width: 200, height: 150 },
  maxSize,
  allowFullscreen = true,
  onClose,
  onToggleFullscreen,
  onResize,
}: WindowProps) => {
  const {
    updateWindow,
    removeWindow,
    activeWindowId,
    setActiveWindow,
    bringToFront,
    endSplitOnDrag,
    windows,
    windowAnimation,
  } = useWindowManagerStore();

  // Get selected animation type - if provided in props, use it, otherwise use the store's value
  const selectedAnimation = animationType || windowAnimation;

  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [windowPosition, setWindowPosition] = useState(position);
  const [windowSize, setWindowSize] = useState(size);
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Previous state before fullscreen
  const [previousState, setPreviousState] = useState({
    position: position,
    size: size,
  });

  useEffect(() => {
    if (onResize) {
      onResize({
        width: windowSize.width,
        height: windowSize.height,
      });
    }
  }, [windowSize]);

  // Drag state refs
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });
  const resizeStartInfo = useRef({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    cursorType: "",
    initialX: 0,
    initialY: 0,
  });

  // Touch event refs for mobile support
  const touchStartPos = useRef({
    touchX: 0,
    touchY: 0,
    windowX: 0,
    windowY: 0,
  });

  // Animation frame Id for cleanup
  const animationFrameId = useRef<number | null>(null);

  // Get the current window's zIndex
  const currentWindow = windows.find((w) => w.id === id);
  const zIndex = currentWindow?.zIndex || 1;

  // Clamp the window position to the screen boundaries
  const clampPositionToScreen = (x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Clamp the position to the screen boundaries
    const clampedX = Math.max(0, Math.min(x, windowWidth - windowSize.width));
    const clampedY = Math.max(0, Math.min(y, windowHeight - windowSize.height));

    return { x: clampedX, y: clampedY };
  };

  // Window activation and bring to front
  const handleWindowActivation = (e: React.MouseEvent) => {
    // Ensure the event is from the window, not child elements
    if (
      e.target === e.currentTarget ||
      (e.currentTarget as HTMLElement).contains(e.target as Node)
    ) {
      setActiveWindow(id);
      bringToFront(id);
    }
  };

  // Component mount/unmount event listeners for mouse and touch events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && !isResizing.current) {
        return;
      }

      e.preventDefault(); // Prevent text selection

      if (isDragging.current) {
        // If there's an ongoing animation, cancel it
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }

        // Request a new animation frame
        animationFrameId.current = requestAnimationFrame(() => {
          const deltaX = e.clientX - dragStartPos.current.mouseX;
          const deltaY = e.clientY - dragStartPos.current.mouseY;

          const newX = dragStartPos.current.windowX + deltaX;
          const newY = dragStartPos.current.windowY + deltaY;

          const { x: clampedX, y: clampedY } = clampPositionToScreen(
            newX,
            newY
          );
          setWindowPosition({ x: clampedX, y: clampedY });

          animationFrameId.current = null;
        });
      } else if (isResizing.current) {
        // If there's an ongoing animation, cancel it
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }

        // Request a new animation frame
        animationFrameId.current = requestAnimationFrame(() => {
          const deltaX = e.clientX - resizeStartInfo.current.mouseX;
          const deltaY = e.clientY - resizeStartInfo.current.mouseY;
          const cursorType = resizeStartInfo.current.cursorType;

          let newWidth = resizeStartInfo.current.width;
          let newHeight = resizeStartInfo.current.height;
          let newX = resizeStartInfo.current.initialX;
          let newY = resizeStartInfo.current.initialY;

          // Set the width and position based on the resize type
          if (cursorType === "se-resize") {
            // Bottom right corner (original behavior)
            newWidth = Math.max(
              minSize.width,
              resizeStartInfo.current.width + deltaX
            );
            newHeight = Math.max(
              minSize.height,
              resizeStartInfo.current.height + deltaY
            );
          } else if (cursorType === "sw-resize") {
            // Bottom left corner
            newWidth = Math.max(
              minSize.width,
              resizeStartInfo.current.width - deltaX
            );
            newHeight = Math.max(
              minSize.height,
              resizeStartInfo.current.height + deltaY
            );
            newX =
              resizeStartInfo.current.initialX +
              resizeStartInfo.current.width -
              newWidth;
          } else if (cursorType === "ne-resize") {
            // Top right corner
            newWidth = Math.max(
              minSize.width,
              resizeStartInfo.current.width + deltaX
            );
            newHeight = Math.max(
              minSize.height,
              resizeStartInfo.current.height - deltaY
            );
            newY =
              resizeStartInfo.current.initialY +
              resizeStartInfo.current.height -
              newHeight;
          } else if (cursorType === "nw-resize") {
            // Top left corner
            newWidth = Math.max(
              minSize.width,
              resizeStartInfo.current.width - deltaX
            );
            newHeight = Math.max(
              minSize.height,
              resizeStartInfo.current.height - deltaY
            );
            newX =
              resizeStartInfo.current.initialX +
              resizeStartInfo.current.width -
              newWidth;
            newY =
              resizeStartInfo.current.initialY +
              resizeStartInfo.current.height -
              newHeight;
          } else if (cursorType === "n-resize") {
            // Only top edge
            newHeight = Math.max(
              minSize.height,
              resizeStartInfo.current.height - deltaY
            );
            newY =
              resizeStartInfo.current.initialY +
              resizeStartInfo.current.height -
              newHeight;
          } else if (cursorType === "s-resize") {
            // Only bottom edge
            newHeight = Math.max(
              minSize.height,
              resizeStartInfo.current.height + deltaY
            );
          } else if (cursorType === "e-resize") {
            // Only right edge
            newWidth = Math.max(
              minSize.width,
              resizeStartInfo.current.width + deltaX
            );
          } else if (cursorType === "w-resize") {
            // Only left edge
            newWidth = Math.max(
              minSize.width,
              resizeStartInfo.current.width - deltaX
            );
            newX =
              resizeStartInfo.current.initialX +
              resizeStartInfo.current.width -
              newWidth;
          }

          // Check if MaxSize is set
          if (maxSize) {
            const originalWidth = newWidth;
            const originalHeight = newHeight;

            newWidth = Math.min(newWidth, maxSize.width);
            newHeight = Math.min(newHeight, maxSize.height);

            // If the size is clamped, recalculate the position
            if (cursorType === "nw-resize") {
              // Top left corner - if the size is clamped, recalculate the position
              if (newWidth !== originalWidth) {
                newX =
                  resizeStartInfo.current.initialX +
                  resizeStartInfo.current.width -
                  newWidth;
              }
              if (newHeight !== originalHeight) {
                newY =
                  resizeStartInfo.current.initialY +
                  resizeStartInfo.current.height -
                  newHeight;
              }
            } else if (cursorType === "ne-resize") {
              // Top right corner - only Y position'u düzelt
              if (newHeight !== originalHeight) {
                newY =
                  resizeStartInfo.current.initialY +
                  resizeStartInfo.current.height -
                  newHeight;
              }
            } else if (cursorType === "sw-resize") {
              // Bottom left corner - only X position'u düzelt
              if (newWidth !== originalWidth) {
                newX =
                  resizeStartInfo.current.initialX +
                  resizeStartInfo.current.width -
                  newWidth;
              }
            } else if (cursorType === "n-resize") {
              // Only top edge - Y position'u düzelt
              if (newHeight !== originalHeight) {
                newY =
                  resizeStartInfo.current.initialY +
                  resizeStartInfo.current.height -
                  newHeight;
              }
            } else if (cursorType === "w-resize") {
              // Only left edge - X position'u düzelt
              if (newWidth !== originalWidth) {
                newX =
                  resizeStartInfo.current.initialX +
                  resizeStartInfo.current.width -
                  newWidth;
              }
            }
          }

          // Prevent the window from going outside the screen
          const maxWidth = window.innerWidth - newX;
          const maxHeight = window.innerHeight - newY;

          const width = Math.min(newWidth, maxWidth);
          const height = Math.min(newHeight, maxHeight);

          setWindowSize({ width, height });
          setWindowPosition({ x: newX, y: newY });

          animationFrameId.current = null;
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) {
        return;
      }

      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartPos.current.touchX;
      const deltaY = touch.clientY - touchStartPos.current.touchY;

      const newX = touchStartPos.current.windowX + deltaX;
      const newY = touchStartPos.current.windowY + deltaY;

      const { x: clampedX, y: clampedY } = clampPositionToScreen(newX, newY);
      setWindowPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        updateWindow(id, { position: windowPosition });
        endSplitOnDrag(id);
      }
      if (isResizing.current) {
        isResizing.current = false;
        updateWindow(id, { position: windowPosition, size: windowSize });
      }

      // If there's an ongoing animation, cancel it
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };

    const handleTouchEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        endSplitOnDrag(id);
      }
    };

    const handleResize = () => {
      // Check if the window position is within the screen boundaries when the screen size changes
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (isFullscreen) {
        // If in fullscreen mode, update the size - no topbar
        setWindowPosition({ x: 0, y: 0 });
        setWindowSize({
          width: windowWidth,
          height: windowHeight,
        });
      } else {
        // If not in fullscreen mode, keep the window position within the screen boundaries
        setWindowPosition((prevPos) => {
          const { x: clampedX, y: clampedY } = clampPositionToScreen(
            prevPos.x,
            prevPos.y
          );
          return { x: clampedX, y: clampedY };
        });
      }
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);

      // Clean up animation
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [id, windowSize.width, windowSize.height, isFullscreen]); // windowSize dependency'lerini ekle

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) return; // If in fullscreen mode, prevent dragging

    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    isDragging.current = true;

    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: windowPosition.x,
      windowY: windowPosition.y,
    };

    // Activate the window and bring it to front
    setActiveWindow(id);
    bringToFront(id);
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (allowFullscreen) {
      toggleFullscreen();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isFullscreen) return; // If in fullscreen mode, prevent dragging

    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;

    isDragging.current = true;

    touchStartPos.current = {
      touchX: touch.clientX,
      touchY: touch.clientY,
      windowX: windowPosition.x,
      windowY: windowPosition.y,
    };

    // Activate the window and bring it to front
    setActiveWindow(id);
    bringToFront(id);
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    isResizing.current = true;

    const target = e.target as HTMLElement;
    const cursorType = window.getComputedStyle(target).cursor;

    resizeStartInfo.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: windowSize.width,
      height: windowSize.height,
      cursorType,
      initialX: windowPosition.x,
      initialY: windowPosition.y,
    };

    // Activate the window and bring it to front
    setActiveWindow(id);
    bringToFront(id);
  };

  const handleClose = () => {
    // Apply the closing animation based on the selected animation
    if (windowRef.current) {
      let animation;

      // Determine the closing animation based on the selected animation
      switch (selectedAnimation) {
        case "fade":
          animation = windowRef.current.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "scale":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "scale(1)" },
              { opacity: 0, transform: "scale(0.8)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "slide":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "translateY(0)" },
              { opacity: 0, transform: "translateY(20px)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "flip":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "rotateX(0deg)" },
              { opacity: 0, transform: "rotateX(15deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "rotate":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "rotate(0deg)" },
              { opacity: 0, transform: "rotate(2deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "jellyfish":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "scale(1)" },
              { opacity: 0, transform: "scale(0.8) translateY(10px)" },
            ],
            { duration: 300, easing: "ease-in-out", fill: "forwards" }
          );
          break;
        default:
          // If there's no animation, close the window directly
          removeWindow(id);
          return;
      }

      // When the animation is finished, close the window
      animation.onfinish = () => {
        removeWindow(id);
        if (onClose) {
          onClose();
        }
      };
    } else {
      removeWindow(id);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;

    if (!isFullscreen) {
      // Switch to fullscreen mode
      setPreviousState({
        position: { ...windowPosition },
        size: { ...windowSize },
      });

      // First update the state
      setIsFullscreen(true);

      // Use Web Animations API for the transition
      if (windowRef.current) {
        // Clean up previous animations
        windowRef.current
          .getAnimations()
          .forEach((animation) => animation.cancel());

        // Select the easing function
        let easing = "cubic-bezier(0.4, 0, 0.2, 1)"; // Default easing
        let duration = 300; // Default duration

        // Set the easing and duration values based on the selected animation type
        if (selectedAnimation === "jellyfish") {
          easing = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // Spring-like easing
          duration = 400;
        }

        const controls = windowRef.current.animate(
          [
            {
              left: `${windowPosition.x}px`,
              top: `${windowPosition.y}px`,
              width: `${windowSize.width}px`,
              height: `${windowSize.height}px`,
              borderRadius: "0.5rem",
            },
            {
              left: "0px",
              top: "0px",
              width: `${window.innerWidth}px`,
              height: `${window.innerHeight}px`,
              borderRadius: "0",
            },
          ],
          {
            duration,
            easing,
            fill: "forwards",
          }
        );

        controls.onfinish = () => {
          // Clean up all animation effects
          if (windowRef.current) {
            // Cancel all animations
            windowRef.current
              .getAnimations()
              .forEach((animation) => animation.cancel());

            // Reset the CSS completely
            windowRef.current.style.cssText = "";
            windowRef.current.style.position = "absolute";
            windowRef.current.style.left = "0px";
            windowRef.current.style.top = "0px";
            windowRef.current.style.width = `${window.innerWidth}px`;
            windowRef.current.style.height = `${window.innerHeight}px`;
            windowRef.current.style.transformOrigin = "top center";
            windowRef.current.style.zIndex = zIndex.toString();
          }

          setWindowPosition({ x: 0, y: 0 });
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };
      }
    } else {
      // Exit fullscreen mode
      const prevPosition = { ...previousState.position };
      const prevSize = { ...previousState.size };

      // Use Web Animations API for the transition
      if (windowRef.current) {
        // Clean up previous animations
        windowRef.current
          .getAnimations()
          .forEach((animation) => animation.cancel());

        // Select the easing function
        let easing = "cubic-bezier(0.4, 0, 0.2, 1)"; // Default easing
        let duration = 300; // Default duration

        // Set the easing and duration values based on the selected animation type
        if (selectedAnimation === "jellyfish") {
          easing = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // Spring-like easing
          duration = 400;
        }

        const controls = windowRef.current.animate(
          [
            {
              left: `${windowPosition.x}px`,
              top: `${windowPosition.y}px`,
              width: `${windowSize.width}px`,
              height: `${windowSize.height}px`,
              borderRadius: "0",
            },
            {
              left: `${prevPosition.x}px`,
              top: `${prevPosition.y}px`,
              width: `${prevSize.width}px`,
              height: `${prevSize.height}px`,
              borderRadius: "0.5rem",
            },
          ],
          {
            duration,
            easing,
            fill: "forwards",
          }
        );

        controls.onfinish = () => {
          // Clean up all animation effects and set the correct values
          if (windowRef.current) {
            // Cancel all animations
            windowRef.current
              .getAnimations()
              .forEach((animation) => animation.cancel());

            // Reset the CSS completely
            windowRef.current.style.cssText = "";
            windowRef.current.style.position = "absolute";
            windowRef.current.style.left = `${prevPosition.x}px`;
            windowRef.current.style.top = `${prevPosition.y}px`;
            windowRef.current.style.width = `${prevSize.width}px`;
            windowRef.current.style.height = `${prevSize.height}px`;
            windowRef.current.style.transformOrigin = "top center";
            windowRef.current.style.zIndex = zIndex.toString();
          }

          setWindowPosition(prevPosition);
          setWindowSize(prevSize);
          setIsFullscreen(false);
        };
      }
    }

    // Update the window state
    updateWindow(id, {
      position: isFullscreen ? previousState.position : { x: 0, y: 0 },
      size: isFullscreen
        ? previousState.size
        : {
            width: window.innerWidth,
            height: window.innerHeight,
          },
    });

    // Call the callback
    if (onToggleFullscreen) {
      onToggleFullscreen(newFullscreenState);
    }
  };

  // Window opening animation
  useEffect(() => {
    if (windowRef.current) {
      // Determine the opening animation based on the selected animation type
      let animation;

      switch (selectedAnimation) {
        case "fade":
          animation = windowRef.current.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "scale":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "scale(0.8)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "slide":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "translateY(20px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "flip":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "rotateX(15deg)" },
              { opacity: 1, transform: "rotateX(0deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "rotate":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "rotate(-2deg)" },
              { opacity: 1, transform: "rotate(0deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "jellyfish":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "scale(0.7)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            {
              duration: 400,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring-like easing
              fill: "forwards",
            }
          );
          break;
        default:
          // If there's no animation, do nothing
          break;
      }
    }
  }, [id]); // Only run when the component is mounted and the ID changes

  // Add the window ID to the global window object - this will be used by the inside applications
  useEffect(() => {
    // Store the window ID in the global object
    (window as any).__WINDOW_ID__ = id;

    return () => {
      // Clean up, when the window is closed
      if ((window as any).__WINDOW_ID__ === id) {
        delete (window as any).__WINDOW_ID__;
      }
    };
  }, [id]);

  // Default icons
  const defaultFullscreenIcon = <FullScreenIconSVG />;

  const defaultRestoreIcon = <FullScreenExitIconSVG />;

  const defaultCloseIcon = <ExitIconSVG />;

  // Determine which resize handles to show based on the resize prop
  const getResizeHandles = () => {
    if (resize === false) return [];

    const handles = [];

    switch (resize) {
      case true:
      case "both":
        // Show all handles
        handles.push("se", "sw", "ne", "nw", "n", "s", "e", "w");
        break;
      case "horizontal":
        // Only horizontal resize (including corners)
        handles.push("e", "w", "ne", "nw", "se", "sw");
        break;
      case "vertical":
        // Only vertical resize (including corners)
        handles.push("n", "s", "ne", "nw", "se", "sw");
        break;
      case "left":
        // Only left edge (including corners)
        handles.push("w", "nw", "sw");
        break;
      case "right":
        // Only right edge (including corners)
        handles.push("e", "ne", "se");
        break;
      case "top":
        // Only top edge (no corners)
        handles.push("n");
        break;
      case "bottom":
        // Only bottom edge (no corners)
        handles.push("s");
        break;
      default:
        handles.push("se", "sw", "ne", "nw", "n", "s", "e", "w");
        break;
    }

    return handles;
  };

  const resizeHandles = getResizeHandles();

  return (
    <div
      ref={windowRef}
      style={{
        position: "absolute",
        width: windowSize.width,
        height: windowSize.height,
        left: windowPosition.x,
        top: windowPosition.y,
        transformOrigin: "top center",
        zIndex,
      }}
      className={`react-window-manager window ${
        isFullscreen ? "fullscreen" : ""
      } ${activeWindowId === id ? "active" : ""} ${className}`}
      onMouseDown={handleWindowActivation}
      data-window-id={id}
    >
      {/* Header */}
      <div
        ref={headerRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleHeaderDoubleClick}
        className="react-window-manager header"
      >
        <div className="react-window-manager toolbar">{toolbar}</div>
        <div className="react-window-manager title">
          {typeof title === "string" ? title : title}
        </div>
        <div className="react-window-manager controls">
          {allowFullscreen && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFullscreen();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              size="icon"
              variant="ghost"
            >
              {isFullscreen
                ? icons?.fullscreenExit || defaultRestoreIcon
                : icons?.fullscreen || defaultFullscreenIcon}
            </Button>
          )}
          <Button
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            size="icon"
            variant="ghost"
            className="destructive"
          >
            {icons?.close || defaultCloseIcon}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="react-window-manager content">{children}</div>

      {/* Resizers - Show the handles based on the resize prop */}
      {!isFullscreen && resizeHandles.length > 0 && (
        <>
          {/* Corner handles */}
          {resizeHandles.includes("se") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle se"
            />
          )}
          {resizeHandles.includes("sw") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle sw"
            />
          )}
          {resizeHandles.includes("ne") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle ne"
            />
          )}
          {resizeHandles.includes("nw") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle nw"
            />
          )}

          {/* Edge handles */}
          {resizeHandles.includes("n") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle n"
            />
          )}
          {resizeHandles.includes("s") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle s"
            />
          )}
          {resizeHandles.includes("e") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle e"
            />
          )}
          {resizeHandles.includes("w") && (
            <div
              onMouseDown={handleResizeStart}
              className="react-window-manager resize-handle w"
            />
          )}
        </>
      )}
    </div>
  );
};

// Export store and types
export {
  useWindowManagerStore,
  type ContextMenuInfo,
  type ContextMenuItem,
  type WindowAnimationType,
} from "./stores/windowManagerStore";

// Export types
export type {
  WindowManagerConfig,
  WindowPosition,
  WindowSize,
} from "./types/index";

export type { WindowManagerState } from "./stores/windowManagerStore";
