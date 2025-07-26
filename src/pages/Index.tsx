import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';
import LandingLayout from '@/layouts/LandingLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PurposeDialog } from '@/components/PurposeDialog';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect } from 'react';
import { Globe } from 'lucide-react';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import heroBackground from '@/assets/hero-background.jpg';
import backgroundImage from '@/assets/background-image.jpg';
import overlayBackground from '@/assets/overlay-background.jpg';

const awardBadge = "/public/lovable-uploads/bd670881-e313-41b8-b0eb-23f2fe1fe109.png";

const Index = () => {
  const {
    user
  } = useAuth();
  const {
    profile,
    loading: profileLoading
  } = useProfile();
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const navigate = useNavigate();

  // Handle user redirects
  useEffect(() => {
    if (user && !profileLoading) {
      // Check if user has a complete profile
      if (!profile || !profile.first_name && !profile.last_name) {
        // Add a small delay to prevent rapid redirects
        const timer = setTimeout(() => {
          navigate('/profile-setup');
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // If user has a complete profile, redirect to dashboard
        const timer = setTimeout(() => {
          navigate('/dashboard');
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
                      <p className="text-body max-w-2xl">
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
                    <div className="text-card-value text-constructive">$0.00</div>
                    <div className="text-card-title">Total Income</div>
                  </div>
                </div>
                <div className="stat-card expense-card p-4">
                  <div className="text-center">
                    <div className="text-card-value text-destructive">$0.00</div>
                    <div className="text-card-title">Total Expenses</div>
                  </div>
                </div>
                <div className="stat-card balance-card p-4">
                  <div className="text-center">
                    <div className="text-card-value text-balance">$0.00</div>
                    <div className="text-card-title">Current Balance</div>
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
  return <div className="min-h-screen">
      {/* Hero Section with Professional Gradient */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroBackground})`
      }}>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat backdrop-blur-sm" style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundBlendMode: 'overlay'
        }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-primary-glow/30 backdrop-blur-md flex items-center justify-center" style={{
            backgroundImage: `url(${overlayBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(2px)'
          }}>
              <span className="text-primary-foreground/60 text-4xl font-bold animate-pulse">កូនខ្មែរ</span>
            </div>
          </div>
        </div>
        
        {/* Language and Theme Controls */}
        <div className="relative z-10 flex justify-end p-4">
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/80 text-sm font-medium animate-bounce">កូនខ្មែរ</span>
            <Button onClick={() => {
            console.log('Current language:', language);
            const newLanguage = language === 'english' ? 'khmer' : 'english';
            console.log('Switching to:', newLanguage);
            setLanguage(newLanguage);
          }} variant="ghost" size="sm" className="h-10 w-10 p-0 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm" title={language === 'english' ? 'Switch to Khmer' : 'Switch to English'}>
              <Globe className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="animate-fade-in">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium backdrop-blur-sm border border-primary-foreground/30">
                <span className="mr-2">✨</span>
                {language === 'khmer' ? 'គ្រប់គ្រងហិរញ្ញវត្ថុដ៏ទំនើបសម្រាប់អ្នក' : 'AI-Powered Finance Management'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 drop-shadow-lg">
              CashSnap <span className="text-primary-glow">Finance</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground/90 mb-6">
              {language === 'khmer' ? 'គ្រប់គ្រងហិរញ្ញវត្ថុប្រចាំថ្ងៃ' : 'Daily Financial Management'}
            </h2>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              {language === 'khmer' ? 'ដំណោះស្រាយគ្រប់គ្រងលុយកាក់ពេញលេញសម្រាប់ប្រជាជនកម្ពុជា ជាមួយនឹងបច្ចេកវិទ្យា AI ទំនើប' : 'Complete money management solution for Cambodians with modern AI technology'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-background text-primary hover:bg-background/90 shadow-glow">
                <Link to="/auth">
                  {language === 'khmer' ? 'ចាប់ផ្តើមប្រើប្រាស់ឥតគិតថ្លៃ' : 'Start Free'}
                  <span className="ml-2 animate-bounce">→</span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/assistant">
                  {language === 'khmer' ? '🤖 AI ជួយណែនាំ' : '🤖 AI Guide'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Down Arrow Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={() => {
              const section = document.getElementById('main-content');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            title={language === 'khmer' ? 'មើលមុខងារ' : 'View Features'}
          >
            <svg
              className="w-6 h-6 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </Button>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section id="main-content" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-fade-in">
              {language === 'khmer' ? 'មុខងារសំខាន់ៗ' : 'Key Features'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
              {language === 'khmer' ? 'ដំណោះស្រាយគ្រប់គ្រងហិរញ្ញវត្ថុដ៏ទំនើបសម្រាប់អ្នក' : 'Complete financial management solution designed for modern users'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Smart Expense Tracking */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.1s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {language === 'khmer' ? 'តាមដានចំណាយ' : 'Smart Tracking'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'តាមដានចំណាយប្រចាំថ្ងៃដោយស្វ័យប្រវត្តិ' : 'Automatically track daily expenses with smart categorization'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 - Budget Management */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.2s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-constructive/10 text-constructive group-hover:bg-constructive group-hover:text-constructive-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-constructive transition-colors">
                    {language === 'khmer' ? 'គ្រប់គ្រងថវិកា' : 'Budget Control'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'កំណត់និងគ្រប់គ្រងថវិកាប្រចាំខែ' : 'Set and manage monthly budgets with alerts'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 - Financial Goals */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.3s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-balance/10 text-balance group-hover:bg-balance group-hover:text-balance-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-xl animate-pulse group-hover:animate-bounce group-hover:rotate-180 transition-transform duration-500">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-balance transition-colors">
                    {language === 'khmer' ? 'គោលដៅហិរញ្ញវត្ថុ' : 'Financial Goals'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'កំណត់និងតាមដានគោលដៅសន្សំ' : 'Set and track your savings goals effectively'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 - Crypto Portfolio */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.4s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 animate-bounce hover:animate-pulse group-hover:shadow-lg group-hover:shadow-accent/20">
                    <img src="/lovable-uploads/16656344-5528-4c46-a596-3ee4d36e4613.png" alt="Money bag" className="w-6 h-6 animate-pulse group-hover:animate-bounce transition-transform duration-300 group-hover:scale-125" />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                    {language === 'khmer' ? 'គ្រប់គ្រង Crypto' : 'Crypto Portfolio'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'តាមដានការវិនិយោគ cryptocurrency' : 'Track your cryptocurrency investments'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 - Reports & Analytics */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.5s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-xl">📈</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-secondary transition-colors">
                    {language === 'khmer' ? 'របាយការណ៍' : 'Smart Reports'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'បង្កើតរបាយការណ៍លម្អិត' : 'Generate detailed financial reports'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 - Multi-language Support */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.6s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted/10 text-muted-foreground group-hover:bg-muted group-hover:text-muted-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-xl">🌐</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-muted-foreground transition-colors">
                    {language === 'khmer' ? 'ភាសាខ្មែរ' : 'Khmer Support'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'គាំទ្រភាសាខ្មែរពេញលេញ' : 'Full Khmer language support'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 7 - Security */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card to-card/95" style={{
            animationDelay: '0.7s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-destructive transition-colors">
                    {language === 'khmer' ? 'សុវត្ថិភាព' : 'Bank Security'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'khmer' ? 'ការពារទិន្នន័យដូចធនាគារ' : 'Bank-level security for your data'}
                </p>
              </CardContent>
            </Card>

            {/* Feature 8 - AI Assistance (full width) */}
            <Card className="lg:col-span-4 group hover:shadow-glow transition-all duration-500 hover:-translate-y-1 animate-fade-in bg-gradient-to-r from-primary/5 to-primary-glow/5 border-0" style={{
            animationDelay: '0.8s'
          }}>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    <span className="text-2xl animate-pulse group-hover:shadow-glow group-hover:text-primary transition-all duration-300">🤖</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-pulse">
                    {language === 'khmer' ? 'ជំនួយដោយបញ្ញាសិប្បនិម្មិត (AI Assistance)' : 'AI-Powered Financial Assistant'}
                  </h3>
                </div>
                
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {language === 'khmer' ? 'Cashsnap មានមុខងារ AI ជួយប្រើប្រាស់ ដែលអាច:' : 'CashSnap features an AI assistant that can:'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-start gap-3 group/item hover:scale-105 transition-transform duration-200">
                    <span className="text-primary text-xl group-hover/item:animate-bounce">🔍</span>
                    <p className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {language === 'khmer' ? 'វិភាគការចំណាយ របស់អ្នកបែបស្វ័យប្រវត្តិ' : 'Analyze your spending patterns automatically'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item hover:scale-105 transition-transform duration-200">
                    <span className="text-primary text-xl group-hover/item:animate-bounce">📈</span>
                    <p className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {language === 'khmer' ? 'ផ្តល់អនុសាសន៍ផ្ទាល់ខ្លួន ដើម្បីជួយអោយអ្នកអាចគ្រប់គ្រងសមតុល្យប្រាក់ចំណូល/ចំណាយបានប្រសើរឡើង' : 'Provide personalized recommendations for better financial balance'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item hover:scale-105 transition-transform duration-200">
                    <span className="text-primary text-xl group-hover/item:animate-bounce">🧠</span>
                    <p className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {language === 'khmer' ? 'រៀនពីទម្លាប់ហិរញ្ញវត្ថុ របស់អ្នក ហើយជួយបង្កើតផែនការសន្សំប្រាក់ឆ្ពោះទៅរកគោលដៅធំៗ' : 'Learn from your habits and help create savings plans for major goals'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-xs text-primary font-bold animate-pulse">💡</span>
                  <p className="text-sm text-primary font-medium">
                    {language === 'khmer' ? 'អាចប្រើបានដូចជាការជជែកជាមួយអ្នកប្រឹក្សាហិរញ្ញវត្ថុប្រកបដោយ AI បែបផ្ទាល់ខ្លួន!' : 'Chat with your personal AI financial advisor anytime!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-secondary/30 to-accent/20 py-0 my-0">
        <div className="container mx-auto py-[60px] px-[7px]">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6 animate-fade-in">
              {language === 'khmer' ? 'ប្រយោជន៍សំខាន់' : 'Key Benefits'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0" style={{
            animationDelay: '0.1s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-constructive/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-constructive/20 transition-all duration-300 group-hover:scale-110">
                    <span className="text-constructive text-xl animate-pulse">⚡</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed group-hover:text-foreground transition-colors">
                  {language === 'khmer' ? 'សន្សំពេល និងលើកកម្ពស់គុណភាពនៃការសម្រេចចិត្ត' : 'Save time and enhance decision quality'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0" style={{
            animationDelay: '0.2s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <span className="text-primary text-xl animate-pulse">👥</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed group-hover:text-foreground transition-colors">
                  {language === 'khmer' ? 'បំពេញតួនាទី ប្រៀបដូចជាមានជំនួយផ្ទាល់ខ្លួនដ៏ល្អសម្រាប់អ្នក' : 'Like having a personal financial advisor'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-fade-in border-0" style={{
            animationDelay: '0.3s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-balance/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-balance/20 transition-all duration-300 group-hover:scale-110">
                    <span className="text-balance text-xl animate-pulse">💎</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed group-hover:text-foreground transition-colors">
                  {language === 'khmer' ? 'ធ្វើអោយអ្នកប្រើចាប់អារម្មណ៍ និងស្ថិតនៅលើវេបសាយបានយូរ' : 'Engaging and long-lasting user experience'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-gradient-card shadow-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-border/50 animate-fade-in px-[47px] py-[11px]">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                  <AnimatedIcon 
                    src="https://media.lordicon.com/icons/wired/outline/947-investment.json"
                    trigger="hover"
                    size="md"
                    colors="primary:hsl(var(--primary)),secondary:hsl(var(--primary-glow))"
                  />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-fade-in">
                {language === 'khmer' ? 'ត្រៀមខ្លួនគ្រប់គ្រងលុយកាក់ដូចអ្នកជំនាញ?' : 'Ready to manage money like a pro?'}
              </h3>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{
              animationDelay: '0.2s'
            }}>
                {language === 'khmer' ? 'ចាប់ផ្តើមដំណើរហិរញ្ញវត្ថុរបស់អ្នកនៅថ្ងៃនេះ ជាមួយនឹងឧបករណ៍ដ៏ទំនើប និងងាយស្រួលប្រើ' : 'Start your financial journey today with modern and easy-to-use tools'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{
              animationDelay: '0.4s'
            }}>
                <Button asChild size="lg" className="text-lg px-12 py-6 shadow-glow hover:shadow-primary/20 hover:scale-105 transition-all duration-300">
                  <Link to="/auth">
                    {language === 'khmer' ? 'ចាប់ផ្តើមឥឡូវនេះ' : 'Start Now'}
                    <span className="ml-2 animate-bounce">→</span>
                  </Link>
                </Button>
                <PurposeDialog>
                  <Button variant="outline" size="lg" className="text-lg px-12 py-6 hover:scale-105 transition-all duration-300">
                    {language === 'khmer' ? 'ស្វែងយល់បន្ថែម' : 'Learn More'}
                  </Button>
                </PurposeDialog>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6 animate-fade-in flex items-center justify-center gap-2" style={{
              animationDelay: '0.6s'
            }}>
                
                {language === 'khmer' ? 'ឥតគិតថ្លៃ • ✨ គ្មានកាតឥណទាន • ✨ ចាប់ផ្តើមបានភ្លាម' : 'Free • ✨ No Credit Card • ✨ Start Instantly'}
              </p>
              
              <div style={{
              animationDelay: '0.8s'
            }} className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-border/20 animate-fade-in my-0 py-[4px]">
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                  Terms of Service
                </Link>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Contact: support@cashsnap.finance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>;
};

export default Index;
