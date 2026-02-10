import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type ModuleType =
  | 'title' | 'separator' | 'os' | 'host' | 'kernel' | 'uptime' | 'packages' | 'shell'
  | 'display' | 'de' | 'wm' | 'wmtheme' | 'theme' | 'icons' | 'font' | 'cursor'
  | 'terminal' | 'terminalfont' | 'cpu' | 'gpu' | 'memory' | 'swap' | 'disk'
  | 'battery' | 'poweradapter' | 'player' | 'media' | 'localip' | 'publicip'
  | 'wifi' | 'datetime' | 'locale' | 'vulkan' | 'opengl' | 'opencl' | 'users'
  | 'bluetooth' | 'sound' | 'gamepad' | 'weather' | 'netio' | 'diskio'
  | 'physicaldisk' | 'version' | 'break' | 'colors' | 'command'
  | 'bios' | 'bluetoothradio' | 'board' | 'bootmgr' | 'brightness' | 'btrfs'
  | 'camera' | 'chassis' | 'cpucache' | 'cpuusage' | 'custom' | 'dns'
  | 'editor' | 'initsystem' | 'keyboard' | 'lm' | 'loadavg' | 'logo'
  | 'monitor' | 'mouse' | 'physicalmemory' | 'processes' | 'terminalsize'
  | 'terminaltheme' | 'tpm' | 'wallpaper' | 'zpool';

export interface ModuleConfig {
  id: string; // Internal ID for drag-and-drop
  type: string;
  key?: string;
  format?: string;
  keyColor?: string;
  outputColor?: string;
  text?: string; // For Command module (shell command to execute)
  source?: string; // For File module
  [key: string]: unknown; // Allow other schema props
}

export interface LogoConfig {
  type: 'auto' | 'builtin' | 'file' | 'data' | 'raw' | 'sixel' | 'kitty' | 'iterm' | 'chafa' | 'small';
  source?: string;
  width?: number;
  height?: number;
  padding?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  color?: {
    [key: string]: string;
  };
  // Store internal state for preview
  _presetName?: string;
  _customContent?: string;
  [key: string]: unknown;
}

export interface DisplayConfig {
  color?: {
    keys?: string;
    title?: string;
    output?: string;
    separator?: string;
  };
  separator?: string;
  keyWidth?: number;
  [key: string]: unknown;
}

interface ConfigState {
  modules: ModuleConfig[];
  logo: LogoConfig;
  display: DisplayConfig;

  // Actions
  addModule: (type: string) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<ModuleConfig>) => void;
  reorderModules: (newOrder: ModuleConfig[]) => void;
  updateLogo: (updates: Partial<LogoConfig>) => void;
  setPresetLogo: (name: string) => void;
  setCustomLogo: (content: string) => void;
  updateDisplay: (updates: Partial<DisplayConfig>) => void;
  resetConfig: () => void;
  loadConfig: (json: string) => void;
}

// Default Modules (mimicking default fastfetch)
const defaultModules: ModuleConfig[] = [
  { id: '1', type: 'title' },
  { id: '2', type: 'separator' },
  { id: '3', type: 'os' },
  { id: '4', type: 'host' },
  { id: '5', type: 'kernel' },
  { id: '6', type: 'uptime' },
  { id: '7', type: 'packages' },
  { id: '8', type: 'shell' },
  { id: '9', type: 'display' },
  { id: '10', type: 'de' },
  { id: '11', type: 'wm' },
  { id: '12', type: 'wmtheme' },
  { id: '13', type: 'theme' },
  { id: '14', type: 'icons' },
  { id: '15', type: 'font' },
  { id: '16', type: 'cursor' },
  { id: '17', type: 'terminal' },
  { id: '18', type: 'terminalfont' },
  { id: '19', type: 'cpu' },
  { id: '20', type: 'gpu' },
  { id: '21', type: 'memory' },
  { id: '22', type: 'swap' },
  { id: '23', type: 'disk' },
  { id: '24', type: 'localip' },
  { id: '25', type: 'battery' },
  { id: '26', type: 'poweradapter' },
  { id: '27', type: 'break' },
  { id: '28', type: 'colors' },
];

