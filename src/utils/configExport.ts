
import { ModuleConfig, LogoConfig, DisplayConfig } from '@/store/config';

export const generateConfigString = (
    modules: ModuleConfig[],
    logo: LogoConfig,
    display: DisplayConfig
): string => {
    const cleanModules = modules.map(({ id: _id, ...rest }) => {
        if (Object.keys(rest).length === 1 && rest.type) return rest.type;
        return rest;
    });

    const config = {
        $schema: 'https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json',
        logo: logo._customContent ? {
            type: 'file',
            source: '~/.config/fastfetch/logo.txt',
            padding: logo.padding
        } : {
            ...logo,
            _presetName: undefined,
            _customContent: undefined,
            source: logo.source || logo._presetName
        },
        display,
        modules: cleanModules,
    };

    return JSON.stringify(config, null, 2);
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
