import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Languages, MapPin, Clock, Users, TrendingUp, CheckCircle } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

const MultiLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [rtlEnabled, setRtlEnabled] = useState(false)

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", completion: 100 },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", completion: 95 },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", completion: 90 },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", completion: 88 },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", completion: 85 },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", completion: 82 },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", completion: 80 },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", completion: 75, rtl: true },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", completion: 78 },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", completion: 70 }
  ]

  const regions = [
    { code: "global", name: "Global", markets: ["NYSE", "NASDAQ", "LSE", "TSE"] },
    { code: "americas", name: "Americas", markets: ["NYSE", "NASDAQ", "TSX", "B3"] },
    { code: "europe", name: "Europe", markets: ["LSE", "Euronext", "DAX", "SIX"] },
    { code: "asia", name: "Asia Pacific", markets: ["TSE", "HKEX", "SGX", "ASX"] },
    { code: "mena", name: "MENA", markets: ["TADAWUL", "DFM", "QE", "EGX"] }
  ]

  const marketData = {
    totalUsers: "2.4M+",
    activeMarkets: "150+",
    supportedCurrencies: "45+",
    tradingVolume: "$12.8B"
  }

  const upcomingLanguages = [
    { name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", eta: "Q2 2024" },
    { name: "Italian", nativeName: "Italiano", flag: "🇮🇹", eta: "Q2 2024" },
    { name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", eta: "Q3 2024" },
    { name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", eta: "Q3 2024" }
  ]

  const getCompletionColor = (completion: number) => {
    if (completion >= 95) return "text-green-500"
    if (completion >= 80) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <>
      <SEOHead
        title="Multi-Language Support - Global Trading Platform"
        description="Trade in your native language with our comprehensive international platform supporting 45+ languages and regional markets worldwide."
        keywords="multi-language trading, international markets, global platform, localization, RTL support"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Global Trading Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience AI trading in your native language with full localization and regional market support
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{marketData.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Global Users</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{marketData.activeMarkets}</div>
              <div className="text-sm text-muted-foreground">Active Markets</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{marketData.supportedCurrencies}</div>
              <div className="text-sm text-muted-foreground">Currencies</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{marketData.tradingVolume}</div>
              <div className="text-sm text-muted-foreground">Daily Volume</div>
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
              {languages.map((language) => (
                <Card 
                  key={language.code} 
                  className={`bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedLanguage === language.code ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedLanguage(language.code)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <div className="font-semibold">{language.name}</div>
                          <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                        </div>
                      </div>
                      {language.completion === 100 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Translation Progress</span>
                        <span className={getCompletionColor(language.completion)}>
                          {language.completion}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${language.completion}%` }}
                        />
                      </div>
                      {language.rtl && (
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
              {regions.map((region) => (
                <Card key={region.code} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {region.name}
                    </CardTitle>
                    <CardDescription>
                      Regional trading markets and compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Supported Markets</div>
                      <div className="flex flex-wrap gap-2">
                        {region.markets.map((market) => (
                          <Badge key={market} variant="secondary">{market}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant={selectedRegion === region.code ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setSelectedRegion(region.code)}
                    >
                      {selectedRegion === region.code ? "Selected" : "Select Region"}
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
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
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
                        {regions.map((region) => (
                          <SelectItem key={region.code} value={region.code}>
                            {region.name}
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
                  <Switch id="auto-translate" defaultChecked />
                  <Label htmlFor="auto-translate">Auto-translate market news</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="local-time" defaultChecked />
                  <Label htmlFor="local-time">Show times in local timezone</Label>
                </div>

                <Button className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Languages
                </CardTitle>
                <CardDescription>
                  Languages currently in development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingLanguages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-sm text-muted-foreground">{lang.nativeName}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{lang.eta}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Request a Language</CardTitle>
                <CardDescription>
                  Don't see your language? Let us know and we'll prioritize it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select language to request" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                      <SelectItem value="th">Thai</SelectItem>
                      <SelectItem value="id">Indonesian</SelectItem>
                      <SelectItem value="ms">Malay</SelectItem>
                      <SelectItem value="sv">Swedish</SelectItem>
                      <SelectItem value="no">Norwegian</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Submit Request</Button>
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