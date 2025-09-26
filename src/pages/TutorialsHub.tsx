import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { SEOHead } from '@/components/seo/SEOHead';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  User, 
  TrendingUp, 
  Shield, 
  Users, 
  Search,
  Star,
  Award,
  Target,
  Brain,
  Lightbulb,
  MessageCircle,
  FileText,
  Video,
  Headphones
} from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  completed?: boolean;
  type: 'video' | 'interactive' | 'article' | 'quiz';
  icon: React.ElementType;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  tutorials: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ElementType;
}

const tutorials: Tutorial[] = [
  // Getting Started
  {
    id: 'welcome',
    title: 'Welcome to HyperCognition',
    description: 'Get familiar with the platform interface and basic navigation',
    duration: '5 min',
    difficulty: 'beginner',
    category: 'Getting Started',
    type: 'interactive',
    icon: User,
    completed: false
  },
  {
    id: 'account-setup',
    title: 'Setting Up Your Account',
    description: 'Complete your profile, enable security features, and customize preferences',
    duration: '8 min',
    difficulty: 'beginner',
    category: 'Getting Started',
    type: 'video',
    icon: Shield
  },
  {
    id: 'platform-tour',
    title: 'Platform Overview Tour',
    description: 'Comprehensive walkthrough of all major platform features',
    duration: '12 min',
    difficulty: 'beginner',
    category: 'Getting Started',
    type: 'interactive',
    icon: BookOpen
  },

  // Trading Basics
  {
    id: 'trading-fundamentals',
    title: 'Trading Fundamentals',
    description: 'Understand basic trading concepts, order types, and market mechanics',
    duration: '15 min',
    difficulty: 'beginner',
    category: 'Trading Basics',
    type: 'article',
    icon: TrendingUp
  },
  {
    id: 'order-types',
    title: 'Understanding Order Types',
    description: 'Market orders, limit orders, stop-loss, and advanced order types',
    duration: '10 min',
    difficulty: 'intermediate',
    category: 'Trading Basics',
    type: 'video',
    icon: Target
  },
  {
    id: 'first-trade',
    title: 'Placing Your First Trade',
    description: 'Step-by-step guide to executing your first trade safely',
    duration: '12 min',
    difficulty: 'beginner',
    category: 'Trading Basics',
    type: 'interactive',
    icon: PlayCircle
  },

  // Portfolio Management
  {
    id: 'portfolio-basics',
    title: 'Portfolio Management Basics',
    description: 'Learn how to build and manage a diversified portfolio',
    duration: '18 min',
    difficulty: 'intermediate',
    category: 'Portfolio Management',
    type: 'article',
    icon: Award
  },
  {
    id: 'risk-management',
    title: 'Risk Management Strategies',
    description: 'Essential risk management techniques and position sizing',
    duration: '20 min',
    difficulty: 'intermediate',
    category: 'Risk Management',
    type: 'video',
    icon: Shield
  },
  {
    id: 'portfolio-rebalancing',
    title: 'Portfolio Rebalancing',
    description: 'When and how to rebalance your portfolio for optimal performance',
    duration: '15 min',
    difficulty: 'advanced',
    category: 'Portfolio Management',
    type: 'interactive',
    icon: Target
  },

  // Social Trading
  {
    id: 'social-trading-intro',
    title: 'Introduction to Social Trading',
    description: 'Discover how to follow, copy, and learn from successful traders',
    duration: '10 min',
    difficulty: 'beginner',
    category: 'Social Trading',
    type: 'video',
    icon: Users
  },
  {
    id: 'copy-trading',
    title: 'Copy Trading Guide',
    description: 'How to set up and manage copy trading strategies',
    duration: '14 min',
    difficulty: 'intermediate',
    category: 'Social Trading',
    type: 'interactive',
    icon: Users
  },
  {
    id: 'trading-signals',
    title: 'Understanding Trading Signals',
    description: 'How to interpret and act on trading signals from the community',
    duration: '12 min',
    difficulty: 'intermediate',
    category: 'Social Trading',
    type: 'article',
    icon: MessageCircle
  },

  // Advanced Features
  {
    id: 'technical-analysis',
    title: 'Technical Analysis Mastery',
    description: 'Advanced charting, indicators, and pattern recognition',
    duration: '25 min',
    difficulty: 'advanced',
    category: 'Advanced Trading',
    type: 'video',
    icon: Brain
  },
  {
    id: 'ai-assistance',
    title: 'AI Trading Assistant',
    description: 'Leverage AI insights for better trading decisions',
    duration: '16 min',
    difficulty: 'intermediate',
    category: 'AI Features',
    type: 'interactive',
    icon: Brain
  },
  {
    id: 'multi-exchange',
    title: 'Multi-Exchange Trading',
    description: 'Connect and trade across multiple exchanges efficiently',
    duration: '18 min',
    difficulty: 'advanced',
    category: 'Advanced Trading',
    type: 'video',
    icon: TrendingUp
  }
];

