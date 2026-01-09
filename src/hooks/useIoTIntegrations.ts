import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ConnectedDevice {
  id: string;
  user_id: string;
  device_type: 'wearable' | 'app' | 'voice_assistant' | 'smart_home';
  device_name: string;
  display_name: string;
  connection_status: 'pending' | 'connected' | 'disconnected' | 'error' | 'syncing';
  device_metadata: Record<string, any>;
  last_sync_at: string | null;
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number;
  bluetooth_id?: string;
  wifi_ssid?: string;
  created_at: string;
}

export interface HabitTrigger {
  id: string;
  user_id: string;
  habit_id: string | null;
  trigger_name: string;
  trigger_type: 'activity' | 'location' | 'time' | 'device_event' | 'voice_command';
  device_id: string | null;
  trigger_conditions: {
    metric?: string;
    operator?: string;
    value?: number | string;
    location?: string;
    time?: string;
  };
  action_type: 'complete_habit' | 'remind' | 'start_timer' | 'log_progress';
  action_config: Record<string, any>;
  is_active: boolean;
  times_triggered: number;
  last_triggered_at: string | null;
}

export interface GeoFence {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  trigger_on: 'enter' | 'exit' | 'both';
  linked_habits: string[];
  is_active: boolean;
}

export interface SmartHomeAutomation {
  id: string;
  user_id: string;
  name: string;
  device_id: string;
  trigger_event: 'habit_start' | 'habit_complete' | 'focus_session' | 'reminder';
  linked_habit_id: string | null;
  automation_actions: Array<{
    device: string;
    action: string;
    value: any;
  }>;
  is_active: boolean;
  times_executed: number;
}

export interface SyncLog {
  id: string;
  device_id: string;
  device_name: string;
  sync_type: 'auto' | 'manual' | 'webhook' | 'bluetooth' | 'wifi';
  sync_status: 'success' | 'partial' | 'failed' | 'in_progress';
  records_synced: number;
  habits_updated: string[];
  error_message: string | null;
  synced_at: string;
  duration_ms?: number;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
  services: string[];
}

export interface WifiNetwork {
  ssid: string;
  signal_strength: number;
  secured: boolean;
  connected: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  displayName: string;
  type: 'wearable' | 'app' | 'voice_assistant' | 'smart_home';
  icon: string;
  color: string;
  description: string;
  dataTypes: string[];
  popular: boolean;
  connectionType: 'bluetooth' | 'wifi' | 'api' | 'oauth';
}

