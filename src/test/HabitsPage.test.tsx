import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import HabitsPage from '@/pages/HabitsPage';
import { useHabitsStore } from '@/stores/habitsStore';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import React, { createContext, useContext } from 'react';

// Mock AuthContext
const mockAuthContext = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  profile: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: {},
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      {children}
      <Toaster />
    </ThemeProvider>
  </BrowserRouter>
);

// Setup MSW server
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  // Reset store state
  useHabitsStore.getState().reset();
});
afterAll(() => server.close());



// Helper to setup initial store state
const setupStore = () => {
  const store = useHabitsStore.getState();
  store._setHabits([
    {
      id: '1',
      user_id: 'test-user-id',
      name: 'Meditate',
      description: '10 minutes of mindfulness',
      category: 'mindfulness',
      frequency: 'daily',
      target_days: [0, 1, 2, 3, 4, 5, 6],
      reminder_time: '07:00',
      color: '#8B5CF6',
      icon: 'brain',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]);
  store._setStreaks({
    '1': {
      habit_id: '1',
      current_streak: 0,
      longest_streak: 5,
      last_completed_date: null,
    },
  });
  store._setCompletions([]);
  // Set loading to false so component renders habits
  useHabitsStore.setState({ loading: false });
};

describe('HabitsPage', () => {
  beforeEach(() => {
    setupStore();
  });

  test('optimistic update: completes habit, updates streak visually immediately', async () => {
    // Setup handler that delays response
    server.use(
      http.post('/api/habits/1/complete', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ success: true, streak: 1 });
      })
    );

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    
    fireEvent.click(completeButton);
    
    // Immediate optimistic UI check (no await) - streak should update immediately
    expect(screen.getByText(/streak: 1/i)).toBeInTheDocument();
  });

  test('successful completion: API succeeds, state persists after refetch', async () => {
    server.use(
      http.post('/api/habits/1/complete', () => {
        return HttpResponse.json({ success: true, streak: 2, completionId: 'completion-1' });
      })
    );

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    fireEvent.click(completeButton);

    // Wait for API response and state update
    await waitFor(() => {
      expect(screen.getByText(/streak: 2/i)).toBeInTheDocument();
    });

    // Verify button shows completed state
    expect(completeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('error handling: API fails, shows toast/error and reverts optimistic update', async () => {
    server.use(
      http.post('/api/habits/1/complete', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    
    // Initial streak is 0
    expect(screen.getByText(/streak: 0/i)).toBeInTheDocument();
    
    fireEvent.click(completeButton);
    
    // Optimistic update shows streak: 1 immediately
    expect(screen.getByText(/streak: 1/i)).toBeInTheDocument();

    // Wait for error and rollback
    await waitFor(() => {
      // Error message should appear
      expect(screen.getByText(/failed to complete/i)).toBeInTheDocument();
    });

    // Streak should revert back to 0
    await waitFor(() => {
      expect(screen.getByText(/streak: 0/i)).toBeInTheDocument();
    });
  });

  test('prevents double completion: button disabled after click until resolved', async () => {
    let resolveRequest: () => void;
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    server.use(
      http.post('/api/habits/1/complete', async () => {
        await requestPromise;
        return HttpResponse.json({ success: true, streak: 1 });
      })
    );

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    
    fireEvent.click(completeButton);
    
    // Button should be disabled (loading state)
    expect(completeButton).toBeDisabled();
    expect(completeButton).toHaveAttribute('aria-busy', 'true');

    // Resolve the request
    resolveRequest!();

    // Wait for button to be enabled again
    await waitFor(() => {
      expect(completeButton).not.toBeDisabled();
    });
  });

  test('accessibility: complete button has proper aria labels', () => {
    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    
    expect(completeButton).toHaveAttribute('aria-label', 'Complete habit: Meditate');
    expect(completeButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('accessibility: completed habit button shows aria-pressed true', async () => {
    // Setup with completed habit
    const today = new Date().toISOString().split('T')[0];
    useHabitsStore.getState()._setCompletions([
      {
        id: 'completion-1',
        habit_id: '1',
        user_id: 'test-user-id',
        completed_date: today,
        notes: null,
      },
    ]);
    useHabitsStore.getState()._setStreaks({
      '1': {
        habit_id: '1',
        current_streak: 1,
        longest_streak: 5,
        last_completed_date: today,
      },
    });

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    expect(completeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('displays loading state while fetching habits', () => {
    // Set loading to true
    useHabitsStore.setState({ loading: true, habits: [] });

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('displays empty state when no habits exist', () => {
    useHabitsStore.setState({ loading: false, habits: [] });

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    expect(screen.getByText(/no habits yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first habit/i)).toBeInTheDocument();
  });

  test('progress bar updates when habit is completed', async () => {
    server.use(
      http.post('/api/habits/1/complete', () => {
        return HttpResponse.json({ success: true, streak: 1 });
      })
    );

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    // Initially 0/1 completed
    expect(screen.getByText('0 / 1')).toBeInTheDocument();

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    fireEvent.click(completeButton);

    // Should update to 1/1
    await waitFor(() => {
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });
  });

  test('uncomplete habit reverts completion state', async () => {
    // Setup with completed habit
    const today = new Date().toISOString().split('T')[0];
    useHabitsStore.getState()._setCompletions([
      {
        id: 'completion-1',
        habit_id: '1',
        user_id: 'test-user-id',
        completed_date: today,
        notes: null,
      },
    ]);
    useHabitsStore.getState()._setStreaks({
      '1': {
        habit_id: '1',
        current_streak: 1,
        longest_streak: 5,
        last_completed_date: today,
      },
    });

    server.use(
      http.post('/api/habits/1/uncomplete', () => {
        return HttpResponse.json({ success: true });
      })
    );

    render(
      <TestWrapper>
        <HabitsPage />
      </TestWrapper>
    );

    // Initially completed with streak 1
    expect(screen.getByText(/streak: 1/i)).toBeInTheDocument();

    const completeButton = screen.getByRole('button', { name: /complete habit: meditate/i });
    fireEvent.click(completeButton);

    // Should revert to streak 0
    await waitFor(() => {
      expect(screen.getByText(/streak: 0/i)).toBeInTheDocument();
    });
  });
});
