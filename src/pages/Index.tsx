import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { ProfileCard } from '@/components/ProfileCard';
import LandingLayout from '@/layouts/LandingLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect } from 'react';
import { Globe } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';
import backgroundImage from '@/assets/background-image.jpg';
import overlayBackground from '@/assets/overlay-background.jpg';

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
              <span className="text-primary-foreground/60 text-4xl font-bold">កូនខ្មែរ</span>
            </div>
          </div>
        </div>
        
        {/* Language and Theme Controls */}
        <div className="relative z-10 flex justify-end p-4">
          <div className="flex items-center gap-2">
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
                {language === 'khmer' ? 'គ្រប់គ្រងហិរញ្ញវត្ថុដោយ AI' : 'AI-Powered Finance Management'}
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
                  <span className="ml-2">→</span>
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
      </section>

      {/* Features Section with Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            
            <p className="text-lg text-muted-foreground max-w-2xl my-0 mx-[122px]">
              {language === 'khmer' ? 'ដំណោះស្រាយគ្រប់គ្រងហិរញ្ញវត្ថុដ៏ទំនើបសម្រាប់អ្នក' : 'Complete financial management solution designed for modern users'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            

            {/* Feature 2 */}
            

            {/* Feature 3 */}
            

            {/* Feature 4 */}
            

            {/* Feature 5 */}
            

            {/* Feature 6 */}
            

            {/* Feature 7 */}
            

            {/* Feature 8 - AI Assistance (full width) */}
            <Card className="lg:col-span-4 group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in bg-gradient-to-r from-primary/5 to-primary-glow/5" style={{
            animationDelay: '0.7s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                    <span className="text-xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold">ជំនួយដោយបញ្ញាសិប្បនិម្មិត (AI Assistance)</h3>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  Cashsnap មានមុខងារ AI ជួយប្រើប្រាស់ ដែលអាច:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">🔍</span>
                    <p className="text-sm text-muted-foreground">វិភាគការចំណាយ របស់អ្នកបែបស្វ័យប្រវត្តិ</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">📈</span>
                    <p className="text-sm text-muted-foreground">ផ្តល់អនុសាសន៍ផ្ទាល់ខ្លួន ដើម្បីជួយអោយអ្នកអាចគ្រប់គ្រងសមតុល្យប្រាក់ចំណូល/ចំណាយបានប្រសើរឡើង</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">🧠</span>
                    <p className="text-sm text-muted-foreground">រៀនពីទម្លាប់ហិរញ្ញវត្ថុ របស់អ្នក ហើយជួយបង្កើតផែនការសន្សំប្រាក់ឆ្ពោះទៅរកគោលដៅធំៗ</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">អាចប្រើបានដូចជាការជជែកជាមួយអ្នកប្រឹក្សាហិរញ្ញវត្ថុប្រកបដោយ AI បែបផ្ទាល់ខ្លួន!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/30 to-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> ប្រយោជន៍សំខាន់</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-constructive/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-constructive/20 transition-colors">
                    <span className="text-constructive text-xl">⚡</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed">
                  សន្សំពេល និងលើកកម្ពស់គុណភាពនៃការសម្រេចចិត្ត
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <span className="text-primary text-xl">👥</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed">
                  បំពេញតួនាទី ប្រៀបដូចជាមានជំនួយផ្ទាល់ខ្លួនដ៏ល្អសម្រាប់អ្នក
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-balance/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-balance/20 transition-colors">
                    <span className="text-balance text-xl">💎</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed">
                  ធ្វើអោយអ្នកប្រើចាប់អារម្មណ៍ និងស្ថិតនៅលើវេបសាយបានយូរ
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
            <div className="bg-gradient-card shadow-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-border/50 py-[23px]">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-2xl">✨</span>
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                ត្រៀមខ្លួនគ្រប់គ្រងលុយកាក់ដូចអ្នកជំនាញ?
              </h3>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                ចាប់ផ្តើមដំណើរហិរញ្ញវត្ថុរបស់អ្នកនៅថ្ងៃនេះ ជាមួយនឹងឧបករណ៍ដ៏ទំនើប និងងាយស្រួលប្រើ
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-12 py-6 shadow-glow hover:shadow-primary/20">
                  <Link to="/auth">
                    ចាប់ផ្តើមឥឡូវនេះ
                    <span className="ml-2">→</span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-12 py-6">
                  ស្វែងយល់បន្ថែម
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                ✨ ឥតគិតថ្លៃ • ✨ គ្មានកាតឥណទាន • ✨ ចាប់ផ្តើមបានភ្លាម
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-border/20">
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
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
