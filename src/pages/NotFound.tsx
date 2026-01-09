import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Templates', href: '/templates', icon: Search },
    { label: 'Challenges', href: '/challenges', icon: Search },
    { label: 'Analytics', href: '/analytics', icon: Search },
    { label: 'Community', href: '/community', icon: Search },
    { label: 'Help Center', href: '/help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <SEOHead 
        title="Page Not Found | Tea Time Network"
        description="The page you're looking for doesn't exist. Return to Tea Time Network to continue building better habits."
        noIndex={true}
      />
      
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[#7C9885]/20 to-[#F4A460]/20 rounded-full mb-6">
            <span className="text-6xl" role="img" aria-label="Lost tea cup">🍵</span>
          </div>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-[#7C9885] to-[#F4A460] bg-clip-text text-transparent mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for seems to have wandered off. 
            Don't worry, let's get you back on track with your habits!
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link 
              to="/" 
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#7C9885]/20 transition-all"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Popular Pages */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Or try one of these popular pages:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {popularPages.map((page, i) => (
                <Link
                  key={i}
                  to={page.href}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7C9885] hover:bg-[#7C9885]/10 rounded-lg transition-colors"
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          If you believe this is an error, please{' '}
          <a href="mailto:support@teatimenetwork.app" className="text-[#7C9885] hover:underline">

            contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
