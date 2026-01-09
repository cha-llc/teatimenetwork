import React from 'react';
import { Edit2, Trash2, Lock } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { Category } from '@/hooks/useCategories';

interface CategoryCardProps {
  category: Category;
  habitCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  habitCount,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  canEdit
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative group bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
        isSelected
          ? 'border-[#7C9885] shadow-md ring-2 ring-[#7C9885]/20'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Category Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <CategoryIcon icon={category.icon} size={28} className="text-current" style={{ color: category.color }} />
      </div>

      {/* Category Info */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{category.name}</h3>
      {category.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{category.description}</p>
      )}

      {/* Habit Count */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${category.color}15`, color: category.color }}
        >
          {habitCount} {habitCount === 1 ? 'habit' : 'habits'}
        </span>
        {category.is_default && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Default
          </span>
        )}
      </div>

      {/* Action Buttons - Only show for custom categories */}
      {!category.is_default && canEdit && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      )}

      {/* Lock icon for default categories when hovering */}
      {category.is_default && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 rounded-lg bg-gray-100">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div
          className="absolute top-4 left-4 w-3 h-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
      )}
    </div>
  );
};

export default CategoryCard;
