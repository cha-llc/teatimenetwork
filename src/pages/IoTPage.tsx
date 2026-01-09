import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Watch, Mic, Home, Smartphone, Plus, Wifi, WifiOff, RefreshCw,
  Zap, MapPin, Clock, Activity, Volume2, Lightbulb, Cloud, CloudOff,
  Download, Upload, CheckCircle, AlertCircle, Settings, Globe,
  Bluetooth, BluetoothConnected, BluetoothOff, Signal, Timer
} from 'lucide-react';
import { useIoTIntegrations, AVAILABLE_DEVICES } from '@/hooks/useIoTIntegrations';
import { DeviceCard } from '@/components/iot/DeviceCard';
import { ConnectDeviceModal } from '@/components/iot/ConnectDeviceModal';
import { HabitTriggerCard } from '@/components/iot/HabitTriggerCard';
import { GeoFenceCard } from '@/components/iot/GeoFenceCard';
import { CreateGeoFenceModal } from '@/components/iot/CreateGeoFenceModal';
import { toast } from 'sonner';

export default function IoTPage() {
  const {
    connectedDevices,
    habitTriggers,
    geoFences,
    automations,
    syncLogs,
    isOnline,
    offlineQueue,
    loading,
    isScanning,
    syncInProgress,
    lastGlobalSync,
    isBluetoothSupported,
    isGeolocationSupported,
    connectDevice,
    connectViaBluetooth,
    connectViaWifi,
    disconnectDevice,
    scanBluetoothDevices,
    syncDevice,
    syncAllDevices,
    toggleAutoSync,
    updateSyncFrequency,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    createGeoFence,
    updateGeoFence,
    deleteGeoFence,
    createAutomation,
    deleteAutomation,
    syncOfflineQueue
  } = useIoTIntegrations();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showGeoFenceModal, setShowGeoFenceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('devices');

  // Filter devices by type
  const wearables = connectedDevices.filter(d => d.device_type === 'wearable' || d.device_type === 'app');
  const voiceAssistants = connectedDevices.filter(d => d.device_type === 'voice_assistant');
  const smartHomeDevices = connectedDevices.filter(d => d.device_type === 'smart_home');

  // Calculate sync stats
  const totalSyncs = syncLogs.length;
  const successfulSyncs = syncLogs.filter(l => l.sync_status === 'success').length;
  const syncSuccessRate = totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 100;

  // Voice commands examples
  const voiceCommands = [
    { assistant: 'Alexa', command: '"Alexa, tell Momentum I finished my meditation"', icon: '🔵' },
    { assistant: 'Google', command: '"Hey Google, log my workout in Momentum"', icon: '🎨' },
    { assistant: 'Siri', command: '"Hey Siri, complete my reading habit"', icon: '🟣' },
    { assistant: 'Alexa', command: '"Alexa, ask Momentum how my day is going"', icon: '🔵' },
    { assistant: 'Google', command: '"Hey Google, start my focus timer"', icon: '🎨' },
    { assistant: 'Siri', command: '"Hey Siri, what habits do I have left today?"', icon: '🟣' }
  ];

  // Smart home automation examples
  const automationExamples = [
    {
      name: 'Focus Mode',
      description: 'Dim lights to 30% when starting a focus session',
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      trigger: 'Focus session starts'
    },
    {
      name: 'Morning Routine',
      description: 'Gradually brighten lights at wake-up time',
      icon: <Lightbulb className="h-5 w-5 text-orange-500" />,
      trigger: 'Morning alarm'
    },
    {
      name: 'Celebration',
      description: 'Flash lights green when completing all daily habits',
      icon: <Lightbulb className="h-5 w-5 text-green-500" />,
      trigger: 'All habits complete'
    },
    {
      name: 'Reminder Announcement',
      description: 'Play reminder through smart speaker',
      icon: <Volume2 className="h-5 w-5 text-blue-500" />,
      trigger: 'Habit reminder time'
    }
  ];

  const handleScanBluetooth = async () => {
    if (!isBluetoothSupported()) {
      toast.error('Bluetooth is not supported in this browser. Try Chrome on desktop or Android.');
      return;
    }
    await scanBluetoothDevices();
  };

  return (
    <PageWrapper title="Integrations & Sync" showNav>
      {/* Connection Status Banner */}
      <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
        isOnline 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="relative">
              <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          ) : (
            <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
          <div>
            <p className="font-medium">
              {isOnline ? 'Connected & Syncing' : 'Offline Mode Active'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isOnline 
                ? `Last sync: ${lastGlobalSync ? new Date(lastGlobalSync).toLocaleTimeString() : 'Just now'}` 
                : `${offlineQueue.length} actions queued for sync`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Bluetooth Status */}
          <Badge 
            variant="outline" 
            className={isBluetoothSupported() ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-500'}
          >
            {isBluetoothSupported() ? (
              <><Bluetooth className="h-3 w-3 mr-1" /> BT Ready</>
            ) : (
              <><BluetoothOff className="h-3 w-3 mr-1" /> No BT</>
            )}
          </Badge>
          
          {!isOnline && offlineQueue.length > 0 && (
            <Badge variant="secondary">
              {offlineQueue.length} pending
            </Badge>
          )}
          
          {isOnline && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={syncAllDevices}
              disabled={syncInProgress !== null}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncInProgress ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Watch className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectedDevices.length}</p>
              <p className="text-xs text-muted-foreground">Devices</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{habitTriggers.length}</p>
              <p className="text-xs text-muted-foreground">Triggers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{geoFences.length}</p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {habitTriggers.reduce((sum, t) => sum + t.times_triggered, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Auto-Done</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{syncSuccessRate}%</p>
              <p className="text-xs text-muted-foreground">Sync Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="devices" className="gap-1">
            <Watch className="h-4 w-4" />
            <span className="hidden sm:inline">Devices</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-1">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="smart-home" className="gap-1">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Smart Home</span>
          </TabsTrigger>
          <TabsTrigger value="triggers" className="gap-1">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Auto-Track</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-1">
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Sync</span>
          </TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold">Wearables & Health Apps</h2>
              <p className="text-muted-foreground">Auto-track habits from your fitness devices</p>
            </div>
            <div className="flex gap-2">
              {isBluetoothSupported() && (
                <Button variant="outline" onClick={handleScanBluetooth} disabled={isScanning}>
                  <Bluetooth className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Scan Bluetooth'}
                </Button>
              )}
              <Button onClick={() => setShowConnectModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Connect Device
              </Button>
            </div>
          </div>

          {wearables.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wearables.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSync={syncDevice}
                  onDisconnect={disconnectDevice}
                  onConfigure={(d) => {
                    // Toggle auto-sync as example configuration
                    toggleAutoSync(d.id, !d.auto_sync_enabled);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Watch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Devices Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your wearables to auto-track fitness habits
                </p>
                <div className="flex justify-center gap-2">
                  {isBluetoothSupported() && (
                    <Button variant="outline" onClick={handleScanBluetooth}>
                      <Bluetooth className="h-4 w-4 mr-2" />
                      Scan Bluetooth
                    </Button>
                  )}
                  <Button onClick={() => setShowConnectModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {AVAILABLE_DEVICES.filter(d => d.popular && (d.type === 'wearable' || d.type === 'app')).map(device => (
                  <button
                    key={device.id}
                    onClick={() => setShowConnectModal(true)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl ${device.color} flex items-center justify-center text-2xl shadow-md`}>
                      {device.icon}
                    </div>
                    <span className="text-sm font-medium text-center">{device.displayName}</span>
                    <Badge variant="outline" className="text-xs">
                      {device.connectionType === 'bluetooth' ? (
                        <Bluetooth className="h-3 w-3" />
                      ) : device.connectionType === 'wifi' ? (
                        <Wifi className="h-3 w-3" />
                      ) : (
                        <Signal className="h-3 w-3" />
                      )}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Tab */}
        <TabsContent value="voice" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Voice Assistants</h2>
              <p className="text-muted-foreground">Control habits with your voice</p>
            </div>
            <Button onClick={() => setShowConnectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Assistant
            </Button>
          </div>

          {voiceAssistants.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voiceAssistants.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSync={syncDevice}
                  onDisconnect={disconnectDevice}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Voice Assistants Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect Alexa, Google, or Siri for hands-free habit tracking
                </p>
                <Button onClick={() => setShowConnectModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Voice Assistant
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Voice Commands Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Commands You Can Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {voiceCommands.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-2xl">{cmd.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{cmd.assistant}</p>
                      <p className="text-sm text-muted-foreground">{cmd.command}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Assistant Setup */}
          <div className="grid md:grid-cols-3 gap-4">
            {AVAILABLE_DEVICES.filter(d => d.type === 'voice_assistant').map(device => (
              <Card key={device.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowConnectModal(true)}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${device.color} flex items-center justify-center text-3xl shadow-lg mb-4`}>
                    {device.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{device.displayName}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{device.description}</p>
                  <Button variant="outline" className="w-full">
                    {connectedDevices.some(d => d.device_name === device.name) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Home Tab */}
        <TabsContent value="smart-home" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Smart Home</h2>
              <p className="text-muted-foreground">Automate your environment based on habits</p>
            </div>
            <Button onClick={() => setShowConnectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>

          {smartHomeDevices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smartHomeDevices.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSync={syncDevice}
                  onDisconnect={disconnectDevice}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Smart Home Devices</h3>
                <p className="text-muted-foreground mb-4">
                  Connect smart lights, speakers, and more via WiFi
                </p>
                <Button onClick={() => setShowConnectModal(true)}>
                  <Wifi className="h-4 w-4 mr-2" />
                  Add Smart Home Device
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Automation Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automation Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {automationExamples.map((automation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {automation.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{automation.name}</h4>
                      <p className="text-sm text-muted-foreground">{automation.description}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Trigger: {automation.trigger}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Track Tab */}
        <TabsContent value="triggers" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold">Auto-Tracking Rules</h2>
              <p className="text-muted-foreground">Automatically complete habits based on activity</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowGeoFenceModal(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                Add Location
              </Button>
              <Button onClick={() => toast.info('Create trigger feature coming soon!')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trigger
              </Button>
            </div>
          </div>

          {/* Activity Triggers */}
          {habitTriggers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Activity Triggers
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habitTriggers.map(trigger => (
                  <HabitTriggerCard
                    key={trigger.id}
                    trigger={trigger}
                    onToggle={(id, active) => updateTrigger(id, { is_active: active })}
                    onDelete={deleteTrigger}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Location Triggers */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Location Triggers
              {!isGeolocationSupported() && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Location unavailable
                </Badge>
              )}
            </h3>
            {geoFences.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {geoFences.map(fence => (
                  <GeoFenceCard
                    key={fence.id}
                    fence={fence}
                    onToggle={(id, active) => updateGeoFence(id, { is_active: active })}
                    onDelete={deleteGeoFence}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h4 className="font-semibold mb-1">No Location Triggers</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Auto-complete habits when you arrive at specific locations
                  </p>
                  <Button variant="outline" onClick={() => setShowGeoFenceModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trigger Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auto-Tracking Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Steps Goal</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Auto-complete "Daily Walk" when you hit 5,000 steps
                  </p>
                </div>
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Gym Check-in</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start workout timer when arriving at the gym
                  </p>
                </div>
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">Sleep Detection</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Log sleep habit when wearable detects 7+ hours
                  </p>
                </div>
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h4 className="font-semibold">Workout Complete</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mark exercise done when Strava logs an activity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Sync & Connectivity</h2>
              <p className="text-muted-foreground">Manage data sync across all your devices</p>
            </div>
            <Button variant="outline" onClick={syncAllDevices} disabled={syncInProgress !== null}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
              Sync All Now
            </Button>
          </div>

          {/* Sync Status */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {isOnline ? (
                    <Cloud className="h-5 w-5 text-green-500" />
                  ) : (
                    <CloudOff className="h-5 w-5 text-yellow-500" />
                  )}
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>WiFi Status</span>
                  <Badge className={isOnline ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    <Wifi className="h-3 w-3 mr-1" />
                    {isOnline ? 'Connected' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bluetooth</span>
                  <Badge className={isBluetoothSupported() ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    <Bluetooth className="h-3 w-3 mr-1" />
                    {isBluetoothSupported() ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Actions</span>
                  <span className="font-semibold">{offlineQueue.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Sync</span>
                  <span className="text-muted-foreground">
                    {lastGlobalSync ? new Date(lastGlobalSync).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Cross-Platform Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile App</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Synced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Web App</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Synced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Watch className="h-4 w-4" />
                    <span>Wearables</span>
                  </div>
                  <Badge className={connectedDevices.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {connectedDevices.length > 0 ? 'Synced' : 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Desktop App</span>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="h-5 w-5 text-purple-500" />
                  Sync Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Syncs</span>
                  <span className="font-semibold">{totalSyncs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Success Rate</span>
                  <span className="font-semibold text-green-600">{syncSuccessRate}%</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Sync Health</span>
                    <span className="text-sm text-muted-foreground">{syncSuccessRate}%</span>
                  </div>
                  <Progress value={syncSuccessRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Sync Settings */}
          {connectedDevices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Device Sync Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedDevices.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {device.device_type === 'wearable' ? <Watch className="h-5 w-5" /> :
                           device.device_type === 'voice_assistant' ? <Mic className="h-5 w-5" /> :
                           <Home className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{device.display_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {device.last_sync_at 
                              ? new Date(device.last_sync_at).toLocaleTimeString() 
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Auto-sync</span>
                          <Switch 
                            checked={device.auto_sync_enabled}
                            onCheckedChange={(checked) => toggleAutoSync(device.id, checked)}
                          />
                        </div>
                        <Select 
                          value={device.sync_frequency_minutes.toString()}
                          onValueChange={(value) => updateSyncFrequency(device.id, parseInt(value))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => syncDevice(device.id)}
                          disabled={syncInProgress === device.id}
                        >
                          <RefreshCw className={`h-4 w-4 ${syncInProgress === device.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offline Mode Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Offline Mode Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Offline Mode</p>
                  <p className="text-sm text-muted-foreground">Track habits even without internet</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Sync on Connect</p>
                  <p className="text-sm text-muted-foreground">Automatically sync when back online</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Background Sync</p>
                  <p className="text-sm text-muted-foreground">Sync data in the background</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Recent Sync Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sync Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {syncLogs.length > 0 ? (
                <div className="space-y-3">
                  {syncLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.sync_status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : log.sync_status === 'in_progress' ? (
                          <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{log.device_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.sync_type} sync • {log.records_synced} records
                            {log.duration_ms && ` • ${log.duration_ms}ms`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={log.sync_status === 'success' ? 'default' : 'destructive'}
                          className={log.sync_status === 'success' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {log.sync_status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.synced_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No sync activity yet</p>
                  <p className="text-sm">Connect a device to start syncing</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Export/Import */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => toast.success('Data exported!')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info('Import feature coming soon!')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Export your habits and progress as JSON or CSV
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ConnectDeviceModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={connectDevice}
        onConnectBluetooth={connectViaBluetooth}
        onConnectWifi={connectViaWifi}
        connectedDeviceNames={connectedDevices.map(d => d.device_name)}
        isBluetoothSupported={isBluetoothSupported()}
      />

      <CreateGeoFenceModal
        isOpen={showGeoFenceModal}
        onClose={() => setShowGeoFenceModal(false)}
        onCreate={createGeoFence}
      />
    </PageWrapper>
  );
}
