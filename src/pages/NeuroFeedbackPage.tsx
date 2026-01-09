import React, { useState, useEffect, useRef } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useBiofeedback, BrainState, NeuroTeaBlend } from '@/hooks/useBiofeedback';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { BrainStateVisualizer } from '@/components/biofeedback/BrainStateVisualizer';
import { BiofeedbackDeviceCard } from '@/components/biofeedback/BiofeedbackDeviceCard';
import { NeuroTeaBlendCard } from '@/components/biofeedback/NeuroTeaBlendCard';
import { CreateBlendModal } from '@/components/biofeedback/CreateBlendModal';
import { 
  Brain, 
  Bluetooth, 
  Smartphone, 
  Waves, 
  Play, 
  Square,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Download,
  Crown,
  Lock,
  AlertCircle,
  RefreshCw,
  Music
} from 'lucide-react';
import { toast } from 'sonner';

export default function NeuroFeedbackPage() {
  const { user, isPremium } = useAuth();
  const { t } = useLanguage();
  const {
    devices,
    blends,
    activeSession,
    currentBrainState,
    activeBlend,
    isConnecting,
    isLoading,
    isBluetoothSupported,
    connectDevice,
    disconnectDevice,
    removeDevice,
    startSession,
    updateBrainState,
    analyzeBrainState,
    getRealTimeAdjustment,
    endSession,
    createBlend,
    playBlend,
    stopBlend,
    setVolume,
    generatePodcastScript,
    deleteBlend
  } = useBiofeedback();

  const [activeTab, setActiveTab] = useState('session');
  const [showCreateBlend, setShowCreateBlend] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const brainStateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update brain state periodically during active session
  useEffect(() => {
    if (activeSession) {
      brainStateIntervalRef.current = setInterval(() => {
        updateBrainState();
      }, 2000);

      sessionIntervalRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      return () => {
        if (brainStateIntervalRef.current) clearInterval(brainStateIntervalRef.current);
        if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      };
    }
  }, [activeSession, updateBrainState]);

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  // Get AI analysis
  const handleAnalyze = async () => {
    if (!currentBrainState) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeBrainState({
        habitName: 'Current Session',
        category: 'Focus',
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'
      });
      setAiAnalysis(analysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Export podcast script
  const handleExportPodcast = async (blend: NeuroTeaBlend) => {
    const script = await generatePodcastScript(blend);
    if (script) {
      const blob = new Blob([JSON.stringify(script, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${blend.name.replace(/\s+/g, '_')}_podcast_script.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Podcast script exported!');
    }
  };

  // Premium gate
  if (!isPremium) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Neuro-Habit Feedback Loop</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Unlock the power of neurofeedback with EEG integration, real-time brain state tracking, 
            and AI-generated Neuro-Tea Blends for optimal habit completion.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            <Card>
              <CardContent className="p-4 text-left">
                <Brain className="w-6 h-6 text-purple-500 mb-2" />
                <h3 className="font-medium text-sm">EEG Integration</h3>
                <p className="text-xs text-muted-foreground">Muse, Neurosity, EMOTIV</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-left">
                <Waves className="w-6 h-6 text-blue-500 mb-2" />
                <h3 className="font-medium text-sm">Binaural Beats</h3>
                <p className="text-xs text-muted-foreground">AI-generated audio</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-left">
                <Sparkles className="w-6 h-6 text-yellow-500 mb-2" />
                <h3 className="font-medium text-sm">Real-time AI</h3>
                <p className="text-xs text-muted-foreground">Live adjustments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-left">
                <Download className="w-6 h-6 text-green-500 mb-2" />
                <h3 className="font-medium text-sm">Export Podcasts</h3>
                <p className="text-xs text-muted-foreground">Guided meditations</p>
              </CardContent>
            </Card>
          </div>

          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Neuro-Habit Feedback"
      description="Real-time brain state tracking & AI-powered optimization"
      icon={<Brain className="w-5 h-5" />}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="session">
            <Brain className="w-4 h-4 mr-2" />
            Live Session
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Bluetooth className="w-4 h-4 mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="blends">
            <Music className="w-4 h-4 mr-2" />
            Neuro-Tea Blends
          </TabsTrigger>
        </TabsList>

        {/* Live Session Tab */}
        <TabsContent value="session" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Brain State Visualizer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Brain State Monitor
                  </span>
                  {activeSession && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Recording
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <BrainStateVisualizer 
                    brainState={currentBrainState} 
                    size="lg"
                    showLabels={true}
                  />
                  
                  {/* Session Controls */}
                  <div className="mt-6 flex gap-4">
                    {!activeSession ? (
                      <Button
                        onClick={() => {
                          startSession();
                          setSessionDuration(0);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        disabled={devices.filter(d => d.is_connected).length === 0}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Session
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => endSession()}
                          variant="destructive"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          End Session
                        </Button>
                        <Button
                          onClick={handleAnalyze}
                          variant="outline"
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          AI Analysis
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Session Duration */}
                  {activeSession && (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Session: {formatDuration(sessionDuration)}</span>
                    </div>
                  )}

                  {/* No devices warning */}
                  {devices.filter(d => d.is_connected).length === 0 && (
                    <div className="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Connect a device to start a session
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Assessment</h4>
                      <p className="text-sm text-muted-foreground">{aiAnalysis.assessment}</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Recommendation</h4>
                      <Badge className={aiAnalysis.recommendation === 'continue' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {aiAnalysis.recommendation === 'continue' ? 'Continue Current Habit' : 'Switch to Micro-Habit'}
                      </Badge>
                      {aiAnalysis.microHabitSuggestion && (
                        <p className="text-sm text-muted-foreground mt-2">{aiAnalysis.microHabitSuggestion}</p>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Recommended Blend</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700">
                          {aiAnalysis.recommendedBlend}
                        </Badge>
                        <span className="text-xs text-muted-foreground">@ {aiAnalysis.optimalBinauralFrequency} Hz</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{aiAnalysis.blendReason}</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300 italic">"{aiAnalysis.motivation}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a session and click "AI Analysis" to get personalized insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Blend Player */}
          {activeBlend && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{activeBlend.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeBlend.binaural_frequency} Hz binaural • {activeBlend.base_frequency} Hz base
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Volume Control */}
                    <div className="flex items-center gap-2 w-32">
                      {volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.01}
                        className="flex-1"
                      />
                    </div>
                    
                    <Button
                      onClick={stopBlend}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Connected Devices</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => connectDevice('phone_sensors')}
                variant="outline"
                disabled={isConnecting}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Use Phone Sensors
              </Button>
              {isBluetoothSupported() && (
                <Button
                  onClick={() => connectDevice('muse')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  disabled={isConnecting}
                >
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Connect EEG Device
                </Button>
              )}
            </div>
          </div>

          {!isBluetoothSupported() && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Bluetooth Not Supported</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Your browser doesn't support Web Bluetooth. Use Chrome on desktop or Android for EEG device connectivity.
                    You can still use phone sensors for basic tracking.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supported Devices Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported EEG Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Muse', type: 'muse', icon: '🧠', desc: 'Meditation headband' },
                  { name: 'Neurosity Crown', type: 'neurosity', icon: '👑', desc: 'Focus tracker' },
                  { name: 'EMOTIV Insight', type: 'emotiv', icon: '🎧', desc: 'Professional EEG' },
                  { name: 'Phone Sensors', type: 'phone_sensors', icon: '📱', desc: 'Motion tracking' }
                ].map((device) => (
                  <div key={device.type} className="bg-muted/50 rounded-lg p-4 text-center">
                    <span className="text-3xl">{device.icon}</span>
                    <h4 className="font-medium mt-2">{device.name}</h4>
                    <p className="text-xs text-muted-foreground">{device.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connected Devices */}
          {devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <BiofeedbackDeviceCard
                  key={device.id}
                  device={device}
                  onDisconnect={disconnectDevice}
                  onRemove={removeDevice}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bluetooth className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Devices Connected</h3>
              <p className="text-sm">Connect an EEG device or use phone sensors to start tracking</p>
            </div>
          )}
        </TabsContent>

        {/* Neuro-Tea Blends Tab */}
        <TabsContent value="blends" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Neuro-Tea Blends</h2>
              <p className="text-sm text-muted-foreground">AI-generated binaural beats with tea-themed ambience</p>
            </div>
            <Button
              onClick={() => setShowCreateBlend(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Blend
            </Button>
          </div>

          {/* Blend Info */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Waves className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">How Neuro-Tea Blends Work</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our AI generates custom binaural beats based on your target mental state and tea flavor preference.
                    Binaural beats use slightly different frequencies in each ear to induce specific brainwave patterns.
                    Combined with tea-themed ambient sounds, these blends help optimize your habit completion.
                  </p>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>🎯 Focus: 12-30 Hz (Beta)</span>
                    <span>🧘 Calm: 8-12 Hz (Alpha)</span>
                    <span>🌙 Sleep: 1-4 Hz (Delta)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blends Grid */}
          {blends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blends.map((blend) => (
                <NeuroTeaBlendCard
                  key={blend.id}
                  blend={blend}
                  isPlaying={activeBlend?.id === blend.id}
                  onPlay={playBlend}
                  onStop={stopBlend}
                  onDelete={deleteBlend}
                  onExport={handleExportPodcast}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Blends Yet</h3>
              <p className="text-sm">Create your first Neuro-Tea Blend to enhance your habit sessions</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Blend Modal */}
      <CreateBlendModal
        isOpen={showCreateBlend}
        onClose={() => setShowCreateBlend(false)}
        onCreate={createBlend}
      />
    </PageWrapper>
  );
}
