interface MainContainerProps {
  children: React.ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative"
    >
      {/* Enhanced overlay for better readability */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60 z-0" />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}