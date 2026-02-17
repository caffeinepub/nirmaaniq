import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import DailyLogEntryPage from './pages/DailyLogEntryPage';
import PlanningPage from './pages/PlanningPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import MyProfilePage from './pages/MyProfilePage';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function AuthenticatedLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (!identity) {
    throw redirect({ to: '/login' });
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    throw redirect({ to: '/register' });
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/projects',
  component: ProjectsPage,
});

const dailyLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/daily-logs',
  component: DailyLogEntryPage,
});

const planningRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/planning',
  component: PlanningPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/reports',
  component: ReportsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/profile',
  component: MyProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    projectsRoute,
    dailyLogsRoute,
    planningRoute,
    analyticsRoute,
    reportsRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
