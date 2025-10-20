import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UserPlus, AlertCircle } from "lucide-react";
import { useTwitterKOLWatchlists } from "@/hooks/useTwitterKOLWatchlists";
import { useTwitterKOLAccounts } from "@/hooks/useTwitterKOLAccounts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function KOLAccountManager() {
  const { watchlists } = useTwitterKOLWatchlists();
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("");
  const [username, setUsername] = useState("");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const { accounts, addAccount, removeAccount, isAdding } = useTwitterKOLAccounts(selectedWatchlist);

  const watchlist = watchlists?.find(w => w.id === selectedWatchlist);
  const isPlatformMode = watchlist?.access_mode === 'platform_shared';
  const accountLimit = isPlatformMode ? 10 : undefined;
  const isAtLimit = accountLimit && accounts && accounts.length >= accountLimit;

  const handleAdd = () => {
    if (!selectedWatchlist || !username) return;
    
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    addAccount({
      watchlist_id: selectedWatchlist,
      twitter_username: cleanUsername,
      priority,
    });
    setUsername("");
    setPriority('medium');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KOL Accounts</CardTitle>
          <CardDescription>
            Add and manage Twitter KOL accounts to monitor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watchlist-select">Select Watchlist</Label>
            <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
              <SelectTrigger id="watchlist-select">
                <SelectValue placeholder="Choose a watchlist" />
              </SelectTrigger>
              <SelectContent>
                {watchlists?.map((watchlist) => (
                  <SelectItem key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWatchlist && (
            <>
              {isPlatformMode && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Platform mode: You can add up to {accountLimit} KOL accounts. 
                    Currently using: {accounts?.length || 0}/{accountLimit}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="username">Twitter Username</Label>
                  <Input
                    id="username"
                    placeholder="@username or username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleAdd} 
                disabled={!username || isAdding || isAtLimit}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isAtLimit ? 'Account Limit Reached' : 'Add KOL Account'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {selectedWatchlist && accounts && accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              KOL Accounts in {watchlist?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <a 
                        href={`https://twitter.com/${account.twitter_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{account.twitter_username}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          account.priority === 'high' ? 'default' : 
                          account.priority === 'medium' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {account.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {account.last_checked_at 
                        ? new Date(account.last_checked_at).toLocaleString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
