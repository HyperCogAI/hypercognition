import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { Wallet, Mail, Calendar, Edit, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface ProfileViewProps {
  userId?: string;
  onEditClick?: () => void;
  isOwnProfile?: boolean;
}

export function ProfileView({ userId, onEditClick, isOwnProfile = false }: ProfileViewProps) {
  const { profile, isLoading } = useUserProfile(userId);
  const { completionScore, steps } = useProfileCompletion();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 w-24 bg-muted rounded-full" />
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </Card>
    );
  }

  if (!profile) return null;

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || ''} />
            <AvatarFallback className="text-2xl">{getInitials(profile.display_name)}</AvatarFallback>
          </Avatar>

          {isOwnProfile && onEditClick && (
            <Button onClick={onEditClick} variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{profile.display_name}</h2>
              {(profile as any).email_verified && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
            {profile.username && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {(profile as any).wallet_address && (
              <Badge variant="secondary" className="gap-1">
                <Wallet className="h-3 w-3" />
                {((profile as any).wallet_type as string)?.toUpperCase()}
              </Badge>
            )}
            {(profile as any).email && (
              <Badge variant="secondary" className="gap-1">
                <Mail className="h-3 w-3" />
                {(profile as any).email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
          </div>

          {isOwnProfile && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completionScore}%</span>
              </div>
              <Progress value={completionScore} className="h-2" />
              {completionScore < 100 && (
                <p className="text-xs text-muted-foreground">
                  Complete {steps.filter(s => !s.completed).length} more steps to reach 100%
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
