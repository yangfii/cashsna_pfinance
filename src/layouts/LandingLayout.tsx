import MainContainer from "../components/MainContainer";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LayoutProps) {
  return (
    <MainContainer>
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center w-full max-w-4xl px-6 mx-auto py-12">
        {children}
      </main>
      <LandingFooter />
    </MainContainer>
  );
}