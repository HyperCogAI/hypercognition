import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomerSupport } from '@/hooks/useCustomerSupport';
import { 
  Ticket, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Star,
  Search,
  Filter,
  Send,
  User,
  UserCheck,
  Timer,
  Target
} from 'lucide-react';
import { format } from 'date-fns';

export const SupportAgentDashboard = () => {
  const {
    loading,
    tickets,
    agents,
    sendMessage,
    fetchTicketMessages,
    getTicketMessages
  } = useCustomerSupport();

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentAgent = agents[0];

  const handleSendMessage = async () => {
    if (!selectedTicket || !messageInput.trim()) return;
    
    try {
      await sendMessage(selectedTicket, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = ticketFilter === 'all' || ticket.status === ticketFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedTicketData = selectedTicket ? tickets.find(t => t.id === selectedTicket) : null;
  const ticketMessages = selectedTicket ? getTicketMessages(selectedTicket) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
            Support Agent{" "}
            <span className="text-white">
              Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground">Manage customer support tickets and interactions</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <UserCheck className="h-4 w-4" />
            {currentAgent?.name || 'Agent'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAgent?.avg_response_time || 45}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAgent?.rating || 4.8}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ticket Queue</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Select value={ticketFilter} onValueChange={setTicketFilter}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicket === ticket.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedTicket(ticket.id);
                        fetchTicketMessages(ticket.id);
                      }}
                    >
                      <h3 className="font-medium text-sm line-clamp-2">{ticket.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-1">#{ticket.id.slice(-6)}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>{format(new Date(ticket.created_at), 'MMM d')}</span>
                        <Badge variant="outline" className="text-xs">{ticket.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedTicketData ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">{selectedTicketData.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ticket #{selectedTicketData.id} • {format(new Date(selectedTicketData.created_at), 'MMM d, yyyy')}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{selectedTicketData.description}</p>
                    </div>
                    {ticketMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_type === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type response..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to start working</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};