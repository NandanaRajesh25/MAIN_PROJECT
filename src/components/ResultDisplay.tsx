import { Check, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { SpellingResult } from '@/hooks/useWordBuilder';

interface ResultDisplayProps {
  result: SpellingResult;
  currentWord: string;
  correctedWord: string | null;
  onTryAgain: () => void;
  onShowSign: () => void;
  onShowCorrectedSigns: () => void;
}

const ResultDisplay = ({
  result,
  currentWord,
  correctedWord,
  onTryAgain,
  onShowSign,
  onShowCorrectedSigns,
}: ResultDisplayProps) => {
  if (result === 'pending') return null;

  const isCorrect = result === 'correct';

  return (
    <div 
      className={`
        rounded-2xl p-3 shadow-lg border-2 transition-all duration-500 flex-shrink-0
        ${isCorrect 
          ? 'bg-success/10 border-success shadow-success-glow' 
          : 'bg-warning/10 border-warning'
        }
      `}
    >
      {isCorrect ? (
        // Success State
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center animate-celebrate">
            <Check className="w-5 h-5 text-success-foreground" />
          </div>
          
          <div>
            <h3 className="text-base font-extrabold text-success flex items-center gap-1 justify-center">
              <Sparkles className="w-3 h-3" />
              Amazing Job!
              <Sparkles className="w-3 h-3" />
            </h3>
            <p className="text-xs font-bold text-foreground mt-1">
              You spelled <span className="text-success">"{currentWord}"</span> correctly!
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              onClick={onShowSign}
              size="sm"
              className="flex-1 h-8 text-xs font-bold rounded-xl gap-1 bg-primary hover:bg-primary/90"
            >
              <Eye className="w-3 h-3" />
              Show Sign
            </Button>
            
            <Button
              onClick={onTryAgain}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs font-bold rounded-xl gap-1 border-2"
            >
              <RefreshCw className="w-3 h-3" />
              Try Another
            </Button>
          </div>
        </div>
      ) : (
        // Correction State
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center animate-wiggle">
            <span className="text-xl">🤔</span>
          </div>
          
          <div>
            <h3 className="text-base font-extrabold text-warning">
              Almost There!
            </h3>
            <p className="text-xs text-foreground mt-1">
              You spelled: <span className="font-bold">"{currentWord}"</span>
            </p>
            <p className="text-sm font-bold text-foreground">
              Did you mean: <span className="text-success font-extrabold">"{correctedWord}"</span>?
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              onClick={onShowCorrectedSigns}
              size="sm"
              className="flex-1 h-8 text-xs font-bold rounded-xl gap-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Eye className="w-3 h-3" />
              Show Signs
            </Button>
            
            <Button
              onClick={onTryAgain}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs font-bold rounded-xl gap-1 border-2"
            >
              <RefreshCw className="w-3 h-3" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
