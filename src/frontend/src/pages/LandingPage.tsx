import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, TrendingUp, AlertTriangle, FileText, Heart } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/nirmaaniq-logo.dim_512x128.png" 
              alt="NirmaanIQ" 
              className="h-8 w-auto"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate({ to: '/login' })}>
              Login
            </Button>
            <Button onClick={() => navigate({ to: '/register' })}>
              Register
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Smart Digital Site Logbook with Intelligent Project Insights
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your construction project management with NirmaanIQ's comprehensive digital logbook system. 
            Streamline daily log entries, track productivity in real-time, receive intelligent delay risk alerts, 
            and generate professional Daily Progress Reports (DPR) with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/register' })} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: '/login' })} className="text-lg px-8">
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-lg shadow-card border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Digital Log Entry</h3>
            <p className="text-muted-foreground text-sm">
              Capture daily activities, working hours, labor deployment, and site conditions with structured digital forms.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-card border">
            <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Productivity Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Monitor planned vs actual progress with visual analytics and productivity percentage calculations.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-card border">
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delay Risk Alerts</h3>
            <p className="text-muted-foreground text-sm">
              Receive intelligent alerts when productivity falls below targets with actionable recommendations.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-card border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">DPR Generation</h3>
            <p className="text-muted-foreground text-sm">
              Generate comprehensive Daily Progress Reports with photos, metrics, and export to PDF instantly.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card shadow-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()} NirmaanIQ. Built with <Heart className="h-4 w-4 text-destructive fill-destructive" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
