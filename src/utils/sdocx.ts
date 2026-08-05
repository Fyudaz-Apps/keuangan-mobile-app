import { inflate } from 'pako';

function decodeUtf8(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) {
      out += String.fromCharCode(b);
    } else if (b < 0xe0) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    } else if (b < 0xf0) {
      out += String.fromCharCode(
        ((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f)
      );
    } else {
      out += String.fromCharCode(
        ((b & 0x07) << 18) |
          ((bytes[i++] & 0x3f) << 12) |
          ((bytes[i++] & 0x3f) << 6) |
          (bytes[i++] & 0x3f)
      );
    }
  }
  return out;
}

function findEndOfCentralDirectory(data: Uint8Array): DataView | null {
  const min = Math.max(0, data.length - 65557);
  for (let i = data.length - 22; i >= min; i--) {
    if (data[i] === 0x50 && data[i + 1] === 0x4b && data[i + 2] === 0x05 && data[i + 3] === 0x06) {
      return new DataView(data.buffer, data.byteOffset + i, 22);
    }
  }
  return null;
}

function findCentralEntry(
  data: Uint8Array,
  offset: number,
  count: number,
  targetName: string
): { method: number; compSize: number; localOffset: number } | null {
  const view = new DataView(data.buffer, data.byteOffset);
  let cursor = offset;
  for (let i = 0; i < count; i++) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const method = view.getUint16(cursor + 10, true);
    const compSize = view.getUint32(cursor + 20, true);
    const fnameLen = view.getUint16(cursor + 28, true);
    const extraLen = view.getUint16(cursor + 30, true);
    const commentLen = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decodeUtf8(data.subarray(cursor + 46, cursor + 46 + fnameLen));
    if (name === targetName || name.endsWith(`/${targetName}`)) {
      return { method, compSize, localOffset };
    }
    cursor += 46 + fnameLen + extraLen + commentLen;
  }
  return null;
}

function readEntryData(
  data: Uint8Array,
  localOffset: number,
  compSize: number,
  method: number
): Uint8Array {
  const view = new DataView(data.buffer, data.byteOffset);
  const fnameLen = view.getUint16(localOffset + 26, true);
  const extraLen = view.getUint16(localOffset + 28, true);
  const start = localOffset + 30 + fnameLen + extraLen;
  const compressed = data.subarray(start, start + compSize);
  if (method === 0) return compressed;
  return inflate(compressed, { raw: true });
}

function extractXmlText(xml: string): string {
  const cdataBlocks = xml.match(/<!\[CDATA\[([\s\S]*?)\]\]>/g);
  if (cdataBlocks) {
    return cdataBlocks.map((block) => block.slice(9, -3)).join('\n');
  }
  const textParts: string[] = [];
  const tagRe = /<([a-zA-Z0-9_]+):t\b[^>]*>([\s\S]*?)<\/\1:t>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(xml)) !== null) {
    textParts.push(match[2]);
  }
  if (textParts.length === 0) return '';
  return textParts
    .map((part) => part.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
    .join('\n');
}

/**
 * Parse a Samsung Notes .sdocx file (a ZIP containing content.xml)
 * and return the note text. Returns '' when no text is found.
 */
export function extractSdocxText(data: Uint8Array): string {
  const eocd = findEndOfCentralDirectory(data);
  if (!eocd) return '';
  const entryCount = eocd.getUint16(10, true);
  const cdOffset = eocd.getUint32(16, true);
  const entry = findCentralEntry(data, cdOffset, entryCount, 'content.xml');
  if (!entry) return '';
  const raw = readEntryData(data, entry.localOffset, entry.compSize, entry.method);
  return extractXmlText(decodeUtf8(raw));
}
