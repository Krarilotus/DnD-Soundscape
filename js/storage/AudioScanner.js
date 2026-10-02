/**
 * DnD-Soundscape: Audio Scanner & File Path Resolver
 * Probes and verifies audio files across standard extensions (.mp3, .ogg, .wav, .opus, .m4a, .webm, .flac).
 */

export class AudioScanner {
  constructor() {
    this.cache = new Map();
  }

  async verifyFile(filePath) {
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    const extensions = ['', '.mp3', '.ogg', '.opus', '.wav', '.m4a', '.webm', '.flac'];
    const basePath = filePath.replace(/\.[a-zA-Z0-9]+$/, '');

    for (const ext of extensions) {
      const candidate = ext ? `${basePath}${ext}` : filePath;
      try {
        const resp = await fetch(candidate, { method: 'HEAD' });
        if (resp.ok) {
          const result = { exists: true, resolvedPath: candidate };
          this.cache.set(filePath, result);
          return result;
        }
      } catch (e) {}
    }

    const result = { exists: false, resolvedPath: filePath };
    this.cache.set(filePath, result);
    return result;
  }
}
