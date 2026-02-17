import { useGetDashboardMetrics, useGetCallerUserProfile, useGetAllProjects } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, ClipboardCheck, TrendingUp, AlertTriangle, Plus, BarChart3, FileText } from 'lucide-react';
import DelayAlertPanel from '../components/dashboard/DelayAlertPanel';
import { isAdmin } from '../lib/roles';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useGetDashboardMetrics();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: projects } = useGetAllProjects();
  const navigate = useNavigate();

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isUserAdmin = userProfile && isAdmin(userProfile.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userProfile?.fullName || 'User'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/daily-logs' })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Daily Log
          </Button>
          {isUserAdmin && (
            <Button variant="outline" onClick={() => navigate({ to: '/projects' })}>
              <Building2 className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalProjects.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Active construction projects</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Log Status</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {metrics?.logStatus.completed ? 'Completed' : 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.logStatus.pending.toString() || '0'} logs pending
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overallProgress.toFixed(1) || '0'}%</div>
            <Progress value={metrics?.overallProgress || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interruptions This Week</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalInterruptionsThisWeek.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Total delays recorded</p>
          </CardContent>
        </Card>
      </div>

      <DelayAlertPanel />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate({ to: '/daily-logs' })}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Add Daily Log
            </Button>
            {isUserAdmin && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate({ to: '/projects' })}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate({ to: '/analytics' })}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate({ to: '/reports' })}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate DPR
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id.toString()}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => navigate({ to: '/projects' })}
                  >
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.location}</p>
                    </div>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No projects yet. {isUserAdmin && 'Create your first project to get started.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
