import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Edit3, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  completion: number;
  isActive: boolean;
  isRTL: boolean;
}

interface TranslationKey {
  key: string;
  category: string;
  english: string;
  translations: Record<string, string>;
}

const LanguageManager: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize languages
    const mockLanguages: Language[] = [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', completion: 100, isActive: true, isRTL: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', completion: 95, isActive: true, isRTL: false },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', completion: 87, isActive: true, isRTL: false },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', completion: 82, isActive: true, isRTL: false },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', completion: 78, isActive: true, isRTL: false },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', completion: 65, isActive: false, isRTL: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', completion: 45, isActive: false, isRTL: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', completion: 30, isActive: false, isRTL: false },
    ];

    // Initialize translation keys
    const mockTranslationKeys: TranslationKey[] = [
      {
        key: 'nav.dashboard',
        category: 'navigation',
        english: 'Dashboard',
        translations: {
          es: 'Panel de Control',
          fr: 'Tableau de Bord',
          de: 'Dashboard',
          zh: '仪表板',
          ja: 'ダッシュボード',
          ar: 'لوحة القيادة',
          hi: 'डैशबोर्ड'
        }
      },
      {
        key: 'trading.buy',
        category: 'trading',
        english: 'Buy',
        translations: {
          es: 'Comprar',
          fr: 'Acheter',
          de: 'Kaufen',
          zh: '购买',
          ja: '購入',
          ar: 'شراء',
          hi: 'खरीदें'
        }
      },
      {
        key: 'trading.sell',
        category: 'trading',
        english: 'Sell',
        translations: {
          es: 'Vender',
          fr: 'Vendre',
          de: 'Verkaufen',
          zh: '出售',
          ja: '売却',
          ar: 'بيع',
          hi: 'बेचें'
        }
      },
      {
        key: 'common.loading',
        category: 'common',
        english: 'Loading...',
        translations: {
          es: 'Cargando...',
          fr: 'Chargement...',
          de: 'Laden...',
          zh: '加载中...',
          ja: '読み込み中...',
          ar: 'جاري التحميل...',
          hi: 'लोड हो रहा है...'
        }
      }
    ];

    setLanguages(mockLanguages);
    setTranslationKeys(mockTranslationKeys);
  }, []);

  const toggleLanguageStatus = (languageCode: string) => {
    setLanguages(prev => prev.map(lang => 
      lang.code === languageCode 
        ? { ...lang, isActive: !lang.isActive }
        : lang
    ));
    toast({
      title: "Language Status Updated",
      description: `Language ${languageCode} has been ${languages.find(l => l.code === languageCode)?.isActive ? 'disabled' : 'enabled'}`,
    });
  };

  const updateTranslation = (key: string, languageCode: string, value: string) => {
    setTranslationKeys(prev => prev.map(item => 
      item.key === key 
        ? { 
            ...item, 
            translations: { 
              ...item.translations, 
              [languageCode]: value 
            }
          }
        : item
    ));
  };

  const filteredKeys = translationKeys.filter(item => {
    const matchesSearch = item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.english.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(translationKeys.map(item => item.category)));

  const exportTranslations = () => {
    const exportData = translationKeys.reduce((acc, item) => {
      acc[item.key] = item.translations;
      return acc;
    }, {} as Record<string, Record<string, string>>);
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Management</h1>
          <p className="text-muted-foreground">Manage translations and multi-language support</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTranslations}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Language
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Language</DialogTitle>
                <DialogDescription>Add a new language to your platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language Code</Label>
                  <Input placeholder="e.g., pt, it, ru" />
                </div>
                <div className="space-y-2">
                  <Label>English Name</Label>
                  <Input placeholder="e.g., Portuguese" />
                </div>
                <div className="space-y-2">
                  <Label>Native Name</Label>
                  <Input placeholder="e.g., Português" />
                </div>
                <Button className="w-full">Add Language</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {languages.map((language) => (
              <Card key={language.code}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <CardTitle className="text-lg">{language.name}</CardTitle>
                        <CardDescription className="text-sm">{language.nativeName}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={language.isActive ? "default" : "secondary"}>
                      {language.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>{language.completion}%</span>
                    </div>
                    <Progress value={language.completion} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>RTL Support</span>
                    {language.isRTL ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </div>
                  
                  <Button 
                    variant={language.isActive ? "outline" : "default"}
                    size="sm" 
                    className="w-full"
                    onClick={() => toggleLanguageStatus(language.code)}
                  >
                    {language.isActive ? "Disable" : "Enable"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search translations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.filter(l => l.code !== 'en').map(language => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.flag} {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Translation Keys</CardTitle>
              <CardDescription>
                Manage translations for {languages.find(l => l.code === selectedLanguage)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredKeys.map((item) => (
                  <div key={item.key} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm text-primary">{item.key}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.category}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">English</Label>
                        <p className="text-sm bg-muted p-2 rounded">{item.english}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {languages.find(l => l.code === selectedLanguage)?.name}
                        </Label>
                        <Textarea
                          value={item.translations[selectedLanguage] || ''}
                          onChange={(e) => updateTranslation(item.key, selectedLanguage, e.target.value)}
                          className="min-h-[40px] resize-none"
                          placeholder="Enter translation..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>Configure global language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.flag} {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Fallback Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.flag} {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Auto-translation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable auto-translation</Label>
                      <p className="text-sm text-muted-foreground">Automatically translate missing keys</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Translation Quality Notice</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Auto-translations should be reviewed by native speakers before going live.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LanguageManager;