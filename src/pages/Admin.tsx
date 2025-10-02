import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOHead } from '@/components/seo/SEOHead';
import { Shield, Users, AlertTriangle, FileCheck, Activity, Settings } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { KYCManagement } from '@/components/admin/KYCManagement';
import { ComplianceAlerts } from '@/components/admin/ComplianceAlerts';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { SystemMonitoring } from '@/components/admin/SystemMonitoring';
import { AdminSettings } from '@/components/admin/AdminSettings';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin status using the security definer function
      const { data: adminCheck, error } = await supabase
        .rpc('is_admin');

      if (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(adminCheck === true);
        
        // Get admin role
        if (adminCheck) {
          const { data: roleData } = await supabase
            .rpc('get_current_user_admin_role');
          setAdminRole(roleData);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Admin Dashboard | HyperCognition"
        description="Administrative control panel for managing users, compliance, and system operations"
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Role: <span className="font-semibold text-foreground capitalize">{adminRole}</span>
          </p>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full overflow-x-auto flex lg:grid lg:grid-cols-6 gap-1 scrollbar-hide mb-6">
            <TabsTrigger value="users" className="flex-shrink-0 gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex-shrink-0 gap-2">
              <FileCheck className="h-4 w-4" />
              <span>KYC</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex-shrink-0 gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex-shrink-0 gap-2">
              <Shield className="h-4 w-4" />
              <span>Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex-shrink-0 gap-2">
              <Activity className="h-4 w-4" />
              <span>Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-shrink-0 gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserManagement adminRole={adminRole} />
          </TabsContent>

          <TabsContent value="kyc" className="mt-6">
            <KYCManagement />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceAlerts />
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AdminSettings adminRole={adminRole} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
