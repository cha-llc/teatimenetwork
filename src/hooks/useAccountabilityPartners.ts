import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Partnership {
  id: string;
  requester_id: string;
  partner_id: string | null;
  partner_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  accepted_at: string | null;
  partner_name?: string;
  is_requester?: boolean;
}

export interface PrivacySettings {
  id?: string;
  user_id?: string;
  share_streaks: boolean;
  share_completions: boolean;
  share_habit_names: boolean;
  share_categories: boolean;
  share_statistics: boolean;
  notify_on_completion: boolean;
  notify_on_streak_break: boolean;
  notify_on_milestone: boolean;
}

export interface PartnerMessage {
  id: string;
  partnership_id: string;
  sender_id: string;
  message: string;
  message_type: 'encouragement' | 'celebration' | 'support' | 'reminder';
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export interface PartnerNotification {
  id: string;
  user_id: string;
  partner_id: string;
  notification_type: string;
  title: string;
  message: string;
  habit_name: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PartnerProgress {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  habits: {
    id: string;
    name: string;
    category: string;
    streak: number;
    completedToday: boolean;
    completionRate: number;
  }[];
  totalHabits: number;
  activeStreaks: number;
  longestStreak: number;
  weeklyCompletionRate: number;
}

const defaultPrivacySettings: PrivacySettings = {
  share_streaks: true,
  share_completions: true,
  share_habit_names: true,
  share_categories: true,
  share_statistics: false,
  notify_on_completion: true,
  notify_on_streak_break: true,
  notify_on_milestone: true,
};

export function useAccountabilityPartners() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Partnership[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [partnerProgress, setPartnerProgress] = useState<PartnerProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => localStorage.getItem('visitorId') || 'demo-user');
  const [userEmail] = useState(() => localStorage.getItem('userEmail') || 'user@example.com');
  const [userName] = useState(() => localStorage.getItem('userName') || 'User');
  const { toast } = useToast();

  // Load partnerships
  const loadPartnerships = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('accountability_partnerships')
        .select('*')
        .or(`requester_id.eq.${userId},partner_email.eq.${userEmail}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const accepted = (data || []).filter(p => p.status === 'accepted').map(p => ({
        ...p,
        is_requester: p.requester_id === userId
      }));
      const pending = (data || []).filter(p => 
        p.status === 'pending' && p.partner_email === userEmail && p.requester_id !== userId
      );

      setPartnerships(accepted);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error loading partnerships:', error);
    }
  }, [userId, userEmail]);

  // Load privacy settings
  const loadPrivacySettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('accountability_privacy')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPrivacySettings(data);
      } else {
        // Create default settings
        const { data: newData } = await supabase
          .from('accountability_privacy')
          .insert({ user_id: userId, ...defaultPrivacySettings })
          .select()
          .single();
        
        if (newData) setPrivacySettings(newData);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  }, [userId]);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const partnershipIds = partnerships.map(p => p.id);
      if (partnershipIds.length === 0) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('partner_messages')
        .select('*')
        .in('partnership_id', partnershipIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [partnerships]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('partner_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId]);

  // Generate mock partner progress (in real app, this would fetch from partner's data)
  const loadPartnerProgress = useCallback(async () => {
    const progress: PartnerProgress[] = partnerships.map(p => ({
      partnerId: p.is_requester ? (p.partner_id || p.partner_email) : p.requester_id,
      partnerName: p.partner_name || p.partner_email.split('@')[0],
      partnerEmail: p.partner_email,
      habits: [
        { id: '1', name: 'Morning Exercise', category: 'Health', streak: 7, completedToday: true, completionRate: 85 },
        { id: '2', name: 'Read 30 mins', category: 'Learning', streak: 12, completedToday: false, completionRate: 72 },
        { id: '3', name: 'Meditation', category: 'Wellness', streak: 3, completedToday: true, completionRate: 60 },
      ],
      totalHabits: 3,
      activeStreaks: 3,
      longestStreak: 12,
      weeklyCompletionRate: 72,
    }));
    setPartnerProgress(progress);
  }, [partnerships]);

  // Send partner invitation
  const sendInvitation = async (partnerEmail: string) => {
    if (partnerEmail === userEmail) {
      toast({
        title: "Invalid Email",
        description: "You cannot add yourself as a partner.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if partnership already exists
      const { data: existing } = await supabase
        .from('accountability_partnerships')
        .select('*')
        .eq('requester_id', userId)
        .eq('partner_email', partnerEmail)
        .single();

      if (existing) {
        toast({
          title: "Already Invited",
          description: "You've already sent an invitation to this email.",
          variant: "destructive",
        });
        return false;
      }

      // Create partnership request
      const { error } = await supabase
        .from('accountability_partnerships')
        .insert({
          requester_id: userId,
          partner_email: partnerEmail,
          status: 'pending',
        });

      if (error) throw error;

      // Send invitation email
      await supabase.functions.invoke('accountability-partner', {
        body: {
          action: 'send-invitation',
          partnerEmail,
          requesterName: userName,
          requesterEmail: userEmail,
        },
      });

      toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${partnerEmail}`,
      });

