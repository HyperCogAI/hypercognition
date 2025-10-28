import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CyberButton } from '@/components/ui/cyber-button';
import { Check } from 'lucide-react';

interface Validator {
  id: string;
  name: string;
  commission: string;
  apy: string;
  reliability: number;
  totalStake: string;
}

const validators: Validator[] = [
  {
    id: '1',
    name: 'Solana Foundation',
    commission: '5%',
    apy: '7.1%',
    reliability: 99.9,
    totalStake: '$45M',
  },
  {
    id: '2',
    name: 'Marinade Finance',
    commission: '6%',
    apy: '6.9%',
    reliability: 99.8,
    totalStake: '$38M',
  },
  {
    id: '3',
    name: 'Everstake',
    commission: '7%',
    apy: '6.7%',
    reliability: 99.7,
    totalStake: '$32M',
  },
  {
    id: '4',
    name: 'Chorus One',
    commission: '8%',
    apy: '6.5%',
    reliability: 99.6,
    totalStake: '$28M',
  },
];

export const SolanaValidators = () => {
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Select a Validator</h3>
        <p className="text-sm text-muted-foreground">
          Delegate your stake to trusted validators on the Solana network
        </p>
      </div>

      <div className="space-y-3">
        {validators.map((validator) => (
          <Card 
            key={validator.id}
            className={`cursor-pointer transition-all ${
              selectedValidator === validator.id 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedValidator(validator.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{validator.name}</CardTitle>
                    {selectedValidator === validator.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <CardDescription className="text-sm mt-1">
                    Commission: {validator.commission} | APY: {validator.apy}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Reliability</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{validator.reliability}%</p>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      High
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Stake</p>
                  <p className="font-semibold">{validator.totalStake}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedValidator && (
        <div className="flex gap-3">
          <CyberButton className="flex-1" disabled>
            Coming Soon
          </CyberButton>
          <CyberButton 
            variant="outline" 
            className="flex-1"
            onClick={() => setSelectedValidator(null)}
          >
            Clear Selection
          </CyberButton>
        </div>
      )}
    </div>
  );
};
