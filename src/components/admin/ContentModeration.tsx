import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Flag, Eye, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const ContentModeration = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [actionsResult, commentsResult] = await Promise.all([
        supabase
          .from('content_moderation')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('agent_comments')
          .select(`
            *,
            agents (name, symbol),
            profiles (display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (actionsResult.error) throw actionsResult.error;
      if (commentsResult.error) throw commentsResult.error;

      setActions(actionsResult.data || []);
      setComments(commentsResult.data || []);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (
    contentId: string,
    contentType: string,
    action: string,
    reason: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('content_moderation')
        .insert({
          content_id: contentId,
          content_type: contentType,
          action,
          reason,
          moderator_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Content ${action}`,
      });

      await loadData();
    } catch (error) {
      console.error('Error moderating content:', error);
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading moderation data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {actions.filter(a => a.action === 'remove').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {actions.filter(a => a.action === 'flag').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
          <CardDescription>Review and moderate user-generated content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {comment.profiles?.display_name || 'Anonymous'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{comment.agents?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {comment.agents?.symbol}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{comment.content}</div>
                    </TableCell>
                    <TableCell>{comment.likes_count}</TableCell>
                    <TableCell>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateContent(
                            comment.id,
                            'comment',
                            'flag',
                            'Flagged for review'
                          )}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => moderateContent(
                            comment.id,
                            'comment',
                            'remove',
                            'Removed by moderator'
                          )}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Moderation History */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation History</CardTitle>
          <CardDescription>Recent moderation actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="capitalize">{action.content_type}</TableCell>
                    <TableCell>
                      <Badge variant={action.action === 'remove' ? 'destructive' : 'secondary'}>
                        {action.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{action.reason}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{action.moderator_id.slice(0, 8)}...</code>
                    </TableCell>
                    <TableCell>
                      {new Date(action.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
