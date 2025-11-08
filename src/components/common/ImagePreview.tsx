import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomOut, ZoomIn, RotateCcw } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailClassName?: string;
  previewClassName?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  className = "",
  thumbnailClassName = "w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity",
  previewClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleOpen = () => {
    setIsOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale((prev) => {
      const newScale = Math.min(prev + 0.5, 3);
      // Reset position to center if zooming to 100% or less
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 0.5);
      // Reset position to center if zooming to 100% or less
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setScale((prev) => {
        const newScale = Math.min(prev + 0.5, 3);
        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
    } else {
      // Zoom out
      setScale((prev) => {
        const newScale = Math.max(prev - 0.5, 0.5);
        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
    }
  };

  return (
    <>
      {/* Thumbnail */}
      <div className={className}>
        <img
          src={src}
          alt={alt}
          className={thumbnailClassName}
          onClick={handleOpen}
          loading="lazy"
        />
      </div>

      {/* Modal Preview */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
            onClick={handleClose}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="p-2 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-black transition-all"
                title="Reset zoom và vị trí"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="p-2 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-black transition-all"
                disabled={scale <= 0.5}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-black text-sm px-2 py-1 bg-white bg-opacity-50 rounded">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="p-2 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-black transition-all"
                disabled={scale >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-black transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative flex items-center justify-center w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className={`transition-transform duration-200 select-none ${
                  isDragging
                    ? "cursor-grabbing"
                    : scale > 1
                    ? "cursor-grab"
                    : "cursor-default"
                } ${previewClassName}`}
                style={{
                  transform: `scale(${scale}) translate(${
                    position.x / scale
                  }px, ${position.y / scale}px)`,
                  maxWidth: scale === 1 ? "90vw" : "none",
                  maxHeight: scale === 1 ? "90vh" : "none",
                  objectFit: "contain",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                draggable={false}
              />
            </motion.div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
              <span className="hidden md:inline">
                Scroll để zoom • Click và kéo để di chuyển •
              </span>
              Click bên ngoài để đóng
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImagePreview;
