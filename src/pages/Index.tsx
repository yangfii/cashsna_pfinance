import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';
import LandingLayout from '@/layouts/LandingLayout';

const Index = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <WelcomeMessage />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="stat-card">
                <h2 className="text-2xl font-bold mb-4 text-gradient">Welcome to Cashsnap</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Your personal finance management dashboard
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/transactions">Add Transaction</Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <ProfileCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LandingLayout>
      <div className="text-white text-center">
        <h2 className="text-4xl font-semibold mb-4">Track Your Finances Smarter</h2>
        <p className="text-lg mb-6">Welcome to Cashsnap — your modern finance dashboard.</p>
        <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </LandingLayout>
  );
};

export default Index;
