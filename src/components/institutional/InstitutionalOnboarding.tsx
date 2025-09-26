import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export const InstitutionalOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const features = [
    {
      title: "Team Management",
      description: "Multi-user access with role-based permissions for traders, analysts, and compliance officers",
      icon: "👥"
    },
    {
      title: "Compliance Tools", 
      description: "Advanced compliance monitoring, audit trails, and automated reporting for regulatory requirements",
      icon: "🛡️"
    },
    {
      title: "API Access",
      description: "Institutional-grade API with high rate limits for algorithmic trading and data integration",
      icon: "🔌"
    },
    {
      title: "White Label",
      description: "Custom branding and domain options for a fully branded trading experience",
      icon: "🎨"
    },
    {
      title: "Advanced Analytics",
      description: "Enterprise reporting, risk analytics, and performance attribution tools",
      icon: "📊"
    },
    {
      title: "Dedicated Support",
      description: "24/7 dedicated support with assigned account manager and priority response",
      icon: "☎️"
    }
  ];

  const plans = [
    {
      name: "Professional",
      price: "$2,500",
      period: "per month",
      features: [
        "Up to 10 team members",
        "Basic compliance tools", 
        "Standard API access",
        "Email support"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      features: [
        "Unlimited team members",
        "Full compliance suite",
        "Premium API access",
        "White label options",
        "Dedicated support",
        "Custom integrations"
      ],
      popular: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-white leading-tight">
          Institutional Trading{" "}
          <span className="text-white">
            Platform
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enterprise-grade trading infrastructure designed for hedge funds, banks, and professional trading organizations
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Scalable solutions for organizations of all sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary/60 border border-white text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-muted-foreground">{plan.period}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our institutional team is ready to help you implement a customized trading solution 
            that meets your organization's specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ 30-day free trial</span>
            <span>✓ No setup fees</span>
            <span>✓ 24/7 support</span>
          </div>
        </CardContent>
      </Card>

      {/* Demo Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Organization</CardTitle>
          <p className="text-muted-foreground">
            Experience institutional features with our demo organization "Quantum Capital Management"
          </p>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            View Demo Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};