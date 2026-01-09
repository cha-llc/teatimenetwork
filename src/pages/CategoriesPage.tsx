import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Filter, Search,
  Grid3X3, List, Loader2, Lock, Sparkles, Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { useCategories, Category, defaultCategories } from '@/hooks/useCategories';
import Navbar from '@/components/navigation/Navbar';
import CategoryCard from '@/components/categories/CategoryCard';
import CategoryIcon from '@/components/categories/CategoryIcon';
import AddCategoryModal from '@/components/categories/AddCategoryModal';
import HabitCard from '@/components/dashboard/HabitCard';
import SettingsModal from '@/components/dashboard/SettingsModal';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import { toast } from '@/components/ui/use-toast';

const CategoriesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { habits, completions, streaks, loading: habitsLoading, toggleCompletion, isCompletedToday, updateHabit, deleteHabit } = useHabits();
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const today = new Date().toISOString().split('T')[0];
  const isPremium = profile?.is_premium;
  const loading = habitsLoading || categoriesLoading;

  // Get all categories (defaults + custom)
  const allCategories = useMemo(() => {
    const customCats = categories.filter(c => !c.is_default);
    const defaultCats = defaultCategories.map(d => ({
      ...d,
      id: d.name.toLowerCase(),
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    return [...defaultCats, ...customCats];
  }, [categories, user]);

  // Count habits per category
  const habitCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    habits.forEach(habit => {
      const cat = habit.category.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [habits]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return allCategories;
    const query = searchQuery.toLowerCase();
    return allCategories.filter(
      c => c.name.toLowerCase().includes(query) || 
           c.description?.toLowerCase().includes(query)
    );
  }, [allCategories, searchQuery]);

  // Filter habits by selected category
  const filteredHabits = useMemo(() => {
    if (!selectedCategory) return [];
    return habits.filter(h => h.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [habits, selectedCategory]);

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        toast({
          title: 'Category updated',
          description: 'Your category has been updated successfully.'
        });
      } else {
        await createCategory(categoryData);
        toast({
          title: 'Category created',
          description: 'Your new category has been created successfully.'
        });
      }
      setEditingCategory(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.is_default) {
      toast({
        title: 'Cannot delete',
        description: 'Default categories cannot be deleted.',
        variant: 'destructive'
      });
      return;
    }

    const habitsInCategory = habitCountByCategory[category.name.toLowerCase()] || 0;
    if (habitsInCategory > 0) {
      const confirmed = confirm(
        `This category has ${habitsInCategory} habit(s). Deleting it will move those habits to "General". Continue?`
      );
      if (!confirmed) return;

      // Move habits to General
      for (const habit of habits.filter(h => h.category.toLowerCase() === category.name.toLowerCase())) {
        await updateHabit(habit.id, { category: 'general' });
      }
    }

    try {
      await deleteCategory(category.id);
      if (selectedCategory === category.id) {
        setSelectedCategory(null);
      }
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAddCategory = () => {
    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleToggleCompletion = async (habitId: string) => {
    await toggleCompletion(habitId, today);
  };

  // Redirect to home if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C9885] to-[#F4A460] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍵</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Please sign in</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need to be logged in to manage categories.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#7C9885] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-[#7C9885] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-x-hidden">
      {/* Navigation */}
      <Navbar 
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
      />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Manage Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your habits with custom categories. {!isPremium && 'Upgrade to Premium to create your own.'}
          </p>
        </div>

        {/* Premium Feature Banner */}
        {!isPremium && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Unlock Custom Categories</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Create unlimited custom categories with your own colors and icons. Organize your habits exactly the way you want.
                </p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <button
              onClick={handleAddCategory}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isPremium
                  ? 'bg-[#7C9885] text-white hover:bg-[#6a8573]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {isPremium ? (
                <>
                  <Plus className="w-4 h-4" />
                  Add Category
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Add Category
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              All Categories ({filteredCategories.length})
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-[#7C9885] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  habitCount={habitCountByCategory[category.name.toLowerCase()] || 0}
                  isSelected={selectedCategory === category.id || selectedCategory === category.name.toLowerCase()}
                  onSelect={() => setSelectedCategory(category.is_default ? category.name.toLowerCase() : category.id)}
                  onEdit={() => handleEditCategory(category)}
                  onDelete={() => handleDeleteCategory(category)}
                  canEdit={isPremium && !category.is_default}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.is_default ? category.name.toLowerCase() : category.id)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedCategory === category.id || selectedCategory === category.name.toLowerCase()
                      ? 'bg-[#7C9885]/5 dark:bg-[#7C9885]/10'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <CategoryIcon icon={category.icon} size={24} className="text-current" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      {habitCountByCategory[category.name.toLowerCase()] || 0} habits
                    </span>
                    {category.is_default && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Default</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtered Habits Section */}
        {selectedCategory && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Habits in "{allCategories.find(c => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory)?.name}"
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({filteredHabits.length} {filteredHabits.length === 1 ? 'habit' : 'habits'})
              </span>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No habits in this category</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create a new habit and assign it to this category.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-[#7C9885] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    streak={streaks[habit.id]}
                    isCompleted={isCompletedToday(habit.id)}
                    onToggle={() => handleToggleCompletion(habit.id)}
                    onEdit={() => {}}
                    onDelete={() => {
                      if (confirm('Are you sure you want to delete this habit?')) {
                        deleteHabit(habit.id);
                      }
                    }}
                    disabled={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {allCategories.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {categories.filter(c => !c.is_default).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Custom Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {habits.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Habits</div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        editCategory={editingCategory}
      />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
};

export default CategoriesPage;
