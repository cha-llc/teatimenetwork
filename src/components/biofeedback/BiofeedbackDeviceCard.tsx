import React from 'react';
import { BiofeedbackDevice } from '@/hooks/useBiofeedback';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Smartphone, 
  Bluetooth, 
  BluetoothConnected,
  Trash2,
  RefreshCw,
  Waves
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BiofeedbackDeviceCardProps {
  device: BiofeedbackDevice;
  onDisconnect: (id: string) => void;
  onRemove: (id: string) => void;
  onReconnect?: (id: string) => void;
}

export function BiofeedbackDeviceCard({ 
  device, 
  onDisconnect, 
  onRemove,
  onReconnect 
}: BiofeedbackDeviceCardProps) {
  const { t } = useLanguage();

  const deviceConfig = {
    muse: {
      name: 'Muse Headband',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: 'EEG meditation headband'
    },
    neurosity: {
      name: 'Neurosity Crown',
      icon: Waves,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      description: 'Focus & productivity EEG'
    },
    emotiv: {
      name: 'EMOTIV Insight',
      icon: Brain,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      description: 'Professional EEG headset'
    },
    phone_sensors: {
      name: 'Phone Sensors',
      icon: Smartphone,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      description: 'Motion & activity sensors'
    }
  };

  const config = deviceConfig[device.device_type];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 overflow-hidden transition-all hover:shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{device.device_name}</h3>
              <p className="text-sm text-gray-400">{config.description}</p>
            </div>
          </div>
          <Badge 
            variant={device.is_connected ? 'default' : 'secondary'}
            className={device.is_connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
          >
            {device.is_connected ? (
              <><BluetoothConnected className="w-3 h-3 mr-1" /> Connected</>
            ) : (
              <><Bluetooth className="w-3 h-3 mr-1" /> Disconnected</>
            )}
          </Badge>
        </div>

        {/* Device Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Last Sync</p>
            <p className="text-sm font-medium text-gray-300">
              {device.last_sync 
                ? new Date(device.last_sync).toLocaleTimeString()
                : 'Never'
              }
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-medium text-gray-300">
              {device.is_connected ? 'Active' : 'Standby'}
            </p>
          </div>
        </div>

        {/* Calibration indicator */}
        {device.calibration_data && Object.keys(device.calibration_data).length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            Calibrated
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {device.is_connected ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 hover:bg-gray-800"
              onClick={() => onDisconnect(device.id)}
            >
              <Bluetooth className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 hover:bg-gray-800"
              onClick={() => onReconnect?.(device.id)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => onRemove(device.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
