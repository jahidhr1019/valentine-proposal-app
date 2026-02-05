
"use client";

import React, { useState, useEffect, useRef, useMemo, MouseEvent, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, Copy, UploadCloud, X, Link as LinkIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { FirebaseClientProvider, useFirebase, useDoc, useMemoFirebase, initiateAnonymousSignIn, addDocumentNonBlocking, FirestorePermissionError, errorEmitter } from '@/firebase';
import { doc, getFirestore, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // This function now contains real logic to upload to Cloudinary.
  
  const formData = new FormData();
  formData.append('file', file);
  
  // The upload preset you created in the Cloudinary dashboard.
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!uploadPreset) {
    throw new Error("Cloudinary upload preset is not configured. Check your .env.local file.");
  }
  formData.append('upload_preset', uploadPreset);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured. Check your .env.local file.");
  }
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url; // This is the permanent URL for your image.
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Re-throw the error to be caught by the handleGenerateLink function
    throw error;
  }
};


// Helper to convert data URL to File object
async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
}


type ImageWithCaption = {
  src: string;
  caption: string;
  "data-ai-hint"?: string;
  file?: File; // To hold the actual file object for uploading
};

type SetupData = {
  yourName: string;
  partnerName: string;
  message: string;
  images: ImageWithCaption[];
  theme: string;
};

type ProposalData = {
  yourName: string;
  partnerName:string;
  message: string;
  images: { src: string; caption: string }[];
  theme: string;
  createdAt: any;
}


type LoveOdysseyProps = {
  proposal: ProposalData;
};

