import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, Trash2 } from 'lucide-react';

export default function ProfileSetup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect existing users with completed profiles, but add protection against loops
  useEffect(() => {
    if (!profileLoading && profile?.first_name && profile?.last_name) {
      // Add a delay to prevent rapid redirects
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [profile, profileLoading, navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = null;
      
      // Upload avatar if one was selected
      if (avatarFile) {
        const { data: avatarData, error: avatarError } = await uploadAvatar(avatarFile);
        if (avatarError) {
          throw avatarError;
        }
        avatarUrl = avatarData?.avatar_url;
      }

      // Update profile with name and avatar
      const { error } = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ...(avatarUrl && { avatar_url: avatarUrl })
      });

      if (error) {
        throw error;
      }

      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to set up profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">More about you</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">Profile photo</Label>
            
            <div className="flex items-center gap-4">
              {/* Avatar Display */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 via-blue-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {firstName.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex gap-2">
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200"
                    asChild
                  >
                    <span className="cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Avatar
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">
              First name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
              className="bg-background border-border"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">
              Last name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
              className="bg-background border-border"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-muted text-muted-foreground hover:bg-muted/80 mt-8"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Get started'}
          </Button>
        </form>
      </div>
    </div>
  );
}