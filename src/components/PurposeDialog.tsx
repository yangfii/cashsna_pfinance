
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface PurposeDialogProps {
  children: React.ReactNode;
}

export const PurposeDialog = ({ children }: PurposeDialogProps) => {
  const { language } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {language === 'khmer' ? 'គោលបំណងនៃការបង្កើតគេហទំព័រ CashSnap Finance' : 'The Purpose of Creating CashSnap Finance'}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed space-y-4">
            {language === 'khmer' ? (
              <div className="space-y-4 text-foreground">
                <p>
                  <strong className="text-primary">🎯 បេសកកម្មរបស់យើង:</strong> CashSnap Finance ត្រូវបានបង្កើតឡើងដើម្បីជួយប្រជាជនកម្ពុជាគ្រប់គ្រងហិរញ្ញវត្ថុប្រចាំថ្ងៃរបស់ពួកគេឱ្យកាន់តែប្រសើរ។
                </p>
                
                <p>
                  <strong className="text-constructive">💡 ហេតុអ្វីបានជាយើងបង្កើត:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>ដំណោះស្រាយបញ្ហាការគ្រប់គ្រងលុយកាក់ដែលស្មុគស្មាញ</li>
                  <li>ផ្តល់ឧបករណ៍ទំនើបសម្រាប់តាមដានចំណូល និងចំណាយ</li>
                  <li>គាំទ្រការវិនិយោគ cryptocurrency ដែលកំពុងពេញនិយម</li>
                  <li>ផ្តល់ការណែនាំដោយ AI ផ្ទាល់ខ្លួន</li>
                </ul>

                <p>
                  <strong className="text-balance">🌟 មុខងារសំខាន់ៗ:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>តាមដានចំណាយប្រចាំថ្ងៃដោយស្វ័យប្រវត្តិ</li>
                  <li>គ្រប់គ្រងថវិកាប្រចាំខែ</li>
                  <li>តាមដាន Crypto Portfolio</li>
                  <li>AI Assistant សម្រាប់ការប្រឹក្សាហិរញ្ញវត្ថុ</li>
                  <li>របាយការណ៍លម្អិត និងការវិភាគ</li>
                  <li>គាំទ្រភាសាខ្មែរពេញលេញ</li>
                </ul>

                <p>
                  <strong className="text-accent">🔒 សុវត្ថិភាព:</strong> យើងប្រើប្រាស់បច្ចេកវិទ្យាសុវត្ថិភាពកម្រិតធនាគារ ដើម្បីការពារទិន្នន័យរបស់អ្នក រួមទាំង 2FA authentication។
                </p>

                <p className="pt-4 border-t border-border/20">
                  <strong className="text-primary">🚀 ចក្ខុវិស័យ:</strong> ក្លាយជាវេទិកាគ្រប់គ្រងហិរញ្ញវត្ថុលេខ១ សម្រាប់ប្រជាជនកម្ពុជា ដែលងាយស្រួលប្រើ និងមានបច្ចេកវិទ្យាទំនើប។
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-foreground">
                <p>
                  <strong className="text-primary">🎯 Our Mission:</strong> CashSnap Finance was created to help Cambodians better manage their daily finances with modern, intelligent tools.
                </p>
                
                <p>
                  <strong className="text-constructive">💡 Why We Created This:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Solve the complexity of money management</li>
                  <li>Provide modern tools for tracking income and expenses</li>
                  <li>Support the growing popularity of cryptocurrency investments</li>
                  <li>Offer personalized AI financial guidance</li>
                </ul>

                <p>
                  <strong className="text-balance">🌟 Key Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Automatic daily expense tracking</li>
                  <li>Monthly budget management</li>
                  <li>Crypto portfolio monitoring</li>
                  <li>AI Assistant for financial advice</li>
                  <li>Detailed reports and analytics</li>
                  <li>Full Khmer language support</li>
                </ul>

                <p>
                  <strong className="text-accent">🔒 Security:</strong> We use bank-level security technology to protect your data, including 2FA authentication and encrypted storage.
                </p>

                <p className="pt-4 border-t border-border/20">
                  <strong className="text-primary">🚀 Vision:</strong> To become the #1 financial management platform for Cambodians, combining ease of use with cutting-edge technology.
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