export const useConfigStore = create<ConfigState>((set) => ({
  modules: defaultModules,
  logo: {
    type: 'auto',
    padding: { top: 2, left: 2 },
    _presetName: 'arch'
  },
  display: {
    separator: '  ->  ',
    color: {
      keys: 'blue',
      title: 'blue',
    }
  },

  addModule: (type) => set((state) => ({
    modules: [...state.modules, { id: uuidv4(), type }]
  })),

  removeModule: (id) => set((state) => ({
    modules: state.modules.filter((m) => m.id !== id)
  })),

  updateModule: (id, updates) => set((state) => ({
    modules: state.modules.map((m) => m.id === id ? { ...m, ...updates } : m)
  })),

  reorderModules: (newOrder) => set({ modules: newOrder }),

  updateLogo: (updates) => set((state) => ({
    logo: { ...state.logo, ...updates }
  })),

  setPresetLogo: (name) => set((state) => ({
    logo: {
      ...state.logo,
      type: 'auto', // Reset to auto/builtin for presets
      source: undefined,
      _presetName: name,
      _customContent: undefined
    }
  })),

  setCustomLogo: (content) => set((state) => ({
    logo: {
      ...state.logo,
      type: 'file', // Typically custom logos are loaded from file
      source: 'logo.txt', // Default reference for downloaded files
      _presetName: undefined,
      _customContent: content
    }
  })),

  updateDisplay: (updates) => set((state) => ({
    display: { ...state.display, ...updates }
  })),

  resetConfig: () => set({
    modules: defaultModules,
    logo: { type: 'auto', padding: { top: 2, left: 2 }, _presetName: 'arch' },
    display: { separator: '  ->  ', color: { keys: 'blue', title: 'blue' } }
  }),

  loadConfig: (json) => {
    try {
      // Strip JSONC comments (// and /* */) before parsing
      const stripJsonComments = (str: string): string => {
        let result = '';
        let inString = false;
        let inSingleLineComment = false;
        let inMultiLineComment = false;
        let escapeNext = false;

        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          const nextChar = str[i + 1];

          if (escapeNext) {
            result += char;
            escapeNext = false;
            continue;
          }

          if (char === '\\' && inString) {
            result += char;
            escapeNext = true;
            continue;
          }

          if (char === '"' && !inSingleLineComment && !inMultiLineComment) {
            inString = !inString;
            result += char;
            continue;
          }

          if (inString) {
            result += char;
            continue;
          }

          if (inSingleLineComment) {
            if (char === '\n') {
              inSingleLineComment = false;
              result += char;
            }
            continue;
          }

          if (inMultiLineComment) {
            if (char === '*' && nextChar === '/') {
              inMultiLineComment = false;
              i++; // Skip the '/'
            }
            continue;
          }

          if (char === '/' && nextChar === '/') {
            inSingleLineComment = true;
            i++; // Skip the second '/'
            continue;
          }

          if (char === '/' && nextChar === '*') {
            inMultiLineComment = true;
            i++; // Skip the '*'
            continue;
          }

          result += char;
        }

        return result;
      };

      const cleanedJson = stripJsonComments(json);
      // Remove trailing commas (allowed in JSONC but not standard JSON)
      const noTrailingCommas = cleanedJson.replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(noTrailingCommas);
      // Basic validation/migration logic would be needed here
      // For now, just a direct set if structure matches
      set({
        logo: parsed.logo || { type: 'auto', _presetName: 'arch' },
        display: parsed.display || {},
        modules: parsed.modules?.map((m: string | ModuleConfig) => {
          if (typeof m === 'string') {
            // Simple string module like "title" — normalize to lowercase
            return { id: uuidv4(), type: m.toLowerCase() };
          } else {
            // Object module with additional properties — normalize type to lowercase
            return { ...m, id: uuidv4(), type: m.type.toLowerCase() };
          }
        }) || defaultModules
      });
    } catch (e) {
      console.error("Failed to load config", e);
    }
  }
}));
