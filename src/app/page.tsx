"use client";

import { useState } from 'react';
import type { UserData } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

import SetupForm from '@/components/app/SetupForm';
import Proposal from '@/components/app/Proposal';
import PhotoRally from '@/components/app/PhotoRally';
import FloatingHearts from '@/components/app/FloatingHearts';

type AppState = 'SETUP' | 'PROPOSAL' | 'RALLY';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('SETUP');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePlaceholder[]>([]);

  const handleSetupSubmit = (data: UserData, photos: ImagePlaceholder[]) => {
    setUserData(data);
    setSelectedPhotos(photos);
    setAppState('PROPOSAL');
  };

  const handleProposalAccept = () => {
    setAppState('RALLY');
  };

  const renderContent = () => {
    switch (appState) {
      case 'SETUP':
        return <SetupForm onSubmit={handleSetupSubmit} />;
      case 'PROPOSAL':
        return <Proposal partnerName={userData?.partnerName || ''} onAccept={handleProposalAccept} />;
      case 'RALLY':
        return <PhotoRally photos={selectedPhotos} message={userData?.message || ''} />;
      default:
        return <SetupForm onSubmit={handleSetupSubmit} />;
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <FloatingHearts count={15} />
      </div>
      <div className="z-10 w-full max-w-4xl">
        {renderContent()}
      </div>
    </main>
  );
}
