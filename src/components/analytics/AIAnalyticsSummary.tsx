import React, { useState } from 'react';
import { Brain, Sparkles, RefreshCw, Volume2, VolumeX, Copy, Check } from 'lucide-react';

interface AIAnalyticsSummaryProps {
  summary: string | null;
  loading: boolean;
  onGenerate: () => void;
}

const AIAnalyticsSummary: React.FC<AIAnalyticsSummaryProps> = ({
  summary,
  loading,
  onGenerate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSpeak = () => {
    if (!summary) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">AI-Narrated Summary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personalized insights from your data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary && (
            <>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={isPlaying ? 'Stop' : 'Listen'}
              >
                {isPlaying ? (
                  <VolumeX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </>
          )}
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : summary ? 'Refresh' : 'Generate'}
          </button>
        </div>
      </div>

      {summary ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
          <Brain className="w-12 h-12 text-purple-300 dark:text-purple-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Click "Generate" to get an AI-powered summary of your habit analytics
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAnalyticsSummary;
