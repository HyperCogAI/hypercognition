import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useTelegramCredentials } from "@/hooks/useTelegramCredentials";

export function TelegramAuthentication() {
  const { credentials, isAuthenticated, authenticate, verifyCode, isAuthenticating } = useTelegramCredentials();
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    authenticate({ apiId, apiHash, phoneNumber });
    setCodeSent(true);
  };

  const handleVerify = () => {
    verifyCode(code);
  };

  if (isAuthenticated && credentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Telegram Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium">Connected as @{credentials.telegram_username || credentials.telegram_first_name}</p>
              <p className="text-sm text-muted-foreground">
                Telegram ID: {credentials.telegram_user_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Get Telegram API Credentials</CardTitle>
          <CardDescription>
            Visit{" "}
            <a 
              href="https://my.telegram.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              my.telegram.org
            </a>{" "}
            and create an app to get your API ID and API Hash
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiId">API ID</Label>
            <Input
              id="apiId"
              type="text"
              placeholder="12345678"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              disabled={codeSent}
            />
          </div>
          <div>
            <Label htmlFor="apiHash">API Hash</Label>
            <Input
              id="apiHash"
              type="password"
              placeholder="abc123def456..."
              value={apiHash}
              onChange={(e) => setApiHash(e.target.value)}
              disabled={codeSent}
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number (with country code)</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={codeSent}
            />
          </div>
          {!codeSent && (
            <Button 
              onClick={handleSendCode}
              disabled={!apiId || !apiHash || !phoneNumber || isAuthenticating}
            >
              Send Verification Code
            </Button>
          )}
        </CardContent>
      </Card>

      {codeSent && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Enter Verification Code</CardTitle>
            <CardDescription>
              Enter the code sent to your Telegram app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="12345"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleVerify}
              disabled={!code || isAuthenticating}
            >
              Verify & Connect
            </Button>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Note:</strong> Your API credentials and session are encrypted and stored securely.
          Your Telegram account will be used to read messages from channels you've joined.
        </AlertDescription>
      </Alert>
    </div>
  );
}
