import { X } from "lucide-react";
import { useEffect, useState } from "react";

const ImageModal = ({ imageUrl, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a brief delay to ensure initial state is rendered
    const timer = setTimeout(() => setIsAnimating(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isAnimating ? 'blur(8px)' : 'blur(0px)'
        }}
      />
      <div 
        className="relative max-w-[90vw] max-h-[90vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className={`
            absolute -top-4 -right-4 btn btn-circle btn-sm bg-base-100
            transition-opacity duration-300
            ${isAnimating ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <X className="size-4" />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className={`
            max-w-full max-h-[90vh] object-contain rounded-lg
            transition-all duration-300 ease-out
            ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          `}
        />
      </div>
    </div>
  );
};

export default ImageModal; 