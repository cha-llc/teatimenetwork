import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, Trash2, Settings, CheckCircle, AlertCircle, Clock, 
  Wifi, WifiOff, Bluetooth, BluetoothConnected, Battery, Signal
} from 'lucide-react';
import { ConnectedDevice, AVAILABLE_DEVICES } from '@/hooks/useIoTIntegrations';

interface DeviceCardProps {
  device: ConnectedDevice;
  onSync: (deviceId: string) => void;
  onDisconnect: (deviceId: string) => void;
  onConfigure?: (device: ConnectedDevice) => void;
}

export function DeviceCard({ device, onSync, onDisconnect, onConfigure }: DeviceCardProps) {
  const deviceInfo = AVAILABLE_DEVICES.find(d => d.name === device.device_name);
  
  const getStatusIcon = () => {
    switch (device.connection_status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (device.connection_status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Syncing...</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Connecting...</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const formatLastSync = () => {
    if (!device.last_sync_at) return 'Never synced';
    const diff = Date.now() - new Date(device.last_sync_at).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(device.last_sync_at).toLocaleDateString();
  };

  const getConnectionTypeIcon = () => {
    if (device.bluetooth_id) {
      return device.connection_status === 'connected' 
        ? <BluetoothConnected className="h-3.5 w-3.5 text-blue-500" />
        : <Bluetooth className="h-3.5 w-3.5 text-blue-400" />;
    }
    if (device.wifi_ssid) {
      return device.connection_status === 'connected'
        ? <Wifi className="h-3.5 w-3.5 text-green-500" />
        : <WifiOff className="h-3.5 w-3.5 text-gray-400" />;
    }
    return <Signal className="h-3.5 w-3.5 text-purple-500" />;
  };

  const getBatteryLevel = () => {
    const battery = device.device_metadata?.battery;
    if (typeof battery !== 'number') return null;
    return battery;
  };

  const batteryLevel = getBatteryLevel();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${deviceInfo?.color || 'bg-gray-500'} flex items-center justify-center text-2xl shadow-md`}>
              {deviceInfo?.icon || '📱'}
            </div>
            <div>
              <h3 className="font-semibold">{device.display_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
              </div>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {/* Device Metadata */}
        {device.device_metadata && Object.keys(device.device_metadata).length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {device.device_metadata.last_steps && (
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Steps</p>
                <p className="text-sm font-semibold">{device.device_metadata.last_steps.toLocaleString()}</p>
              </div>
            )}
            {device.device_metadata.last_heart_rate && (
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="text-sm font-semibold">{device.device_metadata.last_heart_rate} bpm</p>
              </div>
            )}
            {device.device_metadata.last_workout && (
              <div className="bg-muted/50 rounded-lg p-2 text-center col-span-2">
                <p className="text-xs text-muted-foreground">Last Activity</p>
                <p className="text-sm font-semibold">{device.device_metadata.last_workout}</p>
              </div>
            )}
          </div>
        )}

        {/* Sync Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Last sync: {formatLastSync()}</span>
          </div>
          <div className="flex items-center gap-2">
            {batteryLevel !== null && (
              <div className="flex items-center gap-1">
                <Battery className={`h-3.5 w-3.5 ${batteryLevel > 20 ? 'text-green-500' : 'text-red-500'}`} />
                <span>{batteryLevel}%</span>
              </div>
            )}
            {device.auto_sync_enabled && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                {getConnectionTypeIcon()}
                <span>Auto-sync</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Type Badge */}
        <div className="flex items-center gap-2 mb-4">
          {device.bluetooth_id && (
            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
              <Bluetooth className="h-3 w-3 mr-1" />
              Bluetooth
            </Badge>
          )}
          {device.wifi_ssid && (
            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
              <Wifi className="h-3 w-3 mr-1" />
              {device.wifi_ssid}
            </Badge>
          )}
          {!device.bluetooth_id && !device.wifi_ssid && (
            <Badge variant="outline" className="text-xs">
              <Signal className="h-3 w-3 mr-1" />
              API
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onSync(device.id)}
            disabled={device.connection_status === 'syncing' || device.connection_status === 'pending'}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${device.connection_status === 'syncing' ? 'animate-spin' : ''}`} />
            {device.connection_status === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Button>
          {onConfigure && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigure(device)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(device.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
