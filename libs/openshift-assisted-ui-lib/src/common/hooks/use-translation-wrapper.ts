// eslint-disable-next-line no-restricted-imports
import { useTranslation as useReactI18NextTranslation } from 'react-i18next';

export function useTranslation() {
  return useReactI18NextTranslation(import.meta.env.TRANSLATION_NAMESPACE);
}
