import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BrainState {
  alpha: number;
  beta: number;
  gamma: number;
  theta: number;
  delta: number;
  focus: number;
  calm: number;
  timestamp: number;
}

export interface BiofeedbackDevice {
  id: string;
  user_id: string;
  device_type: 'muse' | 'neurosity' | 'emotiv' | 'phone_sensors';
  device_name: string;
  device_id?: string;
  is_connected: boolean;
  last_sync?: string;
  calibration_data: Record<string, any>;
  connection_method?: 'bluetooth' | 'wifi' | 'simulated';
  battery_level?: number;
  signal_quality?: number;
  created_at: string;
}

export interface NeuroSession {
  id: string;
  user_id: string;
  habit_id?: string;
  device_id?: string;
  started_at: string;
  ended_at?: string;
  brain_states: BrainState[];
  mood_readings: MoodReading[];
  ai_interventions: AIIntervention[];
  completion_boost?: number;
  notes?: string;
}

export interface MoodReading {
  timestamp: number;
  mood: number;
  energy: number;
  stress: number;
}

export interface AIIntervention {
  timestamp: number;
  type: string;
  message: string;
  accepted: boolean;
}

export interface NeuroTeaBlend {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  blend_type: 'focus' | 'calm' | 'energy' | 'sleep' | 'custom';
  tea_flavor: 'green_tea' | 'chamomile' | 'matcha' | 'oolong' | 'earl_grey';
  binaural_frequency: number;
  base_frequency: number;
  ambient_sounds: string[];
  duration_minutes: number;
  is_public: boolean;
  play_count: number;
  effectiveness_score?: number;
  created_at: string;
}

export interface BlendPlayback {
  id: string;
  blend_id: string;
  session_id?: string;
  started_at: string;
  ended_at?: string;
  completion_percentage?: number;
  user_rating?: number;
  feedback?: string;
  brain_state_before?: BrainState;
  brain_state_after?: BrainState;
}

