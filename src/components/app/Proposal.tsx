"use client";

import { useState, useRef, useEffect } from 'react';

// ==========================================
// PROPOSAL COMPONENT
// ==========================================

type ProposalProps = {
  partnerName: string;
  onAccept: () => void;
};

export default function Proposal({ partnerName, onAccept }: ProposalProps) {
  const [isFinalState, setIsFinalState] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  const handleYesClick = () => {
    setIsFinalState(true);
    setTimeout(onAccept, 1200);
  };

  const handleNoCaught = () => {
    setIsBroken(true);
  };

  return (
    <div className="text-center animate-in fade-in-0 duration-1000">
      <h1 className="font-headline text-4xl md:text-7xl text-primary leading-tight">
        {partnerName ? `${partnerName},` : "My Dearest,"}
      </h1>
      <h2 className="font-headline text-3xl md:text-6xl text-foreground/90 mt-4 mb-12">
        Will you marry me?
      </h2>
      <div className="relative w-full h-96">
        <LivingButton
          type="yes"
          label="Yes"
          onClick={handleYesClick}
          onCaught={() => {}}
          isBroken={isBroken}
          isFinalState={isFinalState}
        />
        {!isFinalState && !isBroken && (
           <LivingButton
             type="no"
             label="No"
             onClick={() => {}}
             onCaught={handleNoCaught}
             isBroken={isBroken}
             isFinalState={isFinalState}
           />
        )}
      </div>
    </div>
  );
}


// ==========================================
// LIVING BUTTON COMPONENT (EMOJI-FREE)
// ==========================================
const LivingButton = ({ type, label, onClick, onCaught, isBroken, isFinalState }: { type: 'yes' | 'no', label: string, onClick?: () => void, onCaught?: () => void, isBroken: boolean, isFinalState: boolean }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [teleports, setTeleports] = useState(0);
  const [speech, setSpeech] = useState("");
  const maxTeleports = 5;

  const isYes = type === 'yes';

  useEffect(() => {
    if (isFinalState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      // Eye tracking logic
      const angle = Math.atan2(dy, dx);
      const eyeDist = Math.min(dist / 15, 8);
      setPupilPos({ x: Math.cos(angle) * eyeDist, y: Math.sin(angle) * eyeDist });

      // Proximity reactions
      if (dist < 200) {
        if (isYes) {
          setSpeech("Pick me!");
        } else if (teleports < maxTeleports) {
          const jumpX = (Math.random() - 0.5) * 500;
          const jumpY = (Math.random() - 0.5) * 400;
          setTeleports(t => t + 1);
          setSpeech(["Wait!", "Not there!", "Too fast!", "Oops!", "Catch me!"][teleports % 5]);
          
          setPosition(prev => ({
            x: Math.max(Math.min(prev.x + jumpX, window.innerWidth * 0.4), -window.innerWidth * 0.4),
            y: Math.max(Math.min(prev.y + jumpY, window.innerHeight * 0.3), -window.innerHeight * 0.3)
          }));
        } else {
          setSpeech("I surrender");
        }
      } else {
        setSpeech("");
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [teleports, isFinalState, isYes]);

  // Determine emotional state
  const getMood = () => {
    if (isYes) return isHovered ? 'excited' : 'happy';
    if (isFinalState) return 'broken';
    if (teleports >= maxTeleports) return 'sad';
    if (speech) return 'surprised';
    return 'neutral';
  };

  return (
    <div 
      className="absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-center z-20"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: isYes ? 'calc(50% - 180px)' : 'calc(50% + 20px)',
        top: '50%',
        transformOrigin: 'center',
      }}
    >
      {/* Speech Bubble (Emoji-Free) */}
      {speech && (
        <div className="mb-6 bg-white text-slate-900 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-bounce shadow-2xl relative border-b-4 border-slate-200 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white">
          {speech}
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={isYes ? onClick : (teleports >= maxTeleports ? onCaught : undefined)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex flex-col items-center justify-center p-6 rounded-[2.5rem]
          transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-b-[10px] active:border-b-0 active:translate-y-2
          ${isYes 
            ? 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400 w-52 h-36' 
            : 'bg-rose-500 border-rose-700 hover:bg-rose-400 w-52 h-36'
          }
          ${isYes && isFinalState ? 'scale-[25] opacity-100 z-50 fixed inset-0 !rounded-none duration-1000' : 'scale-100'}
          ${isBroken && !isYes ? 'bg-slate-950 border-transparent duration-1000 animate-pulse' : ''}
          group
        `}
      >
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-[2.5rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-xl`} />

        <div className="flex gap-4 mb-4 relative z-10">
          <Eye pos={pupilPos} mood={getMood()} />
          <Eye pos={pupilPos} mood={getMood()} />
        </div>
        <span className="text-white font-black text-2xl tracking-[0.1em] uppercase drop-shadow-lg relative z-10">{label}</span>

        {isBroken && !isYes && (
          <div className="absolute inset-0 flex pointer-events-none">
            <div className="w-1/2 h-full border-r-2 border-slate-900/40 -rotate-3 animate-pulse" />
            <div className="w-1/2 h-full border-l-2 border-slate-900/40 rotate-3 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};

const Eye = ({ pos, mood }: { pos: {x: number, y: number}, mood: string }) => {
  const moods: Record<string, any> = {
    happy: { lid: '0%', pupil: 1.2, brow: '0deg', browY: '-5px' },
    excited: { lid: '0%', pupil: 1.8, brow: '-15deg', browY: '-10px' },
    surprised: { lid: '0%', pupil: 0.6, brow: '-25deg', browY: '-12px' },
    sad: { lid: '65%', pupil: 0.8, brow: '20deg', browY: '2px' },
    broken: { lid: '100%', pupil: 0, brow: '0deg', browY: '0px' },
    neutral: { lid: '15%', pupil: 1, brow: '0deg', browY: '0px' }
  };
  const m = moods[mood] || moods.neutral;

  return (
    <div className="w-11 h-11 bg-white rounded-full overflow-hidden relative shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)]">
      {/* Eye Brow (Pure CSS/UI) */}
      <div 
        className="absolute w-full h-1 bg-slate-900/20 top-1 transition-all duration-300"
        style={{ transform: `translateY(${m.browY}) rotate(${m.brow})` }}
      />

      {/* Pupil */}
      <div 
        className="w-6 h-6 bg-slate-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
        style={{ 
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${m.pupil})`,
        }}
      >
        <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-30" />
      </div>
      
      {/* Eyelid */}
      <div 
        className="absolute top-0 left-[-10%] w-[120%] bg-slate-800 transition-all duration-300" 
        style={{ height: m.lid, transform: `rotate(${m.brow})`, borderRadius: '0 0 50% 50%' }}
      />
    </div>
  );
};
