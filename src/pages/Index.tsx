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
      </div>;
  }
  return <div className="min-h-screen">
      {/* Hero Section with Professional Gradient */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-glow/20 bg-teal-400"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="animate-fade-in">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm border border-white/30">
                <span className="mr-2">✨</span>
                គ្រប់គ្រងហិរញ្ញវត្ថុដោយ AI
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              CashSnap <span className="text-primary-glow">Finance</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-6">
              គ្រប់គ្រងហិរញ្ញវត្ថុប្រចាំថ្ងៃ
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              ដំណោះស្រាយគ្រប់គ្រងលុយកាក់ពេញលេញសម្រាប់ប្រជាជនកម្ពុជា ជាមួយនឹងបច្ចេកវិទ្យា AI ទំនើប
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-glow">
                <Link to="/auth">
                  ចាប់ផ្តើមប្រើប្រាស់ឥតគិតថ្លៃ
                  <span className="ml-2">→</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                មើលរបៀបប្រើប្រាស់
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              🔥 លក្ខណៈពិសេសសំខាន់ៗ 
              <span className="text-gradient">(Key Features)</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ដំណោះស្រាយគ្រប់គ្រងហិរញ្ញវត្ថុដ៏ទំនើបសម្រាប់អ្នក
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">📥</span>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">ត្រួតពិនិត្យចំណូល និងចំណាយប្រចាំថ្ងៃ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  គ្រប់គ្រងប្រាក់ចំណូល និងចំណាយរបស់អ្នកបានយ៉ាងងាយស្រួលជាមួយប្រភេទចំណាត់ថ្នាក់ (Categories) និងការបញ្ចូលទិន្នន័យដោយរហ័ស។
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">គ្មានការស្មុគស្មាញ</p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in" style={{
            animationDelay: '0.1s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">📈</span>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">ផ្ទាំងព័ត៌មានហិរញ្ញវត្ថុទំនើប</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  មើលការចំណាយ-ចំណូលរបស់អ្នកគ្រប់ពេលវេលា តាមរយៈក្រាហ្វច្បាស់លាស់ និងតារាងសង្ខេប។
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">យល់ដឹងអំពីលទ្ធភាពហិរញ្ញវត្ថុបានច្បាស់លាស់ជាងមុន!</p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in" style={{
            animationDelay: '0.2s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">🗣️</span>
                  </div>
                  <span className="text-2xl">🇰🇭</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">ផ្តល់ជូនជាភាសាខ្មែរ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  CashSnap Finance ត្រូវបានរចនាឡើងសម្រាប់អ្នកប្រើនៅកម្ពុជា ជាមួយនឹងភាសាខ្មែរប្រកបដោយការយល់ងាយ។
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">ងាយស្រួលប្រើ សម្រាប់មនុស្សគ្រប់វ័យ!</p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in" style={{
            animationDelay: '0.3s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">🧩</span>
                  </div>
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">ប្រើបានជារបៀប App និង Offline</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  គាំទ្រ PWA (Progressive Web App) អាចដំឡើងដូចជា App ទូរស័ព្ទបានផងដែរ។
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">ប្រើនៅគ្រប់កន្លែង គ្រប់ពេល – ទោះបីឥតអ៊ីនធឺណិតក៏ដោយ!</p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in" style={{
            animationDelay: '0.4s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">🖌️</span>
                  </div>
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">មានបែបផែនស្រស់ស្អាត និងអាចប្ដូរបាន</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  ជម្រើស Light / Dark Mode និងការប្ដូរប្រភេទចំណូល-ចំណាយ តាមបំណង។
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">ផ្ទាល់ខ្លួន ងាយសម្របសម្រួល!</p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in" style={{
            animationDelay: '0.5s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">គ្មានពាណិជ្ជកម្ម និងការពារទិន្នន័យ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  វេបសាយនេះគ្មានពាណិជ្ជកម្ម មិនលក់ទិន្នន័យ និងផ្តោតលើសុវត្ថិភាពផ្ទាល់ខ្លួនរបស់អ្នកប្រើជាចម្បង។
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-primary font-medium">💡</span>
                  <p className="text-xs text-primary font-medium">ជំនឿចិត្តពេញលេញ និងទំនុកចិត្តក្នុងការប្រើប្រាស់!</p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 7 */}
            <Card className="h-full group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in" style={{
            animationDelay: '0.6s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                    <span className="text-lg">🎁</span>
                  </div>
                  <span className="text-2xl">🆓</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">ប្រើប្រាស់ឥតគិតថ្លៃ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  គ្មានបង់ប្រាក់! អាចប្រើបានទាំងនិស្សិត អ្នកជំនាញ និងគ្រួសារ។
                </p>
              </CardContent>
            </Card>

            {/* Feature 8 - AI Assistance (full width) */}
            <Card className="lg:col-span-4 group hover:shadow-glow transition-smooth hover:-translate-y-1 animate-bounce-in bg-gradient-to-r from-primary/5 to-primary-glow/5" style={{
            animationDelay: '0.7s'
          }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
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
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              📌 ប្រយោជន៍សំខាន់ៗ
            </h3>
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
                  បំពេញតួនាទី ជាអ្នកជំនួយផ្ទាល់ខ្លួនសម្រាប់អ្នកមិនចេះហិរញ្ញវត្ថុ
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
            <div className="bg-gradient-card shadow-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-border/50">
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
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;