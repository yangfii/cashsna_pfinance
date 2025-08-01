interface MainContainerProps {
  children: React.ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://i.pinimg.com/736x/70/01/76/700176dc0a287dafa5f15a019198f7b8.jpg')`,
      }}
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