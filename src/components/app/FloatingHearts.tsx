"use client";

import { useMemo } from 'react';

const FloatingHearts = ({ count }: { count: number }) => {
  const hearts = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    opacity: Math.random() * 0.3 + 0.1
  })), [count]);

  return (
    <>
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute bottom-[-10%] animate-float-heart"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            opacity: h.opacity,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            color: '#fb7185'
          }}
        >
          {/* Heart SVG Path */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      ))}
    </>
  );
};

export default FloatingHearts;
