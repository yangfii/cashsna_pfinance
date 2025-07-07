import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Camera, Save, User } from 'lucide-react';

export function ProfileCard() {
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const { error } = await updateProfile({
      first_name: firstName,
      last_name: lastName,
    });

    if (error) {
      toast.error('Error updating profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const { error } = await uploadAvatar(file);

    if (error) {
      toast.error('Error uploading avatar');
    } else {
      toast.success('Avatar updated successfully');
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = profile?.first_name || profile?.last_name 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User';

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : displayName[0]?.toUpperCase() || 'U';

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {uploading && (
              <p className="text-xs text-primary mt-1">Uploading avatar...</p>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={isEditing ? firstName : (profile?.first_name || '')}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={isEditing ? lastName : (profile?.last_name || '')}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFirstName(profile?.first_name || '');
                    setLastName(profile?.last_name || '');
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}