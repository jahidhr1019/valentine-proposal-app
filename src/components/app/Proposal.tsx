"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

type ProposalProps = {
  partnerName: string;
  onAccept: () => void;
};

const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 48;

export default function Proposal({ partnerName, onAccept }: ProposalProps) {
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 55, y: 60 });
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScreenSize = () => {
      if (containerRef.current) {
        setScreenSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const moveButton = useCallback(() => {
    if (!screenSize.width || !screenSize.height) return;

    const x = Math.random() * (screenSize.width - BUTTON_WIDTH);
    const y = Math.random() * (screenSize.height - BUTTON_HEIGHT);
    setNoButtonPosition({ x: (x / screenSize.width) * 100, y: (y / screenSize.height) * 100 });
  }, [screenSize]);

  return (
    <div className="text-center animate-in fade-in-0 duration-1000">
      <h1 className="font-headline text-4xl md:text-7xl text-primary leading-tight">
        {partnerName ? `${partnerName},` : "My Dearest,"}
      </h1>
      <h2 className="font-headline text-3xl md:text-6xl text-foreground/90 mt-4 mb-12">
        Will you marry me?
      </h2>
      <div 
        ref={containerRef}
        className="relative w-full h-64 md:h-80"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
           <Button
            onClick={onAccept}
            className="transform transition-transform duration-300 hover:scale-110 font-headline text-2xl px-12 py-8"
            style={{ width: '150px' }}
          >
            Yes
            <Heart className="ml-2 fill-current" />
          </Button>
        </div>
        
        <Button
          onMouseEnter={moveButton}
          style={{
            position: 'absolute',
            top: `${noButtonPosition.y}%`,
            left: `${noButtonPosition.x}%`,
            width: `${BUTTON_WIDTH}px`,
            height: `${BUTTON_HEIGHT}px`,
            transition: 'top 0.3s ease-out, left 0.3s ease-out',
          }}
          variant="secondary"
          className="font-headline text-xl"
        >
          No
        </Button>
      </div>
    </div>
  );
}
