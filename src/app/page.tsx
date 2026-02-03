
"use client";

import React, { useState, useEffect, useRef, useMemo, MouseEvent, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from "@/lib/utils";

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
  onCaught?: (e?: MouseEvent) => void;
  isFinalState: boolean;
  rejectionCount?: number;
  yesButtonScale: number;
  noButtonScale: number;
  id?: string;
  isHeartbroken?: boolean;
};

type HeartSVGProps = {
  className?: string;
};

type FloatingHeartsProps = {
  count: number;
};

const themes = [
  { orb1: 'bg-rose-900/10', orb2: 'bg-indigo-900/10' },
  { orb1: 'bg-sky-900/20', orb2: 'bg-violet-900/20' }, // Midnight
  { orb1: 'bg-amber-800/10', orb2: 'bg-red-900/10' },   // Sunset
  { orb1: 'bg-teal-900/10', orb2: 'bg-cyan-900/10' },   // Twilight
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [noButtonScale, setNoButtonScale] = useState(1);
  const [isHeartbroken, setIsHeartbroken] = useState(false);

  const handleStart = (data: SetupData) => {
    setSetupData(data);
    setIsStarted(true);
  };

  const handleNoClicked = () => {
    if (isHeartbroken) return;

    setIsHeartbroken(true);
    setYesButtonScale(prev => prev + 0.4);
    setNoButtonScale(prev => Math.max(0.3, prev * 0.9));

    setTimeout(() => {
        setIsHeartbroken(false);
        setRejectionCount(prev => prev + 1);
    }, 2500);
  };

  const handleYesClicked = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFinalState(true);

    setTimeout(() => {
        setShowCelebration(true);
    }, 800);

    setTimeout(() => {
        setShowSuccess(true);
    }, 800 + 3000);
  };
  
  if (!isStarted) {
    return <SetupPage onStart={handleStart} />;
  }

  if (showSuccess) {
    return (
      <LoveOdyssey 
        userImages={setupData.images} 
        customMessage={setupData.message || "Will you be my Valentine?"}
        partnerName={setupData.partnerName}
        yourName={setupData.yourName}
      />
    );
  }

  if(showCelebration) {
    return <CelebrationScreen />;
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
    "Don't do this to me!",
    "I'm nothing without you.",
    "Last chance, I'm begging!",
  ];
  
  const currentTheme = themes[rejectionCount % themes.length];

  return (
    <div className={cn("fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden selection:bg-rose-500/30", isHeartbroken && "animate-shake")}>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[60%] ${currentTheme.orb1} rounded-full blur-[120px] animate-pulse transition-colors duration-1000`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] ${currentTheme.orb2} rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-1000`} />
        {isHeartbroken ? <FallingBrokenHearts count={50} /> : <FloatingHearts count={250} />}
      </div>

      <div className={`absolute top-12 md:top-20 text-center z-50 px-4 transition-all duration-1000 pointer-events-none ${isFinalState ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100'}`}>
        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter text-white drop-shadow-[0_0_30px_rgba(225,29,72,0.3)]">
          {setupData.partnerName}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-600 to-pink-500 bg-[length:200%_auto] animate-gradient-x">
            {isHeartbroken ? "Is this really goodbye?" : mainMessages[rejectionCount % mainMessages.length]}
          </span>
        </h1>
        <p className="text-rose-200/40 font-bold tracking-[0.4em] uppercase text-[10px]">
          A Digital Proposal by {setupData.yourName}
        </p>
      </div>

      <div className="absolute inset-0 z-40">
        <div className="relative w-full h-full flex items-center justify-center gap-8">
          <LivingButton 
            id="yes-button"
            type="yes" 
            label="YES"
            onClick={handleYesClicked}
            isFinalState={isFinalState} 
            yesButtonScale={yesButtonScale}
            noButtonScale={noButtonScale}
            isHeartbroken={isHeartbroken}
          />
          <LivingButton
            id="no-button"
            key={rejectionCount} 
            type="no" 
            label={"NO"}
            onCaught={handleNoClicked} 
            isFinalState={isFinalState} 
            rejectionCount={rejectionCount}
            yesButtonScale={yesButtonScale}
            noButtonScale={noButtonScale}
            isHeartbroken={isHeartbroken}
          />
        </div>
      </div>

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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

