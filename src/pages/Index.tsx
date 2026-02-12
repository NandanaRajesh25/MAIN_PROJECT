import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import CameraPanel from '@/components/CameraPanel';
import WordBuilder from '@/components/WordBuilder';
import ResultDisplay from '@/components/ResultDisplay';
import SignViewer from '@/components/SignViewer';
import { useSignDetection } from '@/hooks/useSignDetection';
import { useWordBuilder } from '@/hooks/useWordBuilder';

const Index = () => {
  const { 
    currentLetter, 
    status, 
    statusMessage, 
    simulateDetection, 
    clearDetection,
    videoRef,
    remainingTime,
    stablePrediction,
    stableCount,
    isConnected,
    startDetection,
    stopDetection
  } = useSignDetection();
  const { 
    letters, 
    currentWord, 
    result, 
    suggestedWord,
    wordVideo,
    letterVideos,
    addLetter, 
    removeLetter, 
    clearWord, 
    checkSpelling,
    acceptCorrection,
    resetResult 
  } = useWordBuilder();

  const [signViewerOpen, setSignViewerOpen] = useState(false);
  const [signViewerMode, setSignViewerMode] = useState<'word' | 'letters'>('word');

  // Add detected letter to word builder
  useEffect(() => {
    if (status === 'detected' && currentLetter) {
      if (currentLetter === 'DEL') {
        // Handle delete action
        removeLetter();
      } else {
        // Add letter
        addLetter(currentLetter);
      }
      // Clear detection after adding
      const timer = setTimeout(() => {
        clearDetection();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, currentLetter, addLetter, removeLetter, clearDetection]);

  const handleTryAgain = () => {
    clearWord();
    resetResult();
    clearDetection();
  };

  const handleShowSign = () => {
    setSignViewerMode('word');
    setSignViewerOpen(true);
  };

  const handleShowCorrectedSigns = () => {
    if (suggestedWord) {
      acceptCorrection();
      setSignViewerMode('letters');
      setSignViewerOpen(true);
    }
  };

  const handleCloseSignViewer = () => {
    setSignViewerOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Sign Language Learning Tool | Fun Spelling Practice for Kids</title>
        <meta name="description" content="A child-friendly sign language detection and spelling correction tool designed for young deaf students. Learn to spell with fun, interactive hand signs!" />
      </Helmet>

      <div className="h-screen bg-background p-2 md:p-3 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="text-center mb-2 flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground flex items-center justify-center gap-2">
            <span className="text-xl md:text-2xl">🤟</span>
            Sign & Spell
            <span className="text-xl md:text-2xl">✨</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Learn to spell with your hands!
          </p>
          
          {/* Camera Control */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {!isConnected ? (
              <button
                onClick={startDetection}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                🎥 Start Camera Detection
              </button>
            ) : (
              <button
                onClick={stopDetection}
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors"
              >
                ⏹️ Stop Detection
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 h-full overflow-hidden">
            {/* Left Panel - Camera & Detection */}
            <section aria-label="Sign Detection" className="overflow-y-auto overflow-x-hidden h-full">
              <CameraPanel
                currentLetter={currentLetter}
                status={status}
                statusMessage={statusMessage}
                onSimulateDetection={simulateDetection}
                videoRef={videoRef}
                remainingTime={remainingTime}
                stablePrediction={stablePrediction}
                stableCount={stableCount}
                isConnected={isConnected}
              />
            </section>

            {/* Right Panel - Word Builder */}
            <section aria-label="Word Builder" className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden h-full">
              <WordBuilder
                letters={letters}
                onClearWord={clearWord}
                onCheckSpelling={checkSpelling}
                onRemoveLetter={removeLetter}
                disabled={result !== 'pending'}
              />

              {/* Result Display */}
              <ResultDisplay
                result={result}
                currentWord={currentWord}
                correctedWord={suggestedWord}
                onTryAgain={handleTryAgain}
                onShowSign={handleShowSign}
                onShowCorrectedSigns={handleShowCorrectedSigns}
              />
            </section>
          </div>
        </main>

        {/* Sign Viewer Modal */}
        <SignViewer
          isOpen={signViewerOpen}
          onClose={handleCloseSignViewer}
          mode={signViewerMode}
          word={currentWord}
          wordVideo={wordVideo}
          letters={suggestedWord?.split('') || letters}
          letterVideos={letterVideos}
        />
      </div>
    </>
  );
};

export default Index;
