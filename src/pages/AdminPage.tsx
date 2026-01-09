import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminAnalyticsCards } from '@/components/admin/AdminAnalyticsCards';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { UserManagement } from '@/components/admin/UserManagement';
import Navbar from '@/components/navigation/Navbar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Shield, 
  RefreshCw,
  AlertTriangle,
  Lock,
  Database
} from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const {
    analytics,
    users,
    loading,
    usersLoading,
    totalUsers,
    currentPage,
    totalPages,
    error,
    fetchAnalytics,
    fetchUsers,
    updateUser
  } = useAdminDashboard();


  const [activeTab, setActiveTab] = useState('overview');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is logged in
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user is admin
    if (profile && !profile.is_admin) {
      setAccessDenied(true);
      return;
    }

    // If admin, fetch data
    if (profile?.is_admin) {
      fetchAnalytics();
      fetchUsers(1, '', 'all');
    }
  }, [user, profile, authLoading, navigate, fetchAnalytics, fetchUsers]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (accessDenied || (profile && !profile.is_admin)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-6">
                  You don't have permission to access the admin dashboard. 
                  This area is restricted to administrators only.
                </p>
                <Button onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if there's no data
  const hasNoData = !loading && analytics && 
    analytics.totalUsers === 0 && 
    analytics.totalHabits === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Platform analytics and user management
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <Badge variant="destructive" className="text-sm py-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Connection Error
              </Badge>
            )}
            <Badge variant="outline" className="text-sm py-1">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </Badge>

            <Button 
              variant="outline" 
              onClick={() => {
                fetchAnalytics();
                if (activeTab === 'users') {
                  fetchUsers(currentPage, '', 'all');
                }
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Unable to Load Data</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error}. Please check your database connection and ensure the edge function is deployed.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      fetchAnalytics();
                      fetchUsers(1, '', 'all');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {hasNoData && !error && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">No Data Yet</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your database is connected but there are no users or habits yet. 
                    Data will appear here as users sign up and create habits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Cards */}
            <AdminAnalyticsCards analytics={analytics} loading={loading} />

            {/* Charts */}
            <AdminCharts analytics={analytics} />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">User Engagement</span>
                      <Badge variant={analytics && analytics.dailyActiveUsers > 0 ? 'default' : 'secondary'}>
                        {analytics?.dailyActiveUsers || 0} active today
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Conversion Rate</span>
                      <Badge variant="outline">
                        {analytics && analytics.totalUsers > 0 
                          ? ((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1) 
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completions (30d)</span>
                      <Badge variant="outline">
                        {analytics?.completionsLast30Days || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">New Users (7d)</span>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        +{analytics?.newUsersThisWeek || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Premium Users</span>
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        {analytics?.premiumUsers || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Habits</span>
                      <Badge variant="outline">
                        {analytics?.totalHabits || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement
              users={users}
              loading={usersLoading}
              totalUsers={totalUsers}
              currentPage={currentPage}
              totalPages={totalPages}
              onFetchUsers={fetchUsers}
              onUpdateUser={updateUser}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
