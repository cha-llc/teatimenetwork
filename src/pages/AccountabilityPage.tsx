import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  UserPlus,
  Bell,
  MessageCircle,
  Check,
  X,
  Clock,
  Heart,
  PartyPopper,
  HandHeart,
  Flame,
  Shield,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useAccountabilityPartners } from '@/hooks/useAccountabilityPartners';
import { AddPartnerModal } from '@/components/accountability/AddPartnerModal';
import { PartnerCard } from '@/components/accountability/PartnerCard';
import { PrivacySettingsCard } from '@/components/accountability/PrivacySettingsCard';
import { SendMessageModal } from '@/components/accountability/SendMessageModal';

export default function AccountabilityPage() {
  const {
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
  } = useAccountabilityPartners();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('partners');

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'encouragement':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'celebration':
        return <PartyPopper className="w-4 h-4 text-yellow-500" />;
      case 'support':
        return <HandHeart className="w-4 h-4 text-blue-500" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'habit_completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'streak_milestone':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'streak_broken':
        return <X className="w-4 h-4 text-red-500" />;
      case 'message_received':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'partner_request':
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <PageWrapper
        title="Accountability Partners"
        description="Stay motivated with your accountability partners"
        icon={<Users className="w-6 h-6" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Accountability Partners"
      description="Stay motivated with your accountability partners"
      icon={<Users className="w-6 h-6" />}
      action={
        <Button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      }
    >
      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Someone wants to be your accountability partner!
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab('requests')}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
              >
                View Requests
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Partners</span>
            {partnerships.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {partnerships.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Requests</span>
            {pendingRequests.length > 0 && (
              <Badge className="ml-1 bg-indigo-500">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
            {unreadMessages > 0 && (
              <Badge className="ml-1 bg-pink-500">
                {unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
            {unreadNotifications > 0 && (
              <Badge className="ml-1 bg-orange-500">
                {unreadNotifications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners">
          {partnerships.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Partners Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Accountability partners help you stay motivated and on track with your habits.
                  Invite someone to join you on your journey!
                </p>
                <Button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Partner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {partnerProgress.map((partner, index) => (
                <PartnerCard
                  key={partnerships[index]?.id || index}
                  partner={partner}
                  partnershipId={partnerships[index]?.id || ''}
                  onRemove={removePartnership}
                  onSendMessage={sendMessage}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                <p className="text-gray-500">
                  When someone invites you to be their accountability partner, it will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Partnership Request</h3>
                          <p className="text-sm text-gray-500">
                            From: {request.partner_email}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => declineRequest(request.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          {messages.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
                <p className="text-gray-500">
                  Send encouragement to your partners or receive messages from them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <Card key={msg.id} className={!msg.is_read ? 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {getMessageIcon(msg.message_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {msg.sender_name || 'Partner'}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {msg.message_type}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{msg.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          {notifications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                <p className="text-gray-500">
                  Partner activity and updates will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`cursor-pointer transition-colors ${
                      !notif.is_read ? 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                    onClick={() => markNotificationRead(notif.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {getNotificationIcon(notif.notification_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{notif.title}</span>
                            <span className="text-xs text-gray-400">
                              {formatTime(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notif.message}
                          </p>
                          {notif.habit_name && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {notif.habit_name}
                            </Badge>
                          )}
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="max-w-2xl">
            <PrivacySettingsCard
              settings={privacySettings}
              onUpdate={updatePrivacySettings}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Partner Modal */}
      <AddPartnerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onInvite={sendInvitation}
      />
    </PageWrapper>
  );
}
