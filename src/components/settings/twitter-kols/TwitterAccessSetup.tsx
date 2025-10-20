import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Key, CheckCircle2, XCircle } from "lucide-react";
import { useTwitterCredentials } from "@/hooks/useTwitterCredentials";

export function TwitterAccessSetup() {
  const [accessMode, setAccessMode] = useState<'personal_api' | 'platform_shared'>('platform_shared');
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessSecret, setAccessSecret] = useState("");
  
  const { credentials, hasCredentials, saveCredentials, deleteCredentials, isSaving, isDeleting } = useTwitterCredentials();

  const handleSaveCredentials = () => {
    saveCredentials({
      api_key: apiKey,
      api_secret: apiSecret,
      access_token: accessToken,
      access_secret: accessSecret,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Twitter Access Method</CardTitle>
          <CardDescription>
            Choose how HyperCognition accesses Twitter to monitor your KOLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={accessMode} onValueChange={(value) => setAccessMode(value as any)}>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="platform_shared" id="platform" />
              <div className="flex-1">
                <Label htmlFor="platform" className="font-medium">
                  Use Platform Account (Recommended)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Use HyperCognition's shared Twitter account. Limited to 10 KOL accounts per watchlist.
                </p>
                <Badge variant="secondary" className="mt-2">Free</Badge>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="personal_api" id="personal" />
              <div className="flex-1">
                <Label htmlFor="personal" className="font-medium">
                  Use My Twitter API
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Use your own Twitter API credentials. No limits on KOL accounts, faster updates.
                </p>
                <Badge variant="outline" className="mt-2">Requires Twitter API Access</Badge>
              </div>
            </div>
          </RadioGroup>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {accessMode === 'platform_shared' 
                ? "You're using the shared platform account. This is perfect for getting started with up to 10 KOL accounts."
                : "You'll need a Twitter Developer account with API v2 access. Get started at developer.twitter.com"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {accessMode === 'personal_api' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Twitter API Credentials
            </CardTitle>
            <CardDescription>
              Enter your Twitter API credentials. These will be encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasCredentials && (
              <Alert className="bg-success/10 border-success">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Credentials saved • {credentials?.rate_limit_remaining || 450} API requests remaining
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key (Consumer Key)</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Twitter API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-secret">API Secret (Consumer Secret)</Label>
              <Input
                id="api-secret"
                type="password"
                placeholder="Enter your Twitter API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-token">Access Token</Label>
              <Input
                id="access-token"
                type="password"
                placeholder="Enter your Twitter access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-secret">Access Token Secret</Label>
              <Input
                id="access-secret"
                type="password"
                placeholder="Enter your Twitter access token secret"
                value={accessSecret}
                onChange={(e) => setAccessSecret(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveCredentials}
                disabled={!apiKey || !apiSecret || !accessToken || !accessSecret || isSaving}
              >
                {isSaving ? "Saving..." : hasCredentials ? "Update Credentials" : "Save Credentials"}
              </Button>
              
              {hasCredentials && (
                <Button 
                  variant="destructive"
                  onClick={() => deleteCredentials()}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Removing..." : "Remove Credentials"}
                </Button>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your credentials are encrypted before storage. Get your API credentials from{" "}
                <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Twitter Developer Portal
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
