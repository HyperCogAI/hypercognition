import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  Code,
  Database
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface SanitizationRule {
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  violations: Array<{
    rule: string;
    severity: string;
    message: string;
  }>;
  riskScore: number;
}

export function EnhancedInputSanitization() {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<ValidationResult | null>(null);
  const [inputType, setInputType] = useState<'trading' | 'general' | 'html'>('trading');

  const sanitizationRules: SanitizationRule[] = [
    {
      name: 'SQL Injection Prevention',
      description: 'Prevents SQL injection attacks',
      pattern: /(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript)/gi,
      replacement: '',
      severity: 'critical'
    },
    {
      name: 'XSS Prevention',
      description: 'Prevents cross-site scripting attacks',
      pattern: /<script[^>]*>.*?<\/script>/gi,
      replacement: '',
      severity: 'critical'
    },
    {
      name: 'HTML Tag Sanitization',
      description: 'Removes potentially dangerous HTML tags',
      pattern: /<(iframe|embed|object|form|input|textarea|button|link|meta|style)[^>]*>/gi,
      replacement: '',
      severity: 'high'
    },
    {
      name: 'JavaScript Protocol Prevention',
      description: 'Removes javascript: protocols',
      pattern: /javascript:/gi,
      replacement: '',
      severity: 'high'
    },
    {
      name: 'Event Handler Removal',
      description: 'Removes HTML event handlers',
      pattern: /on\w+\s*=\s*["'][^"']*["']/gi,
      replacement: '',
      severity: 'high'
    },
    {
      name: 'Data URI Prevention',
      description: 'Prevents data URI attacks',
      pattern: /data:(?:text\/html|application\/javascript)/gi,
      replacement: '',
      severity: 'medium'
    },
    {
      name: 'Unicode Normalization',
      description: 'Normalizes unicode characters',
      pattern: /[\u0080-\uFFFF]/g,
      replacement: '',
      severity: 'low'
    }
  ];

  const tradingSpecificRules: SanitizationRule[] = [
    {
      name: 'Trading Amount Validation',
      description: 'Validates trading amounts',
      pattern: /^(?!0\.?0*$)\d+(\.\d{1,8})?$/,
      replacement: '',
      severity: 'high'
    },
    {
      name: 'Price Format Validation',
      description: 'Validates price formats',
      pattern: /^\d+(\.\d{1,6})?$/,
      replacement: '',
      severity: 'high'
    },
    {
      name: 'Order Type Validation',
      description: 'Validates order types',
      pattern: /^(market|limit|stop_loss|take_profit|stop_limit)$/i,
      replacement: '',
      severity: 'critical'
    },
    {
      name: 'Side Validation',
      description: 'Validates order sides',
      pattern: /^(buy|sell)$/i,
      replacement: '',
      severity: 'critical'
    }
  ];

  const sanitizeInput = (input: string, type: string): ValidationResult => {
    let sanitized = input;
    let violations: Array<{ rule: string; severity: string; message: string }> = [];
    let riskScore = 0;

    // Get appropriate rules based on input type
    const rules = type === 'trading' 
      ? [...sanitizationRules, ...tradingSpecificRules]
      : sanitizationRules;

    // Apply sanitization rules
    rules.forEach(rule => {
      const matches = input.match(rule.pattern);
      if (matches && rule.name !== 'Unicode Normalization') {
        violations.push({
          rule: rule.name,
          severity: rule.severity,
          message: `${rule.description}: Found ${matches.length} violation(s)`
        });

        // Calculate risk score
        const severityScore = {
          low: 1,
          medium: 3,
          high: 7,
          critical: 10
        }[rule.severity];
        
        riskScore += severityScore * matches.length;
      }

      // Apply sanitization
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
    });

    // Use DOMPurify for HTML content
    if (type === 'html') {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
        ALLOWED_ATTR: []
      });
    }

    // Additional trading-specific validation
    if (type === 'trading') {
      sanitized = sanitizeTradingData(sanitized);
    }

    return {
      isValid: violations.filter(v => v.severity === 'critical').length === 0,
      sanitized: sanitized.trim(),
      violations,
      riskScore: Math.min(riskScore, 100)
    };
  };

  const sanitizeTradingData = (input: string): string => {
    // Remove any non-numeric characters from amounts (except decimal points)
    if (/^\d*\.?\d*$/.test(input)) {
      const num = parseFloat(input);
      if (!isNaN(num) && num >= 0) {
        return num.toString();
      }
    }
    return input;
  };

  const testInputSanitization = () => {
    const result = sanitizeInput(testInput, inputType);
    setTestResult(result);
  };

  const getRiskColor = (score: number) => {
    if (score >= 30) return 'text-red-500';
    if (score >= 15) return 'text-orange-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Sanitization Tester */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Input Sanitization Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Input Type</label>
            <select 
              className="w-full mt-1 p-2 border rounded-md"
              value={inputType}
              onChange={(e) => setInputType(e.target.value as any)}
            >
              <option value="trading">Trading Parameters</option>
              <option value="general">General Text</option>
              <option value="html">HTML Content</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Test Input</label>
            <Textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter text to test sanitization rules..."
              className="mt-1"
              rows={4}
            />
          </div>

          <Button onClick={testInputSanitization} className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            Test Sanitization
          </Button>

          {testResult && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Sanitization Result</h3>
                <div className="flex items-center gap-2">
                  {testResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`font-medium ${getRiskColor(testResult.riskScore)}`}>
                    Risk Score: {testResult.riskScore}
                  </span>
                </div>
              </div>

              {testResult.violations.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {testResult.violations.length} security violation(s) in the input.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Original Input</label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                    <code className="text-sm break-all">{testInput}</code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Sanitized Output</label>
                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                    <code className="text-sm break-all">{testResult.sanitized}</code>
                  </div>
                </div>
              </div>

              {testResult.violations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Security Violations Detected</h4>
                  <div className="space-y-2">
                    {testResult.violations.map((violation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <span className="font-medium">{violation.rule}</span>
                          <p className="text-sm text-muted-foreground">{violation.message}</p>
                        </div>
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sanitization Rules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Active Sanitization Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium">General Security Rules</h4>
            <div className="grid gap-3">
              {sanitizationRules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{rule.name}</h5>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                        {rule.pattern.toString()}
                      </code>
                    </div>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-medium mt-6">Trading-Specific Rules</h4>
            <div className="grid gap-3">
              {tradingSpecificRules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{rule.name}</h5>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                        {rule.pattern.toString()}
                      </code>
                    </div>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Input Sanitization Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ DO</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Always sanitize user input on both client and server side</li>
                  <li>• Use whitelist validation for critical parameters</li>
                  <li>• Implement context-specific sanitization rules</li>
                  <li>• Log and monitor sanitization violations</li>
                  <li>• Use prepared statements for database queries</li>
                  <li>• Validate data types and ranges</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">❌ DON'T</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Trust user input without validation</li>
                  <li>• Rely only on client-side validation</li>
                  <li>• Use blacklist-only approaches</li>
                  <li>• Ignore encoding and escaping</li>
                  <li>• Allow raw HTML in user content</li>
                  <li>• Skip input validation for "trusted" users</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}