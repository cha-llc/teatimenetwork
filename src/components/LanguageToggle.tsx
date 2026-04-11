import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Search, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Language,
  LANGUAGES,
  LANGUAGES_BY_REGION,
  getAllLanguages,
  getLanguagesByRegion,
  searchLanguages,
} from '@/lib/languages';

/**
 * Simple Language Selector Dropdown
 * Minimal, clean interface for quick language switching
 */
export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {getAllLanguages().map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/**
 * Universal Language Toggle with Search & Favorites
 * Full-featured language selector with 195+ languages,
 * organized by region, search capability, and favorites
 */
export const UniversalLanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Language[]>([]);
  const [openSheet, setOpenSheet] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favoriteLanguages');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        // Silently fail
      }
    }
  }, []);

  // Save favorites to localStorage
  const updateFavorites = (newFavorites: Language[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('favoriteLanguages', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (lang: Language) => {
    if (favorites.includes(lang)) {
      updateFavorites(favorites.filter((f) => f !== lang));
    } else {
      updateFavorites([...favorites, lang]);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setOpenSheet(false);
  };

  const currentLangInfo = LANGUAGES[language];
  const searchResults = searchQuery ? searchLanguages(searchQuery) : [];

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-base">{currentLangInfo?.flag}</span>
          <span className="hidden sm:inline">{currentLangInfo?.name}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Language
          </SheetTitle>
          <SheetDescription>
            Choose from 195+ languages. Currently: {currentLangInfo?.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-2">
                {searchResults.map((lang) => (
                  <div
                    key={lang.code}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleLanguageSelect(lang.code as Language)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lang.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(lang.code as Language);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(lang.code as Language)
                            ? 'fill-red-500 text-red-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* No search results */}
          {searchQuery && searchResults.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No languages found for "{searchQuery}"
              </p>
            </div>
          )}

          {/* Tabs View (when not searching) */}
          {!searchQuery && (
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="favorites">
                  Favorites ({favorites.length})
                </TabsTrigger>
                <TabsTrigger value="regions">Regions</TabsTrigger>
              </TabsList>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-2">
                {favorites.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      No favorite languages yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click the heart icon to add favorites
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-2">
                      {favorites.map((code) => {
                        const lang = LANGUAGES[code];
                        return (
                          <div
                            key={code}
                            className={`flex items-center justify-between rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors ${
                              language === code ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => handleLanguageSelect(code)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-xl">{lang.flag}</span>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {lang.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {lang.nativeName}
                                </div>
                              </div>
                            </div>
                            {language === code && (
                              <Badge variant="default">Current</Badge>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(code);
                              }}
                              className="p-1 hover:bg-muted rounded ml-2"
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              {/* Regions Tab */}
              <TabsContent value="regions" className="space-y-3">
                {Object.entries(LANGUAGES_BY_REGION).map(([region, codes]) => (
                  <div key={region}>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                      {region} ({codes.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {codes.map((code) => {
                        const lang = LANGUAGES[code as Language];
                        return (
                          <button
                            key={code}
                            onClick={() =>
                              handleLanguageSelect(code as Language)
                            }
                            className={`flex items-center gap-2 rounded-lg p-2 text-sm transition-colors ${
                              language === code
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-accent'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span className="line-clamp-1">{lang.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/**
 * Language Info Card
 * Display current language information
 */
export const LanguageInfoCard: React.FC = () => {
  const { language } = useLanguage();
  const langInfo = LANGUAGES[language];

  if (!langInfo) return null;

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{langInfo.flag}</span>
        <div>
          <h3 className="font-semibold">{langInfo.name}</h3>
          <p className="text-sm text-muted-foreground">{langInfo.nativeName}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Region:</strong> {langInfo.region}
        </p>
        <p>
          <strong>Direction:</strong>{' '}
          {langInfo.direction === 'rtl'
            ? 'Right-to-Left'
            : 'Left-to-Right'}
        </p>
        <p>
          <strong>Code:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">{langInfo.code}</code>
        </p>
      </div>
    </div>
  );
};

/**
 * Minimal Language Indicator
 * Just the flag and language code in a compact format
 */
export const LanguageIndicator: React.FC = () => {
  const { language } = useLanguage();
  const langInfo = LANGUAGES[language];

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-lg">{langInfo?.flag}</span>
      <span className="uppercase font-mono text-xs">{language}</span>
    </div>
  );
};
