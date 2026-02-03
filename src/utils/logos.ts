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

export const getLogoData = (name: string): LogoDefinition | undefined => {
  if (!name) return undefined;
  
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
  
  // Try finding by ID if name is something like "windows_11" vs "Windows 11"
  // But my ID logic in generator was implicit.
  
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
