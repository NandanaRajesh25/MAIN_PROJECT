import { Camera, Keyboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { DetectionStatus } from '@/hooks/useSignDetection';

interface CameraPanelProps {
  currentLetter: string | null;
  status: DetectionStatus;
  statusMessage: string;
  onSimulateDetection: (letter: string) => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  remainingTime?: number;
  stablePrediction?: string;
  stableCount?: number;
  isConnected?: boolean;
}

const CameraPanel = ({ 
  currentLetter, 
  status, 
  statusMessage, 
  onSimulateDetection,
  videoRef,
  remainingTime = 0,
  stablePrediction,
  stableCount = 0,
  isConnected = false
}: CameraPanelProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleKeyPress = (letter: string) => {
    onSimulateDetection(letter);
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col gap-2">
      {/* Camera Feed + Detection Status (unified) */}
      <div className="relative min-h-[480px] bg-camera rounded-2xl border-2 border-camera-border overflow-hidden shadow-soft flex flex-col">
        {/* Status Header */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-card/80 backdrop-blur-sm border-b border-border flex-shrink-0">
          <div 
            className={`
              w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
              ${currentLetter ? 'bg-primary shadow-glow animate-celebrate' : 'bg-muted'}
            `}
          >
            <span className={`text-xs font-extrabold ${currentLetter ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {currentLetter || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold transition-colors truncate ${status === 'detected' ? 'text-success' : 'text-foreground'}`}>
              {statusMessage}
            </p>
            {status === 'idle' && <p className="text-[10px] text-muted-foreground">Make a hand sign in front of the camera</p>}
          </div>
        </div>

        {/* Camera area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {videoRef ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Overlay info */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {remainingTime > 0 && (
                    <span className="text-xs font-bold">
                      Next letter in: {remainingTime}s
                    </span>
                  )}
                </div>
                
                {stablePrediction && stablePrediction !== 'nothing' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]">Detecting:</span>
                    <span className="text-base font-bold">{stablePrediction.toUpperCase()}</span>
                    <span className="text-[10px]">({stableCount}/8)</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center mb-2 animate-pulse-soft">
                <Camera className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground/60">Camera Feed</p>
              <p className="text-[10px] text-muted-foreground mt-1">Your video will appear here</p>
            </>
          )}
        </div>

        {status === 'detecting' && (
          <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-pulse-soft" />
        )}
      </div>

      {/* Mock Keyboard for Testing */}
      <div className="bg-card rounded-2xl p-2 shadow-soft border border-border flex-shrink-0">
        <button
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-1"
        >
          <Keyboard className="w-3 h-3" />
          <span className="text-[10px] font-medium">
            {showKeyboard ? 'Hide Test Keyboard' : 'Show Test Keyboard'}
          </span>
        </button>

        {showKeyboard && (
          <div className="grid grid-cols-9 gap-1">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                className="
                  w-6 h-6 rounded-lg
                  bg-secondary text-secondary-foreground
                  font-bold text-xs
                  hover:bg-primary hover:text-primary-foreground
                  hover:scale-110 active:scale-95
                  transition-all duration-150
                  shadow-sm
                "
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPanel;
