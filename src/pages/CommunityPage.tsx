import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, Globe, Swords, Heart, Sparkles, Plus, Search,
  Brain, Eye, Clock, Zap, Shield, Target,
  Lightbulb, CheckCircle
} from 'lucide-react';
import { useCommunityHubs } from '@/hooks/useCommunityHubs';
import { HubCard } from '@/components/community/HubCard';
import { DuelCard } from '@/components/community/DuelCard';
import { SponsorStreakModal } from '@/components/community/SponsorStreakModal';

export default function CommunityPage() {
  const {
    hubs,
    duels,
    accessibilitySettings,
    accessibilityTips,
    loading,
    joinHub,
    leaveHub,
    createHub,
    createDuel,
    acceptDuel,
    sponsorStreak,
    updateAccessibilitySettings,
    getAccessibilityTips,
    generateDuelChallenge
  } = useCommunityHubs();

  const [activeTab, setActiveTab] = useState('hubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateHub, setShowCreateHub] = useState(false);
  const [showCreateDuel, setShowCreateDuel] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [challenges, setChallenges] = useState('');

  // Create Hub Form State
  const [newHubName, setNewHubName] = useState('');
  const [newHubTheme, setNewHubTheme] = useState('');
  const [newHubDescription, setNewHubDescription] = useState('');
  const [newHubPrivate, setNewHubPrivate] = useState(false);

  // Create Duel Form State
  const [newDuelTitle, setNewDuelTitle] = useState('');
  const [newDuelCategory, setNewDuelCategory] = useState('');
  const [newDuelDuration, setNewDuelDuration] = useState(7);
  const [newDuelStake, setNewDuelStake] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState('');

  const filteredHubs = hubs.filter(hub => 
    hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateHub = async () => {
    await createHub({
      name: newHubName,
      theme: newHubTheme,
      description: newHubDescription,
      is_private: newHubPrivate
    });
    setShowCreateHub(false);
    setNewHubName('');
    setNewHubTheme('');
    setNewHubDescription('');
    setNewHubPrivate(false);
  };

  const handleCreateDuel = async () => {
    await createDuel({
      title: newDuelTitle,
      description: generatedChallenge,
      habit_category: newDuelCategory,
      duration_days: newDuelDuration,
      stake: newDuelStake
    });
    setShowCreateDuel(false);
    setNewDuelTitle('');
    setNewDuelCategory('');
    setNewDuelStake('');
    setGeneratedChallenge('');
  };

  const handleGenerateChallenge = async () => {
    const challenge = await generateDuelChallenge(newDuelCategory, newDuelDuration);
    setGeneratedChallenge(challenge);
  };

  return (
    <PageWrapper title="Community" subtitle="Connect, compete, and grow together">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-4">
              <Globe className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{hubs.length}</p>
              <p className="text-sm opacity-80">Active Hubs</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-4">
              <Swords className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{duels.filter(d => d.status === 'active').length}</p>
              <p className="text-sm opacity-80">Active Duels</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal-500 to-green-500 text-white">
            <CardContent className="p-4">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{hubs.reduce((acc, hub) => acc + (hub.member_count || 0), 0)}</p>
              <p className="text-sm opacity-80">Total Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="hubs" className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Hubs</span>
            </TabsTrigger>
            <TabsTrigger value="duels" className="flex items-center gap-1">
              <Swords className="w-4 h-4" />
              <span className="hidden sm:inline">Duels</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Inclusivity</span>
            </TabsTrigger>
          </TabsList>

          {/* Hubs Tab */}
          <TabsContent value="hubs" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showCreateHub} onOpenChange={setShowCreateHub}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Hub
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Hub</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Hub Name</Label>
                      <Input
                        placeholder="e.g., Early Risers Club"
                        value={newHubName}
                        onChange={(e) => setNewHubName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Theme</Label>
                      <Select value={newHubTheme} onValueChange={setNewHubTheme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="productivity">Productivity</SelectItem>
                          <SelectItem value="mindfulness">Mindfulness</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="creativity">Creativity</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What's your hub about?"
                        value={newHubDescription}
                        onChange={(e) => setNewHubDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Private Hub</Label>
                      <Switch checked={newHubPrivate} onCheckedChange={setNewHubPrivate} />
                    </div>
                    <Button onClick={handleCreateHub} className="w-full">Create Hub</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHubs.map(hub => (
                <HubCard
                  key={hub.id}
                  hub={hub}
                  onJoin={joinHub}
                  onLeave={leaveHub}
                  onView={() => {}}
                />
              ))}
            </div>
          </TabsContent>

          {/* Duels Tab */}
          <TabsContent value="duels" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowSponsorModal(true)}
                  className="border-pink-300 text-pink-600 hover:bg-pink-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Sponsor a Streak
                </Button>
              </div>
              <Dialog open={showCreateDuel} onOpenChange={setShowCreateDuel}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                    <Swords className="w-4 h-4 mr-2" />
                    Challenge Someone
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create a Discipline Duel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Duel Title</Label>
                      <Input
                        placeholder="e.g., Morning Warrior Showdown"
                        value={newDuelTitle}
                        onChange={(e) => setNewDuelTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newDuelCategory} onValueChange={setNewDuelCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning Routine</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="meditation">Meditation</SelectItem>
                          <SelectItem value="productivity">Productivity</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration: {newDuelDuration} days</Label>
                      <Slider
                        value={[newDuelDuration]}
                        onValueChange={([v]) => setNewDuelDuration(v)}
                        min={3}
                        max={30}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Stakes (What's on the line?)</Label>
                      <Input
                        placeholder="e.g., Loser buys coffee"
                        value={newDuelStake}
                        onChange={(e) => setNewDuelStake(e.target.value)}
                      />
                    </div>
                    {newDuelCategory && (
                      <Button 
                        variant="outline" 
                        onClick={handleGenerateChallenge}
                        disabled={loading}
                        className="w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {loading ? 'Generating...' : 'Generate AI Challenge Ideas'}
                      </Button>
                    )}
                    {generatedChallenge && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm">
                        <p className="font-medium mb-1">AI Suggestion:</p>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{generatedChallenge}</p>
                      </div>
                    )}
                    <Button onClick={handleCreateDuel} className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                      <Swords className="w-4 h-4 mr-2" />
                      Create Duel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Active Duels */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Active Duels
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {duels.filter(d => d.status === 'active').map(duel => (
                  <DuelCard key={duel.id} duel={duel} />
                ))}
              </div>
            </div>

            {/* Open Challenges */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Open Challenges
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {duels.filter(d => d.status === 'pending').map(duel => (
                  <DuelCard key={duel.id} duel={duel} onAccept={acceptDuel} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Accessibility/Inclusivity Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-8 h-8" />
                <h3 className="text-xl font-bold">Inclusivity Settings</h3>
              </div>
              <p className="opacity-90">
                Customize your experience to match your unique needs. We believe everyone 
                deserves tools that work with their brain, not against it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* ADHD-Friendly Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    ADHD-Friendly Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ADHD Mode</p>
                      <p className="text-sm text-gray-500">Enable all ADHD-friendly features</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.adhd_mode}
                      onCheckedChange={(v) => updateAccessibilitySettings({ adhd_mode: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Flexible Reminders</p>
                      <p className="text-sm text-gray-500">Reminders with buffer time</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.flexible_reminders}
                      onCheckedChange={(v) => updateAccessibilitySettings({ flexible_reminders: v })}
                    />
                  </div>
                  {accessibilitySettings.flexible_reminders && (
                    <div>
                      <Label>Buffer Time: {accessibilitySettings.reminder_buffer_minutes} min</Label>
                      <Slider
                        value={[accessibilitySettings.reminder_buffer_minutes]}
                        onValueChange={([v]) => updateAccessibilitySettings({ reminder_buffer_minutes: v })}
                        min={15}
                        max={120}
                        step={15}
                        className="mt-2"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Break Down Tasks</p>
                      <p className="text-sm text-gray-500">Split habits into smaller steps</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.break_down_tasks}
                      onCheckedChange={(v) => updateAccessibilitySettings({ break_down_tasks: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dopamine Rewards</p>
                      <p className="text-sm text-gray-500">Extra celebrations and rewards</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.dopamine_rewards}
                      onCheckedChange={(v) => updateAccessibilitySettings({ dopamine_rewards: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Anxiety-Friendly Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Anxiety-Friendly Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Gentle Notifications</p>
                      <p className="text-sm text-gray-500">Softer, less urgent reminders</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.gentle_notifications}
                      onCheckedChange={(v) => updateAccessibilitySettings({ gentle_notifications: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">No Streak Pressure</p>
                      <p className="text-sm text-gray-500">Hide streak counts and warnings</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.no_streak_pressure}
                      onCheckedChange={(v) => updateAccessibilitySettings({ no_streak_pressure: v })}
                    />
                  </div>
                  <div>
                    <Label>Celebration Level</Label>
                    <Select 
                      value={accessibilitySettings.celebration_level}
                      onValueChange={(v: 'minimal' | 'normal' | 'enthusiastic') => 
                        updateAccessibilitySettings({ celebration_level: v })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal - Subtle acknowledgment</SelectItem>
                        <SelectItem value="normal">Normal - Standard celebrations</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic - Big celebrations!</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Visual/Sensory Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Visual & Sensory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reduced Animations</p>
                      <p className="text-sm text-gray-500">Minimize motion and transitions</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.reduced_animations}
                      onCheckedChange={(v) => updateAccessibilitySettings({ reduced_animations: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">High Contrast</p>
                      <p className="text-sm text-gray-500">Enhanced color contrast</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.high_contrast}
                      onCheckedChange={(v) => updateAccessibilitySettings({ high_contrast: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Larger Text</p>
                      <p className="text-sm text-gray-500">Increase text size throughout</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.larger_text}
                      onCheckedChange={(v) => updateAccessibilitySettings({ larger_text: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cognitive Load */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Cognitive Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Simplified Interface</p>
                      <p className="text-sm text-gray-500">Hide advanced features</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.simplified_interface}
                      onCheckedChange={(v) => updateAccessibilitySettings({ simplified_interface: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">One Habit Focus</p>
                      <p className="text-sm text-gray-500">Focus on one habit at a time</p>
                    </div>
                    <Switch
                      checked={accessibilitySettings.one_habit_focus}
                      onCheckedChange={(v) => updateAccessibilitySettings({ one_habit_focus: v })}
                    />
                  </div>
                  <div>
                    <Label>Daily Habit Limit</Label>
                    <Select 
                      value={accessibilitySettings.daily_limit?.toString() || 'none'}
                      onValueChange={(v) => 
                        updateAccessibilitySettings({ daily_limit: v === 'none' ? undefined : parseInt(v) })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No limit</SelectItem>
                        <SelectItem value="3">3 habits per day</SelectItem>
                        <SelectItem value="5">5 habits per day</SelectItem>
                        <SelectItem value="7">7 habits per day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Time Flexibility */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Time Flexibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Flexible Day Boundary</p>
                        <p className="text-sm text-gray-500">Custom day start time</p>
                      </div>
                      <Switch
                        checked={accessibilitySettings.flexible_day_boundary}
                        onCheckedChange={(v) => updateAccessibilitySettings({ flexible_day_boundary: v })}
                      />
                    </div>
                    {accessibilitySettings.flexible_day_boundary && (
                      <div>
                        <Label>Day Starts At: {accessibilitySettings.day_start_hour}:00</Label>
                        <Slider
                          value={[accessibilitySettings.day_start_hour]}
                          onValueChange={([v]) => updateAccessibilitySettings({ day_start_hour: v })}
                          min={0}
                          max={12}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Grace Period: {accessibilitySettings.grace_period_hours} hours</Label>
                      <p className="text-sm text-gray-500 mb-2">Extra time to complete habits</p>
                      <Slider
                        value={[accessibilitySettings.grace_period_hours]}
                        onValueChange={([v]) => updateAccessibilitySettings({ grace_period_hours: v })}
                        min={0}
                        max={6}
                        step={1}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Personalized Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>What challenges are you facing?</Label>
                  <Textarea
                    placeholder="e.g., I have trouble remembering to do my habits, I get overwhelmed easily..."
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button 
                  onClick={() => getAccessibilityTips(challenges)}
                  disabled={loading || !challenges}
                  className="bg-gradient-to-r from-teal-500 to-green-500"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Getting Tips...' : 'Get Personalized Tips'}
                </Button>

                {accessibilityTips.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {accessibilityTips.map((tip, index) => (
                      <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{tip.tip}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tip.explanation}</p>
                            {tip.example && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-2 italic">
                                Example: {tip.example}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sponsor Modal */}
        <SponsorStreakModal
          isOpen={showSponsorModal}
          onClose={() => setShowSponsorModal(false)}
          onSubmit={sponsorStreak}
          loading={loading}
        />
      </div>
    </PageWrapper>
  );
}
