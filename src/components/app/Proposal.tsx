"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';

type SetupData = {
  yourName: string;
  partnerName: string;
  message: string;
  images: string[];
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function Home() {
  const [setupData, setSetupData] = useState<SetupData>({
    yourName: '',
    partnerName: '',
    message: '',
    images: []
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [isFinalState, setIsFinalState] = useState(false);
  const [showRally, setShowRally] = useState(false);
  const [revealImage, setRevealImage] = useState<string | null>(null);

  const handleStart = (data: SetupData) => {
    setSetupData(data);
    setIsStarted(true);
  };

  const handleNoCaught = () => {
    setIsFinalState(true);
    setTimeout(() => {
      setIsBroken(true);
      setTimeout(() => {
        setIsBroken(false);
        setIsFinalState(false);
      }, 3000);
    }, 500);
  };

  const handleYesClicked = () => {
    setShowRally(true);
  };

  if (!isStarted) {
    return <SetupPage onStart={handleStart} />;
  }

  if (showRally) {
    return (
      <PhotoRally 
        userImages={setupData.images} 
        revealImage={revealImage}
        setRevealImage={setRevealImage}
        customMessage={setupData.message}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 overflow-hidden relative selection:bg-rose-500/30">
      {/* Enhanced Romantic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-rose-900/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-900/20 rounded-full blur-[140px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.05),transparent_70%)]" />
        
        {/* Sparkles/Particles */}
        <div className="absolute inset-0 opacity-30">
           {Array.from({ length: 40 }).map((_, i) => (
             <div 
               key={i} 
               className="absolute rounded-full bg-white animate-twinkle"
               style={{
                 width: `${Math.random() * 3}px`,
                 height: `${Math.random() * 3}px`,
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 5}s`,
                 animationDuration: `${Math.random() * 3 + 2}s`
               }}
             />
           ))}
        </div>
        
        <FloatingHearts count={25} />
      </div>

      <div className={`absolute top-20 text-center z-10 transition-all duration-1000 ${isFinalState ? 'opacity-0 scale-90 blur-lg' : 'opacity-100 scale-100'}`}>
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-white drop-shadow-[0_0_30px_rgba(225,29,72,0.4)]">
          {setupData.partnerName}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-rose-500 to-pink-400 bg-[length:200%_auto] animate-gradient-x">Will You?</span>
        </h1>
        <div className="flex items-center justify-center gap-6">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-rose-500/50" />
          <p className="text-rose-200/80 font-bold tracking-[0.5em] uppercase text-[12px] drop-shadow-sm">
            A love note from {setupData.yourName}
          </p>
          <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-rose-500/50" />
        </div>
      </div>

      <div className="w-full h-full fixed inset-0 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <LivingButton 
            type="yes" 
            label="YES"
            onClick={handleYesClicked}
            isBroken={isBroken} 
            isFinalState={isFinalState} 
          />
          <LivingButton 
            type="no" 
            label="NO"
            onCaught={handleNoCaught} 
            isFinalState={isFinalState} 
          />
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10">
        {isBroken ? (
          <div className="animate-bounce text-rose-300 font-bold text-lg tracking-widest uppercase bg-rose-950/60 px-10 py-4 rounded-3xl border border-rose-500/40 backdrop-blur-xl flex items-center gap-4 shadow-2xl">
             <HeartSVG className="w-6 h-6 animate-pulse text-rose-500" />
            <span>I'm fragile...</span>
          </div>
        ) : (
          <div className="px-6 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <div className="text-rose-400/80 font-bold text-[10px] tracking-[0.6em] uppercase flex items-center gap-4">
              <div className="animate-ping w-1.5 h-1.5 bg-rose-500 rounded-full" />
              Listen to your heart
              <div className="animate-ping w-1.5 h-1.5 bg-rose-500 rounded-full delay-300" />
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
        }
        @keyframes shiver {
          0% { transform: translate(0, 0); }
          25% { transform: translate(3px, -3px); }
          50% { transform: translate(-3px, 3px); }
          75% { transform: translate(3px, 3px); }
          100% { transform: translate(0, 0); }
        }
        .animate-shiver {
          animation: shiver 0.08s linear infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-twinkle {
          animation: twinkle linear infinite;
        }
      `}</style>
    </main>
  );
}

// ==========================================
// UTILITY COMPONENTS (HEARTS & SVG)
// ==========================================
const HeartSVG = ({ className }: {className?: string}) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FloatingHearts = ({ count }: {count: number}) => {
  const hearts = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 25 + 10,
    delay: Math.random() * 8,
    duration: Math.random() * 12 + 8,
    opacity: Math.random() * 0.4 + 0.1
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
            color: '#e11d48'
          }}
        >
          <HeartSVG className="w-full h-full" />
        </div>
      ))}
      <style>{`
        @keyframes float-heart {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: var(--tw-opacity); }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-heart {
          animation: float-heart linear infinite;
        }
      `}</style>
    </>
  );
};

// ==========================================
// SETUP PAGE COMPONENT
// ==========================================
const SetupPage = ({ onStart }: {onStart: (data: SetupData) => void}) => {
  const [formData, setFormData] = useState<SetupData>({
    yourName: '',
    partnerName: '',
    message: "You've made me the happiest person. I promise to cherish every moment we share together.",
    images: []
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
          setFormData(prev => ({ ...prev, images: [...prev.images, event.target!.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 blur-[120px] rounded-full" />
      </div>
      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10">
        <div className="flex justify-center mb-8">
          <div className="p-5 bg-rose-500/10 rounded-full ring-1 ring-rose-500/30">
            <HeartSVG className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 text-center tracking-tight">Personalize Your Proposal</h2>
        <p className="text-slate-400 text-center text-sm mb-10">Every detail counts for the perfect "Yes"</p>
        
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-widest text-rose-400 ml-4">From</label>
            <input 
              type="text" 
              placeholder="Your Name"
              className="w-full bg-black/30 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-rose-500 transition-all outline-none"
              value={formData.yourName}
              onChange={e => setFormData({...formData, yourName: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-widest text-rose-400 ml-4">To</label>
            <input 
              type="text" 
              placeholder="Their Name"
              className="w-full bg-black/30 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-rose-500 transition-all outline-none"
              value={formData.partnerName}
              onChange={e => setFormData({...formData, partnerName: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-widest text-rose-400 ml-4">Your Note</label>
            <textarea 
              placeholder="A sweet message for when they click Yes..."
              className="w-full bg-black/30 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-rose-500 transition-all outline-none h-24 resize-none"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            />
          </div>
          
          <div className="space-y-1">
             <label className="text-xs uppercase font-bold tracking-widest text-rose-400 ml-4">Memories (Photos)</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {formData.images.map((img, i) => (
                <img key={i} src={img} className="w-14 h-14 rounded-2xl object-cover border border-rose-500/20" alt="" />
              ))}
              <label className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-500/5 transition-all">
                <span className="text-slate-500 text-2xl">+</span>
                <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>

          <button 
            disabled={!formData.yourName || !formData.partnerName}
            onClick={() => onStart(formData)}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black py-5 rounded-3xl shadow-[0_15px_40px_rgba(225,29,72,0.3)] transition-all disabled:opacity-30 mt-6 active:scale-95 group flex items-center justify-center gap-3 tracking-[0.2em]"
          >
            CREATE THE MOMENT
            <HeartSVG className="w-5 h-5 group-hover:scale-125 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PHOTO RALLY COMPONENT
// ==========================================
type PhotoRallyProps = {
  userImages: string[];
  revealImage: string | null;
  setRevealImage: React.Dispatch<React.SetStateAction<string | null>>;
  customMessage: string;
}

const PhotoRally = ({ userImages, revealImage, setRevealImage, customMessage }: PhotoRallyProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  const allImages = useMemo(() => userImages.length > 0 ? userImages : ["https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop"], [userImages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealImage(allImages[Math.floor(Math.random() * allImages.length)]);
      setIsRevealed(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [allImages, setRevealImage]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center overflow-hidden relative">
      <FloatingHearts count={30} />
      {!isRevealed ? (
        <div className="flex flex-col items-center gap-8 relative z-10 scale-125">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-rose-500/10 rounded-full" />
            <div className="w-24 h-24 border-4 border-rose-500 border-t-transparent rounded-full animate-spin absolute top-0 shadow-[0_0_20px_rgba(225,29,72,0.5)]" />
            <HeartSVG className="w-10 h-10 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-rose-400 font-black tracking-[0.4em] animate-pulse uppercase text-[10px]">Processing Love...</p>
        </div>
      ) : (
        <div className="max-w-2xl text-center px-10 animate-in zoom-in fade-in duration-1000 relative z-10">
          <div className="bg-white p-5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] rotate-2 mb-14 inline-block rounded-sm transform hover:rotate-0 transition-all duration-700 cursor-pointer">
             <div className="relative overflow-hidden">
               <img src={revealImage || ''} className="w-80 h-[28rem] object-cover grayscale-[20%] hover:grayscale-0 transition-all" />
               <div className="absolute inset-0 ring-inset ring-1 ring-black/10" />
             </div>
          </div>
          <h2 className="text-4xl md:text-5xl text-white font-black italic mb-10 leading-tight drop-shadow-2xl font-serif">"{customMessage}"</h2>
          <button onClick={() => window.location.reload()} className="text-rose-400 border-2 border-rose-500/20 px-12 py-5 rounded-full hover:bg-rose-500/10 transition-all font-black tracking-[0.3em] text-[10px] uppercase backdrop-blur-md">Start New Chapter</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// LIVING BUTTON COMPONENT
// ==========================================
type LivingButtonProps = {
  type: 'yes' | 'no';
  label: string;
  onClick?: () => void;
  onCaught?: () => void;
  isBroken?: boolean;
  isFinalState?: boolean;
}

const LivingButton = ({ type, label, onClick, onCaught, isBroken, isFinalState }: LivingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [teleports, setTeleports] = useState(0);
  const [speech, setSpeech] = useState("");
  const [isFearful, setIsFearful] = useState(false);
  const maxTeleports = 12;

  const isYes = type === 'yes';

  // No Button Overlap Prevention Logic
  const getRandomPosition = () => {
    const padding = 120;
    const forbiddenWidth = 400; // Buffer area around YES button
    const forbiddenHeight = 300;
    
    let targetX, targetY;
    let isTooClose = true;
    let attempts = 0;

    // Keep trying until we are away from the center (where YES sits)
    while (isTooClose && attempts < 50) {
      targetX = (Math.random() * (window.innerWidth - padding * 2)) + padding;
      targetY = (Math.random() * (window.innerHeight - padding * 2)) + padding;
      
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      const dx = Math.abs(targetX - screenCenterX);
      const dy = Math.abs(targetY - screenCenterY);

      if (dx > forbiddenWidth / 2 || dy > forbiddenHeight / 2) {
        isTooClose = false;
      }
      attempts++;
    }

    return { 
      x: targetX - (window.innerWidth / 2), 
      y: targetY - (window.innerHeight / 2) 
    };
  };

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

      const angle = Math.atan2(dy, dx);
      const eyeDist = Math.min(dist / 15, 8);
      setPupilPos({ x: Math.cos(angle) * eyeDist, y: Math.sin(angle) * eyeDist });

      if (!isYes) {
        setIsFearful(dist < 260);

        if (dist < 180 && teleports < maxTeleports) {
          setPosition(getRandomPosition());
          setTeleports(t => t + 1);
          setSpeech([
            "Wait!", "Too fast!", "No please!", "Hey!", 
            "Almost!", "Leave me!", "I'm shy!", "Catch me!",
            "Over here!", "Nope!", "Can't touch this!", "Try again!"
          ][teleports % 12]);
        } else if (dist < 120 && teleports >= maxTeleports) {
          setSpeech("Okay, you win...");
        } else if (dist >= 300) {
          setSpeech("");
        }
      } else {
        if (dist < 200) {
          setSpeech("Click Me!");
        } else {
          setSpeech("");
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [teleports, isFinalState, isYes]);

  const getMood = () => {
    if (isYes) return isHovered ? 'excited' : 'happy';
    if (isFinalState) return 'broken';
    if (!isYes && teleports >= maxTeleports) return 'sad';
    if (!isYes && isFearful) return 'fear';
    if (speech) return 'surprised';
    return 'neutral';
  };

  return (
    <div 
      className={`absolute top-1/2 left-1/2 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col items-center z-20 ${!isYes && isFearful && !isFinalState ? 'animate-shiver' : ''}`}
      style={{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        marginLeft: isYes ? (position.x === 0 ? '-140px' : '0') : (position.x === 0 ? '140px' : '0'),
      }}
    >
      {speech && (
        <div className="mb-8 bg-white text-slate-900 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-bounce shadow-[0_15px_40px_rgba(255,255,255,0.2)] relative border-b-4 border-slate-200 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[10px] after:border-transparent after:border-t-white">
          {speech}
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={isYes ? onClick : (teleports >= maxTeleports ? onCaught : undefined)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex flex-col items-center justify-center p-8 rounded-[3.5rem]
          transition-all duration-500 border-b-[12px] active:border-b-0 active:translate-y-2
          ${isYes 
            ? 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400 w-52 h-40 shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)]' 
            : 'bg-rose-500 border-rose-700 hover:bg-rose-400 w-52 h-40 shadow-[0_25px_50px_-12px_rgba(225,29,72,0.5)]'
          }
          ${isYes && isFinalState ? 'scale-[50] opacity-100 z-50 fixed inset-0 !rounded-none duration-1000' : 'scale-100'}
          ${isBroken && isYes ? 'bg-slate-950 border-transparent duration-1000' : ''}
          group
        `}
      >
        <div className={`absolute inset-0 rounded-[3.5rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-3xl`} />

        <div className="flex gap-6 mb-5 relative z-10 scale-125">
          <Eye pos={pupilPos} mood={getMood()} />
          <Eye pos={pupilPos} mood={getMood()} />
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <span className="text-white font-black text-2xl tracking-[0.3em] uppercase drop-shadow-lg">{label}</span>
        </div>

        {isBroken && isYes && (
          <div className="absolute inset-0 flex pointer-events-none opacity-20">
            <div className="w-1/2 h-full border-r border-white/50 -rotate-12 animate-pulse" />
            <div className="w-1/2 h-full border-l border-white/50 rotate-12 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};

type EyeProps = {
  pos: { x: number, y: number };
  mood: string;
}

const Eye = ({ pos, mood }: EyeProps) => {
  const moods: Record<string, any> = {
    happy: { lid: '0%', pupil: 1.3, brow: '0deg', browY: '-8px' },
    excited: { lid: '0%', pupil: 1.9, brow: '-25deg', browY: '-14px' },
    surprised: { lid: '0%', pupil: 0.6, brow: '-30deg', browY: '-16px' },
    fear: { lid: '0%', pupil: 0.5, brow: '-35deg', browY: '-18px', disturbed: true },
    sad: { lid: '65%', pupil: 0.8, brow: '30deg', browY: '6px' },
    broken: { lid: '100%', pupil: 0, brow: '0deg', browY: '0px' },
    neutral: { lid: '15%', pupil: 1, brow: '0deg', browY: '0px' }
  };
  const m = moods[mood] || moods.neutral;

  return (
    <div className={`w-12 h-12 bg-white rounded-full overflow-hidden relative shadow-[inset_0_4px_12px_rgba(0,0,0,0.15)] border border-black/5 ${m.disturbed ? 'ring-4 ring-rose-500/30' : ''}`}>
      <div 
        className="absolute w-full h-2 bg-slate-900/30 top-1.5 transition-all duration-300 rounded-full z-30"
        style={{ transform: `translateY(${m.browY}) rotate(${m.brow})` }}
      />
      <div 
        className="w-6 h-6 bg-slate-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
        style={{ 
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${m.pupil})`,
        }}
      >
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-white rounded-full opacity-50" />
      </div>
      <div 
        className="absolute top-0 left-[-10%] w-[120%] bg-slate-800 transition-all duration-300 z-20" 
        style={{ 
          height: m.lid, 
          transform: `rotate(${m.brow})`, 
          borderRadius: mood === 'sad' ? '0 0 100% 100%' : '0 0 50% 50%' 
        }}
      />
    </div>
  );
};