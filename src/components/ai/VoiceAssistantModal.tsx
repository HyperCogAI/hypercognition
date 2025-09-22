import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VoiceInterface from './VoiceInterface';
import { Mic, MessageCircle } from 'lucide-react';

interface VoiceAssistantModalProps {
  children?: React.ReactNode;
  selectedAgent?: string;
  portfolio?: any;
  marketData?: any;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  children,
  selectedAgent,
  portfolio,
  marketData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice Assistant
            {isSpeaking && (
              <Badge variant="default" className="bg-green-500 text-white text-xs">
                Speaking
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Trading Assistant
            <Badge variant="outline" className="ml-2">
              Real-time Audio
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <VoiceInterface 
            onSpeakingChange={setIsSpeaking}
          />
        </div>
        
        <div className="text-sm text-muted-foreground mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Tips for Voice Interaction:
          </h4>
          <ul className="space-y-1 text-xs">
            <li>• Speak clearly and wait for the assistant to finish before speaking again</li>
            <li>• Ask about market trends, portfolio analysis, or trading strategies</li>
            <li>• You can switch between voice and text input anytime</li>
            <li>• Use "mute" button to disable audio responses if needed</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistantModal;