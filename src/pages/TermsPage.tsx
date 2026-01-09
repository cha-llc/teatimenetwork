import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Check, AlertTriangle, CreditCard, Shield, Scale } from 'lucide-react';

const TermsPage: React.FC = () => {
  const lastUpdated = 'December 27, 2025';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7C9885] to-[#F4A460] rounded-xl flex items-center justify-center">
              <span className="text-xl">🍵</span>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">Tea Time Network</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C9885]/10 rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-[#7C9885]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Check className="w-5 h-5 text-[#7C9885]" />
                Agreement to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By accessing or using Tea Time Network ("the Service"), you agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use 
                the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Description of Service
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Tea Time Network is a habit tracking application that helps users build and 
                maintain positive habits. The Service includes features such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                <li>Habit creation and tracking</li>
                <li>Streak monitoring and milestones</li>
                <li>AI-powered coaching and insights (Premium)</li>
                <li>Community challenges and leaderboards</li>
                <li>Push notifications and reminders</li>
                <li>Device integrations (Premium)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Account Registration
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <CreditCard className="w-5 h-5 text-[#7C9885]" />
                Subscription and Payments
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Free Trial</h3>
                  <p>New users receive a 30-day free trial with access to all features. 
                  No credit card is required for the trial.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Subscription Plans</h3>
                  <p>After the trial, you may subscribe to Premium ($4.99/month), Pro ($9.99/month), 
                  or Ultimate ($19.99/month) plans. Subscriptions are billed monthly.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Cancellation</h3>
                  <p>You may cancel your subscription at any time. Your access will continue 
                  until the end of the current billing period.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Refunds</h3>
                  <p>We offer a 30-day money-back guarantee on all paid plans. Contact support 
                  to request a refund.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <AlertTriangle className="w-5 h-5 text-[#7C9885]" />
                Acceptable Use
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Use the Service for any illegal purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Upload malicious code or content</li>
                <li>Impersonate others or misrepresent your identity</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                The Service and its original content, features, and functionality are owned by 
                Tea Time Network and are protected by international copyright, trademark, and 
                other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                User Content
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You retain ownership of any content you create within the Service (habit names, 
                descriptions, notes, etc.). By using the Service, you grant us a license to 
                store and process this content to provide the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Shield className="w-5 h-5 text-[#7C9885]" />
                Disclaimer of Warranties
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                The Service is provided "as is" without warranties of any kind. We do not 
                guarantee that the Service will be uninterrupted, secure, or error-free. 
                The Service is not intended to provide medical, psychological, or professional advice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Scale className="w-5 h-5 text-[#7C9885]" />
                Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To the maximum extent permitted by law, Tea Time Network shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Termination
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We may terminate or suspend your account at any time for violation of these 
                Terms. You may delete your account at any time through the app settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users 
                of significant changes via email or in-app notification. Continued use of the 
                Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Contact
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <p className="mt-2">
                <a 
                  href="mailto:support@teatimenetwork.app" 
                  className="text-[#7C9885] hover:underline"
                >
                  support@teatimenetwork.app
                </a>

              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
