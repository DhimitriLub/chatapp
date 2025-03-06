import React from 'react';
import confetti from 'canvas-confetti';

const ConfettiButton = ({ onClick }) => {
  const handleClick = (e) => {
    // Trigger confetti from the button's position
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { 
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      }
    });

    // Call the original onClick handler
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-circle btn-sm btn-ghost"
      title="Celebrate!"
    >
      🎉
    </button>
  );
};

export default ConfettiButton; 