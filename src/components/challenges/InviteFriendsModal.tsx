import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Link2, 
  Copy, 
  Check,
  Plus,
  X,
  Send,
  Users
} from 'lucide-react';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emails: string[]) => Promise<any>;
  inviteCode?: string;
}

export function InviteFriendsModal({ isOpen, onClose, onInvite, inviteCode }: InviteFriendsModalProps) {
  const [emails, setEmails] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const inviteLink = inviteCode ? `${window.location.origin}/challenges?code=${inviteCode}` : '';

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvites = async () => {
    const validEmails = emails.filter(e => e.trim() && e.includes('@'));
    if (validEmails.length === 0) return;

    setLoading(true);
    try {
      await onInvite(validEmails);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmails(['']);
        onClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Invite Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Link Section */}
          {inviteCode && (
            <div className="space-y-3">
              <Label className="text-slate-300 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Share Invite Link
              </Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="bg-slate-800 border-slate-600 text-slate-300 text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className={`border-slate-600 ${copied ? 'bg-green-500/20 border-green-500' : ''}`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  Code: {inviteCode}
                </Badge>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Email Invites Section */}
          <div className="space-y-3">
            <Label className="text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Email Invitations
            </Label>
            
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="friend@example.com"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEmail(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddEmail}
              className="border-slate-600 hover:border-indigo-500 w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Email
            </Button>
          </div>

          {/* Success Message */}
          {sent && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Invitations sent successfully!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvites}
              disabled={loading || emails.every(e => !e.trim())}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invites
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
