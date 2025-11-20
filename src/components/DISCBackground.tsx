export const DISCBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dominance - Red Triangle Top Right */}
      <div className="absolute -top-32 -right-32 w-96 h-96 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 90,90 10,90" className="fill-[hsl(0,70%,55%)]" />
        </svg>
      </div>
      
      {/* Influence - Yellow Circle Top Left */}
      <div className="absolute -top-20 -left-20 w-80 h-80 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" className="fill-[hsl(45,90%,55%)]" />
        </svg>
      </div>
      
      {/* Steadiness - Green Rounded Square Bottom Left */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="10" width="80" height="80" rx="12" className="fill-[hsl(140,50%,50%)]" />
        </svg>
      </div>
      
      {/* Conscientiousness - Blue Square Bottom Right */}
      <div className="absolute -bottom-28 -right-28 w-80 h-80 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="10" width="80" height="80" className="fill-[hsl(210,70%,55%)]" />
        </svg>
      </div>

      {/* Additional floating shapes for depth */}
      <div className="absolute top-1/3 left-1/4 w-32 h-32 opacity-3">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
          <circle cx="50" cy="50" r="30" className="fill-[hsl(45,90%,55%)]" />
        </svg>
      </div>
      
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 opacity-3">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,15 85,85 15,85" className="fill-[hsl(0,70%,55%)]" />
        </svg>
      </div>
    </div>
  );
};
