import { X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface SignViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "word" | "letters";
  // for word mode
  word: string;
  wordVideo: string | null;
  // for letter mode
  letters: string[];
  letterVideos: string[];
}

const SignViewer = ({
  isOpen,
  onClose,
  mode,
  word,
  wordVideo,
  letters,
  letterVideos
}: SignViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    setCurrentIndex(0); // reset when opened
    setVideoKey(prev => prev + 1);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentIndex < letterVideos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReplay = () => {
    // For word mode, replay the same video; for letters mode, go back to first letter
    if (mode === "word") {
      setVideoKey(prev => prev + 1);
    } else {
      setCurrentIndex(0);
      setVideoKey(prev => prev + 1);
    }
  };

  const videoSrc =
    mode === "word"
      ? wordVideo
      : letterVideos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-4 shadow-2xl border-4 border-primary w-full max-w-sm animate-pop-in max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-lg font-extrabold text-foreground">
            {mode === "word"
              ? `Sign for "${word}"`
              : `Letter: ${letters[currentIndex]}`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Display - 16:9 aspect ratio */}
        <div className="aspect-video bg-black rounded-xl border-2 border-camera-border flex items-center justify-center mb-3 overflow-hidden flex-shrink-0">
          {videoSrc ? (
            <video
              key={`${videoSrc}-${videoKey}`}
              src={videoSrc}
              autoPlay
              controls={false}
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-sm">No sign available</p>
          )}
        </div>

        {/* Letter Navigation */}
        {mode === "letters" && letterVideos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0 flex-wrap">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-1 flex-wrap justify-center">
              {letters.map((letter, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm
                    ${idx === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {letter}
                </div>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === letterVideos.length - 1}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={handleReplay}
            variant="outline"
            size="default"
            className="flex-1 h-10 text-sm font-bold rounded-xl gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Replay
          </Button>

          <Button
            onClick={onClose}
            size="default"
            className="flex-1 h-10 text-sm font-bold rounded-xl gap-2 bg-success hover:bg-success/90 text-success-foreground"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignViewer;
