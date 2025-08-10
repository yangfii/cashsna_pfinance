import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/useLanguage';
export function WelcomeMessage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t } = useLanguage();
  console.log('Profile data:', profile);
  console.log('User data:', user);

  if (!user) return null;

  const displayName = profile?.first_name || profile?.last_name 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User';

  const lastName = profile?.last_name || '';
  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : displayName[0]?.toUpperCase() || 'U';

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 text-foreground">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-h4 text-foreground">
              {t('welcome.hello')}, {profile?.first_name || displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('welcome.welcomeBack')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}