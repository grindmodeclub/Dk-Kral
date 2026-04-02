import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationArrowsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
}

const NavigationArrows = ({
  onPrevious,
  onNext,
  showPrevious = false,
  showNext = false,
}: NavigationArrowsProps) => {
  return (
    <>
      {showPrevious && onPrevious && (
        <button
          onClick={onPrevious}
          className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all duration-300 group"
          aria-label="Previous page"
        >
          <ChevronLeft
            className="text-white group-hover:text-gold transition-colors"
            size={48}
            strokeWidth={2.5}
          />
        </button>
      )}

      {showNext && onNext && (
        <button
          onClick={onNext}
          className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all duration-300 group"
          aria-label="Next page"
        >
          <ChevronRight
            className="text-white group-hover:text-gold transition-colors"
            size={48}
            strokeWidth={2.5}
          />
        </button>
      )}
    </>
  );
};

export default NavigationArrows;
