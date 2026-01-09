import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, Watch, Mic, Home, Smartphone, Star, CheckCircle, ArrowRight, Loader2,
  Bluetooth, Wifi, WifiOff, Signal, AlertCircle, RefreshCw
} from 'lucide-react';
import { DeviceInfo, AVAILABLE_DEVICES } from '@/hooks/useIoTIntegrations';

interface ConnectDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (device: DeviceInfo) => Promise<any>;
  onConnectBluetooth?: (device: DeviceInfo) => Promise<any>;
  onConnectWifi?: (device: DeviceInfo, ssid?: string) => Promise<any>;
  connectedDeviceNames: string[];
  isBluetoothSupported?: boolean;
}

export function ConnectDeviceModal({ 
  isOpen, 
  onClose, 
  onConnect, 
  onConnectBluetooth,
  onConnectWifi,
  connectedDeviceNames,
  isBluetoothSupported = true
}: ConnectDeviceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'scanning' | 'connecting' | 'success' | 'error'>('idle');
  const [step, setStep] = useState<'select' | 'instructions' | 'connecting'>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredDevices = AVAILABLE_DEVICES.filter(device =>
    device.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const devicesByType = {
    wearable: filteredDevices.filter(d => d.type === 'wearable'),
    app: filteredDevices.filter(d => d.type === 'app'),
    voice_assistant: filteredDevices.filter(d => d.type === 'voice_assistant'),
    smart_home: filteredDevices.filter(d => d.type === 'smart_home')
  };

  const handleSelectDevice = (device: DeviceInfo) => {
    setSelectedDevice(device);
    setStep('instructions');
    setErrorMessage(null);
    setConnectionStatus('idle');
  };

  const handleConnect = async (connectionType: 'auto' | 'bluetooth' | 'wifi' = 'auto') => {
    if (!selectedDevice) return;
    
    setConnecting(true);
    setStep('connecting');
    setConnectionStatus('scanning');
    setConnectionProgress(0);
    setErrorMessage(null);

    try {
      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      setConnectionStatus('connecting');

      let result;
      
      if (connectionType === 'bluetooth' && onConnectBluetooth && selectedDevice.connectionType === 'bluetooth') {
        result = await onConnectBluetooth(selectedDevice);
      } else if (connectionType === 'wifi' && onConnectWifi && selectedDevice.connectionType === 'wifi') {
        result = await onConnectWifi(selectedDevice);
      } else {
        result = await onConnect(selectedDevice);
      }

      clearInterval(progressInterval);
      setConnectionProgress(100);
      setConnectionStatus('success');

      // Wait a moment to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));

      onClose();
      resetState();
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Failed to connect device');
    } finally {
      setConnecting(false);
    }
  };

  const resetState = () => {
    setStep('select');
    setSelectedDevice(null);
    setConnectionProgress(0);
    setConnectionStatus('idle');
    setErrorMessage(null);
    setSearchQuery('');
  };

  const handleBack = () => {
    if (step === 'connecting' && connectionStatus === 'error') {
      setStep('instructions');
      setConnectionStatus('idle');
      setErrorMessage(null);
    } else {
      setStep('select');
      setSelectedDevice(null);
    }
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'bluetooth': return <Bluetooth className="h-4 w-4 text-blue-500" />;
      case 'wifi': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'api': return <Signal className="h-4 w-4 text-purple-500" />;
      case 'oauth': return <Signal className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  const renderDeviceList = (devices: DeviceInfo[]) => (
    <div className="grid gap-3">
      {devices.map(device => {
        const isConnected = connectedDeviceNames.includes(device.name);
        return (
          <button
            key={device.id}
            onClick={() => !isConnected && handleSelectDevice(device)}
            disabled={isConnected}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              isConnected
                ? 'bg-muted/50 border-muted cursor-not-allowed opacity-60'
                : 'hover:border-primary/50 hover:bg-muted/30 cursor-pointer'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl ${device.color} flex items-center justify-center text-2xl shadow-md`}>
              {device.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">{device.displayName}</h4>
                {device.popular && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {isConnected && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {getConnectionIcon(device.connectionType)}
                  <span className="ml-1 capitalize">{device.connectionType}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{device.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {device.dataTypes.slice(0, 3).map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            {!isConnected && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
          </button>
        );
      })}
      {devices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No devices found matching your search
        </div>
      )}
    </div>
  );

  const renderConnectionProgress = () => (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
        connectionStatus === 'success' 
          ? 'bg-green-100 dark:bg-green-900/30' 
          : connectionStatus === 'error'
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'bg-blue-100 dark:bg-blue-900/30'
      }`}>
        {connectionStatus === 'success' ? (
          <CheckCircle className="h-12 w-12 text-green-600" />
        ) : connectionStatus === 'error' ? (
          <AlertCircle className="h-12 w-12 text-red-600" />
        ) : connectionStatus === 'scanning' ? (
          <Bluetooth className="h-12 w-12 text-blue-600 animate-pulse" />
        ) : (
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
        )}
      </div>

      <h3 className="text-xl font-semibold mb-2">
        {connectionStatus === 'success' 
          ? 'Connected!' 
          : connectionStatus === 'error'
          ? 'Connection Failed'
          : connectionStatus === 'scanning'
          ? 'Scanning for device...'
          : 'Connecting...'}
      </h3>

      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {connectionStatus === 'success' 
          ? `${selectedDevice?.displayName} is now connected and syncing data.`
          : connectionStatus === 'error'
          ? errorMessage || 'Unable to connect to the device. Please try again.'
          : connectionStatus === 'scanning'
          ? 'Looking for nearby devices. Make sure your device is in pairing mode.'
          : `Establishing connection with ${selectedDevice?.displayName}...`}
      </p>

      {connectionStatus !== 'success' && connectionStatus !== 'error' && (
        <div className="w-full max-w-xs">
          <Progress value={connectionProgress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground mt-2">
            {connectionProgress}%
          </p>
        </div>
      )}

      {connectionStatus === 'error' && (
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={() => handleConnect()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'select' 
              ? 'Connect a Device or App' 
              : step === 'connecting'
              ? `Connecting ${selectedDevice?.displayName}`
              : `Connect ${selectedDevice?.displayName}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices and apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bluetooth/WiFi Status Banner */}
            <div className="flex gap-2 mb-4">
              <Badge 
                variant={isBluetoothSupported ? "default" : "secondary"}
                className={isBluetoothSupported ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""}
              >
                <Bluetooth className="h-3 w-3 mr-1" />
                {isBluetoothSupported ? 'Bluetooth Available' : 'Bluetooth Unavailable'}
              </Badge>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Wifi className="h-3 w-3 mr-1" />
                WiFi Available
              </Badge>
            </div>

            {/* Device Tabs */}
            <Tabs defaultValue="wearable" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="wearable" className="gap-1">
                  <Watch className="h-4 w-4" />
                  <span className="hidden sm:inline">Wearables</span>
                </TabsTrigger>
                <TabsTrigger value="app" className="gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">Apps</span>
                </TabsTrigger>
                <TabsTrigger value="voice_assistant" className="gap-1">
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">Voice</span>
                </TabsTrigger>
                <TabsTrigger value="smart_home" className="gap-1">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Smart Home</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="wearable" className="m-0">
                  {renderDeviceList(devicesByType.wearable)}
                </TabsContent>
                <TabsContent value="app" className="m-0">
                  {renderDeviceList(devicesByType.app)}
                </TabsContent>
                <TabsContent value="voice_assistant" className="m-0">
                  {renderDeviceList(devicesByType.voice_assistant)}
                </TabsContent>
                <TabsContent value="smart_home" className="m-0">
                  {renderDeviceList(devicesByType.smart_home)}
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : step === 'connecting' ? (
          renderConnectionProgress()
        ) : selectedDevice && (
          <div className="flex-1 overflow-y-auto">
            {/* Device Header */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-6">
              <div className={`w-16 h-16 rounded-xl ${selectedDevice.color} flex items-center justify-center text-3xl shadow-lg`}>
                {selectedDevice.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedDevice.displayName}</h3>
                <p className="text-sm text-muted-foreground">{selectedDevice.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">
                    {getConnectionIcon(selectedDevice.connectionType)}
                    <span className="ml-1 capitalize">{selectedDevice.connectionType}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Connection Type Specific Instructions */}
            {selectedDevice.connectionType === 'bluetooth' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Bluetooth className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">Bluetooth Connection</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Make sure your {selectedDevice.displayName} is in pairing mode and within range. 
                  {!isBluetoothSupported && " Note: Your browser doesn't support Bluetooth, but we'll simulate the connection for demo purposes."}
                </p>
              </div>
            )}

            {selectedDevice.connectionType === 'wifi' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800 dark:text-green-300">WiFi Connection</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Ensure your {selectedDevice.displayName} is connected to the same WiFi network as this device.
                </p>
              </div>
            )}

            {/* Setup Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold">Setup Instructions</h4>
              
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <div>
                    <p className="font-medium">Open {selectedDevice.displayName} app</p>
                    <p className="text-sm text-muted-foreground">Make sure you're logged into your account</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <div>
                    <p className="font-medium">
                      {selectedDevice.connectionType === 'bluetooth' 
                        ? 'Enable Bluetooth pairing mode'
                        : selectedDevice.connectionType === 'wifi'
                        ? 'Check WiFi connection'
                        : 'Navigate to Connected Apps'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDevice.connectionType === 'bluetooth'
                        ? 'Usually found in device settings or by holding the button'
                        : selectedDevice.connectionType === 'wifi'
                        ? 'Ensure device is on the same network'
                        : 'Usually found in Settings or Profile section'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div>
                    <p className="font-medium">Authorize Momentum Habits</p>
                    <p className="text-sm text-muted-foreground">Grant access to the requested data types</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">4</div>
                  <div>
                    <p className="font-medium">Click Connect below</p>
                    <p className="text-sm text-muted-foreground">We'll verify the connection and start syncing</p>
                  </div>
                </div>
              </div>

              {/* Data Types */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Data that will be synced:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDevice.dataTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              
              {selectedDevice.connectionType === 'bluetooth' && isBluetoothSupported ? (
                <Button onClick={() => handleConnect('bluetooth')} disabled={connecting} className="flex-1">
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="h-4 w-4 mr-2" />
                      Connect via Bluetooth
                    </>
                  )}
                </Button>
              ) : selectedDevice.connectionType === 'wifi' ? (
                <Button onClick={() => handleConnect('wifi')} disabled={connecting} className="flex-1">
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-2" />
                      Connect via WiFi
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={() => handleConnect('auto')} disabled={connecting} className="flex-1">
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Device'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
