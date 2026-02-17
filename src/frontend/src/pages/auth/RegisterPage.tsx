import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { StandardizedRole } from '../../backend';

export default function RegisterPage() {
  const { login, identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<StandardizedRole>(StandardizedRole.site_engineer);

  useEffect(() => {
    if (identity && userProfile) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, userProfile, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !designation.trim() || !companyName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        companyName: companyName.trim(),
        role,
        assignedProject: undefined,
      });
      toast.success('Profile created successfully!');
      navigate({ to: '/dashboard' });
    } catch (error: any) {
      console.error('Save profile error:', error);
      toast.error(error.message || 'Failed to save profile');
    }
  };

  const showProfileSetup = identity && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/assets/generated/nirmaaniq-logo.dim_512x128.png" 
              alt="NirmaanIQ" 
              className="h-10 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
            <p className="text-muted-foreground mt-2">Create your account to manage construction projects</p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>
                Sign in with Internet Identity to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogin} className="w-full" size="lg">
                Sign In with Internet Identity
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => navigate({ to: '/login' })}
                  className="text-primary hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/assets/generated/nirmaaniq-logo.dim_512x128.png" 
              alt="NirmaanIQ" 
              className="h-10 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
            <p className="text-muted-foreground mt-2">Tell us about yourself</p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Please provide your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g., Civil Engineer, Project Lead"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as StandardizedRole)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StandardizedRole.admin}>Admin</SelectItem>
                      <SelectItem value={StandardizedRole.site_engineer}>Site Engineer</SelectItem>
                      <SelectItem value={StandardizedRole.project_manager}>Project Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select your role in the organization
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Creating Profile...' : 'Complete Registration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
