import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Crown, Plus, Loader2, 
  Dumbbell, Target, Heart, Book, Star, Users, Sparkles,
  Grid3X3, List, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTemplates, HabitTemplate, officialTemplates } from '@/hooks/useTemplates';
import { useHabits } from '@/hooks/useHabits';
import Navbar from '@/components/navigation/Navbar';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplateDetailModal from '@/components/templates/TemplateDetailModal';
import SaveAsTemplateModal from '@/components/templates/SaveAsTemplateModal';
import SettingsModal from '@/components/dashboard/SettingsModal';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import { toast } from '@/components/ui/use-toast';

type GoalFilter = 'all' | 'fitness' | 'productivity' | 'wellness' | 'learning' | 'custom';
type ViewMode = 'grid' | 'list';

const goalInfo = {
  fitness: { 
    icon: Dumbbell, 
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    activeColor: 'bg-orange-500 text-white',
    description: 'Build strength, endurance, and healthy exercise habits'
  },
  productivity: { 
    icon: Target, 
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    activeColor: 'bg-purple-500 text-white',
    description: 'Boost your efficiency and accomplish more each day'
  },
  wellness: { 
    icon: Heart, 
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    activeColor: 'bg-teal-500 text-white',
    description: 'Nurture your mental and emotional well-being'
  },
  learning: { 
    icon: Book, 
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    activeColor: 'bg-blue-500 text-white',
    description: 'Expand your knowledge and develop new skills'
  }
};

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { 
    communityTemplates, 
    myTemplates, 
    loading, 
    createTemplate, 
    shareTemplate, 
    unshareTemplate,
    deleteTemplate,
    templateToHabit 
  } = useTemplates();
  const { createHabit, habits } = useHabits();

  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-templates'>('browse');

  const isPremium = profile?.is_premium;

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = activeTab === 'browse' 
      ? [...officialTemplates, ...communityTemplates]
      : myTemplates;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    // Goal filter
    if (goalFilter !== 'all') {
      templates = templates.filter(t => t.goal === goalFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      templates = templates.filter(t => t.difficulty === difficultyFilter);
    }

    return templates;
  }, [activeTab, officialTemplates, communityTemplates, myTemplates, searchQuery, goalFilter, difficultyFilter]);

  // Group templates by goal for browse view
  const templatesByGoal = useMemo(() => {
    if (goalFilter !== 'all') return null;
    
    const grouped: Record<string, HabitTemplate[]> = {
      fitness: [],
      productivity: [],
      wellness: [],
      learning: []
    };

    filteredTemplates.forEach(t => {
      if (t.goal in grouped) {
        grouped[t.goal].push(t);
      }
    });

    return grouped;
  }, [filteredTemplates, goalFilter]);

  const handleUseTemplate = async (template: HabitTemplate) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to use templates.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const habitData = templateToHabit(template);
      await createHabit(habitData);
      
      toast({
        title: 'Habit created!',
        description: `"${template.name}" has been added to your habits.`
      });
      
      setShowDetailModal(false);
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create habit from template.',
        variant: 'destructive'
      });
    }
  };



  const handleShareTemplate = async (templateId: string) => {
    const template = myTemplates.find(t => t.id === templateId);
    if (!template) return;

    try {
      if (template.is_community) {
        await unshareTemplate(templateId);
        toast({
          title: 'Template unshared',
          description: 'Your template is now private.'
        });
      } else {
        await shareTemplate(templateId);
        toast({
          title: 'Template shared!',
          description: 'Your template is now available to the community.'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to share template.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteTemplate(templateId);
      toast({
        title: 'Template deleted',
        description: 'Your template has been removed.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveTemplate = async (templateData: Partial<HabitTemplate>) => {
    try {
      await createTemplate(templateData);
      toast({
        title: 'Template saved!',
        description: 'Your custom template has been created.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template.',
        variant: 'destructive'
      });
      throw error;
    }
  };

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

        <div className="bg-gradient-to-br from-[#7C9885] to-[#5a7363] rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Find Your Perfect Habits</h2>
          </div>
          <p className="text-white/80 max-w-2xl mb-6">
            Browse our curated collection of habit templates designed by experts and the community. 
            Each template includes recommended schedules, tips, and everything you need to succeed.
          </p>
          
          {/* Goal Quick Filters */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(goalInfo).map(([goal, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={goal}
                  onClick={() => setGoalFilter(goalFilter === goal ? 'all' : goal as GoalFilter)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    goalFilter === goal
                      ? 'bg-white text-[#7C9885]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {goal.charAt(0).toUpperCase() + goal.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs and Create Button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-[#7C9885] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Browse Templates
              </span>
            </button>
            <button
              onClick={() => setActiveTab('my-templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'my-templates'
                  ? 'bg-[#7C9885] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                My Templates
                {myTemplates.length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {myTemplates.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {isPremium && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7C9885] text-white rounded-lg font-medium hover:bg-[#6a8573] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-colors ${
                showFilters 
                  ? 'border-[#7C9885] bg-[#7C9885]/5 dark:bg-[#7C9885]/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              } text-gray-700 dark:text-gray-300`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } text-gray-700 dark:text-gray-300`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } text-gray-700 dark:text-gray-300`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal</label>
                <select
                  value={goalFilter}
                  onChange={(e) => setGoalFilter(e.target.value as GoalFilter)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#7C9885] focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <option value="all">All Goals</option>
                  <option value="fitness">Fitness</option>
                  <option value="productivity">Productivity</option>
                  <option value="wellness">Wellness</option>
                  <option value="learning">Learning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#7C9885] focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setGoalFilter('all');
                  setDifficultyFilter('all');
                  setSearchQuery('');
                }}
                className="self-end px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'browse' ? (
          <>
            {/* Show grouped by goal if no specific filter */}
            {goalFilter === 'all' && !searchQuery && templatesByGoal ? (
              <div className="space-y-12">
                {Object.entries(templatesByGoal).map(([goal, templates]) => {
                  if (templates.length === 0) return null;
                  const info = goalInfo[goal as keyof typeof goalInfo];
                  const Icon = info.icon;

                  return (
                    <section key={goal}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${info.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">{goal}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setGoalFilter(goal as GoalFilter)}
                          className="text-sm text-[#7C9885] hover:text-[#6a8573] font-medium"
                        >
                          View All
                        </button>
                      </div>

                      <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {templates.slice(0, 3).map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowDetailModal(true);
                            }}
                            onUse={() => handleUseTemplate(template)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <>
                {/* Filtered results */}
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No templates found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredTemplates.map(template => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowDetailModal(true);
                        }}
                        onUse={() => handleUseTemplate(template)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* My Templates Tab */}
            {!isPremium ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center border border-amber-200 dark:border-amber-800">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Premium Feature</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create and save your own habit templates, then share them with the community. 
                  Upgrade to Premium to unlock this feature.
                </p>
                <button 
                  onClick={() => setShowUpgrade(true)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Upgrade to Premium
                </button>
              </div>
            ) : myTemplates.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#7C9885]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-[#7C9885]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No templates yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first custom template to reuse and share.</p>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-6 py-3 bg-[#7C9885] text-white rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowDetailModal(true);
                    }}
                    onUse={() => handleUseTemplate(template)}
                    onShare={() => handleShareTemplate(template.id)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Community Templates Section */}
        {activeTab === 'browse' && communityTemplates.length > 0 && goalFilter === 'all' && !searchQuery && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Community Templates</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Templates created and shared by our community</p>
              </div>
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {communityTemplates.slice(0, 6).map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowDetailModal(true);
                  }}
                  onUse={() => handleUseTemplate(template)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <TemplateDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onUse={handleUseTemplate}
      />

      <SaveAsTemplateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        habit={null}
        onSave={handleSaveTemplate}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </div>
  );
};

export default TemplatesPage;
