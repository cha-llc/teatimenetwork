import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  Crown, 
  Shield, 
  UserX, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import type { AdminUser } from '@/hooks/useAdminDashboard';

interface UserManagementProps {
  users: AdminUser[];
  loading: boolean;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  onFetchUsers: (page: number, search: string, filter: string) => Promise<void>;
  onUpdateUser: (userId: string, updates: Partial<AdminUser>) => Promise<boolean>;
}

export function UserManagement({
  users,
  loading,
  totalUsers,
  currentPage,
  totalPages,
  onFetchUsers,
  onUpdateUser
}: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'premium' | 'admin' | 'revoke-premium' | 'revoke-admin' | null;
    user: AdminUser | null;
  }>({ type: null, user: null });
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = useCallback(() => {
    onFetchUsers(1, search, filter);
  }, [search, filter, onFetchUsers]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filter]);

  const handlePageChange = (page: number) => {
    onFetchUsers(page, search, filter);
  };

  const handleAction = async () => {
    if (!actionDialog.user || !actionDialog.type) return;
    
    setActionLoading(true);
    let updates: Partial<AdminUser> = {};

    switch (actionDialog.type) {
      case 'premium':
        updates = { is_premium: true, subscription_tier: 'pro' };
        break;
      case 'admin':
        updates = { is_admin: true };
        break;
      case 'revoke-premium':
        updates = { is_premium: false, subscription_tier: null };
        break;
      case 'revoke-admin':
        updates = { is_admin: false };
        break;
    }

    await onUpdateUser(actionDialog.user.id, updates);
    setActionLoading(false);
    setActionDialog({ type: null, user: null });
  };

  const getInitials = (user: AdminUser) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              {totalUsers} total users
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onFetchUsers(currentPage, search, filter)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="premium">Premium Only</SelectItem>
              <SelectItem value="free">Free Only</SelectItem>
              <SelectItem value="admin">Admins Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Habits</TableHead>
                <TableHead className="hidden lg:table-cell">Completions</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || user.display_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.is_admin && (
                          <Badge variant="destructive" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.is_premium ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            {user.subscription_tier || 'Premium'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Free</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.habitCount}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.completionCount}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            View Details
                          </DropdownMenuItem>
                          {!user.is_premium ? (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({ type: 'premium', user })}
                            >
                              <Crown className="h-4 w-4 mr-2 text-amber-500" />
                              Grant Premium
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({ type: 'revoke-premium', user })}
                              className="text-amber-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Revoke Premium
                            </DropdownMenuItem>
                          )}
                          {!user.is_admin ? (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({ type: 'admin', user })}
                            >
                              <Shield className="h-4 w-4 mr-2 text-red-500" />
                              Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({ type: 'revoke-admin', user })}
                              className="text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Revoke Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedUser.full_name || selectedUser.display_name || 'Unknown'}
                    </h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex gap-1 mt-1">
                      {selectedUser.is_admin && <Badge variant="destructive">Admin</Badge>}
                      {selectedUser.is_premium ? (
                        <Badge className="bg-amber-500">{selectedUser.subscription_tier || 'Premium'}</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined:</span>
                    <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Habits:</span>
                    <p className="font-medium">{selectedUser.habitCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Completions:</span>
                    <p className="font-medium">{selectedUser.completionCount}</p>
                  </div>
                  {selectedUser.trial_started_at && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Trial Started:</span>
                      <p className="font-medium">{formatDate(selectedUser.trial_started_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog 
          open={!!actionDialog.type} 
          onOpenChange={() => setActionDialog({ type: null, user: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'premium' && 'Grant Premium Access'}
                {actionDialog.type === 'admin' && 'Grant Admin Access'}
                {actionDialog.type === 'revoke-premium' && 'Revoke Premium Access'}
                {actionDialog.type === 'revoke-admin' && 'Revoke Admin Access'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'premium' && 
                  `Are you sure you want to grant premium access to ${actionDialog.user?.email}?`}
                {actionDialog.type === 'admin' && 
                  `Are you sure you want to make ${actionDialog.user?.email} an admin? This will give them full access to the admin dashboard.`}
                {actionDialog.type === 'revoke-premium' && 
                  `Are you sure you want to revoke premium access from ${actionDialog.user?.email}?`}
                {actionDialog.type === 'revoke-admin' && 
                  `Are you sure you want to revoke admin access from ${actionDialog.user?.email}?`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({ type: null, user: null })}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAction}
                disabled={actionLoading}
                variant={actionDialog.type?.includes('revoke') ? 'destructive' : 'default'}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
