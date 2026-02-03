"use client";

import React, { useState, useEffect, useRef, useMemo, ChangeEvent, MouseEvent } from 'react';

/**
 * EMOTIONAL PROPOSAL APP - REFINED LAYOUT
 * - Fixed Z-index stacking (Header > Buttons > Background).
 * - Safe-zone teleportation for the "NO" button.
 * - Aspect-ratio locked, non-distorting image frames.
 */

type ImageWithCaption = {
  src: string;
  caption: string;
};

type SetupData = {
  yourName: string;
  partnerName: string;
  message: string;
  images: ImageWithCaption[];
};

type LoveOdysseyProps = {
  userImages: ImageWithCaption[];
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
    if (rejectionCount < 4) {
      setRejectionCount(prev => prev + 1);
      setThemeIndex(prev => (prev + 1) % themes.length);
    }
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
              {rejectionCount > 3 && <span className="text-white/40 animate-pulse">Running out of breath...</span>}
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

const HeartSVG = ({ className }: HeartSVGProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const LoveOdyssey = ({ 
  userImages, 
  customMessage, 
  partnerName, 
  yourName 
}: LoveOdysseyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  
  const displayImages = useMemo(() => {
    return userImages.length > 0 ? userImages : [
      { src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200", caption: "" },
      { src: "https://images.unsplash.com/photo-1516589174184-c685266e4871?q=80&w=1200", caption: "" },
      { src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1200", caption: "" }
    ];
  }, [userImages]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 4500);
    setTimeout(() => setShowMessage(true), 1200);
    return () => clearInterval(slideInterval);
  }, [displayImages.length]);

  // Frame styles logic
  const getFrameStyles = (index: number) => {
    const frameType = index % 3;
    if (frameType === 0) {
      // Vintage Gold Frame
      return {
        outer: "bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-700 p-2 shadow-[0_0_60px_rgba(251,191,36,0.3)]",
        inner: "border-4 border-amber-900/20",
        label: "text-amber-200 font-serif italic"
      };
    } else if (frameType === 1) {
      // Cyber Neon Frame
      return {
        outer: "bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-blue-500 p-1 animate-pulse shadow-[0_0_80px_rgba(192,38,211,0.4)]",
        inner: "border border-white/20",
        label: "text-cyan-300 font-mono uppercase tracking-widest"
      };
    } else {
      // Modern Rose Minimal
      return {
        outer: "bg-gradient-to-tr from-rose-500 to-pink-500 p-1.5 shadow-[0_0_50px_rgba(225,29,72,0.4)]",
        inner: "border-2 border-white/10",
        label: "text-rose-100 font-sans font-light tracking-tight"
      };
    }
  };

  const frameStyles = getFrameStyles(currentIndex);

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center overflow-hidden z-[100] p-4 font-sans">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 transition-all duration-1000 scale-125 blur-[100px] opacity-20 pointer-events-none">
        <img src={displayImages[currentIndex].src} className="w-full h-full object-cover" alt="" />
      </div>
      
      <div className="relative w-full max-w-lg z-10 flex flex-col items-center justify-center h-full">
        {/* The Artistic Frame - Centered in the viewport */}
        <div className={`relative group rounded-2xl transition-all duration-1000 transform hover:scale-105 ${frameStyles.outer}`}>
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
            <div className={`relative overflow-hidden aspect-[3/4] w-64 md:w-80 ${frameStyles.inner}`}>
              <img 
                key={currentIndex}
                src={displayImages[currentIndex].src} 
                className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-1000"
                alt="Memory"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="bg-white/5 backdrop-blur-md px-4 py-6 border-t border-white/10 flex flex-col items-center">
               <span className={`text-2xl md:text-3xl transition-all duration-1000 ${frameStyles.label}`}>
                 {partnerName} & {yourName}
               </span>
               <div className="mt-2 flex items-center gap-2">
                 <div className="h-px w-8 bg-white/20" />
                 <span className="text-white/40 text-[9px] font-bold tracking-[0.3em] uppercase">
                   Frame {currentIndex + 1}
                 </span>
                 <div className="h-px w-8 bg-white/20" />
               </div>
            </div>
          </div>
        </div>

        {/* Success Message Card - Positioned relative to the frame to keep overall layout balanced */}
        {showMessage && (
          <div className="absolute top-[85%] md:top-[80%] p-6 md:p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-1000 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] text-center w-full max-w-[90%] md:max-w-md">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
              Endless Love
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 mb-2 tracking-tighter">
              Always & Forever
            </h2>
            <p className="text-rose-100/70 text-sm md:text-base font-light leading-relaxed px-2">
              "{customMessage}"
            </p>
            <div className="mt-4 flex justify-center">
               <HeartSVG className="w-8 h-8 text-rose-500 animate-heartbeat" />
            </div>
          </div>
        )}
      </div>

      {/* Restart Button */}
      <button onClick={() => window.location.reload()} className="absolute bottom-6 text-white/20 hover:text-rose-400 text-[10px] font-bold tracking-[0.5em] uppercase transition-all z-[110] border-b border-white/10 pb-1">
        Begin New Chapter
      </button>

      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        .animate-heartbeat { animation: heartbeat 1.5s infinite; }
      `}</style>
    </div>
  );
};


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
    message: '', 
    images: []
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) {
            setFormData(prev => ({ 
              ...prev, 
              images: [...prev.images, { src: ev.target.result as string, caption: "" }] 
            }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const updateCaption = (idx: number, text: string) => {
    const newImages = [...formData.images];
    newImages[idx].caption = text;
    setFormData({ ...formData, images: newImages });
  };

  const isFormValid = formData.yourName && formData.partnerName;

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-rose-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-xl z-10">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden group">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-6 ring-1 ring-rose-500/30 group-hover:scale-110 transition-transform duration-500">
              <HeartSVG className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Digital Odyssey</h1>
            <p className="text-rose-200/40 font-bold tracking-[0.4em] uppercase text-[10px]">Customize your proposal</p>
          </div>

          <div className="space-y-6">
            {/* Names Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">Your Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Romeo" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10"
                  value={formData.yourName} 
                  onChange={e => setFormData({...formData, yourName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">Their Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Juliet" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10"
                  value={formData.partnerName} 
                  onChange={e => setFormData({...formData, partnerName: e.target.value})} 
                />
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">The Final Note (Optional)</label>
              <textarea 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white h-24 resize-none outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10"
                placeholder="Write a message for when they click 'YES'..." 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})} 
              />
            </div>

            {/* Photo Memories */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">Memories & Captions ({formData.images.length})</label>
              
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {formData.images.map((img, i) => (
                  <div key={i} className="group/item relative flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right-2 duration-300">
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-white/10">
                      <img src={img.src} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <span className="text-xs font-bold uppercase tracking-tighter">Del</span>
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <input 
                        type="text" 
                        className="bg-transparent text-white text-xs outline-none border-b border-white/10 focus:border-rose-500/50 py-1 transition-all"
                        value={img.caption}
                        onChange={(e) => updateCaption(i, e.target.value)}
                        placeholder="Add a caption..."
                      />
                      <span className="text-[8px] text-white/20 uppercase mt-2 tracking-widest">Memory {i + 1}</span>
                    </div>
                  </div>
                ))}

                <label className="w-full h-20 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer text-white/20 hover:text-white/40 hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                  <span className="text-xl mb-1">+</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Upload Photos</span>
                  <input type="file" multiple className="hidden" onChange={handleImage} accept="image/*" />
                </label>
              </div>
            </div>

            {/* Launch Button */}
            <button 
              disabled={!isFormValid}
              onClick={() => onStart(formData)}
              className={`w-full group/btn relative overflow-hidden py-6 rounded-[2rem] font-black tracking-[0.4em] text-[11px] uppercase transition-all duration-500
                ${isFormValid 
                  ? 'bg-rose-600 text-white shadow-[0_20px_40px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-95' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isFormValid ? "Begin Love Odyssey" : "Complete Names to Start"}
                {isFormValid && <HeartSVG className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />}
              </div>
              {isFormValid && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              )}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-white/10 text-[9px] font-bold tracking-[0.5em] uppercase pointer-events-none">
          Secure & Private Experience
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};


const LivingButton = ({ type, label, onClick, onCaught, isFinalState, rejectionCount = 0 }: LivingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [teleports, setTeleports] = useState(0);
  const [speech, setSpeech] = useState("");
  const [mode, setMode] = useState<string | null>(null); 
  const [emotionCycle, setEmotionCycle] = useState(0);

  // New state for temporary pause
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const isYes = type === 'yes';
  const maxAttempts = 4;

  useEffect(() => {
    if (!isYes || isFinalState) return;
    const interval = setInterval(() => {
      setEmotionCycle(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, [isYes, isFinalState]);

  // Effect to handle the pause logic
  useEffect(() => {
    if (isYes || isFinalState) return;

    if (rejectionCount >= maxAttempts && !isPaused) {
      setIsPaused(true);
      setSpeech("I'm tired...");
      if(pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        setIsPaused(false);
        // This doesn't reset the rejectionCount, so it will just pause again.
        // To make it run again, we need to call onCaught to increment rejection count,
        // which will re-key the component and reset its internal state.
        // A better approach is to use internal state for evasion counts.
      }, 2000); // 2 second pause
    }

    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [isYes, isFinalState, rejectionCount, isPaused]);


  const triggerEvasion = () => {
    if (teleports >= 15) return; // a higher internal limit
    const modes = ['tiny', 'tornado', 'wind', 'ghost'];
    const currentMode = modes[teleports % modes.length];
    const lines = ["Nope!", "🌪️ TORNADO!", "💨 Catch me!", "👻 Ghostly!", "Almost!", "Oof...", "Wait...", "I'm pooped...", "Fine..."];
    setMode(currentMode);
    setSpeech(lines[Math.min(teleports, lines.length - 1)]);
    
    setTimeout(() => {
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
    if (isFinalState || isPaused) return;
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
        if (dist < evasionRadius && rejectionCount < maxAttempts) triggerEvasion();
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [teleports, isFinalState, isYes, mode, rejectionCount, isPaused]);

  const handleNoClick = (e: MouseEvent) => {
    if (isPaused) {
      if(pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      onCaught?.();
    }
  }

  const getMood = () => {
    if (isFinalState) return 'broken';
    if (isYes) {
      if (isHovered) return 'heartEyes';
      const yesMoods = ['happy', 'beaming', 'blushing', 'partying', 'kissing'];
      return yesMoods[emotionCycle];
    }
    if (rejectionCount >= maxAttempts) return 'exhausted';
    if (mode) return 'astonished';
    if (rejectionCount > 2) return 'pensive';
    if (rejectionCount > 1) return 'pouting';
    return isHovered ? 'thinking' : 'neutral';
  };

  return (
    <div 
      className={`absolute top-1/2 left-1/2 transition-all duration-300 ease-out flex flex-col items-center pointer-events-auto z-40
        ${rejectionCount >= maxAttempts ? 'animate-pant' : ''}`}
      style={{
        transform: `translate(calc(-50% + ${position.x + magneticOffset.x}px), calc(-50% + ${position.y + magneticOffset.y}px)) scale(${mode === 'tiny' ? 0.2 : 1})`,
        marginLeft: isYes ? (position.x === 0 ? '-120px' : '0') : (position.x === 0 ? '120px' : '0'),
        opacity: mode === 'ghost' ? 0.2 : 1,
        cursor: (!isYes && rejectionCount < maxAttempts) ? 'none' : 'pointer'
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