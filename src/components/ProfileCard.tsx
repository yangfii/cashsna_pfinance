import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Camera, Save, User, X } from 'lucide-react';

export function ProfileCard() {
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, removeAvatar, loading, checkUsernameAvailability } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    // Check username availability before saving
    if (username && username !== profile?.username) {
      const { available, error: checkError } = await checkUsernameAvailability(username);
      if (checkError) {
        toast.error('Error checking username availability');
        return;
      }
      if (!available) {
        toast.error(`Username "${username}" is already taken. Please choose a different one.`);
        return;
      }
    }

    const { error } = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      username: username,
    });

    if (error) {
      console.error('Profile update error:', error);
      if (error.message.includes('username_format')) {
        toast.error('Username can only contain letters, numbers, dots, underscores, and hyphens');
      } else if (error.message.includes('duplicate') || error.code === '23505') {
        toast.error(`Username "${username}" is already taken. Please choose a different one.`);
      } else {
        toast.error('Error updating profile');
      }
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
      toast.error('Failed to upload avatar. Please try again.');
    } else {
      toast.success('Avatar updated successfully');
    }
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    const { error } = await removeAvatar();

    if (error) {
      toast.error('Failed to remove avatar. Please try again.');
    } else {
      toast.success('Avatar removed successfully');
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
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-shrink-0">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="text-base sm:text-lg font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
              {profile?.avatar_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            {uploading && (
              <p className="text-xs text-primary mt-1">Uploading avatar...</p>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={isEditing ? username : (profile?.username || '')}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter username"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
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
                    setUsername(profile?.username || '');
                  }}
                  className="sm:flex-none"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="w-full"
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