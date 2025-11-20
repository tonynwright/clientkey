import { cn } from "@/lib/utils";

interface DISCShapeProps {
  type: 'D' | 'I' | 'S' | 'C';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const DISCShape = ({ type, size = 'md', className, animate = false }: DISCShapeProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const shapes = {
    D: (
      <svg viewBox="0 0 100 100" className={cn(sizeClasses[size], className, animate && "animate-pulse")}>
        <polygon 
          points="50,10 90,90 10,90" 
          className="fill-[hsl(0,70%,55%)]/20 stroke-[hsl(0,70%,55%)]"
          strokeWidth="2"
        />
        <polygon 
          points="50,25 75,75 25,75" 
          className="fill-[hsl(0,70%,55%)]/40"
        />
      </svg>
    ),
    I: (
      <svg viewBox="0 0 100 100" className={cn(sizeClasses[size], className, animate && "animate-bounce")}>
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          className="fill-[hsl(45,90%,55%)]/20 stroke-[hsl(45,90%,55%)]"
          strokeWidth="2"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="25" 
          className="fill-[hsl(45,90%,55%)]/40"
        />
      </svg>
    ),
    S: (
      <svg viewBox="0 0 100 100" className={cn(sizeClasses[size], className)}>
        <rect 
          x="10" 
          y="10" 
          width="80" 
          height="80" 
          rx="8"
          className="fill-[hsl(140,50%,50%)]/20 stroke-[hsl(140,50%,50%)]"
          strokeWidth="2"
        />
        <rect 
          x="25" 
          y="25" 
          width="50" 
          height="50" 
          rx="6"
          className="fill-[hsl(140,50%,50%)]/40"
        />
      </svg>
    ),
    C: (
      <svg viewBox="0 0 100 100" className={cn(sizeClasses[size], className)}>
        <rect 
          x="10" 
          y="10" 
          width="80" 
          height="80" 
          className="fill-[hsl(210,70%,55%)]/20 stroke-[hsl(210,70%,55%)]"
          strokeWidth="2"
        />
        <rect 
          x="25" 
          y="25" 
          width="50" 
          height="50" 
          className="fill-[hsl(210,70%,55%)]/40"
        />
      </svg>
    )
  };

  return shapes[type];
};
