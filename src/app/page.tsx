"use client";

import React, { useState, useEffect, useRef, useMemo, ChangeEvent, MouseEvent } from 'react';

/**
 * EMOTIONAL PROPOSAL APP - REFINED LAYOUT
 * - Fixed Z-index stacking (Header > Buttons > Background).
 * - Safe-zone teleportation for the "NO" button.
 * - Aspect-ratio locked, non-distorting image frames.
 */

type SetupData = {
  yourName: string;
  partnerName: string;
  message: string;
  images: string[];
};

type LoveOdysseyProps = {
  userImages: string[];
  customMessage: string;
  partnerName: string;
  yourName: string;
};

type SetupPageProps = {
  onStart: (data: SetupData) => void;
};

type LivingButtonProps = {
  type: 'yes' | 'no';
  label: string;
  onClick?: (e?: MouseEvent) => void;
  onCaught?: () => void;
  isFinalState: boolean;
  rejectionCount?: number;
};

type HeartSVGProps = {
  className?: string;
  style?: React.CSSProperties;
};

type FloatingHeartsProps = {
  count: number;
};

type EyeProps = {
  pos: { x: number; y: number };
  mood: string;
};

const themes = [
    { orb1: 'bg-rose-900/10', orb2: 'bg-indigo-900/10' },
    { orb1: 'bg-sky-900/20', orb2: 'bg-violet-900/20' }, // Midnight
    { orb1: 'bg-amber-800/10', orb2: 'bg-red-900/10' }, // Sunset
    { orb1: 'bg-teal-900/10', orb2: 'bg-cyan-900/10' }, // Twilight
];

export default function Home() {
  const [setupData, setSetupData] = useState<SetupData>({
    yourName: '',
    partnerName: '',
    message: '',
    images: []
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isFinalState, setIsFinalState] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);

  const handleStart = (data: SetupData) => {
    setSetupData(data);
    setIsStarted(true);
  };

  const handleNoClicked = () => {
    setRejectionCount(prev => prev + 1);
    setThemeIndex(prev => (prev + 1) % themes.length);
  };

  const handleYesClicked = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFinalState(true);
    setTimeout(() => {
      setShowSuccess(true);
    }, 800);
  };

  if (!isStarted) {
    return <SetupPage onStart={handleStart} />;
  }

  if (showSuccess) {
    return (
      <LoveOdyssey 
        userImages={setupData.images} 
        customMessage={setupData.message}
        partnerName={setupData.partnerName}
        yourName={setupData.yourName}
      />
    );
  }

  const mainMessages = [
    "Will You Marry Me?",
    "Are you absolutely sure?",
    "My heart can't take it!",
    "This is our love story!",
    "But... but... I love you!",
    "Please say yes?",
    "I'll keep asking forever...",
    "My heart skips a beat for you",
    "Is this a 'yes' in disguise?",
    "I'll build you an empire!",
  ];
  
  const currentTheme = themes[themeIndex];

  return (
    <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden selection:bg-rose-500/30">
      
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[60%] ${currentTheme.orb1} rounded-full blur-[120px] animate-pulse transition-colors duration-1000`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] ${currentTheme.orb2} rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-1000`} />
        <FloatingHearts count={12} />
      </div>

      {/* --- MAIN HEADER --- */}
      <div className={`absolute top-12 md:top-20 text-center z-50 px-4 transition-all duration-1000 pointer-events-none ${isFinalState ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100'}`}>
        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter text-white drop-shadow-[0_0_30px_rgba(225,29,72,0.3)]">
          {setupData.partnerName}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-600 to-pink-500 bg-[length:200%_auto] animate-gradient-x">
            {mainMessages[rejectionCount % mainMessages.length]}
          </span>
        </h1>
        <p className="text-rose-200/40 font-bold tracking-[0.4em] uppercase text-[10px]">
          A Digital Proposal by {setupData.yourName}
        </p>
      </div>

      {/* --- BUTTON CANVAS --- */}
      <div className="w-full h-full absolute inset-0 z-40">
        <div className="relative w-full h-full">
          <LivingButton 
            type="yes" 
            label="YES"
            onClick={handleYesClicked}
            isFinalState={isFinalState} 
          />
          <LivingButton 
            key={rejectionCount} 
            type="no" 
            label="NO"
            onCaught={handleNoClicked} 
            isFinalState={isFinalState} 
            rejectionCount={rejectionCount}
          />
        </div>
      </div>

      {/* --- FOOTER FEEDBACK --- */}
      <div className={`absolute bottom-12 z-50 pointer-events-none transition-opacity duration-500 ${isFinalState ? 'opacity-0' : 'opacity-100'}`}>
          <div className="px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
            <div className="text-rose-400 font-bold text-[9px] tracking-[0.4em] uppercase flex items-center gap-3">
              {rejectionCount === 0 ? "Chase the heart" : `Attempt ${rejectionCount}`}
              {rejectionCount > 10 && <span className="text-white/40 animate-pulse">Running out of breath...</span>}
            </div>
          </div>
      </div>
      
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x { animation: gradient-x 4s ease infinite; }
      `}</style>
    </div>
  );
}

const LoveOdyssey = ({ userImages, customMessage, partnerName, yourName }: LoveOdysseyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  
  const displayImages = useMemo(() => {
    return userImages.length > 0 ? userImages : [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200",
      "https://images.unsplash.com/photo-1516589174184-c685266e4871?q=80&w=1200",
      "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1200"
    ];
  }, [userImages]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 4000);
    setTimeout(() => setShowMessage(true), 1200);
    return () => clearInterval(slideInterval);
  }, [displayImages.length]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#110d19] to-[#030712] flex flex-col items-center justify-center overflow-hidden z-[100] p-4">
      <style>{`
        @keyframes ken-burns {
          0%, 100% { transform: scale(1.1) translate(0, 0); filter: brightness(1); }
          50% { transform: scale(1.2) translate(3%, -3%); filter: brightness(1.1); }
        }
        .animate-ken-burns { animation: ken-burns 20s ease-in-out infinite; }
      `}</style>
      
      <div className="absolute inset-0 transition-all duration-[2000ms] scale-125 blur-xl opacity-20">
        <img
          key={currentIndex}
          src={displayImages[currentIndex]}
          className="w-full h-full object-cover animate-ken-burns"
          alt="Romantic backdrop"
        />
      </div>
      
      <FloatingHearts count={30} />
      
      <div className="relative w-full max-w-lg z-10 flex flex-col items-center animate-in fade-in duration-1000 delay-300">
        <div 
          key={currentIndex}
          className="relative bg-white p-4 pb-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-transform duration-700 ease-out animate-in zoom-in-75 slide-in-from-bottom-10 duration-1000"
        >
          <div className="relative overflow-hidden aspect-square w-64 md:w-80 bg-slate-200">
            <img 
              src={displayImages[currentIndex]} 
              className="w-full h-full object-cover"
              alt="Memory"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent" />
             <div className="absolute inset-0 ring-1 ring-black/10 ring-inset" />
          </div>
          <p className="absolute bottom-6 left-6 font-serif text-xl md:text-2xl text-slate-700 italic">
            {partnerName} & {yourName}
          </p>
        </div>

        {showMessage && (
          <div className="mt-12 p-8 bg-black/25 backdrop-blur-lg border border-white/5 rounded-[2rem] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 shadow-2xl text-center max-w-md">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400 mb-5 tracking-tight">
              She Said Yes!
            </h2>
            <p className="text-rose-100/90 text-lg font-light italic leading-relaxed">
              "{customMessage}"
            </p>
            <div className="mt-8 flex justify-center gap-4">
               <HeartSVG className="w-9 h-9 text-rose-400 animate-bounce" />
               <HeartSVG className="w-9 h-9 text-rose-400 animate-bounce" style={{animationDelay: '150ms'}} />
            </div>
          </div>
        )}
      </div>

      <button onClick={() => window.location.reload()} className="absolute bottom-8 text-rose-300/40 text-[9px] font-black tracking-[0.3em] uppercase hover:text-rose-300/80 transition-opacity z-[110]">
        Restart
      </button>
    </div>
  );
};

const HeartSVG = ({ className, style }: HeartSVGProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FloatingHearts = ({ count }: FloatingHeartsProps) => {
  const hearts = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 12,
  })), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map(h => (
        <div key={h.id} className="absolute bottom-[-5%] animate-float opacity-20"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            color: '#be123c'
          }}
        >
          <HeartSVG className="w-full h-full" />
        </div>
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.2; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
};

const SetupPage = ({ onStart }: SetupPageProps) => {
  const [formData, setFormData] = useState<SetupData>({
    yourName: '',
    partnerName: '',
    message: "I promise to love you more with every passing heartbeat.",
    images: []
  });
  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) {
          setFormData(prev => ({ ...prev, images: [...prev.images, ev.target.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-y-auto">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl my-8">
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
          Preparation <HeartSVG className="w-6 h-6 text-rose-600" />
        </h2>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Your Name</label>
            <input type="text" placeholder="Romeo" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all placeholder:text-white/10" value={formData.yourName} onChange={e => setFormData({...formData, yourName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Partner's Name</label>
            <input type="text" placeholder="Juliet" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all placeholder:text-white/10" value={formData.partnerName} onChange={e => setFormData({...formData, partnerName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Your Message</label>
            <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white h-24 resize-none outline-none focus:ring-2 focus:ring-rose-500/50 transition-all" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Upload Memories</label>
            <div className="flex flex-wrap gap-2 py-2">
              {formData.images.map((img, i) => (
                <div key={i} className="w-12 h-12 rounded-lg border border-rose-500/50 overflow-hidden bg-slate-900">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
              <label className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-white/40 text-xl font-light">+</span>
                <input type="file" multiple className="hidden" onChange={handleImage} accept="image/*" />
              </label>
            </div>
          </div>
          <button disabled={!formData.yourName || !formData.partnerName} onClick={() => onStart(formData)} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-20 active:scale-95 mt-4">LAUNCH PROPOSAL</button>
        </div>
      </div>
    </div>
  );
};

const LivingButton = ({ type, label, onClick, onCaught, isFinalState, rejectionCount }: LivingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [teleports, setTeleports] = useState(0);
  const [speech, setSpeech] = useState("");
  const [mode, setMode] = useState<string | null>(null); 
  const [emotionCycle, setEmotionCycle] = useState(0);
  
  const isYes = type === 'yes';
  const maxAttempts = 15;

  useEffect(() => {
    if (!isYes || isFinalState) return;
    const interval = setInterval(() => {
      setEmotionCycle(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, [isYes, isFinalState]);

  const triggerEvasion = () => {
    if (teleports >= maxAttempts) return;
    const modes = ['tiny', 'tornado', 'wind', 'ghost'];
    const currentMode = modes[teleports % modes.length];
    const lines = ["Nope!", "🌪️ TORNADO!", "💨 Catch me!", "👻 Ghostly!", "Almost!", "Oof...", "Wait...", "I'm pooped...", "Fine..."];
    setMode(currentMode);
    setSpeech(lines[Math.min(teleports, lines.length - 1)]);
    
    setTimeout(() => {
      // SAFE ZONE CALCULATION: Prevent button from overlapping header (top 25%) or footer (bottom 20%)
      const padding = 60;
      const safeTop = window.innerHeight * 0.3;
      const safeBottom = window.innerHeight * 0.8;
      
      let tx = (Math.random() * (window.innerWidth - padding * 3)) + padding;
      let ty = (Math.random() * (safeBottom - safeTop)) + safeTop;

      setPosition({ 
        x: tx - (window.innerWidth / 2), 
        y: ty - (window.innerHeight / 2) 
      });
      setTeleports(t => t + 1);
      setTimeout(() => setMode(null), 300);
    }, 400);
  };

  useEffect(() => {
    if (isFinalState) return;
    const handleMove = (e: globalThis.MouseEvent) => {
      if (!buttonRef.current || mode) return;
      const r = buttonRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      
      setPupilPos({ x: Math.cos(angle) * 7, y: Math.sin(angle) * 7 });

      if (isYes) {
        const pullRadius = 350;
        const pull = Math.max(0, 1 - dist / pullRadius); 
        setMagneticOffset({ x: Math.cos(angle) * 20 * pull, y: Math.sin(angle) * 20 * pull });
      } else {
        const evasionRadius = Math.max(100, 220 - (teleports * 10));
        if (dist < evasionRadius && teleports < maxAttempts) triggerEvasion();
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [teleports, isFinalState, isYes, mode]);

  const getMood = () => {
    if (isFinalState) return 'broken';
    if (isYes) {
      if (isHovered) return 'heartEyes';
      const yesMoods = ['happy', 'beaming', 'blushing', 'partying', 'kissing'];
      return yesMoods[emotionCycle];
    }
    if (teleports >= maxAttempts) return 'exhausted';
    if (mode) return 'astonished';
    if (teleports > 12) return 'pensive';
    if (teleports > 9) return 'pouting';
    if (teleports > 6) return 'angry';
    if (teleports > 3) return 'grimacing';
    return isHovered ? 'thinking' : 'neutral';
  };

  return (
    <div 
      className={`absolute top-1/2 left-1/2 transition-all duration-300 ease-out flex flex-col items-center pointer-events-auto z-40
        ${!isYes && teleports > 10 && teleports < maxAttempts ? 'animate-pant' : ''}`}
      style={{
        transform: `translate(calc(-50% + ${position.x + magneticOffset.x}px), calc(-50% + ${position.y + magneticOffset.y}px)) scale(${mode === 'tiny' ? 0.2 : 1})`,
        marginLeft: isYes ? (position.x === 0 ? '-120px' : '0') : (position.x === 0 ? '120px' : '0'),
        opacity: mode === 'ghost' ? 0.2 : 1,
        cursor: (!isYes && teleports < maxAttempts) ? 'none' : 'pointer'
      }}
    >
      {speech && !isFinalState && (
        <div className="mb-4 bg-white text-black px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest animate-bounce shadow-xl">
          {speech}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={isYes ? onClick : onCaught}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setMagneticOffset({x:0, y:0}); }}
        className={`
          relative flex flex-col items-center justify-center rounded-[2.5rem] w-40 h-32 md:w-48 md:h-36
          transition-all duration-500 border-b-[8px] active:border-b-0 active:translate-y-2
          ${isYes ? 'bg-emerald-500 border-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-emerald-400/50' : 'bg-rose-500 border-rose-700'}
          ${isYes && isFinalState ? 'scale-[120] opacity-100 fixed inset-0 z-[60] rounded-none !m-0 !translate-x-0 !translate-y-0' : ''}
        `}
      >
        <div className={`flex gap-3 mb-3 scale-110 md:scale-125 transition-all duration-300 ${isFinalState ? 'opacity-0' : 'opacity-100'}`}>
          <Eye pos={pupilPos} mood={getMood()} />
          <Eye pos={pupilPos} mood={getMood()} />
        </div>
        <span className={`text-white font-black text-lg md:text-xl tracking-[0.2em] transition-opacity ${isFinalState ? 'opacity-0' : 'opacity-100'}`}>
          {label}
        </span>
      </button>

      <style>{`
        @keyframes pant {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-pant { animation: pant 0.2s infinite; }
      `}</style>
    </div>
  );
};

const Eye = ({ pos, mood }: EyeProps) => {
  const moods: Record<string, any> = {
    happy: { lid: '15%', p: 1.2, bg: 'bg-white', color: 'bg-slate-900', cheeks: true },
    beaming: { lid: '-10%', p: 1.4, bg: 'bg-white', color: 'bg-slate-900', shine: true },
    blushing: { lid: '25%', p: 1.1, bg: 'bg-rose-50', color: 'bg-slate-900', blush: true },
    partying: { lid: '5%', p: 1.5, bg: 'bg-white', color: 'bg-slate-900', sparkle: true },
    kissing: { lid: '35%', p: 1.0, bg: 'bg-white', color: 'bg-slate-900', kiss: true },
    heartEyes: { lid: '0%', p: 1.0, bg: 'bg-white', showHearts: true },
    angry: { lid: '-5%', p: 1.2, bg: 'bg-orange-100', color: 'bg-slate-900', brows: 'angry', steam: true },
    pouting: { lid: '35%', p: 1.1, bg: 'bg-rose-100', color: 'bg-slate-900', brows: 'angry', blush: true },
    pensive: { lid: '60%', p: 0.9, bg: 'bg-indigo-50', color: 'bg-slate-700', tear: true },
    grimacing: { lid: '15%', p: 0.8, bg: 'bg-white', color: 'bg-slate-900', shake: true },
    thinking: { lid: '20%', p: 1.2, bg: 'bg-white', color: 'bg-slate-900', brows: 'uneven' },
    astonished: { lid: '-45%', p: 1.6, bg: 'bg-white', color: 'bg-slate-900', shock: true },
    exhausted: { lid: '85%', p: 0.5, bg: 'bg-slate-200', color: 'bg-slate-500', sweat: true },
    broken: { lid: '100%', p: 0, bg: 'bg-slate-900' },
    neutral: { lid: '25%', p: 1, bg: 'bg-white', color: 'bg-slate-900' }
  };
  
  const m = moods[mood] || moods.neutral;

  return (
    <div className={`w-8 h-8 md:w-10 md:h-10 ${m.bg} rounded-full overflow-hidden relative shadow-inner flex items-center justify-center transition-all duration-500 ${m.shake ? 'animate-bounce' : ''}`}>
      {m.brows === 'angry' && (
        <div className="absolute top-1 left-0 w-full flex justify-around px-1 z-30">
          <div className="w-3 h-0.5 md:w-4 md:h-1 bg-slate-900 rounded-full rotate-12 -translate-y-1" />
          <div className="w-3 h-0.5 md:w-4 md:h-1 bg-slate-900 rounded-full -rotate-12 -translate-y-1" />
        </div>
      )}
      {m.brows === 'uneven' && (
        <div className="absolute top-1 left-0 w-full flex justify-around px-1 z-30">
          <div className="w-3 h-0.5 md:w-4 md:h-1 bg-slate-900 rounded-full -rotate-6" />
          <div className="w-3 h-0.5 md:w-4 md:h-1 bg-slate-900 rounded-full -translate-y-1" />
        </div>
      )}
      {m.showHearts ? (
        <HeartSVG className="w-6 h-6 md:w-8 md:h-8 text-rose-500 animate-pulse" />
      ) : (
        <div 
          className={`w-4 h-4 md:w-5 md:h-5 ${m.color} rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-150`}
          style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${m.p})` }} 
        >
          {m.shock && <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />}
          <div className="absolute top-0.5 right-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full opacity-60" />
        </div>
      )}
      <div className="absolute top-0 left-0 w-full bg-slate-800 transition-all duration-300" style={{ height: m.lid }} />
      {m.blush && <div className="absolute bottom-0 inset-x-0 h-2 md:h-3 bg-rose-400/30 blur-sm animate-pulse" />}
      {m.tear && <div className="absolute bottom-1 left-2 w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-400 rounded-full animate-bounce" />}
      {m.sweat && <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-200 rounded-full blur-[1px] animate-pulse" />}
    </div>
  );
};
