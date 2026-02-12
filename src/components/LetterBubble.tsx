import { X } from 'lucide-react';

interface LetterBubbleProps {
  letter: string;
  index: number;
  onRemove?: () => void;
  showRemove?: boolean;
}

const bubbleColors = [
  'bg-bubble-1',
  'bg-bubble-2', 
  'bg-bubble-3',
  'bg-bubble-4',
  'bg-bubble-5',
];

const LetterBubble = ({ letter, index, onRemove, showRemove = false }: LetterBubbleProps) => {
  const colorClass = bubbleColors[index % bubbleColors.length];
  
  return (
    <div 
      className={`
        relative group
        w-16 h-16 md:w-20 md:h-20
        ${colorClass}
        rounded-2xl
        flex items-center justify-center
        shadow-soft
        animate-pop-in
        transition-transform hover:scale-105
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="text-3xl md:text-4xl font-extrabold text-foreground">
        {letter}
      </span>
      
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="
            absolute -top-2 -right-2
            w-7 h-7 rounded-full
            bg-destructive text-destructive-foreground
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            hover:scale-110
            shadow-md
          "
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default LetterBubble;