export const AVAILABLE_DEVICES: DeviceInfo[] = [
  // Wearables & Health Apps
  {
    id: 'apple_health',
    name: 'apple_health',
    displayName: 'Apple Health',
    type: 'wearable',
    icon: '🍎',
    color: 'bg-red-500',
    description: 'Sync steps, workouts, sleep, and mindfulness data',
    dataTypes: ['Steps', 'Workouts', 'Sleep', 'Mindfulness', 'Heart Rate'],
    popular: true,
    connectionType: 'api'
  },
  {
    id: 'fitbit',
    name: 'fitbit',
    displayName: 'Fitbit',
    type: 'wearable',
    icon: '⌚',
    color: 'bg-teal-500',
    description: 'Track activity, sleep, and heart rate automatically',
    dataTypes: ['Steps', 'Active Minutes', 'Sleep', 'Heart Rate', 'Workouts'],
    popular: true,
    connectionType: 'bluetooth'
  },
  {
    id: 'garmin',
    name: 'garmin',
    displayName: 'Garmin Connect',
    type: 'wearable',
    icon: '🏃',
    color: 'bg-blue-600',
    description: 'Sync activities, body battery, and stress data',
    dataTypes: ['Activities', 'Steps', 'Sleep', 'Stress', 'Body Battery'],
    popular: true,
    connectionType: 'bluetooth'
  },
  {
    id: 'samsung_health',
    name: 'samsung_health',
    displayName: 'Samsung Health',
    type: 'wearable',
    icon: '💙',
    color: 'bg-blue-500',
    description: 'Connect Galaxy Watch and Samsung Health data',
    dataTypes: ['Steps', 'Workouts', 'Sleep', 'Heart Rate', 'Stress'],
    popular: false,
    connectionType: 'bluetooth'
  },
  {
    id: 'whoop',
    name: 'whoop',
    displayName: 'WHOOP',
    type: 'wearable',
    icon: '💪',
    color: 'bg-black',
    description: 'Recovery, strain, and sleep performance metrics',
    dataTypes: ['Recovery', 'Strain', 'Sleep', 'HRV'],
    popular: false,
    connectionType: 'bluetooth'
  },
  {
    id: 'oura',
    name: 'oura',
    displayName: 'Oura Ring',
    type: 'wearable',
    icon: '💍',
    color: 'bg-gray-700',
    description: 'Sleep quality, readiness, and activity tracking',
    dataTypes: ['Sleep Score', 'Readiness', 'Activity', 'HRV'],
    popular: false,
    connectionType: 'bluetooth'
  },
  {
    id: 'strava',
    name: 'strava',
    displayName: 'Strava',
    type: 'app',
    icon: '🚴',
    color: 'bg-orange-500',
    description: 'Auto-log runs, rides, and other activities',
    dataTypes: ['Runs', 'Rides', 'Swims', 'Workouts'],
    popular: true,
    connectionType: 'oauth'
  },
  {
    id: 'google_fit',
    name: 'google_fit',
    displayName: 'Google Fit',
    type: 'app',
    icon: '❤️',
    color: 'bg-green-500',
    description: 'Sync heart points, steps, and activities',
    dataTypes: ['Heart Points', 'Steps', 'Activities', 'Sleep'],
    popular: false,
    connectionType: 'oauth'
  },
  // Voice Assistants
  {
    id: 'alexa',
    name: 'alexa',
    displayName: 'Amazon Alexa',
    type: 'voice_assistant',
    icon: '🔵',
    color: 'bg-cyan-500',
    description: '"Alexa, mark my meditation done"',
    dataTypes: ['Voice Commands', 'Reminders', 'Routines'],
    popular: true,
    connectionType: 'oauth'
  },
  {
    id: 'google_assistant',
    name: 'google_assistant',
    displayName: 'Google Assistant',
    type: 'voice_assistant',
    icon: '🎨',
    color: 'bg-blue-500',
    description: '"Hey Google, log my workout"',
    dataTypes: ['Voice Commands', 'Routines', 'Reminders'],
    popular: true,
    connectionType: 'oauth'
  },
  {
    id: 'siri',
    name: 'siri',
    displayName: 'Apple Siri',
    type: 'voice_assistant',
    icon: '🟣',
    color: 'bg-purple-500',
    description: '"Hey Siri, complete my reading habit"',
    dataTypes: ['Voice Commands', 'Shortcuts', 'Reminders'],
    popular: true,
    connectionType: 'api'
  },
  // Smart Home
  {
    id: 'philips_hue',
    name: 'philips_hue',
    displayName: 'Philips Hue',
    type: 'smart_home',
    icon: '💡',
    color: 'bg-yellow-500',
    description: 'Dim lights for focus, celebrate completions',
    dataTypes: ['Light Control', 'Scenes', 'Brightness'],
    popular: true,
    connectionType: 'wifi'
  },
  {
    id: 'smartthings',
    name: 'smartthings',
    displayName: 'Samsung SmartThings',
    type: 'smart_home',
    icon: '🏠',
    color: 'bg-blue-400',
    description: 'Control smart home devices based on habits',
    dataTypes: ['Devices', 'Scenes', 'Automations'],
    popular: false,
    connectionType: 'wifi'
  },
  {
    id: 'home_assistant',
    name: 'home_assistant',
    displayName: 'Home Assistant',
    type: 'smart_home',
    icon: '🔧',
    color: 'bg-cyan-600',
    description: 'Advanced home automation integration',
    dataTypes: ['All Devices', 'Automations', 'Scripts'],
    popular: false,
    connectionType: 'wifi'
  },
  {
    id: 'lifx',
    name: 'lifx',
    displayName: 'LIFX',
    type: 'smart_home',
    icon: '🌈',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Smart lighting for habit triggers',
    dataTypes: ['Light Control', 'Colors', 'Effects'],
    popular: false,
    connectionType: 'wifi'
  }
];