const HeartSVG = ({ className }: HeartSVGProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const BrokenHeartSVG = ({ className }: HeartSVGProps) => (
  <div className={cn("relative", className)}>
    <svg className="absolute inset-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09L12 5.18" transform="translate(-1, -1) rotate(-8 12 12)" />
        <path d="M12 5.18L13.09 3.81C14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35" transform="translate(1, 1) rotate(8 12 12)" />
    </svg>
  </div>
);

const FallingBrokenHearts = ({ count }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHearts(
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          size: Math.random() * 20 + 10,
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 2,
        }))
      );
    }
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map(h => (
        <div key={h.id} className="absolute top-[-20%] animate-fall opacity-60"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            color: '#444'
          }}
        >
          <BrokenHeartSVG className="w-full h-full" />
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear forwards; }
      `}</style>
    </div>
  );
};


const CelebrationScreen = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="fixed inset-0 bg-[#030712]" />;
    }

    return (
        <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden">
            <ConfettiExplosion />
            <div className="relative z-10 text-center animate-in fade-in-0 zoom-in-90 duration-1000">
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-600 to-pink-500 bg-[length:200%_auto] animate-gradient-x mb-4">
                    YES!
                </h1>
                <p className="text-rose-200/60 font-bold tracking-[0.3em] uppercase text-sm animate-in fade-in delay-300 duration-1000 fill-mode-both">
                    You made the right choice, I will always be there for you!
                </p>
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
};

const ConfettiExplosion = () => {
    const [confetti, setConfetti] = useState<any[]>([]);

    useEffect(() => {
        const generatedConfetti = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 2000,
            y: (Math.random() - 0.5) * 2000,
            size: Math.random() * 25 + 10,
            rotation: Math.random() * 1080 - 540,
            delay: Math.random() * 0.5,
            duration: Math.random() * 2 + 1,
            color: ['#be123c', '#fecdd3', '#fda4af', '#fb7185', '#fff1f2'][Math.floor(Math.random() * 5)]
        }));
        setConfetti(generatedConfetti);
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {confetti.map(c => (
                <div
                    key={c.id}
                    className="absolute top-1/2 left-1/2"
                    style={{
                        '--x-end': `${c.x}px`,
                        '--y-end': `${c.y}px`,
                        '--rotate-end': `${c.rotation}deg`,
                        width: `${c.size}px`,
                        color: c.color,
                        animation: `explode ${c.duration}s ease-out ${c.delay}s forwards`,
                    }}
                >
                    <HeartSVG className="w-full h-full" />
                </div>
            ))}
            <style>{`
                @keyframes explode {
                    0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; }
                    100% { transform: translate(var(--x-end), var(--y-end)) scale(1) rotate(var(--rotate-end)); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

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

  const getFrameStyles = (index: number) => {
    const frameType = index % 3;
    if (frameType === 0) {
      return {
        outer: "bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-700 p-2 shadow-[0_0_60px_rgba(251,191,36,0.3)]",
        inner: "border-4 border-amber-900/20",
        label: "text-amber-200 font-serif italic"
      };
    } else if (frameType === 1) {
      return {
        outer: "bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-blue-500 p-1 animate-pulse shadow-[0_0_80px_rgba(192,38,211,0.4)]",
        inner: "border border-white/20",
        label: "text-cyan-300 font-mono uppercase tracking-widest"
      };
    } else {
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
      <div className="absolute inset-0 transition-all duration-1000 scale-125 blur-[100px] opacity-20 pointer-events-none">
        <img src={displayImages[currentIndex].src} className="w-full h-full object-cover" alt="" />
      </div>
      
      <div className="relative w-full max-w-lg z-10 flex flex-col items-center justify-center h-full">
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
  const [hearts, setHearts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setHearts(
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          size: Math.random() * 15 + 10,
          delay: Math.random() * 5,
          duration: Math.random() * 8 + 12,
        }))
      );
    }
  }, [count]);

  if (!mounted) return null;

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

