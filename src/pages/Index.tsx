import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Welcome to Cashsnap</h1>
          <p className="text-xl text-muted-foreground mb-6">Manage your finances with ease</p>
          <p className="text-muted-foreground">You are signed in as: {user.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gradient">Cashsnap Finances Tracking</h1>
        <p className="text-xl text-muted-foreground mb-8">Take control of your personal finances</p>
        <Button asChild size="lg">
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
