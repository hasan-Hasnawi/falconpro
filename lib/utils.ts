export function getLocalizedName(name: any, locale: string = 'ar'): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') return name[locale] || name.ar || name.en || '';
  return String(name);
}