const learningPaths: LearningPath[] = [
  {
    id: 'complete-beginner',
    title: 'Complete Beginner Path',
    description: 'Perfect for users who are new to trading and cryptocurrencies',
    tutorials: ['welcome', 'account-setup', 'platform-tour', 'trading-fundamentals', 'first-trade', 'portfolio-basics'],
    estimatedTime: '1.5 hours',
    difficulty: 'beginner',
    icon: User
  },
  {
    id: 'social-trader',
    title: 'Social Trading Specialist',
    description: 'Focus on social trading features and community interactions',
    tutorials: ['platform-tour', 'social-trading-intro', 'copy-trading', 'trading-signals', 'risk-management'],
    estimatedTime: '1 hour',
    difficulty: 'intermediate',
    icon: Users
  },
  {
    id: 'advanced-trader',
    title: 'Advanced Trading Mastery',
    description: 'For experienced traders looking to master advanced features',
    tutorials: ['technical-analysis', 'ai-assistance', 'multi-exchange', 'portfolio-rebalancing', 'risk-management'],
    estimatedTime: '2 hours',
    difficulty: 'advanced',
    icon: Brain
  },
  {
    id: 'portfolio-manager',
    title: 'Portfolio Management Expert',
    description: 'Master portfolio construction and risk management',
    tutorials: ['portfolio-basics', 'risk-management', 'portfolio-rebalancing', 'technical-analysis'],
    estimatedTime: '1.2 hours',
    difficulty: 'intermediate',
    icon: Award
  }
];

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button and follow the registration process. You\'ll need to verify your email and complete basic profile information.'
      },
      {
        question: 'Is the platform free to use?',
        answer: 'Yes, basic features are free. Premium features are available with paid plans that offer additional tools and higher limits.'
      },
      {
        question: 'How do I fund my account?',
        answer: 'You can fund your account through bank transfers, credit cards, or cryptocurrency deposits. Go to your wallet section for detailed instructions.'
      }
    ]
  },
  {
    category: 'Trading',
    questions: [
      {
        question: 'What cryptocurrencies can I trade?',
        answer: 'We support hundreds of cryptocurrencies including Bitcoin, Ethereum, and many altcoins. Check the markets section for the full list.'
      },
      {
        question: 'What are the trading fees?',
        answer: 'Trading fees vary by account tier and trading volume. Maker fees start at 0.1% and taker fees at 0.15%.'
      },
      {
        question: 'Can I trade on mobile?',
        answer: 'Yes, our platform is fully responsive and optimized for mobile trading on all devices.'
      }
    ]
  },
  {
    category: 'Security',
    questions: [
      {
        question: 'How secure is my account?',
        answer: 'We use bank-level security including 2FA, cold storage for funds, and regular security audits.'
      },
      {
        question: 'What if I lose my 2FA device?',
        answer: 'Contact support with your backup codes or alternative verification methods. Always keep backup codes safe when setting up 2FA.'
      }
    ]
  }
];

