import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useTelegramKOLWatchlists } from "@/hooks/useTelegramKOLWatchlists";
import { useTelegramKOLChannels } from "@/hooks/useTelegramKOLChannels";

export function TelegramChannelManager() {
  const { watchlists } = useTelegramKOLWatchlists();
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>("");
  const [channelUsername, setChannelUsername] = useState("");
  const { channels, addChannel, removeChannel, syncChannel, isLoading } = useTelegramKOLChannels(selectedWatchlistId);

  const handleAddChannel = () => {
    if (channelUsername && selectedWatchlistId) {
      addChannel({ channelUsername, watchlistId: selectedWatchlistId });
      setChannelUsername("");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Channel</CardTitle>
          <CardDescription>
            Add public Telegram channels or groups you've joined
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="watchlist">Watchlist</Label>
            <Select value={selectedWatchlistId} onValueChange={setSelectedWatchlistId}>
              <SelectTrigger id="watchlist">
                <SelectValue placeholder="Select a watchlist" />
              </SelectTrigger>
              <SelectContent>
                {watchlists.map((watchlist) => (
                  <SelectItem key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="channel">Channel Username or Link</Label>
            <Input
              id="channel"
              placeholder="@channelname or t.me/channelname"
              value={channelUsername}
              onChange={(e) => setChannelUsername(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAddChannel}
            disabled={!channelUsername || !selectedWatchlistId}
          >
            Add Channel
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure you've joined the channel in Telegram first! 
              Open Telegram → Search for the channel → Click "Join"
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {selectedWatchlistId && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Monitored Channels</CardTitle>
                <CardDescription>Channels in this watchlist</CardDescription>
              </div>
              <Button onClick={() => syncChannel()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading channels...</p>
            ) : channels.length === 0 ? (
              <p className="text-muted-foreground">No channels added yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{channel.channel_title}</p>
                          <p className="text-sm text-muted-foreground">@{channel.channel_username}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {channel.is_user_member ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Member
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Not Member
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {channel.last_checked_at 
                          ? new Date(channel.last_checked_at).toLocaleString()
                          : "Never"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeChannel(channel.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
