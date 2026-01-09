import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Loader2, 
  User, 
  Globe, 
  Check, 
  Shield, 
  Eye, 
  EyeOff,
  MapPin,
  Link as LinkIcon,
  Twitter,
  AtSign,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrivacySettings {
  show_achievements: boolean;
  show_streaks: boolean;
  show_habits: boolean;
  show_statistics: boolean;
  show_activity: boolean;
  show_followers: boolean;
  show_following: boolean;
  allow_follow_requests: boolean;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, user, updateProfile, refreshProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>('profile');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_achievements: true,
    show_streaks: true,
    show_habits: true,
    show_statistics: true,
    show_activity: true,
    show_followers: true,
    show_following: true,
    allow_follow_requests: true
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName((profile as any).display_name || profile.full_name || '');
      setUsername((profile as any).username || '');
      setBio((profile as any).bio || '');
      setLocation((profile as any).location || '');
      setWebsite((profile as any).website || '');
      setTwitterHandle((profile as any).twitter_handle || '');
      setIsPublic((profile as any).is_public !== false);
      setAvatarUrl((profile as any).avatar_url || null);
    }
  }, [profile]);

  // Fetch privacy settings
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setPrivacySettings({
          show_achievements: data.show_achievements,
          show_streaks: data.show_streaks,
          show_habits: data.show_habits,
          show_statistics: data.show_statistics,
          show_activity: data.show_activity,
          show_followers: data.show_followers,
          show_following: data.show_following,
          allow_follow_requests: data.allow_follow_requests
        });
      }
    };
    
    if (isOpen) {
      fetchPrivacySettings();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const validateUsername = async (value: string) => {
    if (!value) {
      setUsernameError(null);
      return true;
    }
    
    // Check format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(value)) {
      setUsernameError('Username must be 3-30 characters and contain only letters, numbers, and underscores');
      return false;
    }
    
    // Check availability
    setCheckingUsername(true);
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value.toLowerCase())
      .neq('id', user?.id || '')
      .single();
    
    setCheckingUsername(false);
    
    if (data) {
      setUsernameError('This username is already taken');
      return false;
    }
    
    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    if (value.length >= 3) {
      validateUsername(value);
    } else {
      setUsernameError(null);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, GIF, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      if (avatarUrl) {
        const oldPath = avatarUrl.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      await updateProfile({ avatar_url: publicUrl } as any);
      await refreshProfile();
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || t.profile.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!avatarUrl || !user) return;

    setUploading(true);
    setError(null);

    try {
      const path = avatarUrl.split('/avatars/')[1];
      if (path) {
        await supabase.storage.from('avatars').remove([path]);
      }

      setAvatarUrl(null);
      await updateProfile({ avatar_url: null } as any);
      await refreshProfile();
    } catch (err: any) {
      console.error('Remove error:', err);
      setError(err.message || 'Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (username && !(await validateUsername(username))) {
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      // Update profile
      await updateProfile({
        display_name: displayName,
        username: username || null,
        bio: bio,
        location: location,
        website: website,
        twitter_handle: twitterHandle,
        is_public: isPublic
      } as any);
      
      // Update privacy settings
      if (user) {
        await supabase
          .from('user_privacy_settings')
          .upsert({
            user_id: user.id,
            ...privacySettings,
            updated_at: new Date().toISOString()
          });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const name = displayName || profile?.full_name || profile?.email || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const togglePrivacySetting = (key: keyof PrivacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.profile.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-[#7C9885] border-b-2 border-[#7C9885]'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'text-[#7C9885] border-b-2 border-[#7C9885]'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Privacy
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' ? (
            <>
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#7C9885] to-[#5a7a64] flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{getInitials()}</span>
                    )}
                  </div>
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#7C9885] rounded-full flex items-center justify-center shadow-lg hover:bg-[#6a8573] transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#7C9885] hover:bg-[#7C9885]/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {avatarUrl ? t.profile.changePhoto : t.profile.uploadPhoto}
                  </button>
                  
                  {avatarUrl && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t.profile.removePhoto}
                    </button>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <AtSign className="w-4 h-4" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="your_username"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white ${
                      usernameError ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {checkingUsername && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>
                {usernameError && (
                  <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                )}
                {username && !usernameError && !checkingUsername && (
                  <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Username available
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Your profile URL: teatimenetwork.com/user/{username || 'username'}
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4" />
                  {t.profile.displayName}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.profile.displayNamePlaceholder}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.profile.bio}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t.profile.bioPlaceholder}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-500 text-right mt-1">{bio.length}/160</p>
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>

              {/* Website */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <LinkIcon className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Twitter className="w-4 h-4" />
                  Twitter Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value.replace('@', ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Public Profile Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Eye className="w-5 h-5 text-green-500" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Public Profile</p>
                    <p className="text-sm text-gray-500">Allow others to view your profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPublic ? 'bg-[#7C9885]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isPublic ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Language Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe className="w-4 h-4" />
                  {t.profile.language}
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      language === 'en'
                        ? 'border-[#7C9885] bg-[#7C9885]/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">🇺🇸</span>
                    <span className={language === 'en' ? 'text-[#7C9885] font-medium' : 'text-gray-600 dark:text-gray-400'}>
                      {t.profile.english}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setLanguage('es')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      language === 'es'
                        ? 'border-[#7C9885] bg-[#7C9885]/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">🇪🇸</span>
                    <span className={language === 'es' ? 'text-[#7C9885] font-medium' : 'text-gray-600 dark:text-gray-400'}>
                      {t.profile.spanish}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Privacy Tab */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Control what information is visible on your public profile. These settings only apply when your profile is set to public.
                </p>
              </div>

              <PrivacyToggle
                icon={<Trophy className="w-5 h-5" />}
                label="Show Achievements"
                description="Display your earned badges and achievements"
                enabled={privacySettings.show_achievements}
                onToggle={() => togglePrivacySetting('show_achievements')}
              />

              <PrivacyToggle
                icon={<Flame className="w-5 h-5" />}
                label="Show Streaks"
                description="Display your current habit streaks"
                enabled={privacySettings.show_streaks}
                onToggle={() => togglePrivacySetting('show_streaks')}
              />

              <PrivacyToggle
                icon={<Target className="w-5 h-5" />}
                label="Show Habits"
                description="Display the habits you're tracking"
                enabled={privacySettings.show_habits}
                onToggle={() => togglePrivacySetting('show_habits')}
              />

              <PrivacyToggle
                icon={<TrendingUp className="w-5 h-5" />}
                label="Show Statistics"
                description="Display your completion stats and points"
                enabled={privacySettings.show_statistics}
                onToggle={() => togglePrivacySetting('show_statistics')}
              />

              <PrivacyToggle
                icon={<Users className="w-5 h-5" />}
                label="Show Followers"
                description="Display your follower count"
                enabled={privacySettings.show_followers}
                onToggle={() => togglePrivacySetting('show_followers')}
              />

              <PrivacyToggle
                icon={<Users className="w-5 h-5" />}
                label="Show Following"
                description="Display who you're following"
                enabled={privacySettings.show_following}
                onToggle={() => togglePrivacySetting('show_following')}
              />

              <PrivacyToggle
                icon={<UserPlus className="w-5 h-5" />}
                label="Allow Follow Requests"
                description="Let others follow your profile"
                enabled={privacySettings.allow_follow_requests}
                onToggle={() => togglePrivacySetting('allow_follow_requests')}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !!usernameError}
            className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                {t.profile.profileUpdated}
              </>
            ) : (
              t.profile.updateProfile
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Privacy Toggle Component
const PrivacyToggle: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ icon, label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <div className="flex items-center gap-3">
      <div className={`${enabled ? 'text-[#7C9885]' : 'text-gray-400'}`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-[#7C9885]' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
        enabled ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  </div>
);

// Import missing icons
import { Trophy, Flame, Target, TrendingUp, Users, UserPlus } from 'lucide-react';

export default ProfileSettingsModal;