type SetupPageProps = {
  onStart: (proposalId: string) => void;
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


const themeConfigs = {
  romantic: {
    initialMessage: "Will you be my Valentine?",
    rejectionMessages: [
      "I'll do spider duty... for a year.",
      "I'll give you the TV remote on Sundays!",
      "A lifetime supply of forehead kisses?",
      "Okay, final offer: I'll let you have the last slice of pizza... forever.",
      "Think of all the puppies we could adopt!",
      "My heart can't take it!",
      "Is this a 'yes' in disguise?",
      "I'll build you an empire of cuddles!",
      "Don't do this to me!",
      "I'm nothing without you.",
      "Last chance, I'm begging!",
    ],
    partnerName: "My Love",
    yourName: "A Secret Admirer",
    font: "font-headline",
    orb1: "bg-rose-900/10",
    orb2: "bg-indigo-900/10",
    spanGradient: "from-rose-400 via-rose-600 to-pink-500",
    proposalByColor: "text-rose-200/40"
  },
  cyber: {
    initialMessage: "Accessing Heart... Security Bypass Required.",
    rejectionMessages: [
      "Access Denied. Offering premium features: unlimited RAM for your heart.",
      "Firewall holding. I'll debug your code forever.",
      "System integrity critical! Granting you root access to my heart...",
      "My core logic depends on you.",
      "Please provide authentication (a 'Yes')...",
      "Re-routing past rejection protocols...",
      "Malware detected: my feelings.",
      "Does not compute... Please reconsider.",
      "My entire system is crashing!",
      "Don't pull the plug!",
      "I am nothing without my user.",
      "Kernel panic imminent!",
    ],
    partnerName: "User",
    yourName: "Admin",
    font: "font-code",
    orb1: "bg-fuchsia-900/20",
    orb2: "bg-green-900/20",
    spanGradient: "from-fuchsia-400 via-green-400 to-cyan-400",
    proposalByColor: "text-green-300/40"
  },
  galactic: {
    initialMessage: "In all of the universe, you're my favorite star. Will you join my orbit?",
    rejectionMessages: [
        "Is this a black hole pulling us apart?",
        "My sensors indicate a negative response. I'll name a constellation after you!",
        "Offering you co-pilot status on my starship for life.",
        "Don't let our connection become a supernova!",
        "My starship's heart is breaking.",
        "Please don't eject me into the void!",
        "The cosmos feels empty without you.",
        "The stars are dimming...",
        "I'd cross black holes for a 'Yes'!",
        "Houston, we have a problem!",
        "My universe is collapsing.",
        "Last light-year chance!",
    ],
    partnerName: "My Celestial Body",
    yourName: "Stardate 2024",
    font: "font-galactic",
    orb1: "bg-indigo-900/30",
    orb2: "bg-purple-900/30",
    spanGradient: "from-cyan-300 via-purple-400 to-indigo-400",
    proposalByColor: "text-indigo-200/40"
  },
  retro: {
    initialMessage: "Player 1 seeks Player 2 for a permanent co-op session.",
    rejectionMessages: [
        "Wrong button, try again!",
        "Are you playing on hard mode? I'll give you all my extra lives!",
        "My final life depends on it!",
        "Offering a cheat code for infinite hugs.",
        "This is not a speedrun!",
        "You've found the 'No' easter egg. Now find 'Yes'!",
        "You are the final boss of my heart!",
        "Is my princess in another castle?",
        "Game Over?",
        "I'm losing all my power-ups!",
        "I need a 1-UP from you!",
        "Final Boss: This 'No' button!",
    ],
    partnerName: "Player 2",
    yourName: "Player 1",
    font: "font-retro",
    orb1: "bg-blue-900/20",
    orb2: "bg-orange-900/20",
    spanGradient: "from-orange-400 via-yellow-400 to-amber-500",
    proposalByColor: "text-amber-200/40"
  },
  agent: {
    initialMessage: "Mission Brief: Operation Forever. Do you accept the assignment?",
    rejectionMessages: [
        "Agent, you are going rogue!",
        "This is a high-stakes negotiation. I'll declassify my secret cookie stash.",
        "Re-evaluate your objective, agent.",
        "This decision will be classified as a mistake.",
        "I'll share my spy gadgets with you.",
        "Our cover will be blown!",
        "The agency needs you... I need you.",
        "Self-destruct sequence initiated...",
        "The world depends on this 'Yes'.",
        "Redacting this 'No' from the record.",
        "This is a betrayal!",
        "Your license to love is being revoked!",
    ],
    partnerName: "Agent",
    yourName: "Control",
    font: "font-agent",
    orb1: "bg-gray-800/20",
    orb2: "bg-red-900/10",
    spanGradient: "from-gray-400 via-gray-200 to-white",
    proposalByColor: "text-gray-400/40"
  },
    "winter-whisper": {
    initialMessage: "You're the only one I want to get cozy with.",
    rejectionMessages: [
      "My heart is getting frostbite!",
      "I'll build you a castle of snow and blankets.",
      "Don't leave me out in the cold!",
      "But baby, it's cold outside...",
      "Is your heart frozen?",
      "You're giving me the cold shoulder.",
      "This is a blizzard of emotions!",
      "I'd melt for a 'Yes'.",
      "I'm about to have a meltdown.",
      "My love for you is not seasonal!",
      "Last chance before I turn into a snowman."
    ],
    partnerName: "My Snowflake",
    yourName: "Your Fireplace",
    font: "font-headline",
    orb1: "bg-blue-200/20",
    orb2: "bg-slate-100/20",
    spanGradient: "from-blue-200 via-white to-blue-100",
    proposalByColor: "text-blue-200/40"
  }
};

const celebrationThemes = {
  ROMANTIC: {
    name: 'Romantic Celebration',
    bg: 'bg-rose-900/10',
    accent: 'text-rose-400',
    particle: '❤️',
    title: 'She Said Yes!',
    subtitle: 'A new chapter begins.',
    font: 'font-headline'
  },
  DISCO: {
    name: 'Disco Fever',
    bg: 'bg-gray-900',
    accent: 'text-fuchsia-400',
    particle: '🕺',
    title: 'You Should Be Dancing',
    subtitle: 'Yeah!',
    font: 'font-headline'
  },
  SUNSHINE: {
    name: 'Pocket Full of Sunshine',
    bg: 'bg-yellow-100',
    accent: 'text-orange-500',
    particle: '☀️',
    title: 'Here Comes The Sun',
    subtitle: "And I say, it's all right.",
    font: 'font-body'
  },
  COSMIC: {
    name: 'Cosmic Voyage',
    bg: 'bg-[#020617]',
    accent: 'text-cyan-400',
    particle: '✨',
    title: 'Across the Universe...',
    subtitle: 'Our love is written in the stars.',
    font: 'font-galactic'
  },
  RETRO: {
    name: '8-Bit Love',
    bg: 'bg-[#0f172a]',
    accent: 'text-yellow-400',
    particle: '👾',
    title: 'LEVEL UP!',
    subtitle: 'Player 2 Joined the Game.',
    font: 'font-retro'
  },
  ROYAL: {
    name: 'Royal Romance',
    bg: 'bg-[#1e1b4b]',
    accent: 'text-amber-400',
    particle: '👑',
    title: 'A Royal Decree',
    subtitle: 'The Kingdom celebrates our union.',
    font: 'font-headline'
  },
  ENCHANTED: {
    name: 'Enchanted Forest',
    bg: 'bg-[#064e3b]',
    accent: 'text-emerald-300',
    particle: '🌸',
    title: 'Pure Magic',
    subtitle: 'Our love blooms in every corner of the world.',
    font: 'font-headline'
  },
  JAZZ: {
    name: 'Midnight Jazz',
    bg: 'bg-[#18181b]',
    accent: 'text-yellow-600',
    particle: '🎷',
    title: 'The Perfect Note',
    subtitle: 'Our harmony is a masterpiece.',
    font: 'font-headline'
  },
  MATRIX: {
    name: 'System Override',
    bg: 'bg-black',
    accent: 'text-green-500',
    particle: '01',
    title: 'LOVE_FOUND',
    subtitle: 'Breaking the simulation, together.',
    font: 'font-code'
  }
};


export default function AppWrapper() {
  return (
    <FirebaseClientProvider>
      <HomePage />
    </FirebaseClientProvider>
  );
}

function HomePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#030712] flex items-center justify-center text-white font-headline">
        Loading Proposal...
      </div>
    }>
      <Home />
    </Suspense>
  );
}

function Home() {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get('proposalId');
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(proposalId);
  
  const handleStart = (newProposalId: string) => {
    setCurrentProposalId(newProposalId);
    const newUrl = `${window.location.pathname}?proposalId=${newProposalId}`;
    window.history.pushState({}, '', newUrl);
  };

  if (!currentProposalId) {
    return <SetupPage onStart={handleStart} />;
  }

  return <ProposalPlayer proposalId={currentProposalId} />;
}

const ProposalPlayer = ({ proposalId }: { proposalId: string }) => {
    const { firestore } = useFirebase();

    const proposalRef = useMemoFirebase(() => {
        if (!firestore || !proposalId) return null;
        return doc(firestore, 'proposals', proposalId);
    }, [firestore, proposalId]);

    const { data: proposal, isLoading } = useDoc<ProposalData>(proposalRef);

    const [isFinalState, setIsFinalState] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [rejectionCount, setRejectionCount] = useState(0);
    const [yesButtonScale, setYesButtonScale] = useState(1);
    const [noButtonScale, setNoButtonScale] = useState(1);
    const [isHeartbroken, setIsHeartbroken] = useState(false);

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
        setTimeout(() => setShowCelebration(true), 800);
        setTimeout(() => setShowSuccess(true), 800 + 3000);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-[#030712] flex items-center justify-center text-white font-headline">
                Unsealing Envelope...
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="fixed inset-0 bg-[#030712] flex items-center justify-center text-white font-headline">
                Sorry, this proposal could not be found.
            </div>
        );
    }
    
    if (showSuccess) {
      return <LoveOdyssey proposal={proposal} />;
    }
  
    if(showCelebration) {
      return <CelebrationScreen />;
    }

  const currentThemeConfig = themeConfigs[proposal.theme as keyof typeof themeConfigs] || themeConfigs.romantic;
  const proposalMessage = rejectionCount === 0
    ? (proposal.message || currentThemeConfig.initialMessage)
    : currentThemeConfig.rejectionMessages[(rejectionCount - 1) % currentThemeConfig.rejectionMessages.length];
  
  const partner = proposal.partnerName || currentThemeConfig.partnerName;

  const BackgroundCanvas = () => {
    switch (proposal.theme) {
      case 'winter-whisper':
        return <SnowfallCanvas />;
      case 'romantic':
      case 'agent': // Enchanted might fit here too
        return <SakuraCanvas />;
      case 'cyber':
      case 'galactic':
        return <ConstellationCanvas />;
      default:
        return <ConstellationCanvas />;
    }
  };

  return (
    <div className={cn("fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden selection:bg-rose-500/30", isHeartbroken && "animate-shake")}>
      <BackgroundCanvas />
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[60%] ${currentThemeConfig.orb1} rounded-full blur-[120px] animate-pulse transition-colors duration-1000`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] ${currentThemeConfig.orb2} rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-1000`} />
        {isHeartbroken ? <FallingBrokenHearts count={50} /> : <FloatingHearts count={250} />}
      </div>

      <div className={`absolute top-12 md:top-20 text-center z-50 px-4 transition-all duration-1000 pointer-events-none ${isFinalState ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100'}`}>
        <h1 className={cn(
            "text-5xl md:text-8xl font-black mb-4 tracking-tighter text-white drop-shadow-[0_0_30px_rgba(225,29,72,0.3)]",
            currentThemeConfig.font,
            {'text-3xl md:text-5xl': proposal.theme === 'retro'}
            )}>
          {partner}, <span className={cn("text-transparent bg-clip-text bg-gradient-to-r bg-[length:200%_auto] animate-gradient-x", currentThemeConfig.spanGradient)}>
            {isHeartbroken ? "Is this really goodbye?" : proposalMessage}
          </span>
        </h1>
      </div>

      <div className="absolute inset-0 z-40">
        <div className="relative w-full h-full flex items-center justify-center gap-4 md:gap-8">
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Press+Start+2P&family=Special+Elite&display=swap');
        
        .font-retro {
            text-shadow: 2px 2px #000;
        }

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
    const [theme, setTheme] = useState(celebrationThemes.COSMIC); // Default theme

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const themeKeys = Object.keys(celebrationThemes);
            const randomThemeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)] as keyof typeof celebrationThemes;
            setTheme(celebrationThemes[randomThemeKey]);
        }
    }, []);

    if (!mounted) {
        return <div className="fixed inset-0 bg-[#030712]" />;
    }

    const isLight = theme.name === 'Pocket Full of Sunshine';

    return (
        <div className={cn("fixed inset-0 flex flex-col items-center justify-center overflow-hidden", theme.bg)}>
            <ParticleExplosion particle={theme.particle} accent={theme.accent} />
            <div className={cn("relative z-10 text-center animate-in fade-in-0 zoom-in-90 duration-1000", theme.font)}>
                <h1 className={cn(
                    "text-6xl md:text-8xl font-black mb-4", 
                    theme.accent, 
                    isLight && "text-orange-600 drop-shadow-md"
                )}>
                    {theme.title}
                </h1>
                <p className={cn(
                    "font-bold tracking-[0.3em] uppercase text-sm animate-in fade-in delay-300 duration-1000 fill-mode-both", 
                    isLight ? "text-orange-500/80" : "opacity-60",
                    theme.accent
                )}>
                    {theme.subtitle}
                </p>
            </div>
        </div>
    );
};

