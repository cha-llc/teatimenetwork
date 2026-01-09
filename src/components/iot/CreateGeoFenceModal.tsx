import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Loader2, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGeoFenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (fence: {
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    trigger_on: 'enter' | 'exit' | 'both';
    linked_habits: string[];
    is_active: boolean;
  }) => void;
}

export function CreateGeoFenceModal({ isOpen, onClose, onCreate }: CreateGeoFenceModalProps) {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(100);
  const [triggerOn, setTriggerOn] = useState<'enter' | 'exit' | 'both'>('enter');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  const isGeolocationSupported = 'geolocation' in navigator;

  const handleGetCurrentLocation = () => {
    if (!isGeolocationSupported) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setLocationStatus('idle');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationAccuracy(Math.round(position.coords.accuracy));
        setLocationStatus('success');
        setGettingLocation(false);
        toast.success('Location detected successfully!');
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationStatus('error');
        setGettingLocation(false);
        
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !latitude || !longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Invalid coordinates. Please check latitude and longitude values.');
      return;
    }

    onCreate({
      name,
      latitude: lat,
      longitude: lng,
      radius_meters: radius,
      trigger_on: triggerOn,
      linked_habits: [],
      is_active: true
    });

    // Reset form
    setName('');
    setLatitude('');
    setLongitude('');
    setRadius(100);
    setTriggerOn('enter');
    setLocationStatus('idle');
    setLocationAccuracy(null);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setLatitude('');
    setLongitude('');
    setRadius(100);
    setTriggerOn('enter');
    setLocationStatus('idle');
    setLocationAccuracy(null);
    onClose();
  };

  const presetLocations = [
    { name: 'Home', icon: '🏠' },
    { name: 'Work', icon: '🏢' },
    { name: 'Gym', icon: '🏋️' },
    { name: 'Park', icon: '🌳' },
    { name: 'Library', icon: '📚' },
    { name: 'Coffee Shop', icon: '☕' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Create Location Trigger
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Geolocation Status Banner */}
          {!isGeolocationSupported && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Location services unavailable</span>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                Enter coordinates manually or try a different browser.
              </p>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {presetLocations.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setName(preset.name)}
                  className={name === preset.name ? 'border-primary bg-primary/10' : ''}
                >
                  <span className="mr-1">{preset.icon}</span>
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Location Name */}
          <div>
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Gym"
              required
            />
          </div>

          {/* Get Current Location */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className={`w-full ${locationStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation || !isGeolocationSupported}
            >
              {gettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting Location...
                </>
              ) : locationStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Location Detected
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </>
              )}
            </Button>
            
            {locationStatus === 'success' && locationAccuracy && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Wifi className="h-3 w-3" />
                <span>Accuracy: ±{locationAccuracy}m</span>
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="40.7128"
                required
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-74.0060"
                required
              />
            </div>
          </div>

          {/* Map Preview */}
          {latitude && longitude && (
            <div className="relative h-24 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-3 border-blue-500 bg-blue-500/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div 
                    className="absolute rounded-full border-2 border-dashed border-blue-400 animate-pulse"
                    style={{
                      width: `${Math.min(80, radius / 5)}px`,
                      height: `${Math.min(80, radius / 5)}px`,
                      top: `${-(Math.min(80, radius / 5) - 40) / 2}px`,
                      left: `${-(Math.min(80, radius / 5) - 40) / 2}px`
                    }}
                  />
                </div>
              </div>
              <div className="absolute bottom-1 left-1 right-1 flex justify-between text-xs text-muted-foreground bg-white/80 dark:bg-black/50 px-2 py-1 rounded">
                <span>{parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}</span>
                <Badge variant="secondary" className="text-xs py-0">
                  {radius}m
                </Badge>
              </div>
            </div>
          )}

          {/* Radius */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>Trigger Radius</Label>
              <span className="text-sm font-medium text-primary">{radius} meters</span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
              min={50}
              max={500}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50m (precise)</span>
              <span>500m (wide area)</span>
            </div>
          </div>

          {/* Trigger Type */}
          <div>
            <Label htmlFor="triggerOn">Trigger When</Label>
            <Select value={triggerOn} onValueChange={(v) => setTriggerOn(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enter">
                  <div className="flex items-center gap-2">
                    <span>📍</span> Arriving at location
                  </div>
                </SelectItem>
                <SelectItem value="exit">
                  <div className="flex items-center gap-2">
                    <span>🚶</span> Leaving location
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <span>🔄</span> Both arriving and leaving
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!name || !latitude || !longitude}>
              <MapPin className="h-4 w-4 mr-2" />
              Create Location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
