'use client';

/**
 * Kept as a compatibility shim for downstream imports. The configurator no
 * longer renders schema-generated controls; imported schema fields remain in
 * the raw configuration and are handled by the preview/export boundary.
 */
export default function SchemaFields(): null {
  return null;
}
