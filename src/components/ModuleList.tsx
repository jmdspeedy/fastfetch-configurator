'use client';

import { useConfigStore } from '@/store/config';
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
import { GripVertical, X } from 'lucide-react';

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
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default function ModuleList() {
  const { modules, reorderModules, removeModule, addModule } = useConfigStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      reorderModules(arrayMove(modules, oldIndex, newIndex));
    }
  }

  const availableModules = [
    'OS', 'Host', 'Kernel', 'Uptime', 'Packages', 'Shell', 'Display', 'DE', 'WM', 
    'WMTheme', 'Theme', 'Icons', 'Font', 'Cursor', 'Terminal', 'TerminalFont', 
    'CPU', 'GPU', 'Memory', 'Swap', 'Disk', 'Battery', 'PowerAdapter', 'Player', 
    'Media', 'LocalIP', 'PublicIP', 'Weather', 'Break', 'Colors', 'Separator'
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Active Modules</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {modules.map((module) => (
                <SortableItem 
                  key={module.id} 
                  id={module.id} 
                  type={module.type} 
                  onDelete={() => removeModule(module.id)} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Add Module</h3>
        <select 
          className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-md p-2"
          onChange={(e) => {
            if (e.target.value) {
              addModule(e.target.value);
              e.target.value = '';
            }
          }}
        >
          <option value="">Select a module...</option>
          {availableModules.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
