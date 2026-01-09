import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail, Clock } from 'lucide-react';

const PrivacyPage: React.FC = () => {
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
              <Shield className="w-8 h-8 text-[#7C9885]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Eye className="w-5 h-5 text-[#7C9885]" />
                Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Tea Time Network ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our habit tracking application and related services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Database className="w-5 h-5 text-[#7C9885]" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Account Information</h3>
                  <p>When you create an account, we collect your email address, name, and password (encrypted).</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Habit Data</h3>
                  <p>We store information about your habits, including names, descriptions, completion records, 
                  streaks, and reminder settings.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Usage Data</h3>
                  <p>We collect information about how you interact with our app, including feature usage, 
                  session duration, and device information.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Information</h3>
                  <p>Payment processing is handled by Stripe. We do not store your credit card details 
                  on our servers.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Lock className="w-5 h-5 text-[#7C9885]" />
                How We Protect Your Data
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>All data is encrypted in transit using TLS/SSL</li>
                <li>Passwords are hashed using industry-standard algorithms</li>
                <li>We use secure cloud infrastructure with regular security audits</li>
                <li>Access to user data is restricted to authorized personnel only</li>
                <li>We implement row-level security (RLS) for database access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Globe className="w-5 h-5 text-[#7C9885]" />
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>To provide and maintain our service</li>
                <li>To send you habit reminders and notifications (with your permission)</li>
                <li>To generate AI-powered insights and recommendations</li>
                <li>To improve our app and develop new features</li>
                <li>To communicate with you about updates and support</li>
                <li>To process payments and manage subscriptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Clock className="w-5 h-5 text-[#7C9885]" />
                Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We retain your data for as long as your account is active. If you delete your account, 
                we will delete your personal data within 30 days, except where we are required to 
                retain it for legal purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Disable notifications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Third-Party Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                <li><strong>Supabase</strong> - Database and authentication</li>
                <li><strong>Stripe</strong> - Payment processing</li>
                <li><strong>OpenAI</strong> - AI features (habit analysis and coaching)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <Mail className="w-5 h-5 text-[#7C9885]" />
                Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
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

            <section>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
