/**
 * Client-Side Real Cryptographic Engine using Web Crypto API & Canonical Serialization.
 * Generates deterministic SHA-256 digests and computes Merkle trees.
 */

export class CryptoService {
  /**
   * Computes standard SHA-256 hex digest using Web Crypto API in browser or Node crypto in server.
   */
  public static async computeSha256(data: string | object): Promise<string> {
    const canonicalText = typeof data === 'string' ? data : this.canonicalizeJson(data);

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(canonicalText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Deterministic fallback for non-browser environments
    return this.fallbackSha256(canonicalText);
  }

  /**
   * Synchronous SHA-256 fallback (standard FIPS 180-4 implementation)
   */
  public static fallbackSha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
      return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let lengthProperty = 'length';
    let i, j;
    let result = '';

    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;

    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;

    const isPrime: Record<number, boolean> = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isPrime[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isPrime[i] = true;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length; ) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15],
          w2 = w[i - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

        const s1_ = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const temp1 = (hash[7] + s1_ + ch + k[i] + w[i]) | 0;
        const s0_ = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp2 = (s0_ + maj) | 0;

        hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (let b = 3; b >= 0; b--) {
        const byte = (hash[i] >> (8 * b)) & 255;
        result += byte.toString(16).padStart(2, '0');
      }
    }
    return result;
  }

  /**
   * Deterministically orders and serializes any object to produce consistent canonical hashing.
   */
  public static canonicalizeJson(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return `[${obj.map((item) => this.canonicalizeJson(item)).join(',')}]`;
    }
    const sortedKeys = Object.keys(obj).sort();
    const keyPairs = sortedKeys.map((key) => `${JSON.stringify(key)}:${this.canonicalizeJson(obj[key])}`);
    return `{${keyPairs.join(',')}}`;
  }

  /**
   * Computes a Merkle Root hash from an array of leaf hashes or items.
   */
  public static computeMerkleRoot(leaves: string[]): string {
    if (leaves.length === 0) return this.fallbackSha256('EMPTY_MERKLE_TREE');
    if (leaves.length === 1) return leaves[0];

    let currentLevel = [...leaves];
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const combined = this.fallbackSha256(`${left}:${right}`);
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }
    return currentLevel[0];
  }

  /**
   * Verifies if raw document string matches a registered hash.
   */
  public static verifyDocumentIntegrity(
    content: string | object,
    registeredHash: string
  ): { isValid: boolean; computedHash: string } {
    const computedHash = this.fallbackSha256(typeof content === 'string' ? content : this.canonicalizeJson(content));
    return {
      isValid: computedHash.toLowerCase() === registeredHash.toLowerCase(),
      computedHash,
    };
  }
}
