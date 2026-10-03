import React from 'react';

interface FlyingBottleAnimationProps {
  image: string;
  startRect: DOMRect | null;
}

export const FlyingBottleAnimation: React.FC<FlyingBottleAnimationProps> = ({
  image,
  startRect,
}) => {
  if (!startRect) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none transition-all duration-700 ease-in-out"
      style={{
        top: `${startRect.top}px`,
        left: `${startRect.left}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
      }}
    >
      <img
        src={image}
        alt="Animation ajout panier"
        className="w-full h-full object-contain filter drop-shadow-2xl animate-ping"
      />
    </div>
  );
};
