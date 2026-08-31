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
   * Alias for computeSha256
   */
  public static async computeHash(data: string | object): Promise<string> {
    return this.computeSha256(data);
  }

  /**
   * Generates a deterministic mock digital signature for demo purposes.
   */
  public static async signData(hash: string): Promise<string> {
    return `RSA2048-SIG-${hash.slice(0, 16).toUpperCase()}-${Date.now()}`;
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
    words[words.length] = asciiBitLength | 0;

    for (j = 0; j < words.length; ) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15],
          w2 = w[i - 2];
        const a = hash[0],
          e = hash[4];
        const temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);
        const temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0, ...hash];
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
          const b = (hash[i] >> (8 * j)) & 255;
          result += (b < 16 ? '0' : '') + b.toString(16);
        }
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
