import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";


interface ChainOverride {
  id: string;
  symbol: string | null;
  coingecko_id: string | null;
  primary_chain: string;
  liquidity_chain: string | null;
  contract_address: string | null;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
}

export default function ChainOverrides() {
  const [overrides, setOverrides] = useState<ChainOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<ChainOverride | null>(null);
  
  const [formData, setFormData] = useState({
    symbol: "",
    coingecko_id: "",
    primary_chain: "",
    liquidity_chain: "",
    contract_address: "",
    notes: "",
  });

  useEffect(() => {
    fetchOverrides();
  }, []);

  const fetchOverrides = async () => {
    try {
      const { data, error } = await supabase
        .from("token_chain_overrides")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setOverrides(data || []);
    } catch (error: any) {
      toast.error("Failed to load overrides: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOverride) {
        const { error } = await supabase
          .from("token_chain_overrides")
          .update({
            symbol: formData.symbol || null,
            coingecko_id: formData.coingecko_id || null,
            primary_chain: formData.primary_chain,
            liquidity_chain: formData.liquidity_chain || null,
            contract_address: formData.contract_address || null,
            notes: formData.notes || null,
          })
          .eq("id", editingOverride.id);

        if (error) throw error;
        toast.success("Override updated successfully");
      } else {
        const { error } = await supabase
          .from("token_chain_overrides")
          .insert({
            symbol: formData.symbol || null,
            coingecko_id: formData.coingecko_id || null,
            primary_chain: formData.primary_chain,
            liquidity_chain: formData.liquidity_chain || null,
            contract_address: formData.contract_address || null,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success("Override created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchOverrides();
    } catch (error: any) {
      toast.error("Failed to save override: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this override?")) return;

    try {
      const { error } = await supabase
        .from("token_chain_overrides")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      toast.success("Override deleted successfully");
      fetchOverrides();
    } catch (error: any) {
      toast.error("Failed to delete override: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: "",
      coingecko_id: "",
      primary_chain: "",
      liquidity_chain: "",
      contract_address: "",
      notes: "",
    });
    setEditingOverride(null);
  };

  const handleEdit = (override: ChainOverride) => {
    setEditingOverride(override);
    setFormData({
      symbol: override.symbol || "",
      coingecko_id: override.coingecko_id || "",
      primary_chain: override.primary_chain,
      liquidity_chain: override.liquidity_chain || "",
      contract_address: override.contract_address || "",
      notes: override.notes || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chain Overrides</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Override
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOverride ? "Edit Override" : "Add New Override"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      placeholder="e.g., NEAR"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coingecko_id">CoinGecko ID</Label>
                    <Input
                      id="coingecko_id"
                      value={formData.coingecko_id}
                      onChange={(e) => setFormData({ ...formData, coingecko_id: e.target.value })}
                      placeholder="e.g., near"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_chain">Primary Chain *</Label>
                    <Input
                      id="primary_chain"
                      value={formData.primary_chain}
                      onChange={(e) => setFormData({ ...formData, primary_chain: e.target.value })}
                      placeholder="e.g., NEAR"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="liquidity_chain">Liquidity Chain</Label>
                    <Input
                      id="liquidity_chain"
                      value={formData.liquidity_chain}
                      onChange={(e) => setFormData({ ...formData, liquidity_chain: e.target.value })}
                      placeholder="e.g., Ethereum"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contract_address">Contract Address</Label>
                  <Input
                    id="contract_address"
                    value={formData.contract_address}
                    onChange={(e) => setFormData({ ...formData, contract_address: e.target.value })}
                    placeholder="Optional contract address"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingOverride ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>CoinGecko ID</TableHead>
                  <TableHead>Primary Chain</TableHead>
                  <TableHead>Liquidity Chain</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No overrides found. Click "Add Override" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  overrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell className="font-mono">{override.symbol || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{override.coingecko_id || "-"}</TableCell>
                      <TableCell className="font-semibold">{override.primary_chain}</TableCell>
                      <TableCell>{override.liquidity_chain || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {override.notes || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(override.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(override)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(override.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
}
