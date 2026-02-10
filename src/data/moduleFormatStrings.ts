/**
 * Format string placeholder definitions for all fastfetch modules.
 * Extracted from the official JSON schema:
 * https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json
 *
 * Each module maps to an array of placeholders that can be used in
 * format strings with `{placeholder}` syntax.
 */

export interface FormatPlaceholder {
  /** The placeholder name used inside braces, e.g. "name" for {name} */
  placeholder: string;
  /** Human-readable description of what this placeholder resolves to */
  description: string;
}

export const moduleFormatStrings: Record<string, FormatPlaceholder[]> = {
  Battery: [
    { placeholder: 'manufacturer', description: 'Battery manufacturer' },
    { placeholder: 'model-name', description: 'Battery model name' },
    { placeholder: 'technology', description: 'Battery technology' },
    { placeholder: 'capacity', description: 'Battery capacity (percentage num)' },
    { placeholder: 'status', description: 'Battery status' },
    { placeholder: 'temperature', description: 'Battery temperature (formatted)' },
    { placeholder: 'cycle-count', description: 'Battery cycle count' },
    { placeholder: 'serial', description: 'Battery serial number' },
    { placeholder: 'manufacture-date', description: 'Battery manufacture date' },
    { placeholder: 'capacity-bar', description: 'Battery capacity (percentage bar)' },
    { placeholder: 'time-days', description: 'Time remaining days' },
    { placeholder: 'time-hours', description: 'Time remaining hours' },
    { placeholder: 'time-minutes', description: 'Time remaining minutes' },
    { placeholder: 'time-seconds', description: 'Time remaining seconds' },
    { placeholder: 'time-formatted', description: 'Time remaining (formatted)' },
  ],

  BIOS: [
    { placeholder: 'date', description: 'BIOS date' },
    { placeholder: 'release', description: 'BIOS release' },
    { placeholder: 'vendor', description: 'BIOS vendor' },
    { placeholder: 'version', description: 'BIOS version' },
    { placeholder: 'type', description: 'Firmware type' },
  ],

  Bluetooth: [
    { placeholder: 'name', description: 'Name' },
    { placeholder: 'address', description: 'Address' },
    { placeholder: 'type', description: 'Type' },
    { placeholder: 'battery-percentage', description: 'Battery percentage number' },
    { placeholder: 'connected', description: 'Is connected' },
    { placeholder: 'battery-percentage-bar', description: 'Battery percentage bar' },
  ],

  BluetoothRadio: [
    { placeholder: 'name', description: 'Radio name for discovering' },
    { placeholder: 'address', description: 'Address' },
    { placeholder: 'lmp-version', description: 'LMP version' },
    { placeholder: 'lmp-subversion', description: 'LMP subversion' },
    { placeholder: 'version', description: 'Bluetooth version' },
    { placeholder: 'vendor', description: 'Vendor' },
    { placeholder: 'discoverable', description: 'Discoverable' },
    { placeholder: 'connectable', description: 'Connectable / Pairable' },
  ],

  Board: [
    { placeholder: 'name', description: 'Board name' },
    { placeholder: 'vendor', description: 'Board vendor' },
    { placeholder: 'version', description: 'Board version' },
    { placeholder: 'serial', description: 'Board serial number' },
  ],

  Bootmgr: [
    { placeholder: 'name', description: 'Name / description' },
    { placeholder: 'firmware-path', description: 'Firmware file path' },
    { placeholder: 'firmware-name', description: 'Firmware file name' },
    { placeholder: 'secure-boot', description: 'Is secure boot enabled' },
    { placeholder: 'order', description: 'Boot order' },
  ],

  Brightness: [
    { placeholder: 'percentage', description: 'Screen brightness (percentage num)' },
    { placeholder: 'name', description: 'Screen name' },
    { placeholder: 'max', description: 'Maximum brightness value' },
    { placeholder: 'min', description: 'Minimum brightness value' },
    { placeholder: 'current', description: 'Current brightness value' },
    { placeholder: 'percentage-bar', description: 'Screen brightness (percentage bar)' },
    { placeholder: 'is-builtin', description: 'Is built-in screen' },
  ],

  Btrfs: [
    { placeholder: 'name', description: 'Name / Label' },
    { placeholder: 'uuid', description: 'UUID' },
    { placeholder: 'devices', description: 'Associated devices' },
    { placeholder: 'features', description: 'Enabled features' },
    { placeholder: 'used', description: 'Size used' },
    { placeholder: 'allocated', description: 'Size allocated' },
    { placeholder: 'total', description: 'Size total' },
    { placeholder: 'used-percentage', description: 'Used percentage num' },
    { placeholder: 'allocated-percentage', description: 'Allocated percentage num' },
    { placeholder: 'used-percentage-bar', description: 'Used percentage bar' },
    { placeholder: 'allocated-percentage-bar', description: 'Allocated percentage bar' },
    { placeholder: 'node-size', description: 'Node size' },
    { placeholder: 'sector-size', description: 'Sector size' },
  ],

  Camera: [
    { placeholder: 'name', description: 'Device name' },
    { placeholder: 'vendor', description: 'Vendor' },
    { placeholder: 'colorspace', description: 'Color space' },
    { placeholder: 'id', description: 'Identifier' },
    { placeholder: 'width', description: 'Width (in px)' },
    { placeholder: 'height', description: 'Height (in px)' },
  ],

  Chassis: [
    { placeholder: 'type', description: 'Chassis type' },
    { placeholder: 'vendor', description: 'Chassis vendor' },
    { placeholder: 'version', description: 'Chassis version' },
    { placeholder: 'serial', description: 'Chassis serial number' },
  ],

  Command: [
    { placeholder: 'result', description: 'Command result' },
  ],

  CPU: [
    { placeholder: 'name', description: 'Name' },
    { placeholder: 'vendor', description: 'Vendor' },
    { placeholder: 'cores-physical', description: 'Physical core count' },
    { placeholder: 'cores-logical', description: 'Logical core count' },
    { placeholder: 'cores-online', description: 'Online core count' },
    { placeholder: 'freq-base', description: 'Base frequency (formatted)' },
    { placeholder: 'freq-max', description: 'Max frequency (formatted)' },
    { placeholder: 'temperature', description: 'Temperature (formatted)' },
    { placeholder: 'core-types', description: 'Logical core count grouped by frequency' },
    { placeholder: 'packages', description: 'Processor package count' },
    { placeholder: 'march', description: 'x86-64 CPU microarchitecture' },
  ],

  CPUCache: [
    { placeholder: 'result', description: 'Separate result' },
    { placeholder: 'sum', description: 'Sum result' },
  ],

  CPUUsage: [
    { placeholder: 'avg', description: 'CPU usage (percentage num, average)' },
    { placeholder: 'max', description: 'CPU usage (percentage num, maximum)' },
    { placeholder: 'max-index', description: 'CPU core index of maximum usage' },
    { placeholder: 'min', description: 'CPU usage (percentage num, minimum)' },
    { placeholder: 'min-index', description: 'CPU core index of minimum usage' },
    { placeholder: 'avg-bar', description: 'CPU usage (percentage bar, average)' },
    { placeholder: 'max-bar', description: 'CPU usage (percentage bar, maximum)' },
    { placeholder: 'min-bar', description: 'CPU usage (percentage bar, minimum)' },
  ],

  Cursor: [
    { placeholder: 'theme', description: 'Cursor theme' },
    { placeholder: 'size', description: 'Cursor size' },
  ],

  DateTime: [
    { placeholder: 'year', description: 'Year' },
    { placeholder: 'year-short', description: 'Last two digits of year' },
    { placeholder: 'month', description: 'Month' },
    { placeholder: 'month-pretty', description: 'Month with leading zero' },
    { placeholder: 'month-name', description: 'Month name' },
    { placeholder: 'month-name-short', description: 'Month name short' },
    { placeholder: 'week', description: 'Week number on year' },
    { placeholder: 'weekday', description: 'Weekday' },
    { placeholder: 'weekday-short', description: 'Weekday short' },
    { placeholder: 'day-in-year', description: 'Day in year' },
    { placeholder: 'day-in-month', description: 'Day in month' },
    { placeholder: 'day-in-week', description: 'Day in week' },
    { placeholder: 'hour', description: 'Hour' },
    { placeholder: 'hour-pretty', description: 'Hour with leading zero' },
    { placeholder: 'hour-12', description: 'Hour 12h format' },
    { placeholder: 'hour-12-pretty', description: 'Hour 12h format with leading zero' },
    { placeholder: 'minute', description: 'Minute' },
    { placeholder: 'minute-pretty', description: 'Minute with leading zero' },
    { placeholder: 'second', description: 'Second' },
    { placeholder: 'second-pretty', description: 'Second with leading zero' },
    { placeholder: 'offset-from-utc', description: 'Offset from UTC (ISO 8601)' },
    { placeholder: 'timezone-name', description: 'Timezone name or abbreviation' },
    { placeholder: 'day-pretty', description: 'Day in month with leading zero' },
  ],

  DE: [
    { placeholder: 'process-name', description: 'DE process name' },
    { placeholder: 'pretty-name', description: 'DE pretty name' },
    { placeholder: 'version', description: 'DE version' },
  ],

  Display: [
    { placeholder: 'width', description: 'Screen configured width (px)' },
    { placeholder: 'height', description: 'Screen configured height (px)' },
    { placeholder: 'refresh-rate', description: 'Screen refresh rate (Hz)' },
    { placeholder: 'scaled-width', description: 'Screen scaled width (px)' },
    { placeholder: 'scaled-height', description: 'Screen scaled height (px)' },
    { placeholder: 'name', description: 'Screen name' },
    { placeholder: 'type', description: 'Screen type (Built-in or External)' },
    { placeholder: 'rotation', description: 'Screen rotation (degrees)' },
    { placeholder: 'is-primary', description: 'True if primary screen' },
    { placeholder: 'physical-width', description: 'Physical width (mm)' },
    { placeholder: 'physical-height', description: 'Physical height (mm)' },
    { placeholder: 'inch', description: 'Physical diagonal length (inches)' },
    { placeholder: 'ppi', description: 'Pixels per inch (PPI)' },
    { placeholder: 'bit-depth', description: 'Bits per color channel' },
    { placeholder: 'hdr-enabled', description: 'True if HDR mode is enabled' },
    { placeholder: 'manufacture-year', description: 'Year of manufacturing' },
    { placeholder: 'manufacture-week', description: 'Week of manufacturing' },
    { placeholder: 'serial', description: 'Serial number' },
    { placeholder: 'platform-api', description: 'Platform API used' },
    { placeholder: 'hdr-compatible', description: 'True if HDR compatible' },
    { placeholder: 'scale-factor', description: 'HiDPI scale factor' },
    { placeholder: 'preferred-width', description: 'Preferred width (px)' },
    { placeholder: 'preferred-height', description: 'Preferred height (px)' },
    { placeholder: 'preferred-refresh-rate', description: 'Preferred refresh rate (Hz)' },
  ],

  Disk: [
    { placeholder: 'size-used', description: 'Size used' },
    { placeholder: 'size-total', description: 'Size total' },
    { placeholder: 'size-percentage', description: 'Size percentage num' },
    { placeholder: 'files-used', description: 'Files used' },
    { placeholder: 'files-total', description: 'Files total' },
    { placeholder: 'files-percentage', description: 'Files percentage num' },
    { placeholder: 'is-external', description: 'True if external volume' },
    { placeholder: 'is-hidden', description: 'True if hidden volume' },
    { placeholder: 'filesystem', description: 'Filesystem' },
    { placeholder: 'name', description: 'Label / name' },
    { placeholder: 'is-readonly', description: 'True if read-only' },
    { placeholder: 'create-time', description: 'Create time in local timezone' },
    { placeholder: 'size-percentage-bar', description: 'Size percentage bar' },
    { placeholder: 'files-percentage-bar', description: 'Files percentage bar' },
    { placeholder: 'mountpoint', description: 'Mount point / drive letter' },
    { placeholder: 'mount-from', description: 'Mount from (device path)' },
    { placeholder: 'size-free', description: 'Size free' },
    { placeholder: 'size-available', description: 'Size available' },
  ],

  DiskIO: [
    { placeholder: 'size-read', description: 'Data read per second (formatted)' },
    { placeholder: 'size-written', description: 'Data written per second (formatted)' },
    { placeholder: 'name', description: 'Device name' },
    { placeholder: 'dev-path', description: 'Device raw file path' },
    { placeholder: 'bytes-read', description: 'Data read per second (bytes)' },
    { placeholder: 'bytes-written', description: 'Data written per second (bytes)' },
    { placeholder: 'read-count', description: 'Number of reads' },
    { placeholder: 'write-count', description: 'Number of writes' },
  ],

  DNS: [
    { placeholder: 'result', description: 'DNS result' },
  ],

  Editor: [
    { placeholder: 'type', description: 'Type (Visual / Editor)' },
    { placeholder: 'name', description: 'Name' },
    { placeholder: 'exe-name', description: 'Exe name of real path' },
    { placeholder: 'path', description: 'Full path of real path' },
    { placeholder: 'version', description: 'Version' },
  ],

  Font: [
    { placeholder: 'font1', description: 'Font 1' },
    { placeholder: 'font2', description: 'Font 2' },
    { placeholder: 'font3', description: 'Font 3' },
    { placeholder: 'font4', description: 'Font 4' },
    { placeholder: 'combined', description: 'Combined fonts for display' },
  ],

  Gamepad: [
    { placeholder: 'name', description: 'Name' },
    { placeholder: 'serial', description: 'Serial number' },
    { placeholder: 'battery-percentage', description: 'Battery percentage num' },
    { placeholder: 'battery-percentage-bar', description: 'Battery percentage bar' },
  ],

  GPU: [
    { placeholder: 'vendor', description: 'GPU vendor' },
    { placeholder: 'name', description: 'GPU name' },
    { placeholder: 'driver', description: 'GPU driver' },
    { placeholder: 'temperature', description: 'GPU temperature' },
    { placeholder: 'core-count', description: 'GPU core count' },
    { placeholder: 'type', description: 'GPU type' },
    { placeholder: 'dedicated-total', description: 'Total dedicated memory' },
    { placeholder: 'dedicated-used', description: 'Used dedicated memory' },
    { placeholder: 'shared-total', description: 'Total shared memory' },
    { placeholder: 'shared-used', description: 'Used shared memory' },
    { placeholder: 'platform-api', description: 'Platform API used' },
    { placeholder: 'frequency', description: 'Current frequency (GHz)' },
    { placeholder: 'index', description: 'Vendor specific index' },
    { placeholder: 'dedicated-percentage-num', description: 'Dedicated memory usage %' },
    { placeholder: 'dedicated-percentage-bar', description: 'Dedicated memory usage bar' },
    { placeholder: 'shared-percentage-num', description: 'Shared memory usage %' },
    { placeholder: 'shared-percentage-bar', description: 'Shared memory usage bar' },
    { placeholder: 'core-usage-num', description: 'Core usage percentage num' },
    { placeholder: 'core-usage-bar', description: 'Core usage percentage bar' },
    { placeholder: 'memory-type', description: 'Memory type (Windows only)' },
  ],

  Host: [
    { placeholder: 'family', description: 'Product family' },
    { placeholder: 'name', description: 'Product name' },
    { placeholder: 'version', description: 'Product version' },
    { placeholder: 'sku', description: 'Product SKU' },
    { placeholder: 'vendor', description: 'Product vendor' },
    { placeholder: 'serial', description: 'Product serial number' },
    { placeholder: 'uuid', description: 'Product UUID' },
  ],

  Icons: [
    { placeholder: 'icons1', description: 'Icons part 1' },
    { placeholder: 'icons2', description: 'Icons part 2' },
  ],

  InitSystem: [
    { placeholder: 'name', description: 'Init system name' },
    { placeholder: 'exe', description: 'Init system exe path' },
    { placeholder: 'version', description: 'Init system version' },
    { placeholder: 'pid', description: 'Init system PID' },
  ],

  Kernel: [
    { placeholder: 'sysname', description: 'Sysname' },
    { placeholder: 'release', description: 'Release' },
    { placeholder: 'version', description: 'Version' },
    { placeholder: 'arch', description: 'Architecture' },
    { placeholder: 'display-version', description: 'Display version' },
    { placeholder: 'page-size', description: 'Page size' },
  ],

  Keyboard: [
    { placeholder: 'name', description: 'Name' },
    { placeholder: 'serial', description: 'Serial number' },
  ],

  LM: [
    { placeholder: 'service', description: 'LM service' },
    { placeholder: 'type', description: 'LM type' },
    { placeholder: 'version', description: 'LM version' },
  ],

  Loadavg: [
    { placeholder: 'loadavg1', description: 'Load average over 1min' },
    { placeholder: 'loadavg2', description: 'Load average over 5min' },
    { placeholder: 'loadavg3', description: 'Load average over 15min' },
  ],

  Locale: [
    { placeholder: 'result', description: 'Locale code' },
  ],

  LocalIP: [
    { placeholder: 'ipv4', description: 'IPv4 address' },
    { placeholder: 'ipv6', description: 'IPv6 address' },
    { placeholder: 'mac', description: 'MAC address' },
    { placeholder: 'ifname', description: 'Interface name' },
    { placeholder: 'is-default-route', description: 'Is default route' },
    { placeholder: 'mtu', description: 'MTU size in bytes' },
    { placeholder: 'speed', description: 'Link speed (formatted)' },
    { placeholder: 'flags', description: 'Interface flags' },
  ],

  Media: [
    { placeholder: 'combined', description: 'Pretty media name' },
    { placeholder: 'title', description: 'Media name' },
    { placeholder: 'artist', description: 'Artist name' },
    { placeholder: 'album', description: 'Album name' },
    { placeholder: 'status', description: 'Status' },
  ],

  Memory: [
    { placeholder: 'used', description: 'Used size' },
    { placeholder: 'total', description: 'Total size' },
    { placeholder: 'percentage', description: 'Percentage used (num)' },
    { placeholder: 'percentage-bar', description: 'Percentage used (bar)' },
  ],

  Monitor: [
    { placeholder: 'name', description: 'Display name' },
    { placeholder: 'width', description: 'Native resolution width (px)' },
    { placeholder: 'height', description: 'Native resolution height (px)' },
    { placeholder: 'physical-width', description: 'Physical width (mm)' },
    { placeholder: 'physical-height', description: 'Physical height (mm)' },
    { placeholder: 'inch', description: 'Physical diagonal length (inches)' },
    { placeholder: 'ppi', description: 'Pixels per inch (PPI)' },
    { placeholder: 'manufacture-year', description: 'Year of manufacturing' },
    { placeholder: 'manufacture-week', description: 'Week of manufacturing' },
    { placeholder: 'serial', description: 'Serial number' },
    { placeholder: 'refresh-rate', description: 'Max refresh rate (Hz)' },
    { placeholder: 'hdr-compatible', description: 'True if HDR compatible' },
  ],

  Mouse: [
    { placeholder: 'name', description: 'Mouse name' },
    { placeholder: 'serial', description: 'Mouse serial number' },
  ],

  NetIO: [
    { placeholder: 'rx-size', description: 'Data received per second (formatted)' },
    { placeholder: 'tx-size', description: 'Data sent per second (formatted)' },
    { placeholder: 'ifname', description: 'Interface name' },
    { placeholder: 'is-default-route', description: 'Is default route' },
    { placeholder: 'rx-bytes', description: 'Data received per second (bytes)' },
    { placeholder: 'tx-bytes', description: 'Data sent per second (bytes)' },
    { placeholder: 'rx-packets', description: 'Packets received per second' },
    { placeholder: 'tx-packets', description: 'Packets sent per second' },
    { placeholder: 'rx-errors', description: 'Errors received per second' },
    { placeholder: 'tx-errors', description: 'Errors sent per second' },
    { placeholder: 'rx-drops', description: 'Packets dropped receiving' },
    { placeholder: 'tx-drops', description: 'Packets dropped sending' },
  ],

  OpenCL: [
    { placeholder: 'version', description: 'Platform version' },
    { placeholder: 'name', description: 'Platform name' },
    { placeholder: 'vendor', description: 'Platform vendor' },
  ],

  OpenGL: [
    { placeholder: 'version', description: 'OpenGL version' },
    { placeholder: 'renderer', description: 'OpenGL renderer' },
    { placeholder: 'vendor', description: 'OpenGL vendor' },
    { placeholder: 'slv', description: 'Shading language version' },
    { placeholder: 'library', description: 'OpenGL library used' },
  ],

  OS: [
    { placeholder: 'sysname', description: 'Name of the kernel' },
    { placeholder: 'name', description: 'Name of the OS' },
    { placeholder: 'pretty-name', description: 'Pretty name of the OS' },
    { placeholder: 'id', description: 'ID of the OS' },
    { placeholder: 'id-like', description: 'ID like of the OS' },
    { placeholder: 'variant', description: 'Variant of the OS' },
    { placeholder: 'variant-id', description: 'Variant ID of the OS' },
    { placeholder: 'version', description: 'Version of the OS' },
    { placeholder: 'version-id', description: 'Version ID of the OS' },
    { placeholder: 'codename', description: 'Version codename of the OS' },
    { placeholder: 'build-id', description: 'Build ID of the OS' },
    { placeholder: 'arch', description: 'Architecture of the OS' },
  ],

  Packages: [
    { placeholder: 'all', description: 'Number of all packages' },
    { placeholder: 'pacman', description: 'Number of pacman packages' },
    { placeholder: 'dpkg', description: 'Number of dpkg packages' },
    { placeholder: 'rpm', description: 'Number of rpm packages' },
    { placeholder: 'emerge', description: 'Number of emerge packages' },
    { placeholder: 'xbps', description: 'Number of xbps packages' },
    { placeholder: 'nix-system', description: 'Number of nix-system packages' },
    { placeholder: 'nix-user', description: 'Number of nix-user packages' },
    { placeholder: 'apk', description: 'Number of apk packages' },
    { placeholder: 'pkg', description: 'Number of pkg packages' },
    { placeholder: 'flatpak-system', description: 'Number of flatpak-system packages' },
    { placeholder: 'flatpak-user', description: 'Number of flatpak-user packages' },
    { placeholder: 'snap', description: 'Number of snap packages' },
    { placeholder: 'brew', description: 'Number of brew packages' },
    { placeholder: 'brew-cask', description: 'Number of brew-cask packages' },
    { placeholder: 'scoop-user', description: 'Number of scoop-user packages' },
    { placeholder: 'scoop-global', description: 'Number of scoop-global packages' },
    { placeholder: 'choco', description: 'Number of choco packages' },
    { placeholder: 'winget', description: 'Number of winget packages' },
  ],

  PhysicalDisk: [
    { placeholder: 'size', description: 'Device size (formatted)' },
    { placeholder: 'name', description: 'Device name' },
    { placeholder: 'interconnect', description: 'Device interconnect type' },
    { placeholder: 'dev-path', description: 'Device raw file path' },
    { placeholder: 'serial', description: 'Serial number' },
    { placeholder: 'physical-type', description: 'Device kind (SSD or HDD)' },
    { placeholder: 'removable-type', description: 'Removable or Fixed' },
    { placeholder: 'readonly-type', description: 'Read-only or Read-write' },
    { placeholder: 'revision', description: 'Product revision' },
    { placeholder: 'temperature', description: 'Device temperature (formatted)' },
  ],

  PhysicalMemory: [
    { placeholder: 'bytes', description: 'Size (in bytes)' },
    { placeholder: 'size', description: 'Size formatted' },
    { placeholder: 'max-speed', description: 'Max speed (MT/s)' },
    { placeholder: 'running-speed', description: 'Running speed (MT/s)' },
    { placeholder: 'type', description: 'Type (DDR4, DDR5, etc.)' },
    { placeholder: 'form-factor', description: 'Form factor (SODIMM, DIMM, etc.)' },
    { placeholder: 'locator', description: 'Bank/Device Locator' },
    { placeholder: 'vendor', description: 'Vendor' },
    { placeholder: 'serial', description: 'Serial number' },
    { placeholder: 'part-number', description: 'Part number' },
    { placeholder: 'is-ecc-enabled', description: 'True if ECC enabled' },
  ],

  Player: [
    { placeholder: 'player', description: 'Pretty player name' },
    { placeholder: 'name', description: 'Player name' },
    { placeholder: 'id', description: 'Player identifier' },
    { placeholder: 'url', description: 'URL name' },
  ],

  PowerAdapter: [
    { placeholder: 'watts', description: 'Power adapter watts' },
    { placeholder: 'name', description: 'Power adapter name' },
    { placeholder: 'manufacturer', description: 'Power adapter manufacturer' },
    { placeholder: 'model', description: 'Power adapter model' },
    { placeholder: 'description', description: 'Power adapter description' },
    { placeholder: 'serial', description: 'Power adapter serial number' },
  ],

  Processes: [
    { placeholder: 'result', description: 'Process count' },
  ],

  PublicIP: [
    { placeholder: 'ip', description: 'Public IP address' },
    { placeholder: 'location', description: 'Location' },
  ],

  Shell: [
    { placeholder: 'process-name', description: 'Shell process name' },
    { placeholder: 'exe', description: 'First argument of the command line' },
    { placeholder: 'exe-name', description: 'Shell base name of arg0' },
    { placeholder: 'version', description: 'Shell version' },
    { placeholder: 'pid', description: 'Shell PID' },
    { placeholder: 'pretty-name', description: 'Shell pretty name' },
    { placeholder: 'exe-path', description: 'Shell full exe path' },
    { placeholder: 'tty', description: 'Shell tty used' },
  ],

  Sound: [
    { placeholder: 'is-main', description: 'Is main sound device' },
    { placeholder: 'name', description: 'Device name' },
    { placeholder: 'volume-percentage', description: 'Volume (percentage num)' },
    { placeholder: 'identifier', description: 'Identifier' },
    { placeholder: 'volume-percentage-bar', description: 'Volume (percentage bar)' },
    { placeholder: 'platform-api', description: 'Platform API used' },
  ],

  Swap: [
    { placeholder: 'used', description: 'Used size' },
    { placeholder: 'total', description: 'Total size' },
    { placeholder: 'percentage', description: 'Percentage used (num)' },
    { placeholder: 'percentage-bar', description: 'Percentage used (bar)' },
    { placeholder: 'name', description: 'Name' },
  ],

  Terminal: [
    { placeholder: 'process-name', description: 'Terminal process name' },
    { placeholder: 'exe', description: 'First argument of the command line' },
    { placeholder: 'exe-name', description: 'Terminal base name of arg0' },
    { placeholder: 'pid', description: 'Terminal PID' },
    { placeholder: 'pretty-name', description: 'Terminal pretty name' },
    { placeholder: 'version', description: 'Terminal version' },
    { placeholder: 'exe-path', description: 'Terminal full exe path' },
    { placeholder: 'tty', description: 'Terminal tty / pts used' },
  ],

  TerminalFont: [
    { placeholder: 'combined', description: 'Terminal font combined' },
    { placeholder: 'name', description: 'Terminal font name' },
    { placeholder: 'size', description: 'Terminal font size' },
    { placeholder: 'styles', description: 'Terminal font styles' },
  ],

  TerminalSize: [
    { placeholder: 'rows', description: 'Terminal rows' },
    { placeholder: 'columns', description: 'Terminal columns' },
    { placeholder: 'width', description: 'Terminal width (px)' },
    { placeholder: 'height', description: 'Terminal height (px)' },
  ],

  TerminalTheme: [
    { placeholder: 'fg-color', description: 'Terminal foreground color' },
    { placeholder: 'fg-type', description: 'Foreground type (Dark / Light)' },
    { placeholder: 'bg-color', description: 'Terminal background color' },
    { placeholder: 'bg-type', description: 'Background type (Dark / Light)' },
  ],

  Title: [
    { placeholder: 'user-name', description: 'User name' },
    { placeholder: 'host-name', description: 'Host name' },
    { placeholder: 'home-dir', description: 'Home directory' },
    { placeholder: 'exe-path', description: 'Executable path of current process' },
    { placeholder: 'user-shell', description: "User's default shell" },
    { placeholder: 'user-name-colored', description: 'User name (colored)' },
    { placeholder: 'at-symbol-colored', description: '@ symbol (colored)' },
    { placeholder: 'host-name-colored', description: 'Host name (colored)' },
    { placeholder: 'full-user-name', description: 'Full user name' },
  ],

  Theme: [
    { placeholder: 'theme1', description: 'Theme part 1' },
    { placeholder: 'theme2', description: 'Theme part 2' },
  ],

  TPM: [
    { placeholder: 'version', description: 'TPM device version' },
    { placeholder: 'description', description: 'TPM general description' },
  ],

  Uptime: [
    { placeholder: 'days', description: 'Days after boot' },
    { placeholder: 'hours', description: 'Hours after boot' },
    { placeholder: 'minutes', description: 'Minutes after boot' },
    { placeholder: 'seconds', description: 'Seconds after boot' },
    { placeholder: 'milliseconds', description: 'Milliseconds after boot' },
    { placeholder: 'boot-time', description: 'Boot time in local timezone' },
    { placeholder: 'years', description: 'Years integer after boot' },
    { placeholder: 'days-of-year', description: 'Days of year after boot' },
    { placeholder: 'years-fraction', description: 'Years fraction after boot' },
    { placeholder: 'formatted', description: 'Formatted uptime' },
  ],

  Users: [
    { placeholder: 'name', description: 'User name' },
    { placeholder: 'host-name', description: 'Host name' },
    { placeholder: 'session-name', description: 'Session name' },
    { placeholder: 'client-ip', description: 'Client IP' },
    { placeholder: 'login-time', description: 'Login time in local timezone' },
    { placeholder: 'days', description: 'Days after login' },
    { placeholder: 'hours', description: 'Hours after login' },
    { placeholder: 'minutes', description: 'Minutes after login' },
    { placeholder: 'seconds', description: 'Seconds after login' },
  ],

  Version: [
    { placeholder: 'project-name', description: 'Project name' },
    { placeholder: 'version', description: 'Version' },
    { placeholder: 'version-tweak', description: 'Version tweak' },
    { placeholder: 'build-type', description: 'Build type (debug or release)' },
    { placeholder: 'sysname', description: 'System name' },
    { placeholder: 'arch', description: 'Architecture' },
    { placeholder: 'cmake-built-type', description: 'CMake build type' },
    { placeholder: 'compile-time', description: 'Compile date time' },
    { placeholder: 'compiler', description: 'Compiler used' },
    { placeholder: 'libc', description: 'Libc used' },
  ],

  Vulkan: [
    { placeholder: 'driver', description: 'Driver name' },
    { placeholder: 'api-version', description: 'API version' },
    { placeholder: 'conformance-version', description: 'Conformance version' },
    { placeholder: 'instance-version', description: 'Instance version' },
  ],

  Wallpaper: [
    { placeholder: 'file-name', description: 'File name' },
    { placeholder: 'full-path', description: 'Full path' },
  ],

  Weather: [
    { placeholder: 'result', description: 'Weather result' },
  ],

  Wifi: [
    { placeholder: 'inf-desc', description: 'Interface description' },
    { placeholder: 'inf-status', description: 'Interface status' },
    { placeholder: 'status', description: 'Connection status' },
    { placeholder: 'ssid', description: 'Connection SSID' },
    { placeholder: 'bssid', description: 'Connection BSSID' },
    { placeholder: 'protocol', description: 'Connection protocol' },
    { placeholder: 'signal-quality', description: 'Signal quality (percentage num)' },
    { placeholder: 'rx-rate', description: 'Connection RX rate' },
    { placeholder: 'tx-rate', description: 'Connection TX rate' },
    { placeholder: 'security', description: 'Security algorithm' },
    { placeholder: 'signal-quality-bar', description: 'Signal quality (percentage bar)' },
    { placeholder: 'channel', description: 'Channel number' },
    { placeholder: 'band', description: 'Channel band (GHz)' },
  ],

  WM: [
    { placeholder: 'process-name', description: 'WM process name' },
    { placeholder: 'pretty-name', description: 'WM pretty name' },
    { placeholder: 'protocol-name', description: 'WM protocol name' },
    { placeholder: 'plugin-name', description: 'WM plugin name' },
    { placeholder: 'version', description: 'WM version' },
  ],

  WMTheme: [
    { placeholder: 'result', description: 'WM theme' },
  ],

  Zpool: [
    { placeholder: 'name', description: 'Zpool name' },
    { placeholder: 'state', description: 'Zpool state' },
    { placeholder: 'used', description: 'Size used' },
    { placeholder: 'total', description: 'Size total' },
    { placeholder: 'used-percentage', description: 'Size percentage num' },
    { placeholder: 'fragmentation-percentage', description: 'Fragmentation percentage num' },
    { placeholder: 'used-percentage-bar', description: 'Size percentage bar' },
    { placeholder: 'fragmentation-percentage-bar', description: 'Fragmentation percentage bar' },
  ],
};

