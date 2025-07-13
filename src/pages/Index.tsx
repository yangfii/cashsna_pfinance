import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';
import LandingLayout from '@/layouts/LandingLayout';
import { useEffect } from 'react';

const Index = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Redirect new users to profile setup
  useEffect(() => {
    if (user && !profileLoading) {
      // Check if user needs to complete profile setup
      if (!profile || (!profile.first_name && !profile.last_name)) {
        navigate('/profile-setup');
      }
    }
  }, [user, profile, profileLoading, navigate]);

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in">
            <WelcomeMessage />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
            {/* Main Dashboard Area */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="stat-card border-0 bg-gradient-to-br from-card via-card to-card/95 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center lg:text-left space-y-6">
                    <div className="space-y-3">
                      <h2 className="text-3xl lg:text-4xl font-bold text-gradient">
                        Welcome to Cashsnap Finance
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-2xl">
                        Your intelligent personal finance management dashboard. 
                        Track expenses, manage budgets, and achieve your financial goals.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-md">
                        <Link to="/dashboard">
                          <span>Go to Dashboard</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild size="lg" className="shadow-sm">
                        <Link to="/transactions">
                          <span>Add Transaction</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card income-card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-constructive">$0.00</div>
                    <div className="text-sm text-muted-foreground">Total Income</div>
                  </div>
                </div>
                <div className="stat-card expense-card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">$0.00</div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                </div>
                <div className="stat-card balance-card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-balance">$0.00</div>
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Sidebar */}
            <div className="lg:col-span-4">
              <div className="animate-bounce-in">
                <ProfileCard />
              </div>
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
