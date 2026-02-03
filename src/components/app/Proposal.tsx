"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getEvasiveNoButtonPosition } from '@/ai/flows/evasive-no-button';

type ProposalProps = {
  partnerName: string;
  onAccept: () => void;
};

const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 48;

export default function Proposal({ partnerName, onAccept }: ProposalProps) {
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 55, y: 60 });
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isMoving, setIsMoving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const previousPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const recentDecisionsRef = useRef<boolean[]>([]);

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

  const moveButton = useCallback(async (cursorX: number, cursorY: number) => {
    if (isMoving || !screenSize.width || !screenSize.height) return;

    setIsMoving(true);

    try {
      const result = await getEvasiveNoButtonPosition({
        cursorX,
        cursorY,
        screenWidth: screenSize.width,
        screenHeight: screenSize.height,
        previousPositions: previousPositionsRef.current,
        recentDecisions: recentDecisionsRef.current,
      });

      // Clamp position to be within bounds
      const newX = Math.min(Math.max(result.x, 0), screenSize.width - BUTTON_WIDTH);
      const newY = Math.min(Math.max(result.y, 0), screenSize.height - BUTTON_HEIGHT);

      setNoButtonPosition({ x: (newX / screenSize.width) * 100, y: (newY / screenSize.height) * 100 });

      previousPositionsRef.current.push({ x: newX, y: newY });
      if (previousPositionsRef.current.length > 5) {
        previousPositionsRef.current.shift();
      }
      recentDecisionsRef.current.push(false);
       if (recentDecisionsRef.current.length > 5) {
        recentDecisionsRef.current.shift();
      }

    } catch (error) {
      console.error("Failed to get new button position:", error);
      // Fallback random position
      const x = Math.random() * (screenSize.width - BUTTON_WIDTH);
      const y = Math.random() * (screenSize.height - BUTTON_HEIGHT);
      setNoButtonPosition({ x: (x / screenSize.width) * 100, y: (y / screenSize.height) * 100 });
    } finally {
      setTimeout(() => setIsMoving(false), 200); // Cooldown to prevent spamming
    }
  }, [isMoving, screenSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMoving || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const noButtonX = (noButtonPosition.x / 100) * screenSize.width;
    const noButtonY = (noButtonPosition.y / 100) * screenSize.height;

    const distance = Math.sqrt(
      Math.pow(cursorX - (noButtonX + BUTTON_WIDTH / 2), 2) +
      Math.pow(cursorY - (noButtonY + BUTTON_HEIGHT / 2), 2)
    );

    if (distance < 80) { // Evasion radius
      moveButton(cursorX, cursorY);
    }
  };

  const handleYesClick = () => {
    recentDecisionsRef.current.push(true);
    onAccept();
  }

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
        onMouseMove={handleMouseMove}
        className="relative w-full h-64 md:h-80"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
           <Button
            onClick={handleYesClick}
            className="transform transition-transform duration-300 hover:scale-110 font-headline text-2xl px-12 py-8"
            style={{ width: '150px' }}
          >
            Yes
            <Heart className="ml-2 fill-current" />
          </Button>
        </div>
        
        <Button
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