      loadPartnerships();
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Accept partnership request
  const acceptRequest = async (partnershipId: string) => {
    try {
      const { error } = await supabase
        .from('accountability_partnerships')
        .update({
          status: 'accepted',
          partner_id: userId,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', partnershipId);

      if (error) throw error;

      toast({
        title: "Partnership Accepted!",
        description: "You are now accountability partners.",
      });

      loadPartnerships();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Decline partnership request
  const declineRequest = async (partnershipId: string) => {
    try {
      const { error } = await supabase
        .from('accountability_partnerships')
        .update({ status: 'declined' })
        .eq('id', partnershipId);

      if (error) throw error;

      toast({
        title: "Request Declined",
        description: "The partnership request has been declined.",
      });

      loadPartnerships();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  // Remove partnership
  const removePartnership = async (partnershipId: string) => {
    try {
      const { error } = await supabase
        .from('accountability_partnerships')
        .delete()
        .eq('id', partnershipId);

      if (error) throw error;

      toast({
        title: "Partnership Removed",
        description: "You are no longer accountability partners.",
      });

      loadPartnerships();
    } catch (error) {
      console.error('Error removing partnership:', error);
    }
  };

  // Update privacy settings
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    try {
      const newSettings = { ...privacySettings, ...settings, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from('accountability_privacy')
        .upsert({
          user_id: userId,
          ...newSettings,
        });

      if (error) throw error;

      setPrivacySettings(newSettings);
      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved.",
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  // Send encouragement message
  const sendMessage = async (
    partnershipId: string,
    message: string,
    messageType: PartnerMessage['message_type'] = 'encouragement',
    partnerEmail?: string
  ) => {
    try {
      const { error } = await supabase
        .from('partner_messages')
        .insert({
          partnership_id: partnershipId,
          sender_id: userId,
          message,
          message_type: messageType,
        });

      if (error) throw error;

      // Send email notification
      if (partnerEmail) {
        await supabase.functions.invoke('accountability-partner', {
          body: {
            action: 'send-encouragement',
            partnerEmail,
            senderName: userName,
            message,
            messageType,
          },
        });
      }

      toast({
        title: "Message Sent!",
        description: "Your encouragement has been delivered.",
      });

      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from('partner_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Notify partner of habit completion
  const notifyPartnerCompletion = async (habitName: string) => {
    if (!privacySettings.notify_on_completion) return;

    for (const partnership of partnerships) {
      const partnerEmail = partnership.is_requester 
        ? partnership.partner_email 
        : userEmail; // In real app, get requester's email

      try {
        await supabase.functions.invoke('accountability-partner', {
          body: {
            action: 'send-notification',
            partnerEmail,
            partnerName: userName,
            notificationType: 'habit_completed',
            habitName,
            userName,
          },
        });
      } catch (error) {
        console.error('Error notifying partner:', error);
      }
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadPartnerships(),
        loadPrivacySettings(),
        loadNotifications(),
      ]);
      setLoading(false);
    };
    init();
  }, [loadPartnerships, loadPrivacySettings, loadNotifications]);

  // Load messages and progress when partnerships change
  useEffect(() => {
    if (partnerships.length > 0) {
      loadMessages();
      loadPartnerProgress();
    }
  }, [partnerships, loadMessages, loadPartnerProgress]);

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const unreadMessages = messages.filter(m => !m.is_read && m.sender_id !== userId).length;

  return {
    partnerships,
    pendingRequests,
    privacySettings,
    messages,
    notifications,
    partnerProgress,
    loading,
    unreadNotifications,
    unreadMessages,
    sendInvitation,
    acceptRequest,
    declineRequest,
    removePartnership,
    updatePrivacySettings,
    sendMessage,
    markNotificationRead,
    notifyPartnerCompletion,
    refreshData: loadPartnerships,
  };
}