export function useBiofeedback() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<BiofeedbackDevice[]>([]);
  const [blends, setBlends] = useState<NeuroTeaBlend[]>([]);
  const [activeSession, setActiveSession] = useState<NeuroSession | null>(null);
  const [currentBrainState, setCurrentBrainState] = useState<BrainState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBlend, setActiveBlend] = useState<NeuroTeaBlend | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  
  const bluetoothDeviceRef = useRef<BluetoothDevice | null>(null);
  const bluetoothServerRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ left: OscillatorNode; right: OscillatorNode } | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const brainStateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch devices and blends
  const fetchData = useCallback(async () => {
    if (!user) {
      // Demo mode - load from localStorage
      setIsDemo(true);
      const savedDevices = localStorage.getItem('momentum_biofeedback_devices');
      const savedBlends = localStorage.getItem('momentum_neuro_blends');
      
      if (savedDevices) setDevices(JSON.parse(savedDevices));
      if (savedBlends) setBlends(JSON.parse(savedBlends));
      
      // Add demo blends if empty
      if (!savedBlends) {
        const demoBlends: NeuroTeaBlend[] = [
          {
            id: 'demo-blend-1',
            user_id: 'demo',
            name: 'Deep Focus',
            description: 'Enhance concentration with alpha wave stimulation',
            blend_type: 'focus',
            tea_flavor: 'matcha',
            binaural_frequency: 10,
            base_frequency: 200,
            ambient_sounds: ['rain', 'white_noise'],
            duration_minutes: 25,
            is_public: true,
            play_count: 156,
            effectiveness_score: 4.5,
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-blend-2',
            user_id: 'demo',
            name: 'Calm Evening',
            description: 'Wind down with theta wave relaxation',
            blend_type: 'calm',
            tea_flavor: 'chamomile',
            binaural_frequency: 6,
            base_frequency: 180,
            ambient_sounds: ['ocean', 'birds'],
            duration_minutes: 15,
            is_public: true,
            play_count: 89,
            effectiveness_score: 4.8,
            created_at: new Date().toISOString()
          }
        ];
        setBlends(demoBlends);
        localStorage.setItem('momentum_neuro_blends', JSON.stringify(demoBlends));
      }
      
      setIsLoading(false);
      return;
    }

    setIsDemo(false);
    setIsLoading(true);

    try {
      const [devicesRes, blendsRes] = await Promise.all([
        supabase.from('biofeedback_devices').select('*').eq('user_id', user.id),
        supabase.from('neuro_tea_blends').select('*').or(`user_id.eq.${user.id},is_public.eq.true`)
      ]);

      if (devicesRes.data) setDevices(devicesRes.data);
      if (blendsRes.data) setBlends(blendsRes.data);
    } catch (error) {
      console.error('Error fetching biofeedback data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    
    return () => {
      // Cleanup on unmount
      if (brainStateIntervalRef.current) {
        clearInterval(brainStateIntervalRef.current);
      }
    };
  }, [fetchData]);

  // Save devices to localStorage in demo mode
  useEffect(() => {
    if (isDemo && devices.length > 0) {
      localStorage.setItem('momentum_biofeedback_devices', JSON.stringify(devices));
    }
  }, [devices, isDemo]);

  // Check if Web Bluetooth is supported
  const isBluetoothSupported = useCallback(() => {
    return 'bluetooth' in navigator;
  }, []);

  // Connect to EEG device via Web Bluetooth
  const connectDevice = useCallback(async (deviceType: BiofeedbackDevice['device_type']) => {
    setIsConnecting(true);

    try {
      if (deviceType === 'phone_sensors') {
        // Use phone sensors (accelerometer, etc.) as proxy for activity
        const device: BiofeedbackDevice = {
          id: `phone-${Date.now()}`,
          user_id: user?.id || 'demo',
          device_type: 'phone_sensors',
          device_name: 'Phone Sensors',
          is_connected: true,
          calibration_data: {},
          connection_method: 'simulated',
          battery_level: 100,
          signal_quality: 95,
          created_at: new Date().toISOString()
        };

        if (user && !isDemo) {
          const { data, error } = await supabase
            .from('biofeedback_devices')
            .insert(device)
            .select()
            .single();

          if (error) throw error;
          setDevices(prev => [...prev, data]);
          toast.success('Phone sensors connected!');
          return data;
        } else {
          setDevices(prev => [...prev, device]);
          toast.success('Phone sensors connected! (Demo mode)');
          return device;
        }
      }

      // Web Bluetooth for EEG devices
      if (!isBluetoothSupported()) {
        // Fallback to simulated connection for demo
        toast.info('Bluetooth not available. Using simulated connection for demo.');
        
        const simulatedDevice: BiofeedbackDevice = {
          id: `simulated-${Date.now()}`,
          user_id: user?.id || 'demo',
          device_type: deviceType,
          device_name: `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} (Simulated)`,
          device_id: `sim-${Math.random().toString(36).substr(2, 9)}`,
          is_connected: true,
          calibration_data: {},
          connection_method: 'simulated',
          battery_level: Math.floor(Math.random() * 30) + 70,
          signal_quality: Math.floor(Math.random() * 20) + 80,
          created_at: new Date().toISOString()
        };

        setDevices(prev => [...prev, simulatedDevice]);
        toast.success(`${simulatedDevice.device_name} connected!`);
        
        // Start simulating brain states
        startBrainStateSimulation();
        
        return simulatedDevice;
      }

      const serviceUUIDs: Record<string, string> = {
        muse: '0000fe8d-0000-1000-8000-00805f9b34fb',
        neurosity: '0000180d-0000-1000-8000-00805f9b34fb',
        emotiv: '0000180f-0000-1000-8000-00805f9b34fb'
      };

      toast.info('Scanning for Bluetooth devices...');

      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUUIDs[deviceType] || 'battery_service'] }],
        optionalServices: ['battery_service', 'device_information']
      });

      toast.info(`Connecting to ${bluetoothDevice.name || 'device'}...`);

      // Connect to GATT server
      const server = await bluetoothDevice.gatt?.connect();
      bluetoothDeviceRef.current = bluetoothDevice;
      bluetoothServerRef.current = server || null;

      const device: BiofeedbackDevice = {
        id: `bt-${Date.now()}`,
        user_id: user?.id || 'demo',
        device_type: deviceType,
        device_name: bluetoothDevice.name || `${deviceType} Device`,
        device_id: bluetoothDevice.id,
        is_connected: true,
        calibration_data: {},
        connection_method: 'bluetooth',
        battery_level: 100,
        signal_quality: 100,
        created_at: new Date().toISOString()
      };

      // Try to read battery level
      try {
        const batteryService = await server?.getPrimaryService('battery_service');
        const batteryChar = await batteryService?.getCharacteristic('battery_level');
        const batteryValue = await batteryChar?.readValue();
        if (batteryValue) {
          device.battery_level = batteryValue.getUint8(0);
        }
      } catch (e) {
        console.log('Battery service not available');
      }

      if (user && !isDemo) {
        const { data, error } = await supabase
          .from('biofeedback_devices')
          .insert(device)
          .select()
          .single();

        if (error) throw error;
        setDevices(prev => [...prev, data]);
        toast.success(`${bluetoothDevice.name} connected via Bluetooth!`);
        return data;
      } else {
        setDevices(prev => [...prev, device]);
        toast.success(`${bluetoothDevice.name} connected via Bluetooth!`);
        return device;
      }
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        toast.info('Device selection cancelled');
      } else {
        console.error('Connection error:', error);
        toast.error('Failed to connect device. Try using simulated mode.');
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [user, isBluetoothSupported, isDemo]);

  // Start brain state simulation
  const startBrainStateSimulation = useCallback(() => {
    if (brainStateIntervalRef.current) {
      clearInterval(brainStateIntervalRef.current);
    }

    const initialState: BrainState = {
      alpha: 50,
      beta: 50,
      gamma: 30,
      theta: 40,
      delta: 20,
      focus: 50,
      calm: 50,
      timestamp: Date.now()
    };
    setCurrentBrainState(initialState);

    brainStateIntervalRef.current = setInterval(() => {
      setCurrentBrainState(prev => {
        if (!prev) return initialState;
        return {
          alpha: Math.max(0, Math.min(100, prev.alpha + (Math.random() - 0.5) * 10)),
          beta: Math.max(0, Math.min(100, prev.beta + (Math.random() - 0.5) * 10)),
          gamma: Math.max(0, Math.min(100, prev.gamma + (Math.random() - 0.5) * 8)),
          theta: Math.max(0, Math.min(100, prev.theta + (Math.random() - 0.5) * 8)),
          delta: Math.max(0, Math.min(100, prev.delta + (Math.random() - 0.5) * 5)),
          focus: Math.max(0, Math.min(100, prev.focus + (Math.random() - 0.5) * 15)),
          calm: Math.max(0, Math.min(100, prev.calm + (Math.random() - 0.5) * 12)),
          timestamp: Date.now()
        };
      });
    }, 1000);
  }, []);

  // Disconnect device
  const disconnectDevice = useCallback(async (deviceId: string) => {
    try {
      // Stop brain state simulation
      if (brainStateIntervalRef.current) {
        clearInterval(brainStateIntervalRef.current);
        brainStateIntervalRef.current = null;
      }

      // Disconnect Bluetooth if connected
      if (bluetoothServerRef.current?.connected) {
        bluetoothServerRef.current.disconnect();
      }
      bluetoothDeviceRef.current = null;
      bluetoothServerRef.current = null;

      if (user && !isDemo) {
        await supabase
          .from('biofeedback_devices')
          .update({ is_connected: false })
          .eq('id', deviceId);
      }

      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, is_connected: false } : d
      ));
      setCurrentBrainState(null);
      toast.success('Device disconnected');
    } catch (error) {
      toast.error('Failed to disconnect device');
    }
  }, [user, isDemo]);

  // Remove device
  const removeDevice = useCallback(async (deviceId: string) => {
    try {
      await disconnectDevice(deviceId);
      
      if (user && !isDemo) {
        await supabase.from('biofeedback_devices').delete().eq('id', deviceId);
      }
      
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      toast.success('Device removed');
    } catch (error) {
      toast.error('Failed to remove device');
    }
  }, [user, isDemo, disconnectDevice]);

  // Simulate brain state (for demo/phone sensors)
  const simulateBrainState = useCallback((): BrainState => {
    const baseState = currentBrainState || {
      alpha: 50, beta: 50, gamma: 30, theta: 40, delta: 20, focus: 50, calm: 50, timestamp: Date.now()
    };

    return {
      alpha: Math.max(0, Math.min(100, baseState.alpha + (Math.random() - 0.5) * 10)),
      beta: Math.max(0, Math.min(100, baseState.beta + (Math.random() - 0.5) * 10)),
      gamma: Math.max(0, Math.min(100, baseState.gamma + (Math.random() - 0.5) * 8)),
      theta: Math.max(0, Math.min(100, baseState.theta + (Math.random() - 0.5) * 8)),
      delta: Math.max(0, Math.min(100, baseState.delta + (Math.random() - 0.5) * 5)),
      focus: Math.max(0, Math.min(100, baseState.focus + (Math.random() - 0.5) * 15)),
      calm: Math.max(0, Math.min(100, baseState.calm + (Math.random() - 0.5) * 12)),
      timestamp: Date.now()
    };
  }, [currentBrainState]);

  // Start neuro session
  const startSession = useCallback(async (habitId?: string, deviceId?: string) => {
    try {
      const session: NeuroSession = {
        id: `session-${Date.now()}`,
        user_id: user?.id || 'demo',
        habit_id: habitId,
        device_id: deviceId,
        started_at: new Date().toISOString(),
        brain_states: [],
        mood_readings: [],
        ai_interventions: []
      };

      if (user && !isDemo) {
        const { data, error } = await supabase
          .from('neuro_sessions')
          .insert(session)
          .select()
          .single();

        if (error) throw error;
        setActiveSession(data);
      } else {
        setActiveSession(session);
      }
      
      // Start simulating brain states
      startBrainStateSimulation();
      
      toast.success('Neuro session started');
      return session;
    } catch (error) {
      toast.error('Failed to start session');
      return null;
    }
  }, [user, isDemo, startBrainStateSimulation]);

  // Update brain state during session
  const updateBrainState = useCallback(async () => {
    if (!activeSession) return null;

    const newState = simulateBrainState();
    setCurrentBrainState(newState);

    // Update session with new brain state
    const updatedStates = [...(activeSession.brain_states || []), newState];
    
    if (user && !isDemo) {
      await supabase
        .from('neuro_sessions')
        .update({ brain_states: updatedStates })
        .eq('id', activeSession.id);
    }

    setActiveSession(prev => prev ? { ...prev, brain_states: updatedStates } : null);
    return newState;
  }, [activeSession, simulateBrainState, user, isDemo]);

  // Get AI analysis of brain state
  const analyzeBrainState = useCallback(async (habitContext: { habitName: string; category: string; timeOfDay: string }) => {
    if (!currentBrainState) return null;

    try {
      const { data, error } = await supabase.functions.invoke('neuro-feedback', {
        body: {
          action: 'analyze-brain-state',
          data: { brainState: currentBrainState, habitContext }
        }
      });

      if (error) throw error;
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing brain state:', error);
      // Return simulated analysis for demo
      return {
        state: currentBrainState.focus > 60 ? 'focused' : currentBrainState.calm > 60 ? 'relaxed' : 'neutral',
        recommendation: 'Continue with your current activity. Your brain waves indicate good engagement.',
        confidence: 0.85
      };
    }
  }, [currentBrainState]);

  // Get real-time adjustment
  const getRealTimeAdjustment = useCallback(async (sessionDuration: number, habitProgress: number) => {
    if (!currentBrainState) return null;

    try {
      const { data, error } = await supabase.functions.invoke('neuro-feedback', {
        body: {
          action: 'real-time-adjustment',
          data: { currentState: currentBrainState, sessionDuration, habitProgress }
        }
      });

      if (error) throw error;
      return data.adjustment;
    } catch (error) {
      console.error('Error getting adjustment:', error);
      return {
        type: 'continue',
        message: 'Keep going! Your focus levels are stable.',
        suggestedBreak: sessionDuration > 25 ? true : false
      };
    }
  }, [currentBrainState]);

  // End neuro session
  const endSession = useCallback(async (notes?: string) => {
    if (!activeSession) return;

    try {
      // Stop brain state simulation
      if (brainStateIntervalRef.current) {
        clearInterval(brainStateIntervalRef.current);
        brainStateIntervalRef.current = null;
      }

      const completionBoost = activeSession.brain_states.length > 1
        ? ((activeSession.brain_states[activeSession.brain_states.length - 1]?.focus || 0) - 
           (activeSession.brain_states[0]?.focus || 0))
        : 0;

      if (user && !isDemo) {
        await supabase
          .from('neuro_sessions')
          .update({
            ended_at: new Date().toISOString(),
            notes,
            completion_boost: completionBoost
          })
          .eq('id', activeSession.id);
      }

      setActiveSession(null);
      setCurrentBrainState(null);
      toast.success('Session ended');
    } catch (error) {
      toast.error('Failed to end session');
    }
  }, [activeSession, user, isDemo]);

  // Create a new Neuro-Tea Blend
  const createBlend = useCallback(async (config: {
    name: string;
    blendType: NeuroTeaBlend['blend_type'];
    teaFlavor: NeuroTeaBlend['tea_flavor'];
    targetState: string;
  }) => {
    try {
      // Generate blend configuration
      const blendConfigs: Record<string, { binauralFrequency: number; baseFrequency: number; duration: number }> = {
        focus: { binauralFrequency: 14, baseFrequency: 200, duration: 25 },
        calm: { binauralFrequency: 6, baseFrequency: 180, duration: 15 },
        energy: { binauralFrequency: 18, baseFrequency: 220, duration: 10 },
        sleep: { binauralFrequency: 3, baseFrequency: 160, duration: 30 },
        custom: { binauralFrequency: 10, baseFrequency: 200, duration: 20 }
      };

      const blendConfig = blendConfigs[config.blendType] || blendConfigs.custom;

      const blend: NeuroTeaBlend = {
        id: `blend-${Date.now()}`,
        user_id: user?.id || 'demo',
        name: config.name,
        description: `Custom ${config.blendType} blend with ${config.teaFlavor} flavor`,
        blend_type: config.blendType,
        tea_flavor: config.teaFlavor,
        binaural_frequency: blendConfig.binauralFrequency,
        base_frequency: blendConfig.baseFrequency,
        ambient_sounds: ['rain'],
        duration_minutes: blendConfig.duration,
        is_public: false,
        play_count: 0,
        created_at: new Date().toISOString()
      };

      if (user && !isDemo) {
        const { data, error } = await supabase
          .from('neuro_tea_blends')
          .insert(blend)
          .select()
          .single();

        if (error) throw error;
        setBlends(prev => [...prev, data]);
        toast.success('Neuro-Tea Blend created!');
        return data;
      } else {
        setBlends(prev => [...prev, blend]);
        localStorage.setItem('momentum_neuro_blends', JSON.stringify([...blends, blend]));
        toast.success('Neuro-Tea Blend created!');
        return blend;
      }
    } catch (error) {
      toast.error('Failed to create blend');
      return null;
    }
  }, [user, isDemo, blends]);

  // Play binaural beats
  const playBlend = useCallback(async (blend: NeuroTeaBlend) => {
    try {
      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      
      // Resume audio context if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Create gain node for volume control
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3;
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // Create stereo panner for binaural effect
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      
      const leftPanner = ctx.createStereoPanner();
      const rightPanner = ctx.createStereoPanner();
      
      leftPanner.pan.value = -1;
      rightPanner.pan.value = 1;

      // Set frequencies for binaural beat
      leftOsc.frequency.value = blend.base_frequency;
      rightOsc.frequency.value = blend.base_frequency + blend.binaural_frequency;
      
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';

      // Connect nodes
      leftOsc.connect(leftPanner);
      rightOsc.connect(rightPanner);
      leftPanner.connect(gainNode);
      rightPanner.connect(gainNode);

      // Start oscillators
      leftOsc.start();
      rightOsc.start();

      oscillatorsRef.current = { left: leftOsc, right: rightOsc };
      setActiveBlend(blend);

      // Update play count
      if (user && !isDemo) {
        await supabase
          .from('neuro_tea_blends')
          .update({ play_count: blend.play_count + 1 })
          .eq('id', blend.id);
      }

      toast.success(`Playing ${blend.name} - Use headphones for best effect`);
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('Failed to play blend. Make sure audio is enabled.');
    }
  }, [user, isDemo]);

  // Stop playing
  const stopBlend = useCallback(() => {
    if (oscillatorsRef.current) {
      oscillatorsRef.current.left.stop();
      oscillatorsRef.current.right.stop();
      oscillatorsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setActiveBlend(null);
    toast.info('Playback stopped');
  }, []);

  // Adjust volume
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Generate podcast script
  const generatePodcastScript = useCallback(async (blend: NeuroTeaBlend) => {
    try {
      const { data, error } = await supabase.functions.invoke('neuro-feedback', {
        body: {
          action: 'generate-podcast-script',
          data: {
            blendId: blend.id,
            blendName: blend.name,
            blendType: blend.blend_type,
            teaFlavor: blend.tea_flavor,
            duration: blend.duration_minutes
          }
        }
      });

      if (error) throw error;
      return data.podcast;
    } catch (error) {
      toast.error('Failed to generate podcast script');
      return null;
    }
  }, []);

  // Delete blend
  const deleteBlend = useCallback(async (blendId: string) => {
    try {
      if (user && !isDemo) {
        await supabase.from('neuro_tea_blends').delete().eq('id', blendId);
      }
      
      const updatedBlends = blends.filter(b => b.id !== blendId);
      setBlends(updatedBlends);
      
      if (isDemo) {
        localStorage.setItem('momentum_neuro_blends', JSON.stringify(updatedBlends));
      }
      
      toast.success('Blend deleted');
    } catch (error) {
      toast.error('Failed to delete blend');
    }
  }, [user, isDemo, blends]);

  return {
    devices,
    blends,
    activeSession,
    currentBrainState,
    activeBlend,
    isConnecting,
    isLoading,
    isDemo,
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
    deleteBlend,
    refreshData: fetchData
  };
}
