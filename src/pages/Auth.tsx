
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { Eye, EyeOff, Globe, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { signIn, signUp, signInWithGoogle, resetPassword, resendConfirmation, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const getAuthErrorMessage = (error: any) => {
    const message = error?.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return {
        type: 'invalid_credentials',
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect. Please check and try again.',
        action: 'If you recently signed up, you may need to confirm your email first.'
      };
    } else if (message.includes('Email not confirmed')) {
      return {
        type: 'email_not_confirmed',
        title: 'Email Not Confirmed',
        message: 'Please check your email and click the confirmation link before signing in.',
        action: 'Didn\'t receive the email? You can resend it.'
      };
    } else if (message.includes('User not found')) {
      return {
        type: 'user_not_found',
        title: 'Account Not Found',
        message: 'No account found with this email address.',
        action: 'Please check your email or create a new account.'
      };
    } else if (message.includes('signup_disabled')) {
      return {
        type: 'signup_disabled',
        title: 'Signups Disabled',
        message: 'New account registrations are currently disabled.',
        action: 'Please contact support for assistance.'
      };
    }
    
    return {
      type: 'unknown',
      title: 'Sign In Error',
      message: message || 'An unexpected error occurred during sign in.',
      action: 'Please try again or contact support if the problem persists.'
    };
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password, rememberMe);
      
      if (error) {
        const errorInfo = getAuthErrorMessage(error);
        
        if (errorInfo.type === 'email_not_confirmed') {
          setShowEmailConfirmation(true);
          toast.error(errorInfo.message);
        } else {
          toast.error(errorInfo.message);
        }
      } else {
        toast.success('Welcome back! 🎉');
        navigate('/');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Error sending confirmation email') || error.message.includes('SMTP')) {
          toast.success('Account created successfully! 🎉\nYou can now sign in directly (email confirmation is temporarily disabled).');
          setEmail('');
          setPassword('');
        } else {
          toast.error(error.message || 'An error occurred during registration');
        }
      } else {
        setShowEmailConfirmation(true);
        toast.success('Account created successfully! 🎉');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        toast.error(error.message || 'Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Resend confirmation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error.message || 'An error occurred during Google sign in');
      }
      // Success handling will be done by the auth state change listener
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error(error.message || 'An error occurred sending reset email');
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Professional Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            សូមស្វាគមន៍!
          </h1>
          <p className="text-base text-muted-foreground font-medium">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="border shadow-lg bg-gradient-to-br from-card to-card/95">
          <CardHeader className="text-center pb-4 relative">
            <Button
              onClick={() => setLanguage(language === 'english' ? 'khmer' : 'english')}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0"
              title="Select app language"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-balance bg-clip-text text-transparent">
              Cashsnap Finances Tracking
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Access your personal finance dashboard
            </CardDescription>
          </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <Button 
                onClick={handleGoogleSignIn}
                variant="google" 
                className="w-full"
                disabled={loading}
              >
                Continue with Google
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t("auth.email")}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t("auth.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                     </Button>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <Checkbox 
                       id="remember-me" 
                       checked={rememberMe}
                       onCheckedChange={(checked) => setRememberMe(checked === true)}
                       disabled={loading}
                     />
                      <Label htmlFor="remember-me" className="text-sm font-normal">
                        {t("auth.rememberMe")}
                      </Label>
                   </div>
                   <Button
                     type="button"
                     variant="link"
                     className="px-0 text-sm"
                     onClick={() => setShowForgotPassword(true)}
                     disabled={loading}
                   >
                     {t("auth.forgotPassword")}
                   </Button>
                 </div>
                 
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("common.loading") : t("auth.signIn")}
                  </Button>
               </form>
              
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t("auth.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("common.loading") : t("auth.signUp")}
                </Button>
              </form>
              
            </TabsContent>
          </Tabs>
          
          {/* Email Confirmation Alert */}
          {showEmailConfirmation && (
            <Alert className="mt-6 border-primary/20 bg-primary/5">
              <Mail className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <div className="space-y-2">
                  <p className="font-medium text-sm">✅ Account Created Successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email to <strong>{email}</strong>. 
                    Please check your inbox and click the confirmation link to activate your account.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    <span>Check your inbox (and spam folder)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>The link will expire in 24 hours</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleResendConfirmation}
                    disabled={loading || resendCooldown > 0}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : loading 
                      ? 'Sending...' 
                      : 'Resend Email'
                    }
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowEmailConfirmation(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold mb-3">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForgotPassword(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="text-center text-xs text-muted-foreground/60 mt-4 pt-4 border-t space-y-2">
            <p>© 2024 Cashsnap Finances. All rights reserved.</p>
            <div className="flex justify-center gap-4">
              <Button variant="link" size="sm" className="text-xs p-0 h-auto" asChild>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </Button>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto" asChild>
                <Link to="/terms-of-service">Terms of Service</Link>
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
