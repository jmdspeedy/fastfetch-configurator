import { FASTFETCH_VERSION } from '@/utils/previewCompatibility';

export type TemplateCategory = 'preset' | 'example';
export type CertificationStatus = 'certified' | 'native-required';

export interface TemplateCompatibilityEntry {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  platforms: Array<'linux' | 'macos' | 'windows'>;
  defaultProfile: 'linux' | 'windows' | 'macos';
  logoBehavior: 'automatic' | 'explicit' | 'none' | 'terminal-protocol';
  widths: number[];
  fixture: string;
  fastfetchVersion: string;
  editableFields: string[];
  certification: CertificationStatus;
}

const base = (name: string, category: TemplateCategory): TemplateCompatibilityEntry => ({
  id: `${category}-${name.replace(/\.jsonc?$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  category,
  description: category === 'preset' ? 'Fastfetch release preset' : 'Fastfetch release example',
  platforms: ['linux', 'macos', 'windows'],
  defaultProfile: 'linux',
  logoBehavior: 'automatic',
  widths: [80, 100, 120, 160],
  fixture: `tests/fixtures/templates/${category}/${name}`,
  fastfetchVersion: FASTFETCH_VERSION,
  editableFields: ['key', 'keyColor', 'outputColor', 'separator', 'color'],
  certification: 'native-required',
});

/**
 * Committed compatibility metadata for the pinned release. Runtime discovery
 * remains authoritative; the parity job adds/updates entries when GitHub
 * publishes a new directory member instead of silently filtering it out.
 */
export const compatibilityManifest: TemplateCompatibilityEntry[] = [
  ...Array.from({ length: 31 }, (_, index) => base(`${index + 2}.jsonc`, 'example')),
  ...['all.jsonc', 'archey.jsonc', 'ci.jsonc', 'neofetch.jsonc', 'paleofetch.jsonc', 'screenfetch.jsonc'].map((name) => base(name, 'preset')),
];

export function compatibilityEntryFor(name: string, category: TemplateCategory): TemplateCompatibilityEntry {
  return compatibilityManifest.find((entry) => entry.name === name && entry.category === category) || {
    ...base(name, category),
    certification: 'native-required',
  };
}
