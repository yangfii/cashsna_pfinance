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

  // Redirect new users to profile setup, but only after profile loading is complete
  useEffect(() => {
    if (user && !profileLoading) {
      // Only redirect if we're certain the profile is incomplete
      if (!profile || (!profile.first_name && !profile.last_name)) {
        // Add a small delay to prevent rapid redirects
        const timer = setTimeout(() => {
          navigate('/profile-setup');
        }, 100);
        return () => clearTimeout(timer);
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
      <div className="text-white max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-4">Track Your Finances Smarter</h2>
          <p className="text-lg mb-6">Welcome to Cashsnap — your modern finance dashboard.</p>
          <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>

        {/* Features Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-2">🔥 លក្ខណៈពិសេសសំខាន់ៗ (Key Features)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">✅ 1. 📥 ត្រួតពិនិត្យចំណូល និងចំណាយប្រចាំថ្ងៃ</h4>
                <p className="text-white/90 leading-relaxed">
                  គ្រប់គ្រងប្រាក់ចំណូល និងចំណាយរបស់អ្នកបានយ៉ាងងាយស្រួលជាមួយប្រភេទចំណាត់ថ្នាក់ (Categories) និងការបញ្ចូលទិន្នន័យដោយរហ័ស។
                </p>
                <p className="text-teal-300 font-medium mt-2">💡 គ្មានការស្មុគស្មាញ</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">📊 2. 📈 ផ្ទាំងព័ត៌មានហិរញ្ញវត្ថុទំនើប</h4>
                <p className="text-white/90 leading-relaxed">
                  មើលការចំណាយ-ចំណូលរបស់អ្នកគ្រប់ពេលវេលា តាមរយៈក្រាហ្វច្បាស់លាស់ និងតារាងសង្ខេប។
                </p>
                <p className="text-teal-300 font-medium mt-2">💡 យល់ដឹងអំពីលទ្ធភាពហិរញ្ញវត្ថុបានច្បាស់លាស់ជាងមុន!</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">🇰🇭 3. 🗣️ ផ្តល់ជូនជាភាសាខ្មែរ</h4>
                <p className="text-white/90 leading-relaxed">
                  Cashsnap ត្រូវបានរចនាឡើងសម្រាប់អ្នកប្រើនៅកម្ពុជា ជាមួយនឹងភាសាខ្មែរប្រកបដោយការយល់ងាយ។
                </p>
                <p className="text-teal-300 font-medium mt-2">💡 ងាយស្រួលប្រើ សម្រាប់មនុស្សគ្រប់វ័យ!</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">📱 4. 🧩 ប្រើបានជារបៀប App និង Offline</h4>
                <p className="text-white/90 leading-relaxed">
                  គាំទ្រ PWA (Progressive Web App) អាចដំឡើងដូចជា App ទូរស័ព្ទបានផងដែរ។
                </p>
                <p className="text-teal-300 font-medium mt-2">💡 ប្រើនៅគ្រប់កន្លែង គ្រប់ពេល – ទោះបីឥតអ៊ីនធឺណិតក៏ដោយ!</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">🎨 5. 🖌️ មានបែបផែនស្រស់ស្អាត និងអាចប្ដូរបាន</h4>
                <p className="text-white/90 leading-relaxed">
                  ជម្រើស Light / Dark Mode និងការប្ដូរប្រភេទចំណូល-ចំណាយ តាមបំណង។
                </p>
                <p className="text-teal-300 font-medium mt-2">💡 ផ្ទាល់ខ្លួន ងាយសម្របសម្រួល!</p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">🔒 6. 🛡️ គ្មានពាណិជ្ជកម្ម និងការពារទិន្នន័យ</h4>
                <p className="text-white/90 leading-relaxed">
                  វេបសាយនេះគ្មានពាណិជ្ជកម្ម មិនលក់ទិន្នន័យ និងផ្តោតលើសុវត្ថិភាពផ្ទាល់ខ្លួនរបស់អ្នកប្រើជាចម្បង។
                </p>
                <p className="text-teal-300 font-medium mt-2">💡 ជំនឿចិត្តពេញលេញ និងទំនុកចិត្តក្នុងការប្រើប្រាស់!</p>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-teal-300 mb-2">🆓 7. 🎁 ប្រើប្រាស់ឥតគិតថ្លៃ</h4>
                <p className="text-white/90 leading-relaxed">
                  គ្មានបង់ប្រាក់! អាចប្រើបានទាំងនិស្សិត អ្នកជំនាញ និងគ្រួសារ។
                </p>
              </div>
            </div>

            {/* Feature 8 - AI Assistance (spans 2 columns) */}
            <div className="md:col-span-2 bg-gradient-to-r from-white/10 to-white/15 backdrop-blur-sm rounded-lg p-6 hover:from-white/15 hover:to-white/20 transition-colors">
              <div className="mb-4">
                <h4 className="text-2xl font-semibold text-teal-300 mb-4">🤖 8. ជំនួយដោយបញ្ញាសិប្បនិម្មិត (AI Assistance)</h4>
                <p className="text-white/90 leading-relaxed mb-4">
                  Cashsnap មានមុខងារ AI ជួយប្រើប្រាស់ ដែលអាច:
                </p>
                <div className="space-y-3 ml-4">
                  <p className="text-white/90">🔍 វិភាគការចំណាយ របស់អ្នកបែបស្វ័យប្រវត្តិ</p>
                  <p className="text-white/90">📈 ផ្តល់អនុសាសន៍ផ្ទាល់ខ្លួន ដើម្បីជួយអោយអ្នកអាចគ្រប់គ្រងសមតុល្យប្រាក់ចំណូល/ចំណាយបានប្រសើរឡើង</p>
                  <p className="text-white/90">🧠 រៀនពីទម្លាប់ហិរញ្ញវត្ថុ របស់អ្នក ហើយជួយបង្កើតផែនការសន្សំប្រាក់ឆ្ពោះទៅរកគោលដៅធំៗ</p>
                </div>
                <p className="text-teal-300 font-medium mt-4">💡 អាចប្រើបានដូចជាការជជែកជាមួយអ្នកប្រឹក្សាហិរញ្ញវត្ថុប្រកបដោយ AI បែបផ្ទាល់ខ្លួន!</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 mt-12">
            <h4 className="text-2xl font-semibold text-teal-300 mb-6 text-center">📌 ប្រយោជន៍សំខាន់ៗ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-white/90">
                <p className="mb-2">• សន្សំពេល និងលើកកម្ពស់គុណភាពនៃការសម្រេចចិត្ត</p>
                <p>• បំពេញតួនាទី ជាអ្នកជំនួយផ្ទាល់ខ្លួនសម្រាប់អ្នកមិនចេះហិរញ្ញវត្ថុ</p>
              </div>
              <div className="text-white/90">
                <p>• ធ្វើអោយអ្នកប្រើចាប់អារម្មណ៍ និងស្ថិតនៅលើវេបសាយបានយូរ</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3">
              <Link to="/auth">ចាប់ផ្តើមប្រើប្រាស់ (Get Started)</Link>
            </Button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Index;
