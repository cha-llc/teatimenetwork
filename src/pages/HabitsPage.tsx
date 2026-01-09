import React, { useEffect, useState } from 'react';
import { useHabitsDebug } from '@/hooks/useHabitsDebug';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Flame, Plus, Loader2, AlertCircle, Bug, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddHabitModal from '@/components/dashboard/AddHabitModal';
import { Habit } from '@/stores/habitsStore';

const HabitsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Using useHabitsDebug which includes useDebugValue for React DevTools
  const {
    habits,
    streaks,
    loading,
    error,
    completingHabitId,
    fetchHabits,
    completeHabit,
    uncompleteHabit,
    isCompletedToday,
    addHabit,
    editHabit,
    deleteHabit,
    debug, // Additional debug computed values
  } = useHabitsDebug();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHabits(user?.id);
  }, [user?.id, fetchHabits]);

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleToggleComplete = async (habitId: string, habitName: string) => {
    const isCompleted = isCompletedToday(habitId);
    
    if (isCompleted) {
      await uncompleteHabit(habitId);
    } else {
      await completeHabit(habitId);
    }
  };

  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    if (editingHabit) {
      // Editing existing habit
      const success = await editHabit(editingHabit.id, habitData);
      if (success) {
        toast({
          title: 'Habit updated',
          description: `"${habitData.name}" has been updated successfully.`,
        });
        setEditingHabit(null);
      }
    } else {
      // Adding new habit
      const userId = user?.id || 'demo';
      const newHabit = await addHabit(habitData, userId);
      if (newHabit) {
        toast({
          title: 'Habit created',
          description: `"${newHabit.name}" has been added to your habits.`,
        });
        setIsAddModalOpen(false);
      }
    }
  };

  const handleDeleteHabit = async () => {
    if (!deletingHabit) return;
    
    setIsDeleting(true);
    const success = await deleteHabit(deletingHabit.id);
    setIsDeleting(false);
    
    if (success) {
      toast({
        title: 'Habit deleted',
        description: `"${deletingHabit.name}" has been removed.`,
      });
      setDeletingHabit(null);
    }
  };

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleDeleteClick = (habit: Habit) => {
    setDeletingHabit(habit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your daily habits and build streaks
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </div>

      {/* Debug Info Panel - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-6 border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Bug className="w-4 h-4" />
              Debug Info (useDebugValue)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Habits:</span>
                <span className="ml-2 font-mono font-semibold">{habits.length}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Completed Today:</span>
                <span className="ml-2 font-mono font-semibold">{debug.completedTodayCount}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Completion Rate:</span>
                <span className="ml-2 font-mono font-semibold">{debug.completionRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Streak:</span>
                <span className="ml-2 font-mono font-semibold">{debug.totalCurrentStreak}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Best Streak:</span>
                <span className="ml-2 font-mono font-semibold">
                  {debug.longestStreakValue} ({debug.longestStreakHabit || 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Loading:</span>
                <span className="ml-2 font-mono font-semibold">{loading ? 'true' : 'false'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Error:</span>
                <span className="ml-2 font-mono font-semibold text-red-600">{error || 'none'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Completing:</span>
                <span className="ml-2 font-mono font-semibold">{completingHabitId || 'none'}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
              Open React DevTools and inspect this component to see useDebugValue output
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchHabits(user?.id)}
              className="ml-4"
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No habits yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Start building better habits by adding your first one.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const isCompleted = isCompletedToday(habit.id);
            const streak = streaks[habit.id];
            const isLoading = completingHabitId === habit.id;

            return (
              <Card
                key={habit.id}
                className={`transition-all duration-200 ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Complete Button */}
                    <button
                      type="button"
                      role="button"
                      data-testid="complete-button"
                      onClick={() => handleToggleComplete(habit.id, habit.name)}
                      disabled={isLoading}
                      aria-label={`Complete habit: ${habit.name}`}
                      aria-pressed={isCompleted}
                      aria-busy={isLoading}
                      className={`
                        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
                        ${isCompleted
                          ? 'bg-green-500 text-white focus:ring-green-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-400'
                        }
                        ${isLoading ? 'opacity-70' : ''}
                      `}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check
                          className={`w-6 h-6 transition-transform ${
                            isCompleted ? 'scale-110' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Habit Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-lg ${
                          isCompleted
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {habit.description}
                        </p>
                      )}
                    </div>

                    {/* Streak Display */}
                    <div className="flex items-center gap-2 text-sm">
                      <Flame
                        className={`w-5 h-5 ${
                          (streak?.current_streak || 0) > 0
                            ? 'text-orange-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-medium ${
                          (streak?.current_streak || 0) > 0
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-400'
                        }`}
                        aria-label={`Current streak: ${streak?.current_streak || 0} days`}
                      >
                        {streak?.current_streak || 0}
                      </span>
                    </div>

                    {/* Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(habit)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(habit)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {habits.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${debug.completionRate}%`,
                    }}
                    role="progressbar"
                    aria-valuenow={debug.completedTodayCount}
                    aria-valuemin={0}
                    aria-valuemax={habits.length}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {debug.completedTodayCount} / {habits.length}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen || !!editingHabit}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingHabit} onOpenChange={() => setDeletingHabit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingHabit?.name}"? This action cannot be undone.
              All your progress and streak data for this habit will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHabit}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HabitsPage;
