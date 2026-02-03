export default function TerminalPreview() {
  return (
    <div className="bg-black/90 rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-mono text-sm h-full flex flex-col">
      {/* Terminal Title Bar */}
      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div className="flex-1 text-center text-gray-400 text-xs">jmdspeedy@archlinux: ~</div>
      </div>
      
      {/* Terminal Content */}
      <div className="p-6 text-gray-300">
        <div className="flex gap-6">
          {/* Logo Placeholder */}
          <div className="text-blue-500 font-bold whitespace-pre leading-tight">
{`       /\\
      /  \\
     /    \\
    /      \\
   /   ,,   \\
  /   |  |   \\
 /_-''    ''-_\\`}
          </div>
          
          {/* Info Placeholder */}
          <div className="flex flex-col gap-1">
            <div><span className="text-blue-400 font-bold">jmdspeedy</span>@<span className="text-blue-400 font-bold">archlinux</span></div>
            <div className="text-gray-500">-------------------</div>
            <div><span className="text-blue-400 font-bold">OS</span>: Arch Linux x86_64</div>
            <div><span className="text-blue-400 font-bold">Host</span>: KVM/QEMU (Standard PC)</div>
            <div><span className="text-blue-400 font-bold">Kernel</span>: 6.6.13-linux</div>
            <div><span className="text-blue-400 font-bold">Uptime</span>: 42 mins</div>
            <div><span className="text-blue-400 font-bold">Packages</span>: 1203 (pacman)</div>
            <div><span className="text-blue-400 font-bold">Shell</span>: bash 5.2.21</div>
            <div><span className="text-blue-400 font-bold">CPU</span>: AMD Ryzen 9 5950X (4) @ 3.4GHz</div>
            <div><span className="text-blue-400 font-bold">GPU</span>: Red Hat QXL Paravirtual Graphic Card</div>
            <div><span className="text-blue-400 font-bold">Memory</span>: 1.21 GiB / 16.00 GiB</div>
            
            <div className="mt-4 flex gap-1">
              <div className="w-4 h-4 bg-black"></div>
              <div className="w-4 h-4 bg-red-500"></div>
              <div className="w-4 h-4 bg-green-500"></div>
              <div className="w-4 h-4 bg-yellow-500"></div>
              <div className="w-4 h-4 bg-blue-500"></div>
              <div className="w-4 h-4 bg-magenta-500"></div>
              <div className="w-4 h-4 bg-cyan-500"></div>
              <div className="w-4 h-4 bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
