interface MainContainerProps {
  children: React.ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative"
    >
      {/* Optional overlay to make content readable */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-0" />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}