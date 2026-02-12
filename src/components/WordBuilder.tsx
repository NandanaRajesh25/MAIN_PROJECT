import { Check, Eraser, ArrowLeft } from 'lucide-react';
import LetterBubble from './LetterBubble';
import { Button } from './ui/button';

interface WordBuilderProps {
  letters: string[];
  onClearWord: () => void;
  onCheckSpelling: () => void;
  onRemoveLetter: () => void;
  disabled?: boolean;
}

const WordBuilder = ({ 
  letters, 
  onClearWord, 
  onCheckSpelling,
  onRemoveLetter,
  disabled = false
}: WordBuilderProps) => {
  return (
    <div className="flex flex-col gap-2 flex-shrink-0">
      {/* Word Display Area */}
      <div className="bg-card rounded-2xl p-3 shadow-soft border border-border overflow-auto max-h-48">
        <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="text-base">✨</span>
          Building Your Word
        </h2>

        {letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-1">
              <span className="text-lg">🖐️</span>
            </div>
            <p className="text-xs font-medium">Sign letters to build a word!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {letters.map((letter, index) => (
              <LetterBubble
                key={`${letter}-${index}`}
                letter={letter}
                index={index}
                showRemove={index === letters.length - 1}
                onRemove={onRemoveLetter}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-shrink-0">
        <Button
          onClick={onRemoveLetter}
          disabled={letters.length === 0 || disabled}
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs font-bold rounded-xl gap-1 border-2"
        >
          <ArrowLeft className="w-3 h-3" />
          Undo
        </Button>

        <Button
          onClick={onClearWord}
          disabled={letters.length === 0 || disabled}
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs font-bold rounded-xl gap-1 border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Eraser className="w-3 h-3" />
          Clear
        </Button>

        <Button
          onClick={onCheckSpelling}
          disabled={letters.length === 0 || disabled}
          size="sm"
          className="flex-1 h-9 text-xs font-bold rounded-xl gap-1 bg-success hover:bg-success/90 text-success-foreground"
        >
          <Check className="w-3 h-3" />
          Done
        </Button>
      </div>
    </div>
  );
};

export default WordBuilder;
