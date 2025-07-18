import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';
import LandingLayout from '@/layouts/LandingLayout';
import { useEffect } from 'react';
import heroBackground from '@/assets/hero-background.jpg';
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    profile,
    loading: profileLoading
  } = useProfile();
  const navigate = useNavigate();

  // Redirect new users to profile setup, but only after profile loading is complete
  useEffect(() => {
    if (user && !profileLoading) {
      // Only redirect if we're certain the profile is incomplete
      if (!profile || !profile.first_name && !profile.last_name) {
        // Add a small delay to prevent rapid redirects
        const timer = setTimeout(() => {
          navigate('/profile-setup');
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [user, profile, profileLoading, navigate]);
  if (user) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
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
                        Welcome to CashSnap Finance
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
                        <Link to="/dashboard/transactions">
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
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Hero Section with Clean Design */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <span className="mr-2">✨</span>
                Brand upgrade
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              CashSnap <span className="text-primary">Finance</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Complete financial management solution for modern users with AI-powered insights and intelligent automation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/auth">
                  Get Started Free
                  <span className="ml-2">→</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Clean Cards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your finances efficiently and effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Optimize bonus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We calculate bonus for all countries in the world.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-success rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Add additional rewards system</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Provide additional rewards to webmasters based on last month's data, issued once a month.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-warning rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Optimize counting method</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Download and activate - Download Activation is related to the number of videos and video views.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-info rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Optimize service quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  1V1 service to solve problems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to earn Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How to earn
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get started with CashSnap Finance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your free account in minutes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Track</h3>
              <p className="text-muted-foreground">
                Start tracking your income and expenses
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Grow</h3>
              <p className="text-muted-foreground">
                Watch your financial health improve
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-card shadow-sm rounded-2xl p-8 md:p-12 max-w-3xl mx-auto border border-border/50">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to take control of your finances?
              </h3>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already managing their money smarter with CashSnap Finance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-12 py-6">
                  <Link to="/auth">
                    Get Started Now
                    <span className="ml-2">→</span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-12 py-6">
                  Learn More
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                Free to use • No credit card required • Get started instantly
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;