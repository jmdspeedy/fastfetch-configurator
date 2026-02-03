import { allLogos, LogoDefinition } from '../data/allLogos';

export const commonLogos = [
  "Arch",
  "Debian",
  "Ubuntu",
  "Fedora",
  "Windows 11",
  "macOS",
  "Linux",
  "Android",
  "Pop!_OS",
  "Manjaro",
  "Mint",
  "EndeavourOS",
  "NixOS",
  "Gentoo",
  "Kali",
  "OpenSUSE",
  "Raspbian"
];

// Helper to normalize search
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const manualOverrides: Record<string, string> = {
  "Mint": "linuxmint",
  "Pop!_OS": "pop",
  "Raspbian": "raspbian", // Ensure casing doesn't mess it up if strict
};

export const getLogoData = (name: string): LogoDefinition | undefined => {
  if (!name) return undefined;

  // Handle Manual Overrides
  if (manualOverrides[name]) {
    const overrideName = manualOverrides[name];
    // Recursively find the overridden name
    // (But avoid infinite recursion if bad config, though simple lookup is safer)
    const overrideLogo = allLogos.find(l => l.name === overrideName || l.aliases.includes(overrideName));
    if (overrideLogo) return overrideLogo;
  }
  
  // Try exact match
  let logo = allLogos.find(l => l.name === name);
  if (logo) return logo;

  // Try alias match
  logo = allLogos.find(l => l.aliases.includes(name));
  if (logo) return logo;

  // Try normalized search
  const search = normalize(name);
  logo = allLogos.find(l => 
    normalize(l.name) === search || 
    l.aliases.some(a => normalize(a) === search)
  );
  
  return logo;
};

// For backward compatibility if needed, or helper for color
export const getLogoColor = (name: string): string => {
  const data = getLogoData(name);
  if (data && data.colors.length > 0) {
    return data.colors[0]; // Return primary color
  }
  return 'text-gray-200';
};
