import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Bell, Lock } from 'lucide-react';
import { PrivacySettings } from '@/hooks/useAccountabilityPartners';

interface PrivacySettingsCardProps {
  settings: PrivacySettings;
  onUpdate: (settings: Partial<PrivacySettings>) => void;
}

export function PrivacySettingsCard({ settings, onUpdate }: PrivacySettingsCardProps) {
  const sharingSettings = [
    {
      key: 'share_habit_names',
      label: 'Habit Names',
      description: 'Allow partners to see the names of your habits',
      icon: Eye,
    },
    {
      key: 'share_streaks',
      label: 'Streak Progress',
      description: 'Show your current streaks to partners',
      icon: Eye,
    },
    {
      key: 'share_completions',
      label: 'Daily Completions',
      description: 'Share when you complete habits each day',
      icon: Eye,
    },
    {
      key: 'share_categories',
      label: 'Habit Categories',
      description: 'Show which categories your habits belong to',
      icon: Eye,
    },
    {
      key: 'share_statistics',
      label: 'Detailed Statistics',
      description: 'Share completion rates and detailed analytics',
      icon: Eye,
    },
  ];

  const notificationSettings = [
    {
      key: 'notify_on_completion',
      label: 'Habit Completions',
      description: 'Notify partners when you complete a habit',
      icon: Bell,
    },
    {
      key: 'notify_on_streak_break',
      label: 'Streak Breaks',
      description: 'Alert partners when your streak is broken',
      icon: Bell,
    },
    {
      key: 'notify_on_milestone',
      label: 'Milestones',
      description: 'Celebrate milestones with your partners',
      icon: Bell,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          Privacy Controls
        </CardTitle>
        <CardDescription>
          Control what information your accountability partners can see
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Sharing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Lock className="w-4 h-4" />
            Data Sharing
          </div>
          <div className="space-y-4 pl-6">
            {sharingSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={setting.key} className="text-sm font-medium cursor-pointer">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <Switch
                  id={setting.key}
                  checked={settings[setting.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => onUpdate({ [setting.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Notification Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Bell className="w-4 h-4" />
            Partner Notifications
          </div>
          <div className="space-y-4 pl-6">
            {notificationSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={setting.key} className="text-sm font-medium cursor-pointer">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <Switch
                  id={setting.key}
                  checked={settings[setting.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => onUpdate({ [setting.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Summary */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-indigo-900 dark:text-indigo-100 text-sm mb-2">
            Your Privacy Summary
          </h4>
          <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
            {settings.share_habit_names ? (
              <li>• Partners can see your habit names</li>
            ) : (
              <li>• Habit names are hidden from partners</li>
            )}
            {settings.share_streaks ? (
              <li>• Your streaks are visible to partners</li>
            ) : (
              <li>• Streaks are private</li>
            )}
            {settings.share_completions ? (
              <li>• Daily completions are shared</li>
            ) : (
              <li>• Daily completions are private</li>
            )}
            {settings.notify_on_completion || settings.notify_on_streak_break || settings.notify_on_milestone ? (
              <li>• Partners receive activity notifications</li>
            ) : (
              <li>• No automatic notifications sent to partners</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
