/**
 * Deterministic data used by the browser preview.
 *
 * Fastfetch discovers these values from the host at runtime. A web page cannot
 * do that safely, so the preview deliberately uses a named profile until the
 * user imports a capture produced by Fastfetch on their own machine.
 */
export type PreviewPlatform = 'linux' | 'windows' | 'macos';

export interface PreviewProfile {
  id: PreviewPlatform;
  label: string;
  architecture: string;
  values: Record<string, Record<string, string> | Record<string, string>[]>;
  succeeded?: Record<string, boolean | boolean[]>;
  source?: 'sample' | 'capture';
}

const linuxValues: Record<string, Record<string, string>> = {
  os: { sysname: 'Linux', name: 'Arch Linux', 'pretty-name': 'Arch Linux', arch: 'x86_64', version: '' },
  host: { family: 'Desktop', name: 'KVM/QEMU', version: 'Standard PC', vendor: 'QEMU' },
  kernel: { sysname: 'Linux', release: '6.6.13', version: '#1 SMP', arch: 'x86_64', 'display-version': '6.6.13-linux' },
  uptime: { days: '0', hours: '0', minutes: '42', seconds: '0', formatted: '42 mins' },
  packages: { all: '1203', pacman: '1080', dpkg: '0', rpm: '0' },
  shell: { 'process-name': 'bash', 'pretty-name': 'Bash', version: '5.2.21', 'exe-name': 'bash' },
  display: { width: '1920', height: '1080', 'refresh-rate': '60', 'scaled-width': '1920', 'scaled-height': '1080', name: 'eDP-1', type: 'Built-in' },
  de: { 'pretty-name': 'GNOME', version: '45.3', 'process-name': 'gnome-shell' },
  wm: { 'pretty-name': 'Mutter', version: '45.3', 'process-name': 'mutter' },
  wmtheme: { result: 'Adwaita' },
  theme: { theme1: 'Adwaita [GTK2/3]', theme2: 'Adwaita' },
  icons: { icons1: 'Adwaita [GTK2/3]', icons2: 'Papirus' },
  font: { combined: 'Cantarell (11pt)', font1: 'Cantarell' },
  cursor: { theme: 'Adwaita', size: '24' },
  terminal: { 'pretty-name': 'GNOME Terminal', version: '3.50', 'process-name': 'gnome-terminal' },
  terminalfont: { combined: 'Monospace (12pt)', name: 'Monospace', size: '12pt' },
  cpu: { name: 'AMD Ryzen 9 5950X', vendor: 'AMD', 'cores-physical': '16', 'cores-logical': '32', 'freq-max': '4.90 GHz' },
  gpu: { vendor: 'AMD', name: 'Red Hat QXL Paravirtual Graphic Card', driver: 'llvmpipe' },
  memory: { used: '1.21 GiB', total: '16.00 GiB', percentage: '7', 'percentage-bar': '▏─────────' },
  swap: { used: '0 B', total: '4.00 GiB', percentage: '0', name: '/dev/sda2' },
  disk: { 'size-used': '15.4 GiB', 'size-total': '50.0 GiB', 'size-percentage': '31', filesystem: 'ext4', name: 'root', mountpoint: '/', 'size-free': '34.6 GiB' },
  battery: { capacity: '100', status: 'Charging', manufacturer: 'LGC', 'model-name': 'LGC-LGC4.35', 'capacity-bar': '██████████' },
  poweradapter: { watts: '65', name: 'AC Adapter', manufacturer: 'Lenovo' },
  player: { player: 'Spotify', name: 'spotify' },
  media: { combined: 'Never Gonna Give You Up - Rick Astley', title: 'Never Gonna Give You Up', artist: 'Rick Astley', status: 'Playing' },
  localip: { ipv4: '192.168.1.45', ifname: 'eth0' },
  publicip: { ip: '203.0.113.1', location: 'Tokyo, JP' },
  wifi: { ssid: 'MyWifi', status: 'Connected', 'signal-quality': '70', 'signal-quality-bar': '███████───' },
  datetime: { year: '2024', 'year-pretty': '2024', 'month-pretty': '05', 'day-pretty': '20', 'hour-pretty': '14', 'minute-pretty': '30', 'second-pretty': '00', timezone: 'JST', 'timezone-name': 'JST' },
  locale: { result: 'en_US.UTF-8' },
  version: { 'project-name': 'fastfetch', version: '2.66.0', arch: 'x86_64', sysname: 'Linux' },
  users: { name: 'user', 'host-name': 'localhost', 'session-name': 'tty1' },
  sound: { name: 'PulseAudio', 'platform-api': 'PipeWire', 'volume-percentage': '75' },
  gamepad: { name: 'Xbox Wireless Controller', 'battery-percentage': '75' },
  weather: { result: 'Tokyo: ☀ 22°C' },
  netio: { 'rx-size': '1.2 MiB/s', 'tx-size': '0.3 MiB/s', ifname: 'eth0' },
  diskio: { 'size-read': '50 MiB/s', 'size-written': '25 MiB/s', name: 'sda' },
  physicaldisk: { size: '500 GB', name: 'Samsung SSD 980', 'physical-type': 'SSD' },
  bios: { vendor: 'American Megatrends', version: 'F4', date: '12/01/2023' },
  bluetooth: { name: 'Intel Wireless', connected: 'true', 'battery-percentage': '85' },
  bluetoothradio: { name: 'Intel AX200', vendor: 'Intel', version: '5.2' },
  board: { name: 'ROG B550-F Gaming', vendor: 'ASUS', version: 'Rev 1.0' },
  bootmgr: { name: 'systemd-boot', 'secure-boot': 'false' },
  brightness: { percentage: '75', name: 'eDP-1' },
  btrfs: { name: 'data', used: '450 GiB', total: '500 GiB', 'used-percentage': '90' },
  camera: { name: 'Integrated Webcam', width: '1920', height: '1080' },
  chassis: { type: 'Desktop', vendor: 'Default' },
  cpucache: { result: 'L1: 512 KiB / L2: 4 MiB / L3: 32 MiB', sum: '36.5 MiB' },
  cpuusage: { avg: '15', 'avg-bar': '█─────────' },
  dns: { result: '8.8.8.8, 1.1.1.1' },
  editor: { name: 'nvim', type: 'Visual', version: '0.9.5' },
  initsystem: { name: 'systemd', version: '255', pid: '1' },
  keyboard: { name: 'US QWERTY' },
  lm: { service: 'SDDM', type: 'DM', version: '0.20.0' },
  loadavg: { loadavg1: '0.52', loadavg2: '0.48', loadavg3: '0.43' },
  monitor: { name: 'LG 27GL850', width: '2560', height: '1440', 'refresh-rate': '144' },
  mouse: { name: 'Logitech G502 HERO' },
  physicalmemory: { size: '8 GiB', type: 'DDR4', 'running-speed': '3200' },
  processes: { result: '245' },
  terminalsize: { columns: '120', rows: '40', width: '1920', height: '1080' },
  terminaltheme: { 'fg-color': '#FFFFFF', 'bg-color': '#282A36', 'fg-type': 'Light', 'bg-type': 'Dark' },
  tpm: { version: '2.0', description: 'Enabled' },
  wallpaper: { 'file-name': 'arch.png', 'full-path': '/usr/share/backgrounds/arch.png' },
  vulkan: { driver: 'RADV', 'api-version': '1.3.278' },
  opengl: { version: '4.6', renderer: 'Mesa 24.0.1', vendor: 'AMD' },
  opencl: { version: '3.0', name: 'Mesa', vendor: 'AMD' },
  zpool: { name: 'rpool', state: 'ONLINE', used: '1.2 TiB', total: '2.0 TiB', 'used-percentage': '60' },
  codec: { gpu: 'AMD Radeon', direction: 'Decoder', types: 'H264, HEVC', 'platform-api': 'VA-API' },
};

