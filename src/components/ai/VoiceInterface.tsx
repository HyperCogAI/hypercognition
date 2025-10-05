import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { 
  Mic, 
  MicOff, 
  MessageCircle, 
  Send, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  Loader2,
  Phone,
  PhoneOff
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentTranscriptRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    switch (event.type) {
      case 'connection.established':
        console.log('Connection established');
        break;
        
      case 'session.created':
        console.log('Session created');
        addMessage('assistant', '👋 Hi! I\'m your AI Trading Assistant. I can help you with market analysis, trading advice, and navigating the platform. How can I assist you today?');
        break;
        
      case 'response.audio.delta':
        if (audioEnabled) {
          setIsSpeaking(true);
          onSpeakingChange?.(true);
        }
        break;
        
      case 'response.audio.done':
        setIsSpeaking(false);
        onSpeakingChange?.(false);
        break;
        
      case 'response.audio_transcript.delta':
        // Accumulate transcript deltas
        currentTranscriptRef.current += event.delta;
        break;
        
      case 'response.audio_transcript.done':
        // Add complete transcript as assistant message
        if (currentTranscriptRef.current.trim()) {
          addMessage('assistant', currentTranscriptRef.current.trim());
          currentTranscriptRef.current = '';
        }
        break;
        
      case 'input_audio_buffer.speech_started':
        setIsListening(true);
        break;
        
      case 'input_audio_buffer.speech_stopped':
        setIsListening(false);
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        // Add user's spoken message
        if (event.transcript) {
          addMessage('user', event.transcript);
        }
        break;
        
      case 'response.function_call_arguments.delta':
        console.log('Function call delta:', event);
        break;
        
      case 'response.function_call_arguments.done':
        console.log('Function call done:', event);
        break;
        
      case 'error':
        console.error('OpenAI error:', event);
        toast({
          title: "AI Error",
          description: event.error?.message || 'An error occurred',
          variant: "destructive",
        });
        break;
        
      default:
        console.log('Unhandled event type:', event.type);
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice interface is ready. You can now speak or type your questions.",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    onSpeakingChange?.(false);
    
    toast({
      title: "Disconnected",
      description: "Voice interface has been disconnected.",
    });
  };

  const sendTextMessage = async () => {
    if (!textInput.trim() || !chatRef.current) return;
    
    const message = textInput.trim();
    addMessage('user', message);
    setTextInput('');
    
    try {
      await chatRef.current.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col backdrop-blur-md border border-border/50 shadow-xl">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Trading Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected && (
              <>
                <Badge variant={isListening ? "default" : "secondary"} className="text-xs bg-card/40 border-border/40">
                  <Mic className="w-3 h-3 mr-1" />
                  {isListening ? 'Listening' : 'Idle'}
                </Badge>
                <Badge variant={isSpeaking ? "default" : "secondary"} className="text-xs bg-card/40 border-border/40">
                  <Volume2 className="w-3 h-3 mr-1" />
                  {isSpeaking ? 'Speaking' : 'Quiet'}
                </Badge>
              </>
            )}
            <Badge variant={isConnected ? "default" : "secondary"} className="bg-card/40 border-border/40">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        {/* Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          <div className="space-y-4">
            {messages.length === 0 && !isConnected && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Connect to start chatting with your AI Trading Assistant</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-3 backdrop-blur-sm shadow-sm transition-all ${
                    message.type === 'assistant'
                      ? 'bg-card/40 border border-border/30'
                      : 'bg-gradient-to-br from-primary/80 to-primary/60 text-primary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="flex-shrink-0 space-y-3">
          {/* Connection Controls */}
          <div className="flex justify-center gap-2">
            {!isConnected ? (
              <Button 
                onClick={startConversation}
                disabled={isConnecting}
                className="rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all duration-300"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="outline"
                className="rounded-full border border-border/40 bg-card/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Conversation
              </Button>
            )}
            
            {isConnected && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
                title={audioEnabled ? 'Mute audio' : 'Enable audio'}
                className="rounded-full border border-border/40 bg-card/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300"
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {/* Text Input */}
          {isConnected && (
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or speak..."
                className="flex-1 rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm focus:border-primary/50 transition-colors"
                disabled={!isConnected}
              />
              <Button
                onClick={sendTextMessage}
                disabled={!textInput.trim() || !isConnected}
                size="icon"
                className="rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceInterface;