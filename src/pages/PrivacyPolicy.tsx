import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <Link to="/auth">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              📄 Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                This Privacy Policy explains how CashSnap Finance ("we," "us," "our") collects, uses, and protects your personal and financial information when you visit [yoursite.com] or use our dashboard services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Personal Data:</strong> Name, email, phone number, location.</li>
                <li><strong>Financial Data:</strong> Account balances, transactions, credit scores, asset allocations, etc.</li>
                <li><strong>Usage & Device Data:</strong> IP, browser, device info, cookies, analytics.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. How We Collect Data</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>Direct input when registering or updating profile.</li>
                <li>Through linked accounts (e.g. bank/credit).</li>
                <li>Automatically via cookies and tracking tools.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Purpose of Processing</h2>
              <p className="text-muted-foreground mb-2">We use data to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Provide portfolio management and financial analysis features.</li>
                <li>Improve UX and personalize content.</li>
                <li>Communicate service updates, promotions (if opted in).</li>
                <li>Detect fraud and ensure platform security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Data Sharing</h2>
              <p className="text-muted-foreground mb-2">We only share data with:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Service providers (analytics, hosting, banking integrations).</li>
                <li>Authorized third parties when you request (e.g. tax advisors).</li>
                <li>Legal reasons (via subpoena, law enforcement).</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>We do not sell personal data.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Legal & Compliance</h2>
              <p className="text-muted-foreground">
                We comply with major financial privacy laws, such as GLBA (US) and GDPR (EU), disclosing your data-sharing rights consistent with regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. User Rights</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>Access, correct, download your data.</li>
                <li>Withdraw consent or request deletion.</li>
                <li>Opt out of marketing emails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Security Measures</h2>
              <p className="text-muted-foreground mb-2">We enforce:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Encryption (in transit and at rest)</li>
                <li>Firewalls and monitored access</li>
                <li>Regular audits and security patches.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Cookies & Tracking</h2>
              <p className="text-muted-foreground">
                We use essential and performance cookies. You can manage preferences via your browser.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Children</h2>
              <p className="text-muted-foreground">
                Not directed to minors under 13. We do not knowingly collect from them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Policy Updates</h2>
              <p className="text-muted-foreground">
                We review and update this policy as needed. Effective date will be stated at the top.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contact Info</h2>
              <p className="text-muted-foreground">
                For inquiries or data requests, contact:<br />
                Privacy Officer, CashSnap Finance<br />
                Telegram Group Supporter: <a href="https://t.me/cashsnapfinance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://t.me/cashsnapfinance</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}