# TeaTimeNetworkApp



A modern habit tracking and wellness application built with React, TypeScript, and Vite.

## Features

- 🍵 **Habit Tracking** - Track daily habits with streaks and progress visualization
- 📊 **Analytics Dashboard** - View completion trends, category breakdowns, and insights
- 🎮 **Gamification** - Earn achievements, badges, and compete on leaderboards
- 👥 **Accountability Partners** - Connect with friends for mutual support
- 🧠 **AI Coach** - Get personalized habit suggestions and mood tracking
- 🏆 **Challenges** - Join community challenges and team competitions
- 🌐 **Community Hubs** - Connect with like-minded habit builders
- 🔗 **IoT Integration** - Connect smart devices for automated habit tracking
- 🧬 **Habit Genome** - Discover your unique habit DNA profile

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand, React Context
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Payments**: Stripe integration
- **Testing**: Vitest, React Testing Library, MSW

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/cha-llc/TeaTimeNetworkApp.git
cd TeaTimeNetworkApp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage

# Linting
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui base components
│   ├── dashboard/   # Dashboard-specific components
│   ├── landing/     # Landing page components
│   └── ...          # Feature-specific components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── contexts/        # React Context providers
├── stores/          # Zustand stores
├── lib/             # Utility functions and configs
└── test/            # Test setup and utilities
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by CHA LLC.

## Support

For support, email support@teatimenetwork.app or join our community hub.
