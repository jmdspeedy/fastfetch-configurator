import { FASTFETCH_SCHEMA_URL } from '@/utils/configExport';

export interface FastfetchSchemaNode {
  type?: string;
  title?: string;
  description?: string;
  const?: string;
  enum?: (string | number | boolean | null)[];
  default?: unknown;
  properties?: Record<string, FastfetchSchemaNode>;
  items?: FastfetchSchemaNode;
  oneOf?: FastfetchSchemaNode[];
  anyOf?: FastfetchSchemaNode[];
  $ref?: string;
  additionalProperties?: boolean;
}

export interface FastfetchSchemaDocument extends FastfetchSchemaNode {
  $defs?: Record<string, FastfetchSchemaNode>;
}

let schemaPromise: Promise<FastfetchSchemaDocument> | null = null;

export function loadFastfetchSchema(): Promise<FastfetchSchemaDocument> {
  if (!schemaPromise) {
    schemaPromise = fetch(FASTFETCH_SCHEMA_URL).then(async (response) => {
      if (!response.ok) throw new Error(`Fastfetch schema request failed (${response.status})`);
      return response.json() as Promise<FastfetchSchemaDocument>;
    });
  }
  return schemaPromise;
}

export function resolveSchemaRef(schema: FastfetchSchemaDocument, node: FastfetchSchemaNode): FastfetchSchemaNode {
  if (!node.$ref) return node;
  const prefix = '#/$defs/';
  return node.$ref.startsWith(prefix) ? schema.$defs?.[node.$ref.slice(prefix.length)] || {} : {};
}

export function findModuleSchema(schema: FastfetchSchemaDocument, type: string): FastfetchSchemaNode | undefined {
  const modules = schema.properties?.modules;
  if (!modules?.items) return undefined;
  const target = type.toLowerCase();
  const pending: FastfetchSchemaNode[] = [modules.items];
  const visited = new Set<FastfetchSchemaNode>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    const resolved = resolveSchemaRef(schema, current);
    const constType = resolved.properties?.type?.const;
    if (typeof constType === 'string' && constType.toLowerCase() === target) return resolved;
    if (resolved.oneOf) pending.push(...resolved.oneOf);
    if (resolved.anyOf) pending.push(...resolved.anyOf);
    if (resolved.items) pending.push(resolved.items);
  }
  return undefined;
}
