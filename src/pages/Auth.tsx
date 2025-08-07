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
  const {
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    resendConfirmation,
    user
  } = useAuth();
  const {
    t,
    language,
    setLanguage
  } = useLanguage();
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
      const {
        error
      } = await signIn(email, password, rememberMe);
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

    // Enhanced password validation
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await signUp(email, password);
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
      const {
        error
      } = await resendConfirmation(email);
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
      console.log('Starting Google OAuth flow...');
      console.log('Current URL:', window.location.href);
      console.log('Origin:', window.location.origin);
      const {
        error
      } = await signInWithGoogle();
      if (error) {
        console.error('Google OAuth error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: window.location.href
        });

        // Enhanced error messages for common Google OAuth issues
        let userMessage = 'Failed to sign in with Google';
        if (error.message?.includes('popup_blocked')) {
          userMessage = 'Popup was blocked. Please allow popups for this site and try again.';
        } else if (error.message?.includes('popup_closed_by_user')) {
          userMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.message?.includes('unauthorized_client')) {
          userMessage = 'Google authentication is not properly configured. Please contact support.';
        } else if (error.message?.includes('redirect_uri_mismatch')) {
          userMessage = 'Authentication configuration error. Please contact support.';
        } else if (error.message?.includes('access_denied')) {
          userMessage = 'Access was denied. Please check your Google account permissions.';
        } else if (error.message?.includes('invalid_request')) {
          userMessage = 'Invalid authentication request. Please try again or contact support.';
        } else if (error.message) {
          userMessage = `Google sign-in failed: ${error.message}`;
        }
        toast.error(userMessage);
      } else {
        console.log('Google OAuth initiated successfully');
        toast.success('Redirecting to Google...');
      }
      // Success handling will be done by the auth state change listener
    } catch (err) {
      console.error('Google sign in unexpected error:', err);
      toast.error('An unexpected error occurred during Google sign-in. Please try again.');
    } finally {
      // Don't set loading false immediately for OAuth flows since they redirect
      setTimeout(() => setLoading(false), 3000);
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
      const {
        error
      } = await resetPassword(email);
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
  return <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{
    backgroundImage: `url('https://i.pinimg.com/736x/70/01/76/700176dc0a287dafa5f15a019198f7b8.jpg')`
  }}>
      {/* Background overlay removed */}
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Professional Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-green-100 bg-clip-text text-transparent drop-shadow-lg">
            សូមស្វាគមន៍!
          </h1>
          <p className="text-base text-white/90 font-medium drop-shadow-md">
            Sign in to your account to continue
          </p>
        </div>

        {/* Enhanced Glassmorphism Card */}
        <Card className="
          backdrop-blur-2xl 
          bg-white/15 
          dark:bg-white/10 
          border 
          border-white/30 
          dark:border-white/20 
          shadow-2xl 
          shadow-cyan-500/20
          drop-shadow-2xl
          rounded-3xl
          overflow-hidden
          relative
          before:absolute 
          before:inset-0 
          before:bg-gradient-to-br 
          before:from-white/25 
          before:via-white/10 
          before:to-transparent 
          before:rounded-3xl 
          before:pointer-events-none
          after:absolute
          after:inset-0
          after:rounded-3xl
          after:bg-gradient-to-t
          after:from-transparent
          after:via-white/5
          after:to-white/10
          after:pointer-events-none
          hover:shadow-cyan-400/30
          hover:border-white/40
          transition-all
          duration-300
        ">
          <CardHeader className="text-center pb-4 relative z-10">
            <Button onClick={() => {
            const newLanguage = language === 'english' ? 'khmer' : 'english';
            console.log('Language button clicked. Current:', language, 'New:', newLanguage);
            setLanguage(newLanguage);
            toast.success(`Language switched to ${newLanguage === 'english' ? 'English' : 'ខ្មែរ'}`);
          }} variant="ghost" size="sm" className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20" title={language === 'english' ? 'Switch to Khmer' : 'Switch to English'}>
              <Globe className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-bold text-white drop-shadow-lg">
              Cashsnap Finances Tracking
            </CardTitle>
            <CardDescription className="text-white/80 drop-shadow-md">
              Access your personal finance dashboard
            </CardDescription>
          </CardHeader>
        
        
        </Card>
      </div>
    </div>;
}