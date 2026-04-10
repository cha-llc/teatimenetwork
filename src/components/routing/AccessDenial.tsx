import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

interface AccessDenialProps {
  title: string;
  message: string;
  showAuthLink?: boolean;
  actionText?: string;
  onAction?: () => void;
}

/**
 * AccessDenial - Calm, direct messaging for access restrictions
 * No guilt language. No aggressive pressure.
 * Human, clear, supportive tone.
 */
const AccessDenial: React.FC<AccessDenialProps> = ({
  title,
  message,
  showAuthLink = false,
  actionText = 'Go back',
  onAction
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C9885]/10 via-white to-[#F4A460]/10 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-[#7C9885]/20 to-[#F4A460]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Lock className="w-12 h-12 text-[#7C9885]/60" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Auth Link */}
        {showAuthLink && (
          <div className="mb-8 p-4 bg-[#7C9885]/10 rounded-2xl border border-[#7C9885]/20">
            <p className="text-sm text-gray-700 mb-4">
              Don't have an account yet? Create one to get started.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/?signin=true')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/?signup=true')}
                className="flex-1 px-4 py-3 border border-[#7C9885] text-[#7C9885] rounded-xl font-medium hover:bg-[#7C9885]/5 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-2 text-[#7C9885] hover:text-[#5a7a64] font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {actionText}
        </button>
      </div>
    </div>
  );
};

export default AccessDenial;
