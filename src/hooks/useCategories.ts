import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Default categories that all users have
export const defaultCategories: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Health', color: '#10B981', icon: 'heart', description: 'Physical and mental health habits', is_default: true },
  { name: 'Fitness', color: '#F59E0B', icon: 'dumbbell', description: 'Exercise and workout habits', is_default: true },
  { name: 'Learning', color: '#3B82F6', icon: 'book', description: 'Education and skill development', is_default: true },
  { name: 'Mindfulness', color: '#8B5CF6', icon: 'brain', description: 'Meditation and mental wellness', is_default: true },
  { name: 'Productivity', color: '#EC4899', icon: 'target', description: 'Work and efficiency habits', is_default: true },
  { name: 'General', color: '#7C9885', icon: 'star', description: 'General purpose habits', is_default: true },
];

export const availableIcons = [
  'heart', 'dumbbell', 'book', 'brain', 'target', 'star', 'sun', 'moon',
  'coffee', 'music', 'camera', 'palette', 'code', 'globe', 'home', 'briefcase',
  'wallet', 'gift', 'trophy', 'flame', 'zap', 'clock', 'calendar', 'check'
];

export const availableColors = [
  '#7C9885', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6',
  '#A855F7', '#F43F5E', '#0EA5E9', '#22C55E'
];

export const useCategories = () => {
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('habit_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (!error && data) {
      setCategories(data);
    } else if (error && error.code === 'PGRST116') {
      // Table doesn't exist yet, use defaults
      setCategories([]);
    }
    setLoading(false);
  }, [user]);

  const createCategory = async (category: Partial<Category>) => {
    if (!user) return null;

    // Check if premium (only premium users can create custom categories)
    if (!profile?.is_premium) {
      throw new Error('Custom categories are a premium feature. Upgrade to create your own categories!');
    }

    const { data, error } = await supabase
      .from('habit_categories')
      .insert({
        ...category,
        user_id: user.id,
        is_default: false
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setCategories(prev => [...prev, data]);
    }

    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return;

    // Check if premium
    if (!profile?.is_premium) {
      throw new Error('Custom categories are a premium feature.');
    }

    const { error } = await supabase
      .from('habit_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    // Check if premium
    if (!profile?.is_premium) {
      throw new Error('Custom categories are a premium feature.');
    }

    const { error } = await supabase
      .from('habit_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_default', false); // Can't delete default categories

    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(c => c.id === id);
  };

  // Get all categories including defaults for display
  const getAllCategories = useCallback(() => {
    // Merge custom categories with defaults
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryByName,
    getCategoryById,
    getAllCategories,
    refreshCategories: fetchCategories
  };
};
