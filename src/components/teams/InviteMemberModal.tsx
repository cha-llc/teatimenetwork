import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Link, Copy, Check, Mail, Users } from 'lucide-react';
import { Team, TeamMember } from '@/hooks/useTeams';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  members: TeamMember[];
  onInvite: (email: string, displayName?: string) => Promise<boolean>;
}

export function InviteMemberModal({ isOpen, onClose, team, members, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'pending');
  const spotsLeft = team.max_members - activeMembers.length - 1; // -1 for owner

  const inviteLink = `${window.location.origin}/teams/join/${team.invite_code}`;

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const success = await onInvite(email.trim(), displayName.trim() || undefined);
    setLoading(false);

    if (success) {
      setEmail('');
      setDisplayName('');
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(team.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Invite family or friends to join {team.name}
          </DialogDescription>
        </DialogHeader>

        {spotsLeft <= 0 ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Team is Full</h3>
            <p className="text-sm text-gray-500">
              Your team has reached the maximum of {team.max_members} members.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Available spots
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {spotsLeft} of {team.max_members - 1}
              </span>
            </div>

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Invite Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
                <form onSubmit={handleEmailInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-name">Display Name (Optional)</Label>
                    <Input
                      id="invite-name"
                      placeholder="Their name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={!email.trim() || loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Invite Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyInviteLink}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Invite Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={team.invite_code}
                      readOnly
                      className="font-mono text-lg tracking-wider text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyInviteCode}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Share this link or code with people you want to invite
                </p>
              </TabsContent>
            </Tabs>
          </>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
