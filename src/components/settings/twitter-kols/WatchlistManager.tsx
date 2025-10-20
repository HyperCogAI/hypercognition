import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit2, Users } from "lucide-react";
import { useTwitterKOLWatchlists } from "@/hooks/useTwitterKOLWatchlists";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function WatchlistManager() {
  const { watchlists, isLoading, createWatchlist, updateWatchlist, deleteWatchlist, isCreating } = useTwitterKOLWatchlists();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (editingId) {
      updateWatchlist({ 
        id: editingId, 
        updates: { name, description } 
      });
    } else {
      createWatchlist({ name, description, access_mode: 'platform_shared' });
    }
    setOpen(false);
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (watchlist: any) => {
    setEditingId(watchlist.id);
    setName(watchlist.name);
    setDescription(watchlist.description || "");
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Watchlists</CardTitle>
            <CardDescription>
              Organize KOL accounts into watchlists for better monitoring
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingId(null);
                setName("");
                setDescription("");
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Watchlist" : "Create New Watchlist"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Update your watchlist details" : "Create a new watchlist to organize your KOL accounts"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Watchlist Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Crypto VCs, Alpha Callers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this watchlist"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!name || isCreating}>
                  {editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading watchlists...</div>
        ) : !watchlists || watchlists.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No watchlists yet. Create one to get started!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Access Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlists.map((watchlist) => (
                <TableRow key={watchlist.id}>
                  <TableCell className="font-medium">{watchlist.name}</TableCell>
                  <TableCell className="text-muted-foreground">{watchlist.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={watchlist.access_mode === 'personal_api' ? 'default' : 'secondary'}>
                      {watchlist.access_mode === 'personal_api' ? 'Personal API' : 'Platform'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={watchlist.is_active}
                        onCheckedChange={(checked) => 
                          updateWatchlist({ id: watchlist.id, updates: { is_active: checked } })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {watchlist.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(watchlist)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWatchlist(watchlist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
