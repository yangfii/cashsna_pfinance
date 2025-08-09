import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
export default function TermsOfService() {
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
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
              📜 Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance</h2>
              <p className="text-muted-foreground">
                By using CashSnap Finance, you agree to these Terms. Please don't use our services if you disagree.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Description of Services</h2>
              <p className="text-muted-foreground">
                We offer portfolio and financial data aggregation services accessible via our web dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. User Responsibilities</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>Provide accurate, lawful info.</li>
                <li>Keep login details private.</li>
                <li>Not misuse the service (e.g. hacking, spamming, illegal behavior).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All site content—including design, logos—is our exclusive property. You may not reproduce or distribute without explicit authorization.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Account Suspension/Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts for violation of these Terms or suspicious activity, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Liability & Disclaimers</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>"As-is" basis:</strong> We make no warranties regarding accuracy or availability.</li>
                <li><strong>Limitation of Liability:</strong> We are not responsible for losses resulting from your use, except where prohibited by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Payments & Fees (if applicable)</h2>
              <p className="text-muted-foreground">
                Detail any premium subscription terms, billing cycles, refunds, and late payment policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. User Content</h2>
              <p className="text-muted-foreground">
                If users post comments or settings, they retain ownership but grant us a license to display and use that content.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Third‑Party Links</h2>
              <p className="text-muted-foreground">
                We aren't responsible for third-party sites you may link to or from. We encourage you to review their separate terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We'll notify users of major changes. Continued use after notice implies acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Governing Law & Disputes</h2>
              <p className="text-muted-foreground">
                These Terms are governed by [Applicable Jurisdiction] law. Disputes will be resolved in the local courts of that region.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contact</h2>
              <p className="text-muted-foreground">For Terms‑related inquiries, email:yangfi1502@gmail.com</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>;
}