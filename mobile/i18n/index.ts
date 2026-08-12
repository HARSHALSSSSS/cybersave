import { useSelector } from 'react-redux';
import type { RootState } from '@app/store';
import { LANGUAGES } from '@constants/app';
import { en, type TranslationTree } from './locales/en';
import { hi } from './locales/hi';

const LOCALES: Record<string, TranslationTree> = {
  en,
  hi,
  bn: hi,
  ta: hi,
  te: hi,
  kn: hi,
  ml: hi,
  mr: hi,
  gu: hi,
  pa: hi,
  or: hi,
  as: hi,
};

export function getTranslations(locale: string): TranslationTree {
  return LOCALES[locale] ?? en;
}

/** Replace {{key}} placeholders in translated strings. */
export function tFormat(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    template,
  );
}

export function useTranslation() {
  const locale = useSelector((state: RootState) => state.auth.language);
  const t = getTranslations(locale);
  const format = (template: string, vars: Record<string, string | number>) =>
    tFormat(template, vars);
  return { t, locale, format };
}

export function getLanguageLabel(locale: string): string {
  const match = LANGUAGES.find(lang => lang.id === locale);
  return match?.native ?? match?.english ?? 'English';
}

export function getGreetingKey(): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'greetingMorning';
  if (hour < 17) return 'greetingAfternoon';
  return 'greetingEvening';
}

export function formatAppDate(value: string | Date, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  const tag = locale === 'en' ? 'en-IN' : `${locale}-IN`;
  try {
    return date.toLocaleString(tag);
  } catch {
    return date.toLocaleString('en-IN');
  }
}

export type { TranslationTree };
export {
  getQuickActions,
  getSchemeFilters,
  getSettingsSections,
  getOnboardingSlides,
  getApplicationFilters,
  getNotificationFilters,
  getFaqCategories,
  getFaqCategoryLabel,
  getFaqItems,
  getGovernmentSchemes,
} from './localizedConstants';
export type { LocalizedFaqCategory } from './localizedConstants';