const windowsValues: Record<string, Record<string, string>> = {
  ...linuxValues,
  os: { sysname: 'Windows', name: 'Windows', 'pretty-name': 'Windows 11 Pro', arch: 'x86_64' },
  shell: { 'process-name': 'PowerShell', 'pretty-name': 'PowerShell', version: '7.5.0', 'exe-name': 'pwsh' },
  de: { 'pretty-name': 'Windows', version: '11' },
  wm: { 'pretty-name': 'DWM', version: '' },
  terminal: { 'pretty-name': 'Windows Terminal', version: '1.22' },
  terminalfont: { combined: 'Cascadia Mono (12pt)', name: 'Cascadia Mono', size: '12pt' },
};

const macosValues: Record<string, Record<string, string>> = {
  ...linuxValues,
  os: { sysname: 'Darwin', name: 'macOS', 'pretty-name': 'macOS 15.5', arch: 'arm64' },
  host: { family: 'Mac', name: 'MacBook Pro', version: 'Apple Silicon', vendor: 'Apple' },
  kernel: { sysname: 'Darwin', release: '24.5.0', version: 'Darwin Kernel Version', arch: 'arm64', 'display-version': '24.5.0' },
  shell: { 'process-name': 'zsh', 'pretty-name': 'Zsh', version: '5.9', 'exe-name': 'zsh' },
  de: { 'pretty-name': 'Aqua', version: '' },
  wm: { 'pretty-name': 'Quartz Compositor', version: '' },
  terminal: { 'pretty-name': 'Terminal.app', version: '2.14' },
  terminalfont: { combined: 'SF Mono (12pt)', name: 'SF Mono', size: '12pt' },
};

export const previewProfiles: Record<PreviewPlatform, PreviewProfile> = {
  linux: { id: 'linux', label: 'Linux', architecture: 'x86_64', values: linuxValues, source: 'sample' },
  windows: { id: 'windows', label: 'Windows', architecture: 'x86_64', values: windowsValues, source: 'sample' },
  macos: { id: 'macos', label: 'macOS', architecture: 'arm64', values: macosValues, source: 'sample' },
};

export const defaultPreviewProfile = previewProfiles.linux;
