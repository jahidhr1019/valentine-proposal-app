"use client";

import React from 'react';

const FloatingPetals = () => {
  const petalCount = 20;

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {Array.from({ length: petalCount }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animation: `float ${Math.random() * 10 + 5}s linear infinite`,
          animationDelay: `${Math.random() * 15}s`,
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
        };
        return (
          <div
            key={i}
            className="absolute bottom-[-20px] bg-rose-200 rounded-full opacity-70"
            style={style}
          ></div>
        );
      })}
    </div>
  );
};

export default FloatingPetals;
