import React, { useState, useEffect, useCallback } from 'react';

interface Translation {
  [key: string]: string | Translation;
}

interface I18nContextType {
  currentLanguage: string;
  availableLanguages: string[];
  translations: Translation;
  t: (key: string, params?: Record<string, string>) => string;
  changeLanguage: (language: string) => void;
  isRTL: boolean;
}

// Mock translations data
const mockTranslations: Record<string, Translation> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      portfolio: 'Portfolio',
      trading: 'Trading',
      analytics: 'Analytics',
      settings: 'Settings'
    },
    trading: {
      buy: 'Buy',
      sell: 'Sell',
      amount: 'Amount',
      price: 'Price',
      total: 'Total',
      orderPlaced: 'Order placed successfully'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save'
    }
  },
  es: {
    nav: {
      dashboard: 'Panel de Control',
      portfolio: 'Portafolio',
      trading: 'Comercio',
      analytics: 'Analíticas',
      settings: 'Configuración'
    },
    trading: {
      buy: 'Comprar',
      sell: 'Vender',
      amount: 'Cantidad',
      price: 'Precio',
      total: 'Total',
      orderPlaced: 'Orden colocada exitosamente'
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar'
    }
  },
  fr: {
    nav: {
      dashboard: 'Tableau de Bord',
      portfolio: 'Portefeuille',
      trading: 'Trading',
      analytics: 'Analytiques',
      settings: 'Paramètres'
    },
    trading: {
      buy: 'Acheter',
      sell: 'Vendre',
      amount: 'Montant',
      price: 'Prix',
      total: 'Total',
      orderPlaced: 'Ordre passé avec succès'
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Sauvegarder'
    }
  },
  de: {
    nav: {
      dashboard: 'Dashboard',
      portfolio: 'Portfolio',
      trading: 'Trading',
      analytics: 'Analytik',
      settings: 'Einstellungen'
    },
    trading: {
      buy: 'Kaufen',
      sell: 'Verkaufen',
      amount: 'Betrag',
      price: 'Preis',
      total: 'Gesamt',
      orderPlaced: 'Bestellung erfolgreich aufgegeben'
    },
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern'
    }
  },
  zh: {
    nav: {
      dashboard: '仪表板',
      portfolio: '投资组合',
      trading: '交易',
      analytics: '分析',
      settings: '设置'
    },
    trading: {
      buy: '购买',
      sell: '出售',
      amount: '数量',
      price: '价格',
      total: '总计',
      orderPlaced: '订单提交成功'
    },
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      confirm: '确认',
      save: '保存'
    }
  }
};

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const useI18n = (): I18nContextType => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Translation>(mockTranslations.en);

  const availableLanguages = Object.keys(mockTranslations);
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0];
      if (availableLanguages.includes(browserLanguage)) {
        setCurrentLanguage(browserLanguage);
      }
    }
  }, []);

  useEffect(() => {
    // Update translations when language changes
    setTranslations(mockTranslations[currentLanguage] || mockTranslations.en);
    
    // Update document direction for RTL languages
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  const getNestedValue = (obj: Translation, path: string): string => {
    const keys = path.split('.');
    let current: any = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if key not found
        const fallback = mockTranslations.en;
        let fallbackCurrent: any = fallback;
        for (const fallbackKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && fallbackKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fallbackKey];
          } else {
            return path; // Return the key if not found in fallback
          }
        }
        return typeof fallbackCurrent === 'string' ? fallbackCurrent : path;
      }
    }
    
    return typeof current === 'string' ? current : path;
  };

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    let translation = getNestedValue(translations, key);
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, paramValue);
      });
    }
    
    return translation;
  }, [translations]);

  const changeLanguage = useCallback((language: string) => {
    if (availableLanguages.includes(language)) {
      setCurrentLanguage(language);
      localStorage.setItem('preferred-language', language);
    }
  }, [availableLanguages]);

  return {
    currentLanguage,
    availableLanguages,
    translations,
    t,
    changeLanguage,
    isRTL
  };
};

// Context provider component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};