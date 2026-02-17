import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Briefcase, Building2, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getRoleLabel } from '../lib/roles';

export default function MyProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
      setPhone(userProfile.phone);
      setDesignation(userProfile.designation);
      setCompanyName(userProfile.companyName);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !designation.trim() || !companyName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!userProfile) {
      toast.error('Profile not loaded');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        companyName: companyName.trim(),
        role: userProfile.role,
        assignedProject: userProfile.assignedProject,
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Save profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    window.open('https://identity.ic0.app/', '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="shadow-card max-w-md">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone Number
              </Label>
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
              <Label htmlFor="designation" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Designation
              </Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g., Civil Engineer, Project Lead"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company Name
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Role
              </Label>
              <div className="p-3 rounded-lg border bg-muted/50">
                <span className="text-sm font-medium">{getRoleLabel(userProfile.role)}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Your role is managed by administrators
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saveProfile.isPending} className="flex-1">
                {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleChangePassword}
                className="flex items-center gap-2"
              >
                Change Password
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
