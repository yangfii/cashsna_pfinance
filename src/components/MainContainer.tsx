interface MainContainerProps {
  children: React.ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/lovable-uploads/a5ad6ef9-79f1-492c-8698-f22960973926.png')`,
      }}
    >
      {/* Dark overlay with gradient for professional look */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/85 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/50 z-0" />
      
      {/* Foreground content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}