/**
 * LOCKED CONTENT COMPONENTS - TEA TIME NETWORK
 * 
 * Components for displaying locked content states.
 * Clear, calm, non-pushy paywalls.
 * 
 * No aggressive overlays, no countdown timers, no FOMO tactics.
 */

import React from 'react';
import { Lock } from 'lucide-react';

// ============================================================================
// LOCKED CONTENT OVERLAY
// ============================================================================

interface LockedContentProps {
  title: string;
  description?: string;
  features?: string[];
  purposeStatement?: string;
  onUpgradeClick: () => void;
  upgradeCTAText?: string;
  children?: React.ReactNode;
}

/**
 * LockedContent
 * 
 * Displays a calm, clear locked state over content.
 * No aggressive overlays or interrupting modals.
 * 
 * Shows:
 * - Lock icon
 * - Title
 * - Purpose statement ("This is where the structure lives.")
 * - What's included (bullet list)
 * - One upgrade button
 */
export const LockedContent: React.FC<LockedContentProps> = ({
  title,
  description,
  features = [],
  purposeStatement = 'This is where the structure lives.',
  onUpgradeClick,
  upgradeCTAText = 'Unlock Full Access',
  children,
}) => {
  return (
    <div className="relative w-full">
      {/* Blurred content in background */}
      {children && (
        <div className="blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      )}

      {/* Locked overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-dark-900/80 to-dark-900/90 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-navy-100/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-gold-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-cream-50 mb-4">
            {title}
          </h2>

          {/* Purpose Statement */}
          <p className="text-cream-200 text-lg mb-8 leading-relaxed">
            {purposeStatement}
          </p>

          {/* Description (optional) */}
          {description && (
            <p className="text-cream-300 mb-8">
              {description}
            </p>
          )}

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-8 text-left">
              <p className="text-cream-300 text-sm mb-4">Your membership includes:</p>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-gold-400 mt-1">✓</span>
                    <span className="text-cream-200">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upgrade Button */}
          <button
            onClick={onUpgradeClick}
            className="w-full px-6 py-3 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors"
          >
            {upgradeCTAText}
          </button>

          {/* Optional: Subtle hint */}
          <p className="text-cream-400 text-xs mt-6">
            Join thousands building intentional lives.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LOCKED BADGE
// ============================================================================

interface LockedBadgeProps {
  variant?: 'overlay' | 'corner' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * LockedBadge
 * 
 * Small visual indicator that content is locked.
 * Used on cards, list items, etc.
 * 
 * Variants:
 * - overlay: Full content with overlay
 * - corner: Small badge in corner
 * - inline: Inline text indicator
 */
export const LockedBadge: React.FC<LockedBadgeProps> = ({
  variant = 'corner',
  size = 'md',
}) => {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1 text-cream-400 text-sm">
        <Lock className="w-3 h-3" />
        <span>Locked</span>
      </span>
    );
  }

  if (variant === 'corner') {
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="absolute top-2 right-2 p-1.5 bg-dark-900/80 rounded-full">
        <Lock className={`${iconSizes[size]} text-gold-400`} strokeWidth={2} />
      </div>
    );
  }

  return null;
};

// ============================================================================
// PREVIEW CONTENT
// ============================================================================

interface PreviewContentProps {
  title: string;
  content: string;
  previewPercentage: number;
  onUpgradeClick: () => void;
}

/**
 * PreviewContent
 * 
 * Shows preview of content (e.g., first 15% of notes).
 * Content fades to indicate it continues.
 * Upgrade button appears below preview.
 */
export const PreviewContent: React.FC<PreviewContentProps> = ({
  title,
  content,
  previewPercentage,
  onUpgradeClick,
}) => {
  const charCount = Math.ceil(content.length * (previewPercentage / 100));
  const previewText = content.substring(0, charCount);
  const hasMore = charCount < content.length;

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-cream-50 mb-4">{title}</h3>

      <div className="relative">
        {/* Preview text */}
        <p
          className={`text-cream-200 leading-relaxed ${
            hasMore ? 'pb-8' : ''
          }`}
        >
          {previewText}
          {hasMore && <span className="text-cream-400">...</span>}
        </p>

        {/* Fade effect */}
        {hasMore && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-dark-900" />
        )}
      </div>

      {/* Upgrade prompt */}
      {hasMore && (
        <div className="mt-6 p-4 bg-navy-100/10 rounded border border-navy-400/20">
          <p className="text-cream-300 text-sm mb-3">
            This preview shows the first {previewPercentage}% of the content.
          </p>
          <button
            onClick={onUpgradeClick}
            className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors"
          >
            Read Full Content
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// LOCKED STEPS (FOR CHALLENGES)
// ============================================================================

interface Step {
  stepNumber: number;
  title: string;
  content: string;
}

interface LockedStepsProps {
  steps: Step[];
  visibleSteps: number;
  onUpgradeClick: () => void;
}

/**
 * LockedSteps
 * 
 * Shows visible steps in full, others as locked tiles.
 * Used for challenges/prompts.
 */
export const LockedSteps: React.FC<LockedStepsProps> = ({
  steps,
  visibleSteps,
  onUpgradeClick,
}) => {
  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const isVisible = step.stepNumber <= visibleSteps;

        if (isVisible) {
          return (
            <div
              key={step.stepNumber}
              className="p-4 rounded border border-gold-400/30 bg-navy-100/10"
            >
              <h4 className="text-lg font-bold text-gold-400 mb-2">
                Step {step.stepNumber}: {step.title}
              </h4>
              <p className="text-cream-200">{step.content}</p>
            </div>
          );
        }

        return (
          <div
            key={step.stepNumber}
            className="p-4 rounded border border-navy-400/20 bg-dark-800 opacity-60 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={onUpgradeClick}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-cream-400">
                Step {step.stepNumber}: {step.title}
              </h4>
              <Lock className="w-5 h-5 text-cream-400" />
            </div>
            <p className="text-cream-400 text-sm mt-2">Unlock to continue</p>
          </div>
        );
      })}

      {/* Upgrade CTA */}
      {visibleSteps < steps.length && (
        <div className="mt-6 p-4 bg-navy-100/10 rounded border border-navy-400/20">
          <p className="text-cream-300 mb-3">
            Unlock all {steps.length} steps to complete this challenge.
          </p>
          <button
            onClick={onUpgradeClick}
            className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors"
          >
            Upgrade to App Member
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SIGN IN REQUIRED
// ============================================================================

interface SignInRequiredProps {
  title?: string;
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

/**
 * SignInRequired
 * 
 * Prompt for user to sign in/sign up.
 * Not aggressive, clear call-to-action.
 */
export const SignInRequired: React.FC<SignInRequiredProps> = ({
  title = 'Sign In to Access',
  onSignInClick,
  onSignUpClick,
}) => {
  return (
    <div className="flex items-center justify-center min-h-96 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 rounded">
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-cream-50 mb-4">{title}</h2>

        <p className="text-cream-300 mb-8">
          Create an account to access Tea Time Network content and tools.
        </p>

        <div className="space-y-3">
          <button
            onClick={onSignUpClick}
            className="w-full px-6 py-3 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors"
          >
            Create Account
          </button>

          <button
            onClick={onSignInClick}
            className="w-full px-6 py-3 bg-navy-500 hover:bg-navy-600 text-cream-50 font-bold rounded transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UPGRADE PROMPT
// ============================================================================

interface UpgradePromptProps {
  reason: 'upgrade_required' | 'sign_in_required' | 'admin_required';
  onUpgradeClick: () => void;
  onSignInClick?: () => void;
}

/**
 * UpgradePrompt
 * 
 * Contextual upgrade/sign-in prompt.
 * Used in inline scenarios where full locked content is too much.
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  reason,
  onUpgradeClick,
  onSignInClick,
}) => {
  if (reason === 'sign_in_required') {
    return (
      <div className="p-4 bg-navy-100/10 rounded border border-navy-400/20 text-center">
        <p className="text-cream-300 mb-3">
          Sign in to unlock this content.
        </p>
        <button
          onClick={onSignInClick}
          className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors text-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (reason === 'admin_required') {
    return (
      <div className="p-4 bg-teal-400/20 rounded border border-teal-400/40 text-center">
        <p className="text-teal-200 text-sm">
          Admin access required for this feature.
        </p>
      </div>
    );
  }

  // upgrade_required
  return (
    <div className="p-4 bg-navy-100/10 rounded border border-navy-400/20">
      <p className="text-cream-300 text-sm mb-3">
        This is where the structure lives. Unlock full access.
      </p>
      <button
        onClick={onUpgradeClick}
        className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors"
      >
        Upgrade to App Member
      </button>
    </div>
  );
};

export default {
  LockedContent,
  LockedBadge,
  PreviewContent,
  LockedSteps,
  SignInRequired,
  UpgradePrompt,
};
