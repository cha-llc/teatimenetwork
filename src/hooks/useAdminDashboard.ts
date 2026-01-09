import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface PlatformAnalytics {
  totalUsers: number;
  premiumUsers: number;
  subscriptionsByTier: {
    starter: number;
    pro: number;
    ultimate: number;
  };
  totalHabits: number;
  completionsLast30Days: number;
  completionRate: number;
  popularHabits: Array<{
    id: string;
    name: string;
    category: string;
    current_streak: number;
  }>;
  newUsersThisWeek: number;
  dailyActiveUsers: number;
  signupTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  subscription_tier: string | null;
  is_admin: boolean;
  created_at: string;
  trial_started_at: string | null;
  habitCount: number;
  completionCount: number;
}

export interface AdminLog {
  id: string;
  action_type: string;
  details: Record<string, unknown>;
  created_at: string;
  admin_id: string;
  target_user_id: string | null;
}

// Empty analytics for when no data is available
const getEmptyAnalytics = (): PlatformAnalytics => ({
  totalUsers: 0,
  premiumUsers: 0,
  subscriptionsByTier: {
    starter: 0,
    pro: 0,
    ultimate: 0
  },
  totalHabits: 0,
  completionsLast30Days: 0,
  completionRate: 0,
  popularHabits: [],
  newUsersThisWeek: 0,
  dailyActiveUsers: 0,
  signupTrend: []
});

export function useAdminDashboard() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard', {
        body: { action: 'get-analytics' }
      });

      if (error) {
        throw error;
      }
      if (data?.error) throw new Error(data.error);

      // Only set real data from the database
      setAnalytics(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
      
      // Set empty analytics instead of mock data
      setAnalytics(getEmptyAnalytics());

      toast({
        title: 'Unable to Load Analytics',
        description: 'Could not connect to the database. Please check your connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUsers = useCallback(async (
    page: number = 1,
    search: string = '',
    filter: string = 'all'
  ) => {
    setUsersLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard', {
        body: { action: 'get-users', page, limit: 20, search, filter }
      });

      if (error) {
        throw error;
      }
      if (data?.error) throw new Error(data.error);

      // Only set real users from the database
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      
      // Set empty users instead of mock data
      setUsers([]);
      setTotalUsers(0);
      setCurrentPage(1);
      setTotalPages(1);

      toast({
        title: 'Unable to Load Users',
        description: 'Could not connect to the database. Please check your connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  const updateUser = useCallback(async (
    userId: string,
    updates: Partial<AdminUser>
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard', {
        body: { action: 'update-user', userId, updates }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Update local state with real data
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      ));

      toast({
        title: 'Success',
        description: 'User updated successfully'
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const fetchAdminLogs = useCallback(async (page: number = 1) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard', {
        body: { action: 'get-admin-logs', page, limit: 50 }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLogs(data.logs || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch admin logs';
      setLogs([]);
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  }, [toast]);

  return {
    analytics,
    users,
    logs,
    loading,
    usersLoading,
    totalUsers,
    currentPage,
    totalPages,
    error,
    fetchAnalytics,
    fetchUsers,
    updateUser,
    fetchAdminLogs
  };
}
