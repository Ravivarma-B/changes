'use client';

import { ToggleGroup, ToggleGroupItem } from "web-utils-components/toggle-group";
import { useEffect, useState } from "react";
import { DEFAULT_LANGUAGE, Language } from "../../constants/locale";

type LanguageToggleProps = {
  language?: Language; 
  onLanguageChange?: (langauage: Language) => void;
};
export const  LanguageToggle: React.FC<LanguageToggleProps> = ({language, onLanguageChange}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(language || DEFAULT_LANGUAGE); // Default to en
  useEffect(() => {
    setSelectedLanguage(language || DEFAULT_LANGUAGE);
  }, [language]);
  return (
    <ToggleGroup
      type="single"
      value={selectedLanguage}
      variant="outline"
      onValueChange={(value) => {
        if (value && value != selectedLanguage) { 
          setSelectedLanguage(value as Language);
          onLanguageChange?.(value as Language);
        }
      }}
      size="sm"
    >
      <ToggleGroupItem value={Language.AR} aria-label="Toggle Arabic" variant="outline" className={`${selectedLanguage === Language.AR ? 'bg-white/80 dark:bg-slate-600/80 backdrop-blur-sm' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm'} border border-white/30 dark:border-slate-600/30`}>
        {Language.AR.toUpperCase()}
      </ToggleGroupItem>
      <ToggleGroupItem value={Language.EN} aria-label="Toggle English" variant="outline" className={`${selectedLanguage === Language.EN ? 'bg-white/80 dark:bg-slate-600/80 backdrop-blur-sm' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm'} border border-white/30 dark:border-slate-600/30`}>
        {Language.EN.toUpperCase()}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}