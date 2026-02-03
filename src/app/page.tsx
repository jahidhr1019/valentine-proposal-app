"use client";

import React, { useState, useEffect, useRef, useMemo, ChangeEvent, MouseEvent } from 'react';

/**
 * EMOTIONAL PROPOSAL APP
 * * FEATURES:
 * - Setup Screen: Personalize names and upload photos.
 * - Dynamic Header: Changes text as the user tries to click "NO".
 * - Living Buttons: "YES" follows you, "NO" runs away and gets tired.
 * - Love Odyssey Success: A cinematic slideshow of memories with a custom message.
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
};

type HeartSVGProps = {
  className?: string;
};

type FloatingHeartsProps = {
  count: number;
};

type EyeProps = {
  pos: { x: number; y: number };
  mood: string;
};


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

  const handleStart = (data: SetupData) => {
    setSetupData(data);
    setIsStarted(true);
  };

  const handleNoClicked = () => {
    setRejectionCount(prev => prev + 1);
  };

  const handleYesClicked = (e?: React.MouseEvent) => {
    // Prevent event bubbling just in case
    if (e) e.stopPropagation();
    setIsFinalState(true);
    // Short delay for the "YES" button to expand and cover the screen
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
    "Will You?",
    "Are you sure?",
    "Think again?",
    "Really...?",
    "But why?",
    "Please?",
    "I'll ask forever..."
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-8 overflow-hidden relative selection:bg-rose-500/30">
      
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-rose-900/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-indigo-900/10 rounded-full blur-[160px] animate-pulse delay-1000" />
        <FloatingHearts count={15} />
      </div>

      {/* --- MAIN HEADER --- */}
      <div className={`absolute top-24 text-center z-10 transition-all duration-1000 ${isFinalState ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100'}`}>
        <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter text-white drop-shadow-[0_0_40px_rgba(225,29,72,0.3)]">
          {setupData.partnerName}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-600 to-pink-500 bg-[length:200%_auto] animate-gradient-x">
            {mainMessages[rejectionCount % mainMessages.length]}
          </span>
        </h1>
        <p className="text-rose-200/40 font-bold tracking-[0.4em] uppercase text-[10px]">
          A Digital Proposal by {setupData.yourName}
        </p>
      </div>

      {/* --- BUTTON CANVAS --- */}
      <div className="w-full h-full fixed inset-0">
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
          />
        </div>
      </div>

      {/* --- FOOTER FEEDBACK --- */}
      <div className="absolute bottom-16 z-10 pointer-events-none">
          <div className="px-8 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
            <div className="text-rose-400 font-bold text-[10px] tracking-[0.5em] uppercase flex items-center gap-4">
              {rejectionCount === 0 ? "Chase the heart" : `Heartbreak Attempt ${rejectionCount}`}
              {rejectionCount > 10 && <span className="text-white/40">It's getting tired...</span>}
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

// --- SUCCESS ODYSSEY COMPONENT ---

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

    setTimeout(() => setShowMessage(true), 1500);

    return () => clearInterval(slideInterval);
  }, [displayImages.length]);

  return (
    <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden z-[100]">
      {/* Background Slideshow (Blurry) */}
      <div className="absolute inset-0 transition-all duration-1000 scale-110 blur-3xl opacity-30">
        <img src={displayImages[currentIndex]} className="w-full h-full object-cover" alt="backdrop" />
      </div>

      <FloatingHearts count={40} />

      {/* Main Content */}
      <div className="relative w-full max-w-4xl px-6 z-10 flex flex-col items-center">
        
        {/* Photo Card */}
        <div className="relative group perspective-1000">
          <div className="bg-white p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform transition-all duration-1000 animate-in zoom-in-75">
            <div className="relative overflow-hidden aspect-[4/5] w-72 md:w-96">
              <img 
                key={currentIndex}
                src={displayImages[currentIndex]} 
                className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000"
                alt="Memory"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.2)]" />
            </div>
            <div className="pt-6 pb-2 text-center">
               <p className="font-serif text-2xl md:text-3xl text-slate-800 italic">
                 {partnerName} & {yourName}
               </p>
               <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mt-2">Our Forever Story</p>
            </div>
          </div>
        </div>

        {/* Cinematic Message */}
        {showMessage && (
          <div className="mt-12 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 shadow-2xl">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 mb-6 text-center tracking-tight">
              She Said Yes!
            </h2>
            <p className="text-rose-100 text-lg md:text-xl font-light italic leading-relaxed text-center max-w-lg mx-auto">
              "{customMessage}"
            </p>
            <div className="mt-8 flex justify-center gap-4">
               <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center animate-bounce">
                  <HeartSVG className="w-6 h-6 text-rose-500" />
               </div>
               <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center animate-bounce delay-150">
                  <HeartSVG className="w-6 h-6 text-rose-500" />
               </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => window.location.reload()} className="fixed bottom-8 text-rose-400 text-[10px] font-black tracking-[0.4em] uppercase opacity-30 hover:opacity-100 transition-opacity z-[110]">
        Reset Presentation
      </button>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

// --- CORE UI SUB-COMPONENTS ---

const HeartSVG = ({ className }: HeartSVGProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FloatingHearts = ({ count }: FloatingHeartsProps) => {
  const hearts = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 20 + 8,
    delay: Math.random() * 10,
    duration: Math.random() * 10 + 10,
    opacity: Math.random() * 0.3 + 0.1
  })), [count]);

  return (
    <>
      {hearts.map(h => (
        <div key={h.id} className="absolute bottom-[-10%] animate-float pointer-events-none"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            opacity: h.opacity,
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
          20% { opacity: var(--tw-opacity); }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </>
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
        if (ev.target?.result) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ev.target!.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HeartSVG className="w-32 h-32 text-rose-500" />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Create the Moment</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Your Name</label>
            <input 
              type="text"
              placeholder="Romeo"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all placeholder:text-white/10"
              value={formData.yourName} onChange={e => setFormData({...formData, yourName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Partner's Name</label>
            <input 
              type="text"
              placeholder="Juliet"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all placeholder:text-white/10"
              value={formData.partnerName} onChange={e => setFormData({...formData, partnerName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Your Message</label>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white h-24 resize-none outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2">Upload Memories (Pics)</label>
            <div className="flex flex-wrap gap-2 py-2">
              {formData.images.map((img, i) => (
                <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border border-rose-500/50" alt="" />
              ))}
              <label className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-white/40 text-xl">+</span>
                <input type="file" multiple className="hidden" onChange={handleImage} />
              </label>
            </div>
          </div>

          <button 
            disabled={!formData.yourName || !formData.partnerName}
            onClick={() => onStart(formData)}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-20 active:scale-95"
          >
            START THE PROPOSAL
          </button>
        </div>
      </div>
    </div>
  );
};

const LivingButton = ({ type, label, onClick, onCaught, isFinalState }: LivingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [teleports, setTeleports] = useState(0);
  const [speech, setSpeech] = useState("");
  const [mode, setMode] = useState<string | null>(null); 
  
  const isYes = type === 'yes';
  const maxAttempts = 10;

  const triggerEvasion = () => {
    if (teleports >= maxAttempts) return;
    const modes = ['tiny', 'tornado', 'wind', 'ghost'];
    const currentMode = modes[teleports % modes.length];
    const lines = ["Nope!", "🌪️ TORNADO!", "💨 Catch me!", "👻 Ghostly!", "Almost!", "Oof...", "Wait...", "I'm pooped...", "Okay fine."];
    setMode(currentMode);
    setSpeech(lines[Math.min(teleports, lines.length - 1)]);
    
    setTimeout(() => {
      const padding = 120;
      let tx, ty;
      let valid = false;
      let it = 0;
      while (!valid && it < 50) {
        tx = (Math.random() * (window.innerWidth - padding * 2)) + padding;
        ty = (Math.random() * (window.innerHeight - padding * 2)) + padding;
        const dx = Math.abs(tx - window.innerWidth / 2);
        const dy = Math.abs(ty - window.innerHeight / 2);
        if (dx > 200 || dy > 150) valid = true;
        it++;
      }
      setPosition({ x: tx - (window.innerWidth / 2), y: ty - (window.innerHeight / 2) });
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
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      setPupilPos({ x: Math.cos(angle) * 7, y: Math.sin(angle) * 7 });
      if (!isYes) {
        const evasionRadius = Math.max(80, 200 - (teleports * 8));
        if (dist < evasionRadius && teleports < maxAttempts) triggerEvasion();
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [teleports, isFinalState, isYes, mode]);

  const getMood = () => {
    if (isFinalState) return 'broken';
    if (isYes) return isHovered ? 'excited' : 'happy';
    if (teleports >= maxAttempts) return 'exhausted';
    if (mode) return 'fear';
    return teleports > 10 ? 'tired' : 'neutral';
  };

  return (
    <div 
      className={`absolute top-1/2 left-1/2 transition-all duration-500 ease-out flex flex-col items-center pointer-events-auto z-20 
        ${!isYes && teleports > 10 && teleports < maxAttempts ? 'animate-pant' : ''}`}
      style={{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${mode === 'tiny' ? 0.15 : 1})`,
        marginLeft: isYes ? (position.x === 0 ? '-140px' : '0') : (position.x === 0 ? '140px' : '0'),
        opacity: mode === 'ghost' ? 0.2 : 1,
        cursor: (!isYes && teleports < maxAttempts) ? 'none' : 'pointer'
      }}
    >
      {speech && (
        <div className="mb-6 bg-white text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest animate-bounce shadow-xl">
          {speech}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={isYes ? onClick : (teleports >= maxAttempts ? onCaught : undefined)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex flex-col items-center justify-center rounded-[3rem] w-48 h-36
          transition-all duration-500 border-b-[10px] active:border-b-0 active:translate-y-2
          ${isYes ? 'bg-emerald-500 border-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-rose-500 border-rose-700'}
          ${isYes && isFinalState ? 'scale-[100] opacity-100 fixed inset-0 z-50 rounded-none' : ''}
        `}
      >
        <div className={`flex gap-4 mb-4 scale-110 transition-opacity ${isFinalState ? 'opacity-0' : 'opacity-100'}`}>
          <Eye pos={pupilPos} mood={getMood()} />
          <Eye pos={pupilPos} mood={getMood()} />
        </div>
        <span className={`text-white font-black text-xl tracking-[0.2em] transition-opacity ${isFinalState ? 'opacity-0' : 'opacity-100'}`}>
          {label}
        </span>
      </button>

      <style>{`
        @keyframes pant {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-pant { animation: pant 0.2s infinite; }
      `}</style>
    </div>
  );
};

const Eye = ({ pos, mood }: EyeProps) => {
  const moods: Record<string, { lid: string, p: number }> = {
    happy: { lid: '0%', p: 1.2 },
    excited: { lid: '0%', p: 1.8 },
    fear: { lid: '0%', p: 0.5 },
    tired: { lid: '40%', p: 0.8 },
    exhausted: { lid: '70%', p: 0.6 },
    broken: { lid: '100%', p: 0 },
    neutral: { lid: '10%', p: 1 }
  };
  const m = moods[mood] || moods.neutral;

  return (
    <div className="w-10 h-10 bg-white rounded-full overflow-hidden relative shadow-inner">
      <div className="w-5 h-5 bg-slate-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
           style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${m.p})` }} />
      <div className="absolute top-0 left-0 w-full bg-slate-800 transition-all duration-500" style={{ height: m.lid }} />
    </div>
  );
};
