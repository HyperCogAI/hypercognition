import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Key, CheckCircle2, XCircle } from "lucide-react";
import { useTwitterCredentials } from "@/hooks/useTwitterCredentials";

export function TwitterAccessSetup() {
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
  );
}
