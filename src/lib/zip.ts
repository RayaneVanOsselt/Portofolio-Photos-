/**
 * Archive ZIP préparée dans le navigateur, sans dépendance (le site est
 * statique : pas de serveur pour la générer).
 *
 * Les photos sont déjà compressées (JPEG) : elles sont rangées telles quelles
 * (méthode « stored »), ce qui est instantané. Les fichiers sont récupérés un
 * par un ; la progression suit les octets réellement reçus ; l'opération est
 * annulable. La taille totale est plafonnée par l'appelant
 * (siteConfig.downloads.maxArchiveBytes) pour ne jamais saturer la mémoire.
 */

export type ZipEntry = {
  /** Chemin dans l'archive : « dossier/fichier.jpg » (ASCII de préférence). */
  name: string;
  url: string;
  /** Taille attendue, pour la progression. */
  bytes: number;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Date et heure au format MS-DOS (en-têtes ZIP). */
function dosDate(date: Date) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

/** Télécharge un fichier en rapportant chaque bloc reçu. */
async function fetchBytes(url: string, signal: AbortSignal | undefined, onChunk: (bytes: number) => void) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Fichier indisponible (${response.status}) : ${url}`);
  if (!response.body) {
    const data = new Uint8Array(await response.arrayBuffer());
    onChunk(data.length);
    return data;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    length += value.length;
    onChunk(value.length);
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  return data;
}

export async function buildZip(
  entries: ZipEntry[],
  { date = new Date(), signal, onProgress }: { date?: Date; signal?: AbortSignal; onProgress?: (received: number, total: number) => void } = {},
): Promise<Blob> {
  const encoder = new TextEncoder();
  const total = entries.reduce((n, e) => n + e.bytes, 0);
  const { time, day } = dosDate(date);
  const parts: BlobPart[] = [];
  const directory: BlobPart[] = [];
  let directorySize = 0;
  let offset = 0;
  let received = 0;

  for (const entry of entries) {
    const data = await fetchBytes(entry.url, signal, (bytes) => {
      received += bytes;
      onProgress?.(Math.min(received, total), total);
    });
    const name = encoder.encode(entry.name);
    const crc = crc32(data);

    // En-tête local (30 octets) + nom + données.
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version nécessaire
    local.setUint16(6, 0x0800, true); // noms en UTF-8
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    parts.push(local.buffer, name, data);

    // Entrée du répertoire central (46 octets) + nom.
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(12, time, true);
    central.setUint16(14, day, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, data.length, true);
    central.setUint32(24, data.length, true);
    central.setUint16(28, name.length, true);
    central.setUint32(42, offset, true);
    directory.push(central.buffer, name);
    directorySize += 46 + name.length;
    offset += 30 + name.length + data.length;
  }

  // Fin du répertoire central (22 octets).
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, directorySize, true);
  end.setUint32(16, offset, true);

  return new Blob([...parts, ...directory, end.buffer], { type: "application/zip" });
}

/** Propose un fichier généré au téléchargement. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Laisse au navigateur le temps de démarrer l'écriture avant de libérer la mémoire.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
