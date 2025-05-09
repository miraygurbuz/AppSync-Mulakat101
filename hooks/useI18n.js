import { useEffect } from 'react';
import { I18n } from 'aws-amplify';
import { trTranslations } from '../translations/tr';

export function useI18n(language = 'tr') {
  useEffect(() => {
    I18n.putVocabularies({ tr: trTranslations });
    I18n.setLanguage(language);
  }, [language]);

  return { I18n };
}