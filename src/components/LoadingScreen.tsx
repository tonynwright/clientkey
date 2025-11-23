import { useState, useEffect } from "react";
import logo from "@/assets/clientkey-logo.png";
import { Progress } from "@/components/ui/progress";

const LOADING_STAGES = [
  { progress: 20, label: "Initializing authentication..." },
  { progress: 40, label: "Loading user data..." },
  { progress: 60, label: "Setting up workspace..." },
  { progress: 80, label: "Loading dashboard..." },
  { progress: 100, label: "Almost ready..." },
];

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(LOADING_STAGES[0].label);

  useEffect(() => {
    let stageIndex = 0;
    
    const interval = setInterval(() => {
      if (stageIndex < LOADING_STAGES.length) {
        setProgress(LOADING_STAGES[stageIndex].progress);
        setCurrentStage(LOADING_STAGES[stageIndex].label);
        stageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="animate-fade-in w-full max-w-md px-4 sm:px-8">
        {/* Logo with pulse animation */}
        <div className="mb-6 sm:mb-8 animate-scale-in flex justify-center">
          <div className="relative">
            <img 
              src={logo} 
              alt="ClientKey.io" 
              className="h-16 w-16 sm:h-24 sm:w-24 animate-pulse"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center animate-fade-in">
          ClientKey.io
        </h1>

        {/* Progress bar */}
        <div className="mb-4 animate-fade-in">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current stage text */}
        <p className="text-sm text-muted-foreground mb-6 animate-fade-in text-center">
          {currentStage}
        </p>

        {/* Loading spinner */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};