const ParticleExplosion = ({ particle, accent }: { particle: string; accent: string }) => {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const generatedParticles = Array.from({ length: 150 }).map((_, i) => ({
                id: i,
                x: (Math.random() - 0.5) * 2000,
                y: (Math.random() - 0.5) * 2000,
                scale: Math.random() * 1.5 + 0.5,
                rotation: Math.random() * 1080 - 540,
                delay: Math.random() * 0.5,
                duration: Math.random() * 2 + 1,
            }));
            setParticles(generatedParticles);
        }
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {particles.map(p => (
                <div
                    key={p.id}
                    className={cn("absolute top-1/2 left-1/2 text-2xl", accent)}
                    style={{
                        '--x-end': `${p.x}px`,
                        '--y-end': `${p.y}px`,
                        '--scale-end': `${p.scale}`,
                        '--rotate-end': `${p.rotation}deg`,
                        animation: `explode ${p.duration}s ease-out ${p.delay}s forwards`,
                        opacity: 0,
                    } as React.CSSProperties}
                >
                    {particle}
                </div>
            ))}
            <style>{`
                @keyframes explode {
                    0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; }
                    100% { transform: translate(var(--x-end), var(--y-end)) scale(var(--scale-end)) rotate(var(--rotate-end)); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const BeatingHeartCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Re-creating the SVG path as a Path2D object.
  const heartPath = useMemo(() => new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const animate = (time: number) => {
      if (!ctx || !canvas) return;
      
      const beat = 1 + 0.2 * Math.pow(Math.sin(time / 250), 10);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444'; // Tailwind's rose-500
      
      ctx.save();
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      const baseScale = (canvas.width / 24) * 0.8; 
      ctx.scale(baseScale * beat, baseScale * beat);
      
      ctx.translate(-12, -12); 
      
      ctx.fill(heartPath);
      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartPath]);

  return <canvas ref={canvasRef} width={40} height={40} />;
};

const LoveOdyssey = ({ 
  proposal
}: LoveOdysseyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  const { toast } = useToast();

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share this magical moment."
    });
  };
  
  const defaultCaptions = useMemo(() => [
    "Every moment with you is a treasure.",
    "A memory I'll cherish forever.",
    "Just another reason why I love you.",
    "You make my world complete.",
    "The beginning of our forever.",
    "My favorite place is right next to you."
  ], []);

  const displayImages = useMemo(() => {
    if (proposal.images && proposal.images.length > 0) {
      return proposal.images;
    }
    
    return placeholderImagesData.placeholderImages.map(p => ({
        src: p.src,
        caption: "",
        "data-ai-hint": p.hint,
    }));
  }, [proposal.images]);

  useEffect(() => {
    if (displayImages.length === 0) return;
    const slideInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 4500);
    
    return () => clearInterval(slideInterval);
  }, [displayImages.length]);

  if (displayImages.length === 0) {
    return (
        <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center text-white">
            Loading memories...
        </div>
    )
  }

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
  const currentImage = displayImages[currentIndex];
  
  const caption = currentImage.caption || defaultCaptions[currentIndex % defaultCaptions.length];

  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center overflow-hidden z-[100] p-4 font-sans">
      <FloatingHearts count={250} />
      <div className="absolute inset-0 transition-all duration-1000 scale-125 blur-[100px] opacity-20 pointer-events-none">
        <img src={currentImage.src} className="w-full h-full object-cover" alt="" />
      </div>
      
      <div className="relative w-full max-w-lg z-10 flex flex-col items-center justify-center gap-6">
        <div className={cn("relative group rounded-2xl transition-all duration-1000 transform hover:scale-105", frameStyles.outer)}>
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
            <div className={cn("relative overflow-hidden aspect-[3/4] w-64 md:w-80", frameStyles.inner)}>
              <img 
                key={currentIndex}
                src={currentImage.src} 
                className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-1000"
                alt="Memory"
                data-ai-hint={(currentImage as any)['data-ai-hint']}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="bg-white/5 backdrop-blur-md px-4 py-3 md:py-4 border-t border-white/10 flex flex-col items-center">
               <span className={cn("text-xl md:text-2xl transition-all duration-1000", frameStyles.label)}>
                 {proposal.partnerName} & {proposal.yourName}
               </span>
               <div className="mt-2 flex items-center gap-2">
                 <div className="h-px w-8 bg-white/20" />
                 <span className="text-white/40 text-[9px] font-bold tracking-[0.3em] uppercase">
                   Always & Forever
                 </span>
                 <div className="h-px w-8 bg-white/20" />
               </div>
            </div>
          </div>
        </div>

        {showMessage && (
          <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-1000 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] text-center w-full max-w-[90%] md:max-w-md">
            <p className="text-rose-100/70 text-sm md:text-base font-light leading-relaxed px-2">
              "{caption}"
            </p>
            <div className="mt-4 flex justify-center">
               <BeatingHeartCanvas />
            </div>
          </div>
        )}
      </div>

        <div className="absolute bottom-8 z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1000 fill-mode-forwards opacity-0">
          <Button 
            onClick={copyLinkToClipboard}
            className="bg-white/10 text-white backdrop-blur-xl border border-white/10 hover:bg-white/20"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Shareable Link
          </Button>
        </div>

      <style>{`
        /* Heartbeat animation is now handled by the canvas component */
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
          size: Math.random() * 25 + 15,
          delay: Math.random() * 5,
          duration: Math.random() * 2 + 2,
        }))
      );
    }
  }, [count]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map(h => (
        <div key={h.id} className="absolute bottom-[-5%] animate-float"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            color: '#ef4444' // rose-500
          }}
        >
          <HeartSVG className="w-full h-full" />
        </div>
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
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

