import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface TradingProfile {
  id: string;
  display_name: string;
  [key: string]: any;
}

interface CopyTradingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trader: TradingProfile;
}

export const CopyTradingDialog: React.FC<CopyTradingDialogProps> = ({ 
  isOpen, 
  onClose, 
  trader 
}) => {
  const [copyPercentage, setCopyPercentage] = useState(10);
  const [maxAmount, setMaxAmount] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [copyBuy, setCopyBuy] = useState(true);
  const [copySell, setCopySell] = useState(true);
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Copy Trading Setup",
      description: `Now copying ${trader.display_name} with ${copyPercentage}% allocation`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy {trader.display_name}</DialogTitle>
          <DialogDescription>
            Configure your copy trading settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="percentage">Copy Percentage (%)</Label>
            <Input
              id="percentage"
              type="number"
              value={copyPercentage}
              onChange={(e) => setCopyPercentage(Number(e.target.value))}
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <Label htmlFor="maxAmount">Max Amount per Trade ($)</Label>
            <Input
              id="maxAmount"
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Optional"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="copyBuy">Copy Buy Orders</Label>
            <Switch id="copyBuy" checked={copyBuy} onCheckedChange={setCopyBuy} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="copySell">Copy Sell Orders</Label>
            <Switch id="copySell" checked={copySell} onCheckedChange={setCopySell} />
          </div>
          
          <Button onClick={handleSubmit} className="w-full">
            Start Copy Trading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};