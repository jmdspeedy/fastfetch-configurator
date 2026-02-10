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
import { GripVertical, X, Plus, Search, Settings } from 'lucide-react';
import { useState, useMemo } from 'react';
import ModuleEditor from './ModuleEditor';

const ALL_MODULE_TYPES: ModuleType[] = [
  'title', 'separator', 'os', 'host', 'kernel', 'uptime', 'packages', 'shell', 
  'display', 'de', 'wm', 'wmtheme', 'theme', 'icons', 'font', 'cursor', 
  'terminal', 'terminalfont', 'cpu', 'gpu', 'memory', 'swap', 'disk', 
  'battery', 'poweradapter', 'player', 'media', 'localip', 'publicip', 
  'wifi', 'datetime', 'locale', 'vulkan', 'opengl', 'opencl', 'users', 
  'bluetooth', 'sound', 'gamepad', 'weather', 'netio', 'diskio', 
  'physicaldisk', 'version', 'break', 'colors', 'command',
  'bios', 'bluetoothradio', 'board', 'bootmgr', 'brightness', 'btrfs',
  'camera', 'chassis', 'cpucache', 'cpuusage', 'custom', 'dns',
  'editor', 'initsystem', 'keyboard', 'lm', 'loadavg', 'logo',
  'monitor', 'mouse', 'physicalmemory', 'processes', 'terminalsize',
  'terminaltheme', 'tpm', 'wallpaper', 'zpool'
];

function SortableItem({ id, type, onDelete, onEdit }: { id: string; type: string; onDelete: () => void; onEdit: () => void }) {
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
      <div className="flex-1 font-mono text-sm text-gray-200 truncate">
        {type}
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
            title="Edit Module"
        >
            <Settings size={16} />
        </button>
        <button 
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Remove Module"
        >
            <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ModuleList() {
  const { modules, reorderModules, removeModule, addModule } = useConfigStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

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
    <>
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
                  onEdit={() => setEditingModuleId(m.id)} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Module Editor Modal */}
      {editingModuleId && (
        <ModuleEditor 
          key={editingModuleId}
          moduleId={editingModuleId} 
          onClose={() => setEditingModuleId(null)} 
        />
      )}
    </>
  );
}