export default function TutorialsHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || tutorial.difficulty === selectedDifficulty;
    const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = [...new Set(tutorials.map(t => t.category))];
  const overallProgress = (completedTutorials.size / tutorials.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'interactive': return PlayCircle;
      case 'article': return FileText;
      case 'quiz': return Brain;
      default: return BookOpen;
    }
  };

  const toggleTutorialComplete = (tutorialId: string) => {
    const newCompleted = new Set(completedTutorials);
    if (newCompleted.has(tutorialId)) {
      newCompleted.delete(tutorialId);
    } else {
      newCompleted.add(tutorialId);
    }
    setCompletedTutorials(newCompleted);
  };

  return (
    <>
      <SEOHead 
        title="Learning Hub | Complete Trading Education Center"
        description="Master cryptocurrency trading with our comprehensive tutorials, interactive guides, and learning paths. From beginner to expert level."
        keywords="trading tutorials, crypto education, trading guides, learn trading, cryptocurrency basics"
      />
      
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Learning Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master the art of trading with our comprehensive learning center. From basics to advanced strategies, 
            we've got everything you need to succeed.
          </p>
          
          {/* Progress Overview */}
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <Progress value={overallProgress} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedTutorials.size} of {tutorials.length} tutorials completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="tutorials">All Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Start */}
              <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Quick Start Guide
                  </CardTitle>
                  <CardDescription>
                    New to the platform? Start here for a guided introduction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tutorials.slice(0, 3).map((tutorial) => {
                      const Icon = tutorial.icon;
                      const TypeIcon = getTypeIcon(tutorial.type);
                      return (
                        <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 text-primary mt-1" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{tutorial.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{tutorial.duration}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <TypeIcon className="h-3 w-3" />
                                  <Badge variant="outline" className="text-xs">
                                    {tutorial.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              {completedTutorials.has(tutorial.id) && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Learning Paths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Popular Paths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {learningPaths.slice(0, 2).map((path) => {
                    const Icon = path.icon;
                    return (
                      <div key={path.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                        <Icon className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{path.title}</p>
                          <p className="text-xs text-muted-foreground">{path.estimatedTime}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Categories Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const categoryTutorials = tutorials.filter(t => t.category === category);
                const completed = categoryTutorials.filter(t => completedTutorials.has(t.id)).length;
                const progress = (completed / categoryTutorials.length) * 100;

                return (
                  <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium mb-2">{category}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {categoryTutorials.length} tutorials
                      </p>
                      <Progress value={progress} className="mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {completed}/{categoryTutorials.length} completed
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((path) => {
                const Icon = path.icon;
                const pathTutorials = tutorials.filter(t => path.tutorials.includes(t.id));
                const completed = pathTutorials.filter(t => completedTutorials.has(t.id)).length;
                const progress = (completed / pathTutorials.length) * 100;

                return (
                  <Card key={path.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Icon className="h-8 w-8 text-primary mt-1" />
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {path.title}
                            <Badge variant="outline" className={getDifficultyColor(path.difficulty)}>
                              {path.difficulty}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {path.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated time: {path.estimatedTime}</span>
                          <span className="text-muted-foreground">{completed}/{pathTutorials.length} completed</span>
                        </div>
                        <Progress value={progress} />
                        <div className="space-y-2">
                          {pathTutorials.slice(0, 3).map((tutorial) => (
                            <div key={tutorial.id} className="flex items-center gap-2 text-sm">
                              {completedTutorials.has(tutorial.id) ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={completedTutorials.has(tutorial.id) ? 'line-through text-muted-foreground' : ''}>
                                {tutorial.title}
                              </span>
                            </div>
                          ))}
                          {pathTutorials.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{pathTutorials.length - 3} more tutorials
                            </p>
                          )}
                        </div>
                        <Button className="w-full">
                          {progress === 100 ? 'Review Path' : 'Start Learning'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* All Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tutorials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Tutorials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial) => {
                const Icon = tutorial.icon;
                const TypeIcon = getTypeIcon(tutorial.type);
                const isCompleted = completedTutorials.has(tutorial.id);

                return (
                  <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className="h-6 w-6 text-primary mt-1" />
                          <div className="flex-1">
                            <CardTitle className="text-base">{tutorial.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {tutorial.description}
                            </CardDescription>
                          </div>
                        </div>
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            <span className="capitalize">{tutorial.type}</span>
                          </div>
                          <span className="text-muted-foreground">{tutorial.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                            {tutorial.difficulty}
                          </Badge>
                          <Badge variant="secondary">{tutorial.category}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant={isCompleted ? "secondary" : "default"} 
                            className="flex-1"
                          >
                            {isCompleted ? 'Review' : 'Start'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTutorialComplete(tutorial.id);
                            }}
                          >
                            {isCompleted ? 'Unmark' : 'Mark Complete'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {faqCategories.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.questions.map((item, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium mb-2">{item.question}</h4>
                      <p className="text-muted-foreground text-sm">{item.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Glossary Tab */}
          <TabsContent value="glossary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Glossary</CardTitle>
                <CardDescription>
                  Essential terms and definitions for cryptocurrency trading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">HODL</h4>
                      <p className="text-sm text-muted-foreground">Hold On for Dear Life - a strategy of holding cryptocurrency long-term</p>
                    </div>
                    <div>
                      <h4 className="font-medium">DCA</h4>
                      <p className="text-sm text-muted-foreground">Dollar Cost Averaging - investing fixed amounts regularly regardless of price</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Market Cap</h4>
                      <p className="text-sm text-muted-foreground">Total value of all coins in circulation (price × supply)</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Volatility</h4>
                      <p className="text-sm text-muted-foreground">The degree of price fluctuation in a cryptocurrency</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Whale</h4>
                      <p className="text-sm text-muted-foreground">An individual or entity that holds large amounts of cryptocurrency</p>
                    </div>
                    <div>
                      <h4 className="font-medium">FOMO</h4>
                      <p className="text-sm text-muted-foreground">Fear Of Missing Out - emotional trading based on price movements</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Support/Resistance</h4>
                      <p className="text-sm text-muted-foreground">Price levels where buying/selling pressure typically emerges</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Slippage</h4>
                      <p className="text-sm text-muted-foreground">Difference between expected and actual execution price</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}