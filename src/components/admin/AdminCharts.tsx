import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import type { PlatformAnalytics } from '@/hooks/useAdminDashboard';

interface AdminChartsProps {
  analytics: PlatformAnalytics | null;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

function EmptyChartState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center text-center p-6">
      <div className="p-3 bg-muted rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-muted-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground/70 mt-1">{description}</p>
    </div>
  );
}

export function AdminCharts({ analytics }: AdminChartsProps) {
  if (!analytics) return null;

  const subscriptionData = [
    { name: 'Starter', value: analytics.subscriptionsByTier.starter, color: '#10b981' },
    { name: 'Pro', value: analytics.subscriptionsByTier.pro, color: '#3b82f6' },
    { name: 'Ultimate', value: analytics.subscriptionsByTier.ultimate, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  const freeUsers = analytics.totalUsers - analytics.premiumUsers;
  const userTypeData = [
    { name: 'Free', value: freeUsers, color: '#94a3b8' },
    { name: 'Premium', value: analytics.premiumUsers, color: '#f59e0b' }
  ];

  const hasSignupData = analytics.signupTrend && analytics.signupTrend.length > 0;
  const hasUserData = analytics.totalUsers > 0;
  const hasPopularHabits = analytics.popularHabits && analytics.popularHabits.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Signup Trend */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>User Signups (Last 7 Days)</CardTitle>
          <CardDescription>Daily new user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {hasSignupData ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.signupTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState 
              icon={TrendingUp}
              title="No Signup Data"
              description="User signup trends will appear here once users start registering."
            />
          )}
        </CardContent>
      </Card>

      {/* User Types Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Free vs Premium users</CardDescription>
        </CardHeader>
        <CardContent>
          {hasUserData ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState 
              icon={PieChartIcon}
              title="No Users Yet"
              description="User distribution will appear here once users sign up."
            />
          )}
        </CardContent>
      </Card>

      {/* Subscription Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Tiers</CardTitle>
          <CardDescription>Premium user breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" name="Users">
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState 
              icon={BarChart3}
              title="No Premium Users"
              description="Subscription tier breakdown will appear once users upgrade."
            />
          )}
        </CardContent>
      </Card>

      {/* Popular Habits */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Popular Habits</CardTitle>
          <CardDescription>Top habits by streak count</CardDescription>
        </CardHeader>
        <CardContent>
          {hasPopularHabits ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.popularHabits.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="current_streak" name="Current Streak" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState 
              icon={BarChart3}
              title="No Habits Yet"
              description="Popular habits will appear here once users create and track habits."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