/**
 * Dummy sample values for format placeholders, used by the terminal preview
 * to show realistic output when a custom format string is specified.
 * Maps "ModuleType.placeholder" to a sample display value.
 */
export const formatDummyValues: Record<string, Record<string, string>> = {
  Battery: {
    manufacturer: 'LGC', 'model-name': 'LGC-LGC4.35', technology: 'Li-ion',
    capacity: '100', status: 'Charging', temperature: '31°C', 'cycle-count': '42',
    serial: 'A1B2C3', 'manufacture-date': '2023-01-15', 'capacity-bar': '██████████',
    'time-days': '0', 'time-hours': '2', 'time-minutes': '30', 'time-seconds': '0',
    'time-formatted': '2h 30m',
  },
  BIOS: {
    date: '12/01/2023', release: '2.2', vendor: 'American Megatrends', version: 'F4', type: 'UEFI',
  },
  Bluetooth: {
    name: 'Intel Wireless', address: 'AA:BB:CC:DD:EE:FF', type: 'Headset',
    'battery-percentage': '85', connected: 'true', 'battery-percentage-bar': '████████░░',
  },
  BluetoothRadio: {
    name: 'Intel AX200', address: 'AA:BB:CC:DD:EE:FF', 'lmp-version': '12',
    'lmp-subversion': '1', version: '5.2', vendor: 'Intel', discoverable: 'true', connectable: 'true',
  },
  Board: {
    name: 'ROG B550-F Gaming', vendor: 'ASUS', version: 'Rev 1.0', serial: 'S/N 12345',
  },
  Bootmgr: {
    name: 'systemd-boot', 'firmware-path': '/EFI/systemd', 'firmware-name': 'systemd-bootx64.efi',
    'secure-boot': 'false', order: '0001',
  },
  Brightness: {
    percentage: '75', name: 'eDP-1', max: '100', min: '0', current: '75',
    'percentage-bar': '███████░░░', 'is-builtin': 'true',
  },
  Btrfs: {
    name: 'data', uuid: 'a1b2c3d4', devices: '/dev/sda1', features: 'mixed-bg',
    used: '450 GiB', allocated: '460 GiB', total: '500 GiB',
    'used-percentage': '90', 'allocated-percentage': '92',
    'used-percentage-bar': '█████████░', 'allocated-percentage-bar': '█████████░',
    'node-size': '16 KiB', 'sector-size': '4 KiB',
  },
  Camera: {
    name: 'Integrated Webcam', vendor: 'Chicony', colorspace: 'sRGB',
    id: '0x1234', width: '1920', height: '1080',
  },
  Chassis: {
    type: 'Desktop', vendor: 'Default', version: 'N/A', serial: 'N/A',
  },
  Command: { result: 'Hello World' },
  CPU: {
    name: 'AMD Ryzen 9 5950X', vendor: 'AMD', 'cores-physical': '16',
    'cores-logical': '32', 'cores-online': '32', 'freq-base': '3.40 GHz',
    'freq-max': '4.90 GHz', temperature: '45°C', 'core-types': '32x 3.4GHz',
    packages: '1', march: 'zen3',
  },
  CPUCache: { result: 'L1: 512 KiB / L2: 4 MiB / L3: 32 MiB', sum: '36.5 MiB' },
  CPUUsage: {
    avg: '15', max: '42', 'max-index': '3', min: '2', 'min-index': '7',
    'avg-bar': '█░░░░░░░░░', 'max-bar': '████░░░░░░', 'min-bar': '░░░░░░░░░░',
  },
  Cursor: { theme: 'Adwaita', size: '24' },
  DateTime: {
    year: '2024', 'year-short': '24', month: '5', 'month-pretty': '05',
    'month-name': 'May', 'month-name-short': 'May', week: '21', weekday: 'Monday',
    'weekday-short': 'Mon', 'day-in-year': '141', 'day-in-month': '20', 'day-in-week': '1',
    hour: '14', 'hour-pretty': '14', 'hour-12': '2', 'hour-12-pretty': '02',
    minute: '30', 'minute-pretty': '30', second: '0', 'second-pretty': '00',
    'offset-from-utc': '+09:00', 'timezone-name': 'JST', 'day-pretty': '20',
  },
  DE: { 'process-name': 'gnome-shell', 'pretty-name': 'GNOME', version: '45.3' },
  Display: {
    width: '1920', height: '1080', 'refresh-rate': '60', 'scaled-width': '1920',
    'scaled-height': '1080', name: 'eDP-1', type: 'Built-in', rotation: '0',
    'is-primary': 'true', 'physical-width': '344', 'physical-height': '194',
    inch: '15.6', ppi: '141', 'bit-depth': '8', 'hdr-enabled': 'false',
    'manufacture-year': '2023', 'manufacture-week': '12', serial: 'N/A',
    'platform-api': 'DRM', 'hdr-compatible': 'false', 'scale-factor': '1.0',
    'preferred-width': '1920', 'preferred-height': '1080', 'preferred-refresh-rate': '60',
  },
  Disk: {
    'size-used': '15.4 GiB', 'size-total': '50.0 GiB', 'size-percentage': '31',
    'files-used': '125432', 'files-total': '3276800', 'files-percentage': '4',
    'is-external': 'false', 'is-hidden': 'false', filesystem: 'ext4', name: 'root',
    'is-readonly': 'false', 'create-time': '2023-01-01', 'size-percentage-bar': '███░░░░░░░',
    'files-percentage-bar': '░░░░░░░░░░', mountpoint: '/', 'mount-from': '/dev/sda1',
    'size-free': '34.6 GiB', 'size-available': '32.1 GiB',
  },
  DiskIO: {
    'size-read': '50 MiB/s', 'size-written': '25 MiB/s', name: 'sda',
    'dev-path': '/dev/sda', 'bytes-read': '52428800', 'bytes-written': '26214400',
    'read-count': '1024', 'write-count': '512',
  },
  DNS: { result: '8.8.8.8, 1.1.1.1' },
  Editor: {
    type: 'Visual', name: 'nvim', 'exe-name': 'nvim',
    path: '/usr/bin/nvim', version: '0.9.5',
  },
  Font: {
    font1: 'Cantarell', font2: 'Noto Sans', font3: 'Monospace',
    font4: 'Sans', combined: 'Cantarell (11pt)',
  },
  Gamepad: {
    name: 'Xbox Wireless Controller', serial: 'XB12345',
    'battery-percentage': '75', 'battery-percentage-bar': '███████░░░',
  },
  GPU: {
    vendor: 'AMD', name: 'RX 6800 XT', driver: 'RADV', temperature: '55°C',
    'core-count': '4608', type: 'Discrete', 'dedicated-total': '16 GiB',
    'dedicated-used': '2 GiB', 'shared-total': '16 GiB', 'shared-used': '512 MiB',
    'platform-api': 'Vulkan', frequency: '2.25', index: '0',
    'dedicated-percentage-num': '12', 'dedicated-percentage-bar': '█░░░░░░░░░',
    'shared-percentage-num': '3', 'shared-percentage-bar': '░░░░░░░░░░',
    'core-usage-num': '45', 'core-usage-bar': '████░░░░░░', 'memory-type': 'GDDR6',
  },
  Host: {
    family: 'Desktop', name: 'KVM/QEMU', version: 'Standard PC',
    sku: 'N/A', vendor: 'QEMU', serial: 'N/A', uuid: 'a1b2c3d4-...',
  },
  Icons: { icons1: 'Adwaita', icons2: 'Papirus' },
  InitSystem: {
    name: 'systemd', exe: '/lib/systemd/systemd', version: '255', pid: '1',
  },
  Kernel: {
    sysname: 'Linux', release: '6.6.13', version: '#1 SMP',
    arch: 'x86_64', 'display-version': '6.6.13-linux', 'page-size': '4096',
  },
  Keyboard: { name: 'US QWERTY', serial: 'N/A' },
  LM: { service: 'SDDM', type: 'DM', version: '0.20.0' },
  Loadavg: { loadavg1: '0.52', loadavg2: '0.48', loadavg3: '0.43' },
  Locale: { result: 'en_US.UTF-8' },
  LocalIP: {
    ipv4: '192.168.1.45', ipv6: 'fe80::1', mac: 'AA:BB:CC:DD:EE:FF',
    ifname: 'eth0', 'is-default-route': 'true', mtu: '1500',
    speed: '1 Gbps', flags: 'UP,BROADCAST,RUNNING',
  },
  Media: {
    combined: 'Never Gonna Give You Up - Rick Astley', title: 'Never Gonna Give You Up',
    artist: 'Rick Astley', album: 'Whenever You Need Somebody', status: 'Playing',
  },
  Memory: {
    used: '1.21 GiB', total: '16.00 GiB', percentage: '7',
    'percentage-bar': '░░░░░░░░░░',
  },
  Monitor: {
    name: 'LG 27GL850', width: '2560', height: '1440',
    'physical-width': '597', 'physical-height': '336', inch: '27',
    ppi: '109', 'manufacture-year': '2023', 'manufacture-week': '12',
    serial: 'N/A', 'refresh-rate': '144', 'hdr-compatible': 'true',
  },
  Mouse: { name: 'Logitech G502 HERO', serial: 'N/A' },
  NetIO: {
    'rx-size': '1.2 MiB/s', 'tx-size': '0.3 MiB/s', ifname: 'eth0',
    'is-default-route': 'true', 'rx-bytes': '1258291', 'tx-bytes': '314572',
    'rx-packets': '1024', 'tx-packets': '512', 'rx-errors': '0',
    'tx-errors': '0', 'rx-drops': '0', 'tx-drops': '0',
  },
  OpenCL: { version: '3.0', name: 'Mesa', vendor: 'AMD' },
  OpenGL: {
    version: '4.6', renderer: 'Mesa 24.0.1', vendor: 'AMD',
    slv: '4.60', library: 'Mesa',
  },
  OS: {
    sysname: 'Linux', name: 'Arch Linux', 'pretty-name': 'Arch Linux',
    id: 'arch', 'id-like': '', variant: '', 'variant-id': '',
    version: '', 'version-id': '', codename: '', 'build-id': 'rolling',
    arch: 'x86_64',
  },
  Packages: {
    all: '1203', pacman: '1080', dpkg: '0', rpm: '0', emerge: '0',
    xbps: '0', 'nix-system': '0', 'nix-user': '0', apk: '0', pkg: '0',
    'flatpak-system': '45', 'flatpak-user': '12', snap: '66', brew: '0',
    'brew-cask': '0', 'scoop-user': '0', 'scoop-global': '0', choco: '0', winget: '0',
  },
  PhysicalDisk: {
    size: '500 GB', name: 'Samsung SSD 980', interconnect: 'NVMe',
    'dev-path': '/dev/nvme0n1', serial: 'S1234', 'physical-type': 'SSD',
    'removable-type': 'Fixed', 'readonly-type': 'Read-write', revision: '1B2Q',
    temperature: '38°C',
  },
  PhysicalMemory: {
    bytes: '8589934592', size: '8 GiB', 'max-speed': '3200',
    'running-speed': '3200', type: 'DDR4', 'form-factor': 'DIMM',
    locator: 'BANK0/SIMM0', vendor: 'Samsung', serial: 'A1B2C3',
    'part-number': 'M378A1K43EB2', 'is-ecc-enabled': 'false',
  },
  Player: {
    player: 'Spotify', name: 'spotify', id: 'org.mpris.MediaPlayer2.spotify',
    url: 'https://open.spotify.com',
  },
  PowerAdapter: {
    watts: '65', name: 'AC Adapter', manufacturer: 'Lenovo',
    model: 'ADLX65', description: '65W USB-C', serial: 'N/A',
  },
  Processes: { result: '245' },
  PublicIP: { ip: '203.0.113.1', location: 'Tokyo, JP' },
  Shell: {
    'process-name': 'bash', exe: 'bash', 'exe-name': 'bash',
    version: '5.2.21', pid: '1234', 'pretty-name': 'Bash',
    'exe-path': '/usr/bin/bash', tty: 'pts/0',
  },
  Sound: {
    'is-main': 'true', name: 'PulseAudio', 'volume-percentage': '75',
    identifier: 'default', 'volume-percentage-bar': '███████░░░',
    'platform-api': 'PipeWire',
  },
  Swap: {
    used: '0 B', total: '4.00 GiB', percentage: '0',
    'percentage-bar': '░░░░░░░░░░', name: '/dev/sda2',
  },
  Terminal: {
    'process-name': 'gnome-terminal', exe: 'gnome-terminal-server',
    'exe-name': 'gnome-terminal-server', pid: '5678',
    'pretty-name': 'GNOME Terminal', version: '3.50',
    'exe-path': '/usr/bin/gnome-terminal', tty: 'pts/0',
  },
  TerminalFont: {
    combined: 'Monospace (12pt)', name: 'Monospace', size: '12pt', styles: 'Regular',
  },
  TerminalSize: { rows: '40', columns: '120', width: '1920', height: '1080' },
  TerminalTheme: {
    'fg-color': '#FFFFFF', 'fg-type': 'Light',
    'bg-color': '#282A36', 'bg-type': 'Dark',
  },
  Title: {
    'user-name': 'user', 'host-name': 'hostname', 'home-dir': '/home/user',
    'exe-path': '/usr/bin/bash', 'user-shell': '/bin/bash',
    'user-name-colored': 'user', 'at-symbol-colored': '@',
    'host-name-colored': 'hostname', 'full-user-name': 'User Name',
  },
  Theme: { theme1: 'Adwaita', theme2: 'GTK3' },
  TPM: { version: '2.0', description: 'Enabled' },
  Uptime: {
    days: '0', hours: '0', minutes: '42', seconds: '0',
    milliseconds: '0', 'boot-time': '2024-05-20 14:00:00',
    years: '0', 'days-of-year': '0', 'years-fraction': '0.0', formatted: '42 mins',
  },
  Users: {
    name: 'user', 'host-name': 'localhost', 'session-name': 'tty1',
    'client-ip': '127.0.0.1', 'login-time': '2024-05-20 12:00:00',
    days: '0', hours: '2', minutes: '30', seconds: '0',
  },
  Version: {
    'project-name': 'fastfetch', version: '2.8.0', 'version-tweak': '',
    'build-type': 'release', sysname: 'Linux', arch: 'x86_64',
    'cmake-built-type': 'Release', 'compile-time': '2024-05-01',
    compiler: 'GCC 13.2', libc: 'glibc 2.39',
  },
  Vulkan: {
    driver: 'RADV', 'api-version': '1.3.278',
    'conformance-version': '1.3.6.0', 'instance-version': '1.3.278',
  },
  Wallpaper: {
    'file-name': 'arch.png', 'full-path': '/usr/share/backgrounds/arch.png',
  },
  Weather: { result: 'Tokyo: 🌤 22°C' },
  Wifi: {
    'inf-desc': 'wlan0', 'inf-status': 'Up', status: 'Connected',
    ssid: 'MyWifi', bssid: 'AA:BB:CC:DD:EE:FF', protocol: '802.11ax',
    'signal-quality': '70', 'rx-rate': '866 Mbps', 'tx-rate': '866 Mbps',
    security: 'WPA2', 'signal-quality-bar': '███████░░░', channel: '36', band: '5',
  },
  WM: {
    'process-name': 'mutter', 'pretty-name': 'Mutter', 'protocol-name': 'Wayland',
    'plugin-name': '', version: '45.3',
  },
  WMTheme: { result: 'Adwaita' },
  Zpool: {
    name: 'rpool', state: 'ONLINE', used: '1.2 TiB', total: '2.0 TiB',
    'used-percentage': '60', 'fragmentation-percentage': '12',
    'used-percentage-bar': '██████░░░░', 'fragmentation-percentage-bar': '█░░░░░░░░░',
  },
};

// --- Case-insensitive lookup helpers ---
// Build lowercase-keyed maps once for O(1) lookups regardless of module type casing

const formatStringsLowerMap: Record<string, FormatPlaceholder[]> = {};
for (const key of Object.keys(moduleFormatStrings)) {
  formatStringsLowerMap[key.toLowerCase()] = moduleFormatStrings[key];
}

const dummyValuesLowerMap: Record<string, Record<string, string>> = {};
for (const key of Object.keys(formatDummyValues)) {
  dummyValuesLowerMap[key.toLowerCase()] = formatDummyValues[key];
}

/**
 * Get format placeholders for a module type (case-insensitive).
 * Returns an empty array if no placeholders are found.
 */
export function getFormatPlaceholders(moduleType: string): FormatPlaceholder[] {
  return formatStringsLowerMap[moduleType.toLowerCase()] || [];
}

/**
 * Get dummy sample values for a module type (case-insensitive).
 * Returns an empty object if no dummy values are found.
 */
export function getDummyValues(moduleType: string): Record<string, string> {
  return dummyValuesLowerMap[moduleType.toLowerCase()] || {};
}
