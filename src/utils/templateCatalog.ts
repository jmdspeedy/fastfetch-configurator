import { compatibilityEntryFor, TemplateCategory, TemplateCompatibilityEntry } from '@/data/templates/compatibilityManifest';
import { FASTFETCH_VERSION } from '@/utils/previewCompatibility';

export interface RemoteTemplate {
  name: string;
  download_url: string;
  category: TemplateCategory;
  compatibility: TemplateCompatibilityEntry;
}

interface GitHubContentItem {
  name: string;
  download_url: string;
  type: string;
}

export const FASTFETCH_PRESET_URL = `https://api.github.com/repos/fastfetch-cli/fastfetch/contents/presets?ref=${FASTFETCH_VERSION}`;
export const FASTFETCH_EXAMPLE_URL = `https://api.github.com/repos/fastfetch-cli/fastfetch/contents/presets/examples?ref=${FASTFETCH_VERSION}`;

const isJsonFile = (item: GitHubContentItem) => item.type === 'file' && /\.(jsonc|json)$/i.test(item.name);

export async function fetchRemoteTemplateCatalog(): Promise<RemoteTemplate[]> {
  const [presetsResponse, examplesResponse] = await Promise.all([fetch(FASTFETCH_PRESET_URL), fetch(FASTFETCH_EXAMPLE_URL)]);
  if (!presetsResponse.ok || !examplesResponse.ok) throw new Error('Failed to load the pinned Fastfetch template catalog');
  const [presets, examples] = await Promise.all([
    presetsResponse.json() as Promise<GitHubContentItem[]>,
    examplesResponse.json() as Promise<GitHubContentItem[]>,
  ]);
  const convert = (items: GitHubContentItem[], category: TemplateCategory) => items.filter(isJsonFile).map((item) => ({
    name: item.name,
    download_url: item.download_url,
    category,
    compatibility: compatibilityEntryFor(item.name, category),
  }));
  return [...convert(presets, 'preset'), ...convert(examples, 'example')].sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name, undefined, { numeric: true }));
}