const FloatingBackground = () => {
  const [hearts, setHearts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const generatedHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 20 + 10}px`,
      opacity: Math.random() * 0.3 + 0.05,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 15 + 10}s`,
    }));
    setHearts(generatedHearts);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute bottom-[-10%] animate-float-up text-rose-500/40"
          style={{
            left: h.left,
            width: h.width,
            opacity: h.opacity,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          <HeartSVG className="w-full h-full" />
        </div>
      ))}
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
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
    const newImages: ImageWithCaption[] = [...formData.images];
    newImages[idx].caption = text;
    setFormData({ ...formData, images: newImages });
  };

  const isFormValid = formData.yourName && formData.partnerName;

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-rose-500/30 overflow-x-hidden relative">
      {mounted && <FloatingBackground />}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-xl z-10">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden group">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-6 ring-1 ring-rose-500/30 group-hover:scale-110 transition-transform duration-500">
              <HeartSVG className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Digital Odyssey</h1>
            <p className="text-rose-200/40 font-bold tracking-[0.4em] uppercase text-[10px]">Customize your proposal</p>
          </div>

          <div className="space-y-6">
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

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">The Final Note (Optional)</label>
              <textarea 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white h-24 resize-none outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10"
                placeholder="What is it, yes or no?" 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})} 
              />
            </div>

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
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: inherit; }
          90% { opacity: inherit; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-up { animation: float-up linear infinite; }
      `}</style>
    </div>
  );
};

const Eye = ({ pos, mood }: { pos: {x: number, y: number}, mood: string }) => {
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


const LivingButton = ({ 
  type, 
  label, 
  onClick, 
  onCaught, 
  isFinalState, 
  rejectionCount = 0,
  yesButtonScale,
  noButtonScale,
  id,
  isHeartbroken,
}: LivingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dynamicOffset, setDynamicOffset] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<string | null>(null);
  const [isFleeing, setIsFleeing] = useState(false);

  const isYes = type === 'yes';

  const checkOverlap = (rectA: DOMRect, rectB: DOMRect) => {
      const buffer = 100;
      return !(
          rectA.right < rectB.left - buffer ||
          rectA.left > rectB.right + buffer ||
          rectA.bottom < rectB.top - buffer ||
          rectA.top > rectB.bottom + buffer
      );
  };

  const getMood = () => {
    if (isHeartbroken) return 'pensive';
    if (isFinalState) return isYes ? 'partying' : 'broken';
    if (isYes) {
        return (dynamicOffset.x !== 0 || dynamicOffset.y !== 0) ? 'blushing' : 'beaming';
    }
    if (mode === 'glitch') return 'grimacing';
    if (mode === 'tornado') return 'astonished';
    if (rejectionCount && rejectionCount > 3) return 'pensive';
    return 'neutral';
  };

  const triggerEvasion = useCallback(() => {
    if (isYes || isFinalState || mode || isHeartbroken) return;

    if (!isFleeing) {
      setIsFleeing(true);
    }

    const tactics = ['tornado', 'wind', 'tiny', 'ghost', 'newton', 'blackhole', 'glitch'];
    const tactic = tactics[Math.floor(Math.random() * tactics.length)];
    setMode(tactic);

    const noButton = buttonRef.current;
    const yesButton = document.getElementById('yes-button');

    if (!noButton || !yesButton) {
        setTimeout(() => setMode(null), 1000);
        return;
    }

    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
        const padding = 120;
        const nx = (Math.random() - 0.5) * (window.innerWidth - padding * 2);
        const ny = (Math.random() - 0.5) * (window.innerHeight - padding * 2);

        const noButtonRect = noButton.getBoundingClientRect();
        const noButtonWidth = noButtonRect.width;
        const noButtonHeight = noButtonRect.height;

        const futureNoRect = {
            left: window.innerWidth / 2 + nx - noButtonWidth / 2,
            top: window.innerHeight / 2 + ny - noButtonHeight / 2,
            right: window.innerWidth / 2 + nx + noButtonWidth / 2,
            bottom: window.innerHeight / 2 + ny + noButtonHeight / 2,
            width: noButtonWidth,
            height: noButtonHeight,
        } as DOMRect;
        
        const yesRect = yesButton.getBoundingClientRect();

        if (!checkOverlap(futureNoRect, yesRect)) {
            setPosition({ x: nx, y: ny });
            setTimeout(() => setMode(null), 1000);
            return;
        }
    }
    
    console.warn("Could not find a non-overlapping position for 'No' button.");
    setTimeout(() => setMode(null), 1000);

  }, [isYes, isFinalState, mode, noButtonScale, isHeartbroken, isFleeing]);

  useEffect(() => {
    const handleMove = (e: any) => {
      if (!buttonRef.current || isFinalState || isHeartbroken) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      setPupilPos({ x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 });

      if (isYes) {
        if (dist < 150) {
          const push = (150 - dist) * 0.15;
          setDynamicOffset({ x: -Math.cos(angle) * push, y: -Math.sin(angle) * push });
        } else {
          setDynamicOffset({ x: 0, y: 0 });
        }
      } else {
        if (mode === 'newton' && dist < 250) {
          const force = (250 - dist) * 0.4 / (noButtonScale || 1);
          setDynamicOffset({ x: -Math.cos(angle) * force, y: -Math.sin(angle) * force });
        }
        else if (mode === 'blackhole' && dist < 300) {
          const force = (300 - dist) * 0.3 / (noButtonScale || 1);
          setDynamicOffset({ x: Math.cos(angle) * force, y: Math.sin(angle) * force });
        } else {
          setDynamicOffset({x: 0, y: 0});
        }
      }
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mode, isYes, isFinalState, noButtonScale, isHeartbroken]);
  
  const isFleeingNoButton = !isYes && isFleeing;

  return (
    <button
      id={id}
      ref={buttonRef}
      onClick={isYes ? onClick : onCaught}
      onMouseEnter={!isYes ? triggerEvasion : undefined}
      style={isFleeingNoButton ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${position.x + dynamicOffset.x}px), 
                    calc(-50% + ${position.y + dynamicOffset.y}px)) 
                    scale(${noButtonScale})`,
      } : {
        position: 'relative',
        transform: `translate(${dynamicOffset.x}px, ${dynamicOffset.y}px) scale(${isYes ? yesButtonScale : noButtonScale})`,
      }}
      className={cn(
        "transition-all duration-300 ease-out flex items-center gap-4 px-8 py-4 rounded-full border-4 shadow-2xl cursor-pointer",
        isYes ? "bg-rose-500 border-rose-300 text-white" : "bg-slate-100 border-slate-300 text-slate-800",
        isFleeingNoButton ? "z-50" : (isYes ? "z-10" : "z-20"),
        mode === 'tornado' && "animate-spin",
        mode === 'ghost' && "opacity-20 blur-sm scale-125",
        mode === 'tiny' && "scale-0 opacity-0",
        mode === 'wind' && "skew-x-[45deg] blur-lg translate-x-[800px] opacity-0",
        mode === 'glitch' && "animate-pulse skew-y-12 contrast-200 brightness-150",
        isHeartbroken && "opacity-50"
      )}
    >
      <div className="flex gap-1">
        <Eye pos={pupilPos} mood={getMood()} />
        <Eye pos={pupilPos} mood={getMood()} />
      </div>
      <span className="text-2xl font-black italic uppercase tracking-tighter">{label}</span>
    </button>
  );
};
