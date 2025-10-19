import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LanguagePreference {
  id: string;
  user_id: string;
  language_code: string;
  region_code: string;
  rtl_enabled: boolean;
  auto_translate: boolean;
  local_timezone: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportedLanguage {
  id: string;
  language_code: string;
  language_name: string;
  native_name: string;
  flag_emoji: string | null;
  completion_percentage: number;
  is_active: boolean;
  is_rtl: boolean;
  sort_order: number;
}

export interface TradingRegion {
  id: string;
  region_code: string;
  region_name: string;
  supported_markets: any; // JSON type from database
  is_active: boolean;
  sort_order: number;
}

export const useLanguagePreferences = () => {
  const [preferences, setPreferences] = useState<LanguagePreference | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [tradingRegions, setTradingRegions] = useState<TradingRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSupportedLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('supported_languages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setSupportedLanguages(data || []);
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      toast({
        title: "Error loading languages",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const fetchTradingRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_regions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setTradingRegions(data || []);
    } catch (error) {
      console.error('Failed to fetch trading regions:', error);
      toast({
        title: "Error loading regions",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPreferences(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_language_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
    }
  };

  const savePreferences = async (prefs: Partial<LanguagePreference>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save preferences",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('user_language_preferences')
        .upsert({
          user_id: user.id,
          language_code: prefs.language_code || 'en',
          region_code: prefs.region_code || 'global',
          rtl_enabled: prefs.rtl_enabled ?? false,
          auto_translate: prefs.auto_translate ?? true,
          local_timezone: prefs.local_timezone ?? true,
        });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your language preferences have been updated",
      });

      await fetchUserPreferences();
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSupportedLanguages(),
        fetchTradingRegions(),
        fetchUserPreferences()
      ]);
      setLoading(false);
    };

    loadData();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUserPreferences();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    preferences,
    supportedLanguages,
    tradingRegions,
    loading,
    savePreferences,
    refetch: () => Promise.all([
      fetchSupportedLanguages(),
      fetchTradingRegions(),
      fetchUserPreferences()
    ])
  };
};