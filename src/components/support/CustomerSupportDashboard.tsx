import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomerSupport } from '@/hooks/useCustomerSupport';
import { 
  Ticket, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Plus, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  Star,
  BookOpen,
  HelpCircle,
  User,
  Calendar,
  Tag,
  Paperclip,
  Users,
  Headphones
} from 'lucide-react';
import { format } from 'date-fns';

export const CustomerSupportDashboard = () => {
  const {
    loading,
    tickets,
    messages,
    agents,
    knowledgeBase,
    createTicket,
    sendMessage,
    fetchTicketMessages,
    rateSupportInteraction,
    searchKnowledgeBase,
    getTicketMessages
  } = useCustomerSupport();

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(knowledgeBase);

  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const,
    tags: [] as string[]
  });

  const handleCreateTicket = async () => {
    if (!newTicketData.subject || !newTicketData.description) return;

    try {
      await createTicket(newTicketData);
      setNewTicketDialog(false);
      setNewTicketData({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
        tags: []
      });
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !messageInput.trim()) return;

    try {
      await sendMessage(selectedTicket, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults(searchKnowledgeBase(query));
    } else {
      setSearchResults(knowledgeBase);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'waiting_for_customer':
        return <MessageCircle className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const openTickets = tickets.filter(t => ['open', 'in_progress', 'waiting_for_customer'].includes(t.status));
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status));
  const selectedTicketData = selectedTicket ? tickets.find(t => t.id === selectedTicket) : null;
  const ticketMessages = selectedTicket ? getTicketMessages(selectedTicket) : [];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
            <Headphones className="h-8 w-8 md:h-10 md:w-10 text-white" />
            Customer Support
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto md:mx-0">
            Get help from our 24/7 support team or find answers in our knowledge base
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Ticket className="h-4 w-4" />
            {openTickets.length} Open Tickets
          </Badge>
          <Dialog open={newTicketDialog} onOpenChange={setNewTicketDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg mx-4">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newTicketData.subject}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newTicketData.category}
                      onValueChange={(value) => setNewTicketData(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTicketData.priority}
                      onValueChange={(value) => setNewTicketData(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    rows={5}
                    value={newTicketData.description}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleCreateTicket} 
                  disabled={!newTicketData.subject || !newTicketData.description || loading}
                  className="w-full"
                >
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <div className="relative">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 bg-background/50 backdrop-blur-sm border border-border/50 p-1 h-auto">
            <TabsTrigger 
              value="tickets"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              My Tickets
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              <span className="hidden sm:inline">Knowledge Base</span>
              <span className="sm:hidden">KB</span>
            </TabsTrigger>
            <TabsTrigger 
              value="live-chat"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              <span className="hidden sm:inline">Live Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contact"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              Contact
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Open Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {openTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No open tickets</p>
                      <p className="text-sm">Create a new ticket if you need help</p>
                    </div>
                  ) : (
                    openTickets.map((ticket) => (
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
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm line-clamp-2">{ticket.subject}</h3>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </div>
                          <span>{format(new Date(ticket.created_at), 'MMM d')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Recently Resolved</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resolvedTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedTicket(ticket.id);
                        fetchTicketMessages(ticket.id);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-2">{ticket.subject}</h3>
                        {ticket.customer_satisfaction_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{ticket.customer_satisfaction_rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          <span className="capitalize">{ticket.status}</span>
                        </div>
                        <span>{format(new Date(ticket.resolved_at || ticket.updated_at), 'MMM d')}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {selectedTicketData ? (
                <Card className="h-[600px] flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="flex-shrink-0 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedTicketData.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ticket #{selectedTicketData.id} • Created {format(new Date(selectedTicketData.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          {getStatusIcon(selectedTicketData.status)}
                          <span className="capitalize">{selectedTicketData.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {selectedTicketData.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedTicketData.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <div className="flex gap-1">
                          {selectedTicketData.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {ticketMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.sender_type === 'customer'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-3 w-3" />
                                <span className="text-xs font-medium">
                                  {message.sender_type === 'customer' ? 'You' : 'Support Agent'}
                                </span>
                                <span className="text-xs opacity-70">
                                  {format(new Date(message.created_at), 'MMM d, HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    {['open', 'in_progress', 'waiting_for_customer'].includes(selectedTicketData.status) && (
                      <div className="border-t p-4">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Textarea
                              placeholder="Type your message..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              rows={3}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={handleSendMessage}
                              disabled={!messageInput.trim() || loading}
                              className="gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Send
                            </Button>
                            <Button size="sm" variant="outline">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rating Section for Resolved Tickets */}
                    {selectedTicketData.status === 'resolved' && !selectedTicketData.customer_satisfaction_rating && (
                      <div className="border-t p-4 bg-muted/50">
                        <p className="text-sm font-medium mb-3">How was your support experience?</p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              size="sm"
                              variant="outline"
                              onClick={() => rateSupportInteraction(selectedTicketData.id, rating)}
                              className="gap-1"
                            >
                              <Star className="h-4 w-4" />
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a ticket to view details</p>
                    <p className="text-sm">Choose from your open or resolved tickets</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.slice(0, 9).map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:shadow-md transition-all duration-200 bg-background/50 border-border/50 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                      <Badge variant="outline" className="w-fit">
                        {article.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>{article.views} views</span>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{article.helpful_votes}/{article.total_votes}</span>
                          </div>
                        </div>
                        <span>{format(new Date(article.updated_at), 'MMM d')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Chat Tab */}
        <TabsContent value="live-chat" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Chat Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      {agents.filter(a => a.status === 'online').length} agents online
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="text-sm text-muted-foreground">
                    Avg response time: 2 min
                  </div>
                </div>
                
                <div className="space-y-4 max-w-md mx-auto">
                  <Button size="lg" className="w-full gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Start Live Chat
                  </Button>
                </div>

                <div className="mt-8 max-w-md mx-auto">
                  <p className="text-sm font-medium text-foreground mb-4">
                    Our support team is available 24/7 to help you with:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Technical issues</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Account setup</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Trading questions</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Billing inquiries</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">support@hypercognition.io</p>
                      <p className="text-sm text-muted-foreground">Email support</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Response Times</p>
                      <p className="text-sm text-muted-foreground">
                        Chat: 2 min • Email: 4 hours • Tickets: 8 hours
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle>Support Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="relative">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                          agent.status === 'online' ? 'bg-green-500' : 
                          agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agent.specializations.slice(0, 2).join(', ')}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{agent.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            • {agent.total_resolved} resolved
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};