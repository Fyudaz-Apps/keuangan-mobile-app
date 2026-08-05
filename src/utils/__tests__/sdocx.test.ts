import { deflate } from 'pako';
import { extractSdocxText } from '@/utils/sdocx';

interface ZipEntry {
  name: string;
  content: string;
}

function makeZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  const encoder = new TextEncoder();
  const concat = (parts: Uint8Array[]) => {
    const total = parts.reduce((sum, p) => sum + p.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const p of parts) {
      out.set(p, pos);
      pos += p.length;
    }
    return out;
  };

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const raw = encoder.encode(entry.content);
    const compressed = deflate(raw, { raw: true });

    const local = new Uint8Array(30 + name.length + compressed.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(compressed, 30 + name.length);
    localParts.push(local);

    const central = new Uint8Array(46 + name.length);
    const c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(10, 8, true);
    c.setUint32(20, compressed.length, true);
    c.setUint32(24, raw.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);

    offset += local.length;
  }

  const cdSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const eocd = new Uint8Array(22);
  const e = new DataView(eocd.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(10, entries.length, true);
  e.setUint32(12, cdSize, true);
  e.setUint32(16, offset, true);

  return concat([...localParts, ...centralParts, eocd]);
}

describe('extractSdocxText', () => {
  it('extracts text from s:t elements in content.xml', () => {
    const zip = makeZip([
      {
        name: 'content.xml',
        content:
          '<s:document><s:content><s:p><s:t>makan bakso 25rb</s:t></s:p><s:p><s:t>bensin 100rb</s:t></s:p></s:content></s:document>',
      },
      { name: 'image1.bin', content: 'not-text' },
    ]);
    expect(extractSdocxText(zip)).toBe('makan bakso 25rb\nbensin 100rb');
  });

  it('returns empty string for non-zip data', () => {
    expect(extractSdocxText(new Uint8Array([1, 2, 3, 4, 5]))).toBe('');
  });
});
