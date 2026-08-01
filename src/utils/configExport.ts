
import { ModuleConfig, LogoConfig, DisplayConfig } from '@/store/config';

export const FASTFETCH_SCHEMA_URL = 'https://raw.githubusercontent.com/fastfetch-cli/fastfetch/2.66.0/doc/json_schema.json';

export const buildConfigDocument = (
    modules: ModuleConfig[],
    logo: LogoConfig,
    display: DisplayConfig,
    general: Record<string, unknown> = {},
) => {
    const cleanModules = modules.map((module) => {
        const rest = Object.fromEntries(Object.entries(module).filter(([key]) => key !== 'id')) as Record<string, unknown>;
        if (Object.keys(rest).length === 1 && rest.type) return rest.type;
        return rest;
    });

    const cleanLogo = logo._customContent
        ? { type: 'file', source: '~/.config/fastfetch/logo.txt', padding: logo.padding }
        : Object.fromEntries(Object.entries({
            ...logo,
            _presetName: undefined,
            _customContent: undefined,
            source: logo.type === 'none' ? undefined : (logo.source || logo._presetName),
        }).filter(([, value]) => value !== undefined));

    return {
        $schema: FASTFETCH_SCHEMA_URL,
        ...(Object.keys(general).length > 0 ? { general } : {}),
        logo: cleanLogo,
        display,
        modules: cleanModules,
    };
};

export const generateConfigString = (
    modules: ModuleConfig[],
    logo: LogoConfig,
    display: DisplayConfig,
    general: Record<string, unknown> = {},
): string => {
    return JSON.stringify(buildConfigDocument(modules, logo, display, general), null, 2);
};

export const downloadConfig = (json: string, filename: string = 'config.jsonc') => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
};
