import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit } from "lucide-react";
import { useTelegramKOLWatchlists } from "@/hooks/useTelegramKOLWatchlists";

export function TelegramWatchlistManager() {
  const { watchlists, createWatchlist, updateWatchlist, deleteWatchlist, isLoading } = useTelegramKOLWatchlists();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (editingId) {
      updateWatchlist({ id: editingId, updates: { name, description } });
    } else {
      createWatchlist({ name, description });
    }
    setIsDialogOpen(false);
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (watchlist: any) => {
    setEditingId(watchlist.id);
    setName(watchlist.name);
    setDescription(watchlist.description || "");
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Watchlists</CardTitle>
            <CardDescription>Organize Telegram channels into watchlists</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setName(""); setDescription(""); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Create"} Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alpha Channels"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="High-quality crypto alpha channels"
                  />
                </div>
                <Button onClick={handleSubmit} disabled={!name}>
                  {editingId ? "Update" : "Create"} Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading watchlists...</p>
        ) : watchlists.length === 0 ? (
          <p className="text-muted-foreground">No watchlists yet. Create one to get started.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlists.map((watchlist) => (
                <TableRow key={watchlist.id}>
                  <TableCell className="font-medium">{watchlist.name}</TableCell>
                  <TableCell className="text-muted-foreground">{watchlist.description}</TableCell>
                  <TableCell>
                    <Switch
                      checked={watchlist.is_active}
                      onCheckedChange={(checked) => 
                        updateWatchlist({ id: watchlist.id, updates: { is_active: checked } })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(watchlist)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteWatchlist(watchlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
