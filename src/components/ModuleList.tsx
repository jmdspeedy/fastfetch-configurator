'use client';

import { useConfigStore, ModuleType } from '@/store/config';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Plus, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

const ALL_MODULE_TYPES: ModuleType[] = [
  'Title', 'Separator', 'OS', 'Host', 'Kernel', 'Uptime', 'Packages', 'Shell', 
  'Display', 'DE', 'WM', 'WMTheme', 'Theme', 'Icons', 'Font', 'Cursor', 
  'Terminal', 'TerminalFont', 'CPU', 'GPU', 'Memory', 'Swap', 'Disk', 
  'Battery', 'PowerAdapter', 'Player', 'Media', 'LocalIP', 'PublicIP', 
  'Wifi', 'DateTime', 'Locale', 'Vulkan', 'OpenGL', 'OpenCL', 'Users', 
  'Bluetooth', 'Sound', 'Gamepad', 'Weather', 'NetIO', 'DiskIO', 
  'PhysicalDisk', 'Version', 'Break', 'Colors', 'Command',
  'BIOS', 'BluetoothRadio', 'Board', 'Bootmgr', 'Brightness', 'Btrfs',
  'Camera', 'Chassis', 'CPUCache', 'CPUUsage', 'Custom', 'DNS',
  'Editor', 'InitSystem', 'Keyboard', 'LM', 'Loadavg', 'Logo',
  'Monitor', 'Mouse', 'PhysicalMemory', 'Processes', 'TerminalSize',
  'TerminalTheme', 'TPM', 'Wallpaper', 'Zpool'
];

function SortableItem({ id, type, onDelete }: { id: string; type: string; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-gray-800 p-3 rounded-md mb-2 border border-gray-700 group hover:border-blue-500 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-300">
        <GripVertical size={18} />
      </div>
      <div className="flex-1 font-mono text-sm text-gray-200">
        {type}
      </div>
      <button 
        onClick={onDelete}
        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default function ModuleList() {
  const { modules, reorderModules, removeModule, addModule } = useConfigStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      reorderModules(arrayMove(modules, oldIndex, newIndex));
    }
  };

  const filteredAvailableModules = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return ALL_MODULE_TYPES.filter(t => t.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Add Module Search/Trigger */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2 top-2.5 text-gray-500" />
            <input 
              type="text"
              placeholder="Add module..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowAddMenu(true);
              }}
              onFocus={() => setShowAddMenu(true)}
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-md pl-8 pr-2 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredAvailableModules.length > 0 ? (
              <div className="p-1">
                {filteredAvailableModules.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      addModule(type);
                      setShowAddMenu(false);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white rounded transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">No modules match</div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {modules.map((m) => (
              <SortableItem 
                key={m.id} 
                id={m.id} 
                type={m.type} 
                onDelete={() => removeModule(m.id)} 
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
