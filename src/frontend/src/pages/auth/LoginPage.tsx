import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  useEffect(() => {
    if (loginStatus === 'loginError') {
      toast.error('Login failed. Please try again.');
    }
  }, [loginStatus]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/assets/generated/nirmaaniq-logo.dim_512x128.png" 
            alt="NirmaanIQ" 
            className="h-10 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your construction projects</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Use Internet Identity to securely access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
              size="lg"
            >
              {loginStatus === 'logging-in' ? 'Connecting...' : 'Sign In with Internet Identity'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Don't have an account?{' '}
              <button
                onClick={() => navigate({ to: '/register' })}
                className="text-primary hover:underline"
              >
                Register here
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
