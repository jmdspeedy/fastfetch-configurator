import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { presetLogos } from '@/utils/logos';

export type ModuleType = 
  | 'Title' | 'Separator' | 'OS' | 'Host' | 'Kernel' | 'Uptime' | 'Packages' | 'Shell' 
  | 'Display' | 'DE' | 'WM' | 'WMTheme' | 'Theme' | 'Icons' | 'Font' | 'Cursor' 
  | 'Terminal' | 'TerminalFont' | 'CPU' | 'GPU' | 'Memory' | 'Swap' | 'Disk' 
  | 'Battery' | 'PowerAdapter' | 'Player' | 'Media' | 'LocalIP' | 'PublicIP' 
  | 'Wifi' | 'DateTime' | 'Locale' | 'Vulkan' | 'OpenGL' | 'OpenCL' | 'Users' 
  | 'Bluetooth' | 'Sound' | 'Gamepad' | 'Weather' | 'NetIO' | 'DiskIO' 
  | 'PhysicalDisk' | 'Version' | 'Break' | 'Colors' | 'Command';

export interface ModuleConfig {
  id: string; // Internal ID for drag-and-drop
  type: string;
  key?: string;
  format?: string;
  keyColor?: string;
  outputColor?: string;
  [key: string]: any; // Allow other schema props
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
  [key: string]: any;
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
  [key: string]: any;
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
  loadConfig: (json: string) => void;
}

// Default Modules (mimicking default fastfetch)
const defaultModules: ModuleConfig[] = [
  { id: '1', type: 'Title' },
  { id: '2', type: 'Separator' },
  { id: '3', type: 'OS' },
  { id: '4', type: 'Host' },
  { id: '5', type: 'Kernel' },
  { id: '6', type: 'Uptime' },
  { id: '7', type: 'Packages' },
  { id: '8', type: 'Shell' },
  { id: '9', type: 'Display' },
  { id: '10', type: 'DE' },
  { id: '11', type: 'WM' },
  { id: '12', type: 'WMTheme' },
  { id: '13', type: 'Theme' },
  { id: '14', type: 'Icons' },
  { id: '15', type: 'Font' },
  { id: '16', type: 'Cursor' },
  { id: '17', type: 'Terminal' },
  { id: '18', type: 'TerminalFont' },
  { id: '19', type: 'CPU' },
  { id: '20', type: 'GPU' },
  { id: '21', type: 'Memory' },
  { id: '22', type: 'Swap' },
  { id: '23', type: 'Disk' },
  { id: '24', type: 'LocalIP' },
  { id: '25', type: 'Battery' },
  { id: '26', type: 'PowerAdapter' },
  { id: '27', type: 'Break' },
  { id: '28', type: 'Colors' },
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
      source: '/path/to/logo.txt', // Placeholder
      _presetName: undefined,
      _customContent: content
    }
  })),

  updateDisplay: (updates) => set((state) => ({
    display: { ...state.display, ...updates }
  })),

  loadConfig: (json) => {
    try {
      const parsed = JSON.parse(json);
      // Basic validation/migration logic would be needed here
      // For now, just a direct set if structure matches
      set({
        logo: parsed.logo || { type: 'auto', _presetName: 'arch' },
        display: parsed.display || {},
        modules: parsed.modules?.map((m: any) => ({
          ...m, 
          id: uuidv4(), 
          type: typeof m === 'string' ? m : m.type 
        })) || defaultModules
      });
    } catch (e) {
      console.error("Failed to load config", e);
    }
  }
}));