export function useIoTIntegrations() {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [habitTriggers, setHabitTriggers] = useState<HabitTrigger[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [automations, setAutomations] = useState<SmartHomeAutomation[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredBluetoothDevices, setDiscoveredBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [syncInProgress, setSyncInProgress] = useState<string | null>(null);
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bluetoothDeviceRef = useRef<any>(null);

  // Check if Web Bluetooth is supported
  const isBluetoothSupported = useCallback(() => {
    return 'bluetooth' in navigator;
  }, []);

  // Check if Geolocation is supported
  const isGeolocationSupported = useCallback(() => {
    return 'geolocation' in navigator;
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Changes will sync when reconnected.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from localStorage for demo
  useEffect(() => {
    const savedDevices = localStorage.getItem('momentum_connected_devices');
    const savedTriggers = localStorage.getItem('momentum_habit_triggers');
    const savedGeoFences = localStorage.getItem('momentum_geo_fences');
    const savedAutomations = localStorage.getItem('momentum_automations');
    const savedOfflineQueue = localStorage.getItem('momentum_offline_queue');
    const savedSyncLogs = localStorage.getItem('momentum_sync_logs');

    if (savedDevices) setConnectedDevices(JSON.parse(savedDevices));
    if (savedTriggers) setHabitTriggers(JSON.parse(savedTriggers));
    if (savedGeoFences) setGeoFences(JSON.parse(savedGeoFences));
    if (savedAutomations) setAutomations(JSON.parse(savedAutomations));
    if (savedOfflineQueue) setOfflineQueue(JSON.parse(savedOfflineQueue));
    if (savedSyncLogs) setSyncLogs(JSON.parse(savedSyncLogs));

    // Add demo data if empty
    if (!savedDevices) {
      const demoDevices: ConnectedDevice[] = [
        {
          id: 'demo-1',
          user_id: 'demo',
          device_type: 'wearable',
          device_name: 'apple_health',
          display_name: 'Apple Health',
          connection_status: 'connected',
          device_metadata: { last_steps: 8432, last_workout: 'Running', battery: 85 },
          last_sync_at: new Date(Date.now() - 1800000).toISOString(),
          auto_sync_enabled: true,
          sync_frequency_minutes: 30,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user_id: 'demo',
          device_type: 'voice_assistant',
          device_name: 'alexa',
          display_name: 'Amazon Alexa',
          connection_status: 'connected',
          device_metadata: { skills_enabled: ['habit-tracker'], last_command: 'Complete meditation' },
          last_sync_at: new Date().toISOString(),
          auto_sync_enabled: true,
          sync_frequency_minutes: 0,
          created_at: new Date().toISOString()
        }
      ];
      setConnectedDevices(demoDevices);
      localStorage.setItem('momentum_connected_devices', JSON.stringify(demoDevices));
    }

    if (!savedTriggers) {
      const demoTriggers: HabitTrigger[] = [
        {
          id: 'trigger-1',
          user_id: 'demo',
          habit_id: 'habit-1',
          trigger_name: 'Auto-complete Walk',
          trigger_type: 'activity',
          device_id: 'demo-1',
          trigger_conditions: { metric: 'steps', operator: '>=', value: 5000 },
          action_type: 'complete_habit',
          action_config: {},
          is_active: true,
          times_triggered: 12,
          last_triggered_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'trigger-2',
          user_id: 'demo',
          habit_id: 'habit-2',
          trigger_name: 'Gym Check-in',
          trigger_type: 'location',
          device_id: null,
          trigger_conditions: { location: 'gym' },
          action_type: 'start_timer',
          action_config: { duration: 60 },
          is_active: true,
          times_triggered: 8,
          last_triggered_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setHabitTriggers(demoTriggers);
      localStorage.setItem('momentum_habit_triggers', JSON.stringify(demoTriggers));
    }

    // Add initial sync logs
    if (!savedSyncLogs) {
      const initialLogs: SyncLog[] = [
        {
          id: 'log-1',
          device_id: 'demo-1',
          device_name: 'Apple Health',
          sync_type: 'auto',
          sync_status: 'success',
          records_synced: 24,
          habits_updated: ['Walking', 'Exercise'],
          error_message: null,
          synced_at: new Date(Date.now() - 1800000).toISOString(),
          duration_ms: 1250
        },
        {
          id: 'log-2',
          device_id: 'demo-2',
          device_name: 'Amazon Alexa',
          sync_type: 'manual',
          sync_status: 'success',
          records_synced: 5,
          habits_updated: ['Meditation'],
          error_message: null,
          synced_at: new Date(Date.now() - 3600000).toISOString(),
          duration_ms: 850
        }
      ];
      setSyncLogs(initialLogs);
      localStorage.setItem('momentum_sync_logs', JSON.stringify(initialLogs));
    }

    setLoading(false);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('momentum_connected_devices', JSON.stringify(connectedDevices));
    }
  }, [connectedDevices, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('momentum_habit_triggers', JSON.stringify(habitTriggers));
    }
  }, [habitTriggers, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('momentum_geo_fences', JSON.stringify(geoFences));
    }
  }, [geoFences, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('momentum_automations', JSON.stringify(automations));
    }
  }, [automations, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('momentum_sync_logs', JSON.stringify(syncLogs));
    }
  }, [syncLogs, loading]);

  // Auto-sync interval for connected devices
  useEffect(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      if (isOnline) {
        connectedDevices
          .filter(d => d.auto_sync_enabled && d.connection_status === 'connected' && d.sync_frequency_minutes > 0)
          .forEach(device => {
            const lastSync = device.last_sync_at ? new Date(device.last_sync_at).getTime() : 0;
            const now = Date.now();
            const syncIntervalMs = device.sync_frequency_minutes * 60 * 1000;
            
            if (now - lastSync >= syncIntervalMs) {
              syncDevice(device.id, 'auto');
            }
          });
      }
    }, 60000); // Check every minute

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [connectedDevices, isOnline]);

  // Scan for Bluetooth devices
  const scanBluetoothDevices = useCallback(async () => {
    if (!isBluetoothSupported()) {
      toast.error('Bluetooth is not supported on this device/browser');
      return [];
    }

    setIsScanning(true);
    setDiscoveredBluetoothDevices([]);

    try {
      // Request Bluetooth device - this opens the browser's device picker
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'heart_rate', 'device_information']
      });

      if (device) {
        const discoveredDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          rssi: -50, // Simulated signal strength
          connected: false,
          services: []
        };

        setDiscoveredBluetoothDevices([discoveredDevice]);
        bluetoothDeviceRef.current = device;
        
        toast.success(`Found device: ${device.name || 'Unknown Device'}`);
        return [discoveredDevice];
      }
    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        console.error('Bluetooth scan error:', error);
        toast.error('Failed to scan for Bluetooth devices');
      }
    } finally {
      setIsScanning(false);
    }

    return [];
  }, [isBluetoothSupported]);

  // Connect via Bluetooth
  const connectViaBluetooth = useCallback(async (deviceInfo: DeviceInfo) => {
    if (!isBluetoothSupported()) {
      // Fallback to simulated connection
      toast.info('Bluetooth not available. Using simulated connection.');
      return connectDevice(deviceInfo);
    }

    setIsScanning(true);

    try {
      const serviceUUIDs: Record<string, string> = {
        fitbit: '0000180d-0000-1000-8000-00805f9b34fb',
        garmin: '0000180d-0000-1000-8000-00805f9b34fb',
        samsung_health: '0000180d-0000-1000-8000-00805f9b34fb',
        whoop: '0000180d-0000-1000-8000-00805f9b34fb',
        oura: '0000180d-0000-1000-8000-00805f9b34fb'
      };

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [serviceUUIDs[deviceInfo.name] || 'heart_rate'] },
          { namePrefix: deviceInfo.displayName.split(' ')[0] }
        ],
        optionalServices: ['battery_service', 'device_information']
      });

      if (device) {
        // Connect to GATT server
        const server = await device.gatt?.connect();
        
        const newDevice: ConnectedDevice = {
          id: `device-${Date.now()}`,
          user_id: 'demo',
          device_type: deviceInfo.type,
          device_name: deviceInfo.name,
          display_name: device.name || deviceInfo.displayName,
          connection_status: 'connected',
          device_metadata: {
            bluetooth_name: device.name,
            bluetooth_id: device.id,
            gatt_connected: server?.connected || false
          },
          last_sync_at: new Date().toISOString(),
          auto_sync_enabled: true,
          sync_frequency_minutes: 30,
          bluetooth_id: device.id,
          created_at: new Date().toISOString()
        };

        setConnectedDevices(prev => [...prev, newDevice]);
        bluetoothDeviceRef.current = device;

        // Add sync log
        addSyncLog(newDevice.id, deviceInfo.displayName, 'bluetooth', 'success', 0);

        toast.success(`${device.name || deviceInfo.displayName} connected via Bluetooth!`);
        return newDevice;
      }
    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        console.error('Bluetooth connection error:', error);
        toast.error('Failed to connect via Bluetooth. Using simulated connection.');
      }
      // Fallback to simulated connection
      return connectDevice(deviceInfo);
    } finally {
      setIsScanning(false);
    }

    return null;
  }, [isBluetoothSupported]);

  // Connect via WiFi (simulated for smart home devices)
  const connectViaWifi = useCallback(async (deviceInfo: DeviceInfo, ssid?: string) => {
    const newDevice: ConnectedDevice = {
      id: `device-${Date.now()}`,
      user_id: 'demo',
      device_type: deviceInfo.type,
      device_name: deviceInfo.name,
      display_name: deviceInfo.displayName,
      connection_status: 'pending',
      device_metadata: { wifi_connected: true },
      last_sync_at: null,
      auto_sync_enabled: true,
      sync_frequency_minutes: 5,
      wifi_ssid: ssid || 'Home Network',
      created_at: new Date().toISOString()
    };

    setConnectedDevices(prev => [...prev, newDevice]);

    // Simulate WiFi connection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setConnectedDevices(prev =>
      prev.map(d =>
        d.id === newDevice.id
          ? { ...d, connection_status: 'connected', last_sync_at: new Date().toISOString() }
          : d
      )
    );

    addSyncLog(newDevice.id, deviceInfo.displayName, 'wifi', 'success', 0);
    toast.success(`${deviceInfo.displayName} connected via WiFi!`);

    return newDevice;
  }, []);

  // Connect a new device (generic)
  const connectDevice = useCallback(async (deviceInfo: DeviceInfo) => {
    const newDevice: ConnectedDevice = {
      id: `device-${Date.now()}`,
      user_id: 'demo',
      device_type: deviceInfo.type,
      device_name: deviceInfo.name,
      display_name: deviceInfo.displayName,
      connection_status: 'pending',
      device_metadata: {},
      last_sync_at: null,
      auto_sync_enabled: true,
      sync_frequency_minutes: 30,
      created_at: new Date().toISOString()
    };

    setConnectedDevices(prev => [...prev, newDevice]);

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setConnectedDevices(prev =>
      prev.map(d =>
        d.id === newDevice.id
          ? { ...d, connection_status: 'connected', last_sync_at: new Date().toISOString() }
          : d
      )
    );

    addSyncLog(newDevice.id, deviceInfo.displayName, 'manual', 'success', 0);
    toast.success(`${deviceInfo.displayName} connected!`);

    return newDevice;
  }, []);

  // Disconnect a device
  const disconnectDevice = useCallback((deviceId: string) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    
    // Disconnect Bluetooth if applicable
    if (bluetoothDeviceRef.current && device?.bluetooth_id === bluetoothDeviceRef.current.id) {
      bluetoothDeviceRef.current.gatt?.disconnect();
      bluetoothDeviceRef.current = null;
    }

    setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
    // Also remove related triggers
    setHabitTriggers(prev => prev.filter(t => t.device_id !== deviceId));
    setAutomations(prev => prev.filter(a => a.device_id !== deviceId));

    toast.success('Device disconnected');
  }, [connectedDevices]);

  // Add sync log helper
  const addSyncLog = useCallback((deviceId: string, deviceName: string, syncType: SyncLog['sync_type'], status: SyncLog['sync_status'], recordsSynced: number, errorMessage?: string) => {
    const syncLog: SyncLog = {
      id: `sync-${Date.now()}`,
      device_id: deviceId,
      device_name: deviceName,
      sync_type: syncType,
      sync_status: status,
      records_synced: recordsSynced,
      habits_updated: [],
      error_message: errorMessage || null,
      synced_at: new Date().toISOString(),
      duration_ms: Math.floor(Math.random() * 2000) + 500
    };

    setSyncLogs(prev => [syncLog, ...prev].slice(0, 100));
    return syncLog;
  }, []);

  // Sync device data
  const syncDevice = useCallback(async (deviceId: string, syncType: 'manual' | 'auto' = 'manual') => {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (!device) return null;

    setSyncInProgress(deviceId);

    // Update device status to syncing
    setConnectedDevices(prev =>
      prev.map(d =>
        d.id === deviceId ? { ...d, connection_status: 'syncing' as const } : d
      )
    );

    // Simulate sync with realistic timing
    const syncDuration = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, syncDuration));

    // Simulate data sync results
    const recordsSynced = Math.floor(Math.random() * 50) + 10;
    const habitsUpdated = ['Walking', 'Exercise', 'Sleep'].slice(0, Math.floor(Math.random() * 3) + 1);

    // Update device metadata with simulated data
    const updatedMetadata = {
      ...device.device_metadata,
      last_steps: Math.floor(Math.random() * 5000) + 3000,
      last_heart_rate: Math.floor(Math.random() * 40) + 60,
      battery: Math.floor(Math.random() * 30) + 70,
      last_activity: new Date().toISOString()
    };

    setConnectedDevices(prev =>
      prev.map(d =>
        d.id === deviceId
          ? { 
              ...d, 
              connection_status: 'connected' as const, 
              last_sync_at: new Date().toISOString(),
              device_metadata: updatedMetadata
            }
          : d
      )
    );

    const syncLog = addSyncLog(deviceId, device.display_name, syncType, 'success', recordsSynced);
    syncLog.habits_updated = habitsUpdated;
    syncLog.duration_ms = syncDuration;

    setSyncInProgress(null);
    setLastGlobalSync(new Date());

    if (syncType === 'manual') {
      toast.success(`Synced ${recordsSynced} records from ${device.display_name}`);
    }

    return syncLog;
  }, [connectedDevices, addSyncLog]);

  // Sync all devices
  const syncAllDevices = useCallback(async () => {
    const connectedDevicesList = connectedDevices.filter(d => d.connection_status === 'connected');
    
    if (connectedDevicesList.length === 0) {
      toast.info('No connected devices to sync');
      return;
    }

    toast.info(`Syncing ${connectedDevicesList.length} devices...`);

    for (const device of connectedDevicesList) {
      await syncDevice(device.id, 'manual');
    }

    toast.success('All devices synced successfully!');
  }, [connectedDevices, syncDevice]);

  // Create habit trigger
  const createTrigger = useCallback((trigger: Omit<HabitTrigger, 'id' | 'user_id' | 'times_triggered' | 'last_triggered_at'>) => {
    const newTrigger: HabitTrigger = {
      ...trigger,
      id: `trigger-${Date.now()}`,
      user_id: 'demo',
      times_triggered: 0,
      last_triggered_at: null
    };

    setHabitTriggers(prev => [...prev, newTrigger]);
    toast.success('Trigger created!');
    return newTrigger;
  }, []);

  // Update trigger
  const updateTrigger = useCallback((triggerId: string, updates: Partial<HabitTrigger>) => {
    setHabitTriggers(prev =>
      prev.map(t => (t.id === triggerId ? { ...t, ...updates } : t))
    );
    toast.success('Trigger updated');
  }, []);

  // Delete trigger
  const deleteTrigger = useCallback((triggerId: string) => {
    setHabitTriggers(prev => prev.filter(t => t.id !== triggerId));
    toast.success('Trigger deleted');
  }, []);

  // Create geo-fence
  const createGeoFence = useCallback((fence: Omit<GeoFence, 'id' | 'user_id'>) => {
    const newFence: GeoFence = {
      ...fence,
      id: `fence-${Date.now()}`,
      user_id: 'demo'
    };

    setGeoFences(prev => [...prev, newFence]);
    toast.success('Location trigger created!');
    return newFence;
  }, []);

  // Update geo-fence
  const updateGeoFence = useCallback((fenceId: string, updates: Partial<GeoFence>) => {
    setGeoFences(prev =>
      prev.map(f => (f.id === fenceId ? { ...f, ...updates } : f))
    );
  }, []);

  // Delete geo-fence
  const deleteGeoFence = useCallback((fenceId: string) => {
    setGeoFences(prev => prev.filter(f => f.id !== fenceId));
    toast.success('Location trigger deleted');
  }, []);

  // Create automation
  const createAutomation = useCallback((automation: Omit<SmartHomeAutomation, 'id' | 'user_id' | 'times_executed'>) => {
    const newAutomation: SmartHomeAutomation = {
      ...automation,
      id: `automation-${Date.now()}`,
      user_id: 'demo',
      times_executed: 0
    };

    setAutomations(prev => [...prev, newAutomation]);
    toast.success('Automation created!');
    return newAutomation;
  }, []);

  // Delete automation
  const deleteAutomation = useCallback((automationId: string) => {
    setAutomations(prev => prev.filter(a => a.id !== automationId));
    toast.success('Automation deleted');
  }, []);

  // Get setup instructions
  const getSetupInstructions = useCallback(async (deviceName: string, deviceType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('device-integrations', {
        body: {
          action: 'generate-setup-instructions',
          deviceName,
          deviceType
        }
      });

      if (error) throw error;
      return data.instructions;
    } catch (error) {
      console.error('Error getting setup instructions:', error);
      return null;
    }
  }, []);

  // Parse voice command
  const parseVoiceCommand = useCallback(async (command: string, habits: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('device-integrations', {
        body: {
          action: 'parse-voice-command',
          command,
          availableHabits: habits
        }
      });

      if (error) throw error;
      return data.parsed;
    } catch (error) {
      console.error('Error parsing voice command:', error);
      return null;
    }
  }, []);

  // Add to offline queue
  const addToOfflineQueue = useCallback((action: any) => {
    const queueItem = {
      ...action,
      id: `offline-${Date.now()}`,
      created_offline_at: new Date().toISOString()
    };

    setOfflineQueue(prev => {
      const updated = [...prev, queueItem];
      localStorage.setItem('momentum_offline_queue', JSON.stringify(updated));
      return updated;
    });

    toast.info('Action queued for sync when online');
  }, []);

  // Sync offline queue
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    toast.info(`Syncing ${offlineQueue.length} offline actions...`);

    // Process queue items
    for (const item of offlineQueue) {
      // In real app, would sync to server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setOfflineQueue([]);
    localStorage.removeItem('momentum_offline_queue');
    toast.success('Offline actions synced successfully!');
  }, [offlineQueue]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline, offlineQueue.length, syncOfflineQueue]);

  // Get current location for geo-fencing
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationSupported()) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  }, [isGeolocationSupported]);

  // Toggle device auto-sync
  const toggleAutoSync = useCallback((deviceId: string, enabled: boolean) => {
    setConnectedDevices(prev =>
      prev.map(d =>
        d.id === deviceId ? { ...d, auto_sync_enabled: enabled } : d
      )
    );
    toast.success(enabled ? 'Auto-sync enabled' : 'Auto-sync disabled');
  }, []);

  // Update sync frequency
  const updateSyncFrequency = useCallback((deviceId: string, minutes: number) => {
    setConnectedDevices(prev =>
      prev.map(d =>
        d.id === deviceId ? { ...d, sync_frequency_minutes: minutes } : d
      )
    );
    toast.success(`Sync frequency updated to ${minutes} minutes`);
  }, []);

  return {
    // State
    connectedDevices,
    habitTriggers,
    geoFences,
    automations,
    syncLogs,
    isOnline,
    offlineQueue,
    loading,
    isScanning,
    discoveredBluetoothDevices,
    wifiNetworks,
    syncInProgress,
    lastGlobalSync,
    availableDevices: AVAILABLE_DEVICES,

    // Capability checks
    isBluetoothSupported,
    isGeolocationSupported,

    // Device actions
    connectDevice,
    connectViaBluetooth,
    connectViaWifi,
    disconnectDevice,
    scanBluetoothDevices,

    // Sync actions
    syncDevice,
    syncAllDevices,
    toggleAutoSync,
    updateSyncFrequency,

    // Trigger actions
    createTrigger,
    updateTrigger,
    deleteTrigger,

    // Geo-fence actions
    createGeoFence,
    updateGeoFence,
    deleteGeoFence,
    getCurrentLocation,

    // Automation actions
    createAutomation,
    deleteAutomation,

    // Utility actions
    getSetupInstructions,
    parseVoiceCommand,
    addToOfflineQueue,
    syncOfflineQueue
  };
}
