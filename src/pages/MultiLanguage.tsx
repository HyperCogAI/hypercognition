import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Globe, Languages, MapPin, Clock, Users, TrendingUp, CheckCircle, ThumbsUp, Loader2 } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"
import { useLanguagePreferences } from "@/hooks/useLanguagePreferences"
import { useLanguageRequests } from "@/hooks/useLanguageRequests"

const MultiLanguage = () => {
  const { 
    preferences, 
    supportedLanguages, 
    tradingRegions, 
    loading: prefsLoading, 
    savePreferences 
  } = useLanguagePreferences();
  
  const {
    requests,
    loading: requestsLoading,
    createRequest,
    voteRequest
  } = useLanguageRequests();

  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [rtlEnabled, setRtlEnabled] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [localTimezone, setLocalTimezone] = useState(true)
  const [newLanguageCode, setNewLanguageCode] = useState("")
  const [newLanguageName, setNewLanguageName] = useState("")
  const [saving, setSaving] = useState(false)

  // Load user preferences when available
  useEffect(() => {
    if (preferences) {
      setSelectedLanguage(preferences.language_code);
      setSelectedRegion(preferences.region_code);
      setRtlEnabled(preferences.rtl_enabled);
      setAutoTranslate(preferences.auto_translate);
      setLocalTimezone(preferences.local_timezone);
    }
  }, [preferences]);

  const handleSavePreferences = async () => {
    setSaving(true);
    await savePreferences({
      language_code: selectedLanguage,
      region_code: selectedRegion,
      rtl_enabled: rtlEnabled,
      auto_translate: autoTranslate,
      local_timezone: localTimezone
    } as any);
    setSaving(false);
  };

  const handleSubmitRequest = async () => {
    if (!newLanguageCode || !newLanguageName) return;
    
    const success = await createRequest(newLanguageCode, newLanguageName);
    if (success) {
      setNewLanguageCode("");
      setNewLanguageName("");
    }
  };

  const handleVote = async (requestId: string) => {
    await voteRequest(requestId);
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 95) return "text-green-500"
    if (completion >= 80) return "text-yellow-500"
    return "text-orange-500"
  };

  if (prefsLoading && requestsLoading) {
    return (
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Multi-Language Support - Global Trading Platform"
        description="Trade in your native language with our comprehensive international platform supporting 45+ languages and regional markets worldwide."
        keywords="multi-language trading, international markets, global platform, localization, RTL support"
      />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-4">
            Global Trading Platform
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Experience AI trading in your native language with full localization and regional market support
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Languages className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{supportedLanguages.length}</div>
              <div className="text-sm text-muted-foreground">Supported Languages</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{tradingRegions.length}</div>
              <div className="text-sm text-muted-foreground">Trading Regions</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{requests.length}</div>
              <div className="text-sm text-muted-foreground">Community Requests</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {supportedLanguages.reduce((sum, lang) => sum + lang.completion_percentage, 0) / supportedLanguages.length || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Translation</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="languages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="languages" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {supportedLanguages.map((language) => (
                <Card 
                  key={language.language_code} 
                  className={`bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedLanguage === language.language_code ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedLanguage(language.language_code)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag_emoji || '🌐'}</span>
                        <div>
                          <div className="font-semibold">{language.language_name}</div>
                          <div className="text-sm text-muted-foreground">{language.native_name}</div>
                        </div>
                      </div>
                      {language.completion_percentage === 100 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Translation Progress</span>
                        <span className={getCompletionColor(language.completion_percentage)}>
                          {language.completion_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${language.completion_percentage}%` }}
                        />
                      </div>
                      {language.is_rtl && (
                        <Badge variant="outline" className="text-xs">RTL Support</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {tradingRegions.map((region) => (
                <Card key={region.region_code} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {region.region_name}
                    </CardTitle>
                    <CardDescription>
                      Regional trading markets and compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Supported Markets</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(region.supported_markets) && region.supported_markets.map((market: string) => (
                          <Badge key={market} variant="secondary">{market}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant={selectedRegion === region.region_code ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setSelectedRegion(region.region_code)}
                    >
                      {selectedRegion === region.region_code ? "Selected" : "Select Region"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Localization Settings</CardTitle>
                <CardDescription>
                  Customize your language and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Display Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.language_code} value={lang.language_code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag_emoji || '🌐'}</span>
                              <span>{lang.language_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Trading Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tradingRegions.map((region) => (
                          <SelectItem key={region.region_code} value={region.region_code}>
                            {region.region_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="rtl-mode"
                    checked={rtlEnabled}
                    onCheckedChange={setRtlEnabled}
                  />
                  <Label htmlFor="rtl-mode">Enable RTL (Right-to-Left) layout</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-translate" 
                    checked={autoTranslate}
                    onCheckedChange={setAutoTranslate}
                  />
                  <Label htmlFor="auto-translate">Auto-translate market news</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="local-time" 
                    checked={localTimezone}
                    onCheckedChange={setLocalTimezone}
                  />
                  <Label htmlFor="local-time">Show times in local timezone</Label>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSavePreferences}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Community Requests
                </CardTitle>
                <CardDescription>
                  Vote for languages you'd like to see added
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No language requests yet. Be the first to request one!
                    </p>
                  ) : (
                    requests.map((req) => (
                      <div key={req.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <div className="font-medium">{req.language_name}</div>
                            {req.native_name && (
                              <div className="text-sm text-muted-foreground">{req.native_name}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={req.status === 'approved' ? 'default' : 'outline'}>
                            {req.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant={req.user_voted ? 'default' : 'outline'}
                            onClick={() => handleVote(req.id)}
                            className="min-w-[80px]"
                          >
                            <ThumbsUp className={`h-4 w-4 mr-1 ${req.user_voted ? 'fill-current' : ''}`} />
                            {req.votes}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Request a Language</CardTitle>
                <CardDescription>
                  Don't see your language? Submit a request and gather community support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="lang-code">Language Code</Label>
                      <Input
                        id="lang-code"
                        placeholder="e.g., vi, th, id"
                        value={newLanguageCode}
                        onChange={(e) => setNewLanguageCode(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lang-name">Language Name</Label>
                      <Input
                        id="lang-name"
                        placeholder="e.g., Vietnamese"
                        value={newLanguageName}
                        onChange={(e) => setNewLanguageName(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleSubmitRequest}
                    disabled={!newLanguageCode || !newLanguageName}
                  >
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default MultiLanguage