'use client';

import { FastfetchSchemaDocument, FastfetchSchemaNode, resolveSchemaRef } from '@/utils/fastfetchSchema';

interface SchemaFieldsProps {
  schema: FastfetchSchemaDocument;
  node: FastfetchSchemaNode;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  omit?: string[];
}

const OMIT = new Set(['type', 'key', 'keyColor', 'outputColor', 'format', 'id']);

function resolveNode(schema: FastfetchSchemaDocument, node: FastfetchSchemaNode, value: unknown): FastfetchSchemaNode {
  const resolved = resolveSchemaRef(schema, node);
  if (!resolved.oneOf && !resolved.anyOf) return resolved;
  const variants = resolved.oneOf || resolved.anyOf || [];
  const matching = variants.find((variant) => {
    const candidate = resolveSchemaRef(schema, variant);
    if (candidate.const !== undefined) return candidate.const === value;
    if (candidate.type === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
    if (candidate.type === 'array') return Array.isArray(value);
    return candidate.type === typeof value;
  });
  return resolveSchemaRef(schema, matching || variants[0] || resolved);
}

function setPath(source: Record<string, unknown>, path: string[], value: unknown): Record<string, unknown> {
  const next: Record<string, unknown> = { ...source };
  let cursor = next;
  path.forEach((part, index) => {
    if (index === path.length - 1) cursor[part] = value;
    else {
      const child = cursor[part];
      cursor[part] = { ...(child && typeof child === 'object' && !Array.isArray(child) ? child : {}) };
      cursor = cursor[part] as Record<string, unknown>;
    }
  });
  return next;
}

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, (char) => char.toUpperCase());
}

/** Render all schema properties not already covered by the common editor. */
export default function SchemaFields({ schema, node, value, onChange, omit = [] }: SchemaFieldsProps) {
  const resolved = resolveNode(schema, node, value);
  const properties = resolved.properties || {};

  const renderNode = (key: string, childNode: FastfetchSchemaNode, childValue: unknown, path: string[]) => {
    if (OMIT.has(key) || omit.includes(key)) return null;
    const child = resolveNode(schema, childNode, childValue);
    const update = (nextValue: unknown) => onChange(setPath(value, path, nextValue));
    if (child.type === 'object' || child.properties) {
      return (
        <details key={path.join('.')} className="border-t border-gray-800 pt-3 mt-3" open={childValue !== undefined}>
          <summary className="text-xs text-blue-300 cursor-pointer">{labelFor(key)}</summary>
          <div className="pl-3 mt-3 space-y-3">
            {Object.entries(child.properties || {}).map(([nestedKey, nestedNode]) => renderNode(nestedKey, nestedNode, (childValue as Record<string, unknown> | undefined)?.[nestedKey], [...path, nestedKey]))}
          </div>
        </details>
      );
    }
    if (child.type === 'array') {
      return (
        <label key={path.join('.')} className="block">
          <span className="text-xs text-gray-400 block mb-1">{labelFor(key)}</span>
          <textarea value={childValue === undefined ? '' : JSON.stringify(childValue, null, 2)} onChange={(event) => {
            try { update(JSON.parse(event.target.value)); } catch { /* keep editing invalid JSON without mutating config */ }
          }} className="w-full h-20 bg-gray-900 border border-gray-700 text-gray-200 text-xs font-mono rounded-md p-2" />
        </label>
      );
    }
    if (child.type === 'boolean') {
      return <label key={path.join('.')} className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={Boolean(childValue ?? child.default)} onChange={(event) => update(event.target.checked)} />{labelFor(key)}</label>;
    }
    if (child.enum || child.const !== undefined) {
      const options = child.enum || [child.const];
      return <label key={path.join('.')} className="block"><span className="text-xs text-gray-400 block mb-1">{labelFor(key)}</span><select value={String(childValue ?? child.default ?? options[0])} onChange={(event) => update(event.target.value)} className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md p-2">{options.map((option) => <option key={String(option)} value={String(option)}>{String(option)}</option>)}</select></label>;
    }
    if (child.type === 'number' || child.type === 'integer') {
      return <label key={path.join('.')} className="block"><span className="text-xs text-gray-400 block mb-1">{labelFor(key)}</span><input type="number" value={childValue === undefined ? '' : String(childValue)} onChange={(event) => update(event.target.value === '' ? undefined : Number(event.target.value))} className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md p-2" /></label>;
    }
    return <label key={path.join('.')} className="block"><span className="text-xs text-gray-400 block mb-1">{labelFor(key)}</span><input type="text" value={childValue === undefined ? '' : String(childValue)} placeholder={child.default === undefined ? '' : String(child.default)} onChange={(event) => update(event.target.value)} className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md p-2" /></label>;
  };

  return <div className="pt-3 border-t border-gray-800"><div className="text-xs uppercase tracking-wider text-gray-500 mb-3">Fastfetch 2.66 options</div><div className="space-y-3">{Object.entries(properties).map(([key, childNode]) => renderNode(key, childNode, value[key], [key]))}</div></div>;
}
