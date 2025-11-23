import logo from "@/assets/clientkey-logo.png";

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="animate-fade-in">
        {/* Logo with pulse animation */}
        <div className="mb-8 animate-scale-in">
          <div className="relative">
            <img 
              src={logo} 
              alt="ClientKey.io" 
              className="h-24 w-24 animate-pulse"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center animate-fade-in">
          ClientKey.io
        </h1>

        {/* Loading spinner */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>

        {/* Loading text */}
        <p className="text-sm text-muted-foreground mt-6 animate-fade-in text-center">
          Loading your workspace...
        </p>
      </div>
    </div>
  );
};