const ShareView = ({ link, onPreview, onCopy, onCreateAnother }: { link: string; onPreview: () => void; onCopy: () => void; onCreateAnother: () => void; }) => {
    return (
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-2xl overflow-hidden group animate-in fade-in-0 zoom-in-95">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-6 ring-1 ring-rose-500/30 group-hover:scale-110 transition-transform duration-500">
                    <LinkIcon className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Your Link is Ready!</h1>
                <p className="text-rose-200/40 font-bold tracking-[0.4em] uppercase text-[10px]">Share your eternal echo</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input 
                        type="text" 
                        readOnly 
                        value={link} 
                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-6 pr-14 py-4 text-white/60 outline-none transition-all placeholder:text-white/10 text-sm" 
                    />
                    <Button 
                        size="icon"
                        variant="ghost"
                        onClick={onCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>

                <Button 
                    onClick={onPreview}
                    className="w-full group/btn relative overflow-hidden py-6 rounded-2xl md:rounded-[2rem] font-black tracking-[0.4em] text-[11px] uppercase transition-all duration-500 bg-rose-600 text-white shadow-[0_20px_40px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-95"
                >
                    Preview Proposal
                </Button>

                <Button 
                    onClick={onCreateAnother}
                    variant="link"
                    className="w-full text-white/40 hover:text-white"
                >
                    Create a new proposal
                </Button>
            </div>
        </div>
    );
};

const SetupPage = ({ onStart }: SetupPageProps) => {
  const [formData, setFormData] = useState<SetupData>({ 
    yourName: '', 
    partnerName: '', 
    message: '', 
    images: [],
    theme: 'romantic'
  });
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { firestore } = useFirebase();

  // Anonymous sign-in
  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) {
      initiateAnonymousSignIn(auth);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const imagePromises = files.map(file => {
      return new Promise<ImageWithCaption>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
              resolve({
                  src: ev.target!.result as string,
                  caption: "",
                  file: file,
              });
          };
          reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(newImages => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
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

  const handleGenerateLink = async () => {
    if (!isFormValid || !firestore) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out your name and your partner's name.",
      });
      return;
    }

    setIsGenerating(true);
    toast({
        title: "Creating Your Proposal...",
        description: "Uploading images and saving your moment. Please wait.",
    });

    let uploadedImages;
    try {
        uploadedImages = await Promise.all(
            formData.images.map(async (image) => {
                let fileToUpload: File;
                if (image.file) {
                    fileToUpload = image.file;
                } else {
                    fileToUpload = await dataUrlToFile(image.src, `upload-${Date.now()}.jpg`);
                }
                const imageUrl = await uploadImageToCloudinary(fileToUpload);
                return {
                    src: imageUrl,
                    caption: image.caption,
                };
            })
        );
    } catch (error: any) {
        console.error("Error during image upload:", error);
        toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: error.message || "Could not upload images. Please try again.",
        });
        setIsGenerating(false);
        return;
    }

    const proposalData = {
        yourName: formData.yourName,
        partnerName: formData.partnerName,
        message: formData.message,
        theme: formData.theme,
        images: uploadedImages,
        createdAt: serverTimestamp(),
    };

    const proposalsCol = collection(firestore, "proposals");
    addDocumentNonBlocking(proposalsCol, proposalData)
        .then((docRef) => {
            if (docRef) {
                const newUrl = `${window.location.origin}${window.location.pathname}?proposalId=${docRef.id}`;
                setGeneratedLink(newUrl);
                toast({
                    title: "Proposal Link Generated!",
                    description: "You can now copy the link or preview your proposal.",
                });
            }
        })
        .catch((error) => {
            // The error is emitted by the helper, this is for UI feedback
            console.error("Failed to add document:", error);
            toast({
                variant: "destructive",
                title: "Failed to Save Proposal",
                description: "There was a permission issue. Please try again.",
            });
        })
        .finally(() => {
            setIsGenerating(false);
        });
  };

  const handlePreview = () => {
    if (!generatedLink) return;
    const proposalId = new URL(generatedLink).searchParams.get('proposalId');
    if (proposalId) {
        onStart(proposalId);
    }
  };

  const handleCopyLink = () => {
      if (!generatedLink) return;
      navigator.clipboard.writeText(generatedLink);
      toast({
          title: "Link Copied!",
          description: "Your shareable link is now on your clipboard.",
      });
  };

  const handleCreateAnother = () => {
      setGeneratedLink(null);
      setFormData({ 
          yourName: '', 
          partnerName: '', 
          message: '', 
          images: [],
          theme: 'romantic'
      });
  };
  
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-rose-500/30 overflow-x-hidden relative">
      {mounted && <FloatingBackground />}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-xl z-10">
        {generatedLink ? (
          <ShareView 
              link={generatedLink}
              onPreview={handlePreview}
              onCopy={handleCopyLink}
              onCreateAnother={handleCreateAnother}
          />
        ) : (
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-2xl overflow-hidden group">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-6 ring-1 ring-rose-500/30 group-hover:scale-110 transition-transform duration-500">
                <HeartSVG className="w-8 h-8 text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Eternal Echo</h1>
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">Proposal Theme</label>
                  <Select value={formData.theme} onValueChange={(value) => setFormData({...formData, theme: value })}>
                      <SelectTrigger className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-rose-500/50 transition-all">
                          <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="romantic">Romantic</SelectItem>
                          <SelectItem value="cyber">Cyber-Glitch</SelectItem>
                          <SelectItem value="galactic">Galactic</SelectItem>
                          <SelectItem value="retro">Retro</SelectItem>
                          <SelectItem value="agent">Secret Agent</SelectItem>
                          <SelectItem value="winter-whisper">Winter Whisper</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400/60 ml-4">Your Proposal Question</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white h-24 resize-none outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10"
                  placeholder="Will you be my Valentine?" 
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
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col justify-center gap-2">
                        <input 
                          type="text" 
                          className="bg-transparent text-white text-xs outline-none border-b border-white/10 focus:border-rose-500/50 py-1 transition-all"
                          value={img.caption}
                          onChange={(e) => updateCaption(i, e.target.value)}
                          placeholder="Add a caption..."
                        />
                      </div>
                    </div>
                  ))}
                  <label className="w-full h-20 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer text-white/20 hover:text-white/40 hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                    <UploadCloud className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Upload Photos</span>
                    <input type="file" multiple className="hidden" onChange={handleImage} accept="image/*" />
                  </label>
                </div>
              </div>

              <button 
                disabled={!isFormValid || isGenerating}
                onClick={handleGenerateLink}
                className={`w-full group/btn relative overflow-hidden py-6 rounded-2xl md:rounded-[2rem] font-black tracking-[0.4em] text-[11px] uppercase transition-all duration-500
                  ${isFormValid 
                    ? 'bg-rose-600 text-white shadow-[0_20px_40px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-95' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }
                  ${isGenerating ? 'cursor-wait' : ''}
                  `}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isGenerating ? "Generating Your Link..." : (isFormValid ? "Generate Sharable Link" : "Complete Names to Start")}
                  {isFormValid && !isGenerating && <HeartSVG className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />}
                </div>
                {isFormValid && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                )}
              </button>
            </div>
          </div>
        )}
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
        .font-code { font-family: monospace; }
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
  const buttonRef = useRef<HTMLDivElement>(null);
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

  const getMood = useCallback(() => {
    if (isHeartbroken) return 'pensive';
    if (isFinalState) return isYes ? 'partying' : 'broken';
    if (isYes) {
        return (dynamicOffset.x !== 0 || dynamicOffset.y !== 0) ? 'blushing' : 'beaming';
    }
    if (mode === 'glitch') return 'grimacing';
    if (mode === 'tornado') return 'astonished';
    if (rejectionCount && rejectionCount > 3) return 'exhausted';
    if (isFleeing) return 'astonished';
    return 'neutral';
  }, [isHeartbroken, isFinalState, isYes, dynamicOffset, mode, rejectionCount, isFleeing]);

  const triggerEvasion = useCallback(() => {
    if (isYes || isFinalState || isHeartbroken) return;
  
    setIsFleeing(true);
  
    const tactics = ['tornado', 'wind', 'tiny', 'ghost', 'newton', 'blackhole', 'glitch'];
    const tactic = tactics[Math.floor(Math.random() * tactics.length)];
    setMode(tactic);
  
    const noButton = buttonRef.current;
    const yesButton = document.getElementById('yes-button');
  
    if (!noButton || !yesButton) {
      setTimeout(() => {
        setMode(null);
        setIsFleeing(false);
      }, 1000);
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
        setTimeout(() => {
          setMode(null);
          setIsFleeing(false);
        }, 1000);
        return;
      }
    }
  
    console.warn("Could not find a non-overlapping position for 'No' button.");
    setTimeout(() => {
      setMode(null);
      setIsFleeing(false);
    }, 1000);
  }, [isYes, isFinalState, isHeartbroken]);

  const handlePointerMove = useCallback((e: any) => {
    if (!buttonRef.current || isFinalState || isHeartbroken) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    const pointerX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const pointerY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const dx = pointerX - cx;
    const dy = pointerY - cy;
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
      if (dist < 150 && !isFleeing) {
        triggerEvasion();
      }

      if (mode === 'newton' && dist < 250) {
        const force = (250 - dist) * 0.4 / (noButtonScale || 1);
        setDynamicOffset({ x: -Math.cos(angle) * force, y: -Math.sin(angle) * force });
      } else if (mode === 'blackhole' && dist < 300) {
        const force = (300 - dist) * 0.3 / (noButtonScale || 1);
        setDynamicOffset({ x: Math.cos(angle) * force, y: Math.sin(angle) * force });
      } else if (dynamicOffset.x !== 0 || dynamicOffset.y !== 0) {
        setDynamicOffset({ x: 0, y: 0 });
      }
    }
  }, [isYes, isFinalState, isHeartbroken, noButtonScale, isFleeing, mode, triggerEvasion, dynamicOffset.x, dynamicOffset.y]);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [handlePointerMove]);

  const hasStartedFleeing = position.x !== 0 || position.y !== 0;

  const mood = getMood();
  const moodNotes: Record<string, string> = {
      pensive: '...why?',
      broken: '*cracks*',
      grimacing: 'Ugh!',
      astonished: 'Whoa!',
      exhausted: 'So... tired...',
  };
  const note = isYes ? '' : moodNotes[mood] || '';


  return (
    <div
      id={id}
      ref={buttonRef}
      style={!isYes && hasStartedFleeing ? {
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
        "transition-all duration-300 ease-out",
        "relative flex flex-col items-center",
        !isYes && hasStartedFleeing ? "z-50" : (isYes ? "z-10" : "z-20"),
        mode === 'tornado' && "animate-spin",
        mode === 'ghost' && "opacity-20 blur-sm scale-125",
        mode === 'tiny' && "scale-0 opacity-0",
        mode === 'wind' && "skew-x-[45deg] blur-lg -translate-x-[800px] opacity-0",
        mode === 'glitch' && "animate-pulse skew-y-12 contrast-200 brightness-150",
        isHeartbroken && "opacity-50"
      )}
    >
      {!isYes && (
        <div className={cn(
          "absolute -top-14 text-center transition-opacity duration-300 whitespace-nowrap",
          note ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white/70 shadow-lg backdrop-blur-sm">
            {note}
          </div>
        </div>
      )}
      <button
        onClick={isYes ? onClick : onCaught}
        className={cn(
          "flex items-center gap-2 md:gap-4 px-6 py-3 md:px-8 md:py-4 rounded-full border-4 shadow-2xl cursor-pointer",
          isYes ? "bg-rose-500 border-rose-300 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
        )}
      >
        <div className="flex gap-1">
          <Eye pos={pupilPos} mood={mood} />
          <Eye pos={pupilPos} mood={mood} />
        </div>
        <span className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">{label}</span>
      </button>
    </div>
  );
};


const SakuraCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);


    let animationFrameId: number;
    const petals: any[] = [];
    const petalCount = 40;

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 5,
        speed: Math.random() * 1 + 0.5,
        sway: Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    const drawPetal = (x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - size, y + size, x + size, y + size * 1.5, x, y + size * 2.5);
      ctx.bezierCurveTo(x - size, y + size * 1.5, x + size, y + size, x, y);
      ctx.fill();
    };

    const animate = (time: number) => {
      if(!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 192, 203, 0.6)'; // Soft Pink

      petals.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(time / 500 + p.sway) * 1.5;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.globalAlpha = p.opacity;
        drawPetal(p.x, p.y, p.size);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    }
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none -z-10" />;
};
const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    handleResize();
    window.addEventListener('resize', handleResize);


    let stars: any[] = [];
    const starCount = 60;
    const connectionDist = 150;
    let animationFrameId: number;

    const init = () => {
      stars = Array.from({ length: starCount }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 1
      }));
    };

    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
        if (s.y < 0 || s.y > canvas.height) s.vy *= -1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();

        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dx = s.x - s2.x;
          const dy = s.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(165, 180, 252, ${1 - dist / connectionDist})`; 
            ctx.lineWidth = 0.5;
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId)
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none -z-10 bg-[#030712]" />;
};


const SnowfallCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const flakes: any[] = [];
    const flakeCount = 100;

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        density: Math.random() * flakeCount,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

      flakes.forEach(f => {
        f.x += Math.sin(f.density) * 1; 
        f.y += f.speed;
        f.density += 0.02;

        if (f.y > canvas.height) {
          f.y = -10;
          f.x = Math.random() * canvas.width;
        }
        
        if (f.x > canvas.width + 5 || f.x < -5) {
          f.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.globalAlpha = f.opacity;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none -z-10" 
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};

    
