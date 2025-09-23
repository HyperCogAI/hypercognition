import React from 'react'
import { Card, StatCard, FeatureCard } from '@/components/ui/card'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/ui/responsive-components'
import { Button } from '@/components/ui/button'
import { CyberButton } from '@/components/ui/cyber-button'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Layout, 
  Smartphone, 
  Monitor, 
  Zap, 
  Sparkles, 
  Target,
  CheckCircle,
  TrendingUp,
  Users,
  Activity,
  DollarSign
} from 'lucide-react'

export function DesignSystemShowcase() {
  return (
    <ResponsiveContainer variant="wide" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-responsive-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            HyperCognition Design System
          </h1>
          <p className="text-responsive text-muted-foreground max-w-2xl mx-auto">
            A comprehensive, mobile-first design system built for performance, accessibility, and beautiful user experiences across all devices.
          </p>
        </div>

        {/* Design Tokens Showcase */}
        <div className="space-y-6">
          <h2 className="text-responsive-lg font-semibold flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Design Tokens & Theme System
          </h2>
          
          <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
            <Card variant="cyber" className="text-center">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold">Primary Theme</h3>
                <p className="text-sm text-muted-foreground">Cyan-teal accent for CTAs and highlights</p>
                <div className="text-xs font-mono bg-muted/50 rounded p-2">
                  hsl(186 100% 62%)
                </div>
              </div>
            </Card>

            <Card variant="neon" className="text-center">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold">Secondary Theme</h3>
                <p className="text-sm text-muted-foreground">Blue accent for secondary actions</p>
                <div className="text-xs font-mono bg-muted/50 rounded p-2">
                  hsl(210 100% 65%)
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="text-center">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold">Accent Colors</h3>
                <p className="text-sm text-muted-foreground">Subtle highlights and interactions</p>
                <div className="text-xs font-mono bg-muted/50 rounded p-2">
                  hsl(210 100% 65%)
                </div>
              </div>
            </Card>

            <Card variant="outlined" className="text-center">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-destructive flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-destructive-foreground" />
                </div>
                <h3 className="font-semibold">Semantic Colors</h3>
                <p className="text-sm text-muted-foreground">Status and feedback indicators</p>
                <div className="text-xs font-mono bg-muted/50 rounded p-2">
                  Destructive, Success, Warning
                </div>
              </div>
            </Card>
          </ResponsiveGrid>
        </div>

        {/* Component Variants */}
        <div className="space-y-6">
          <h2 className="text-responsive-lg font-semibold flex items-center gap-2">
            <Layout className="w-6 h-6" />
            Component System
          </h2>

          {/* Button Variants */}
          <Card variant="elevated">
            <div className="p-6 space-y-4">
              <h3 className="font-semibold">Button Variants</h3>
              <ResponsiveStack direction={{ mobile: 'column', tablet: 'row', desktop: 'row' }} gap="md" wrap>
                <Button>Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </ResponsiveStack>
              
              <h4 className="font-medium text-sm text-muted-foreground">Cyber Buttons</h4>
              <ResponsiveStack direction={{ mobile: 'column', tablet: 'row', desktop: 'row' }} gap="md" wrap>
                <CyberButton variant="cyber">Cyber</CyberButton>
                <CyberButton variant="neon">Neon</CyberButton>
                <CyberButton variant="analytics">Analytics</CyberButton>
                <CyberButton variant="ai">AI Assistant</CyberButton>
              </ResponsiveStack>
            </div>
          </Card>

          {/* Card Variants */}
          <div className="space-y-4">
            <h3 className="font-semibold">Card Variants</h3>
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              <Card variant="default">
                <div className="p-6">
                  <h4 className="font-semibold mb-2">Default Card</h4>
                  <p className="text-sm text-muted-foreground">Standard card with subtle border and shadow</p>
                </div>
              </Card>

              <Card variant="elevated">
                <div className="p-6">
                  <h4 className="font-semibold mb-2">Elevated Card</h4>
                  <p className="text-sm text-muted-foreground">Enhanced shadow with hover effects</p>
                </div>
              </Card>

              <Card variant="neon">
                <div className="p-6">
                  <h4 className="font-semibold mb-2">Neon Card</h4>
                  <p className="text-sm text-muted-foreground">Glowing border with primary color</p>
                </div>
              </Card>
            </ResponsiveGrid>
          </div>

          {/* Specialized Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold">Specialized Components</h3>
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
              <StatCard
                title="Total Users"
                value="12,345"
                subtitle="Active this month"
                icon={Users}
                trend={{ value: 12.5, label: "vs last month", positive: true }}
              />
              
              <StatCard
                title="Revenue"
                value="$45,678"
                subtitle="Monthly recurring"
                icon={DollarSign}
                trend={{ value: 8.3, label: "vs last month", positive: true }}
              />
              
              <StatCard
                title="Performance"
                value="98.9%"
                subtitle="System uptime"
                icon={Activity}
                trend={{ value: 0.2, label: "vs last month", positive: true }}
              />
              
              <StatCard
                title="Growth"
                value="23.4%"
                subtitle="User acquisition"
                icon={TrendingUp}
                trend={{ value: 5.1, label: "vs last month", positive: true }}
              />
            </ResponsiveGrid>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold">Feature Cards</h3>
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              <FeatureCard
                title="Mobile-First Design"
                description="Optimized for touch interactions with responsive layouts that work seamlessly across all devices."
                icon={Smartphone}
                badge="NEW"
                action={{
                  label: "Learn More",
                  onClick: () => console.log('Mobile features clicked')
                }}
              />
              
              <FeatureCard
                title="Performance Optimized"
                description="Lazy loading, code splitting, and performance monitoring built-in for lightning-fast experiences."
                icon={Zap}
                action={{
                  label: "View Metrics",
                  onClick: () => console.log('Performance clicked')
                }}
              />
              
              <FeatureCard
                title="Desktop Experience"
                description="Rich desktop features with keyboard navigation, tooltips, and advanced interactions."
                icon={Monitor}
                action={{
                  label: "Explore",
                  onClick: () => console.log('Desktop features clicked')
                }}
              />
            </ResponsiveGrid>
          </div>
        </div>

        {/* Typography Scale */}
        <div className="space-y-6">
          <h2 className="text-responsive-lg font-semibold">Responsive Typography</h2>
          
          <Card variant="elevated">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h1 className="text-responsive-xl font-bold">Extra Large Heading</h1>
                <p className="text-xs text-muted-foreground font-mono">
                  .text-responsive-xl | clamp(1.5rem, 5vw, 2.25rem)
                </p>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-responsive-lg font-semibold">Large Heading</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  .text-responsive-lg | clamp(1.125rem, 4vw, 1.5rem)
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-responsive">Regular responsive text that scales fluidly with viewport width while maintaining optimal readability across all device sizes.</p>
                <p className="text-xs text-muted-foreground font-mono">
                  .text-responsive | clamp(0.875rem, 2.5vw, 1rem)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Interactive Demo */}
        <div className="space-y-6">
          <h2 className="text-responsive-lg font-semibold">Interactive Experience</h2>
          
          <Card variant="cyber" clickable onCardClick={() => console.log('Cyber card clicked!')}>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Try the Interactive Demo</h3>
                <p className="text-sm text-muted-foreground">
                  Click this card to experience the touch-optimized interactions and smooth animations
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Touch Optimized</Badge>
                <Badge variant="outline">Accessible</Badge>
                <Badge variant="secondary">Responsive</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Design Principles */}
        <div className="space-y-6">
          <h2 className="text-responsive-lg font-semibold">Design Principles</h2>
          
          <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap="lg">
            <Card variant="elevated">
              <div className="p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Mobile-First
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Minimum 44px touch targets</li>
                  <li>• Optimized for thumb navigation</li>
                  <li>• Reduced motion for performance</li>
                  <li>• Safe area padding for notched devices</li>
                </ul>
              </div>
            </Card>

            <Card variant="elevated">
              <div className="p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Performance
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Semantic color tokens</li>
                  <li>• Efficient animations</li>
                  <li>• Lazy loading components</li>
                  <li>• Optimized bundle sizes</li>
                </ul>
              </div>
            </Card>
          </ResponsiveGrid>
        </div>
      </div>
    </ResponsiveContainer>
  )
}