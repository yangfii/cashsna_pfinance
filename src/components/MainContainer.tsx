interface MainContainerProps {
  children: React.ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://i.pinimg.com/736x/a8/48/6e/a8486ea9d7b9d0f4cb98e30cbb8b8e5f.jpg')`,
      }}
    >
      {/* Optional overlay to make content readable */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}