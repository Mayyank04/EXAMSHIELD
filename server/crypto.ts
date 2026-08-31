import crypto from 'crypto';

// In-memory keypair storage for simulated hardware security modules / institutional certs
interface AuthorityKeypair {
  id: string;
  role: string;
  name: string;
  publicKey: string;
  privateKey: string;
}

const authorityKeyRegistry = new Map<string, AuthorityKeypair>();

// Generate deterministic or dynamic keypairs
export function getOrCreateKeypair(role: string, name: string): AuthorityKeypair {
  const keyId = `KEY-${role.toUpperCase()}-${name.replace(/\s+/g, '_')}`;
  if (authorityKeyRegistry.has(keyId)) {
    return authorityKeyRegistry.get(keyId)!;
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const keypair: AuthorityKeypair = {
    id: keyId,
    role,
    name,
    publicKey,
    privateKey,
  };

  authorityKeyRegistry.set(keyId, keypair);
  return keypair;
}

// Compute standard SHA-256 hex digest
export function computeSha256(data: string | Buffer | object): string {
  const content = typeof data === 'string'
    ? data
    : Buffer.isBuffer(data)
    ? data
    : JSON.stringify(data, Object.keys(data).sort());

  return crypto.createHash('sha256').update(content).digest('hex');
}

// Sign payload with institutional private key
export function signPayload(payload: string | object, privateKeyPem: string): string {
  const content = typeof payload === 'string'
    ? payload
    : JSON.stringify(payload, Object.keys(payload).sort());

  const signer = crypto.createSign('SHA256');
  signer.update(content);
  signer.end();
  return signer.sign(privateKeyPem, 'hex');
}

// Verify payload signature with institutional public key
export function verifySignature(payload: string | object, signatureHex: string, publicKeyPem: string): boolean {
  try {
    const content = typeof payload === 'string'
      ? payload
      : JSON.stringify(payload, Object.keys(payload).sort());

    const verifier = crypto.createVerify('SHA256');
    verifier.update(content);
    verifier.end();
    return verifier.verify(publicKeyPem, signatureHex, 'hex');
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

// Generate canonical Paper Hash
export function computePaperFingerprint(paperData: {
  paperCode: string;
  examination: string;
  subject: string;
  year: number;
  set: string;
  version: number;
  questions: any[];
}): string {
  return computeSha256({
    code: paperData.paperCode,
    exam: paperData.examination,
    subject: paperData.subject,
    year: paperData.year,
    set: paperData.set,
    version: paperData.version,
    questions: paperData.questions,
  });
}

// Generate secure QR Token (non-confidential pointer token)
export function generateSecureQrPayload(type: 'PAPER' | 'PACKAGE', entityId: string, secretSalt: string = 'EXAMSHIELD_SALT_2027'): string {
  const timestamp = Date.now().toString();
  const token = computeSha256(`${type}:${entityId}:${timestamp}:${secretSalt}`).slice(0, 16).toUpperCase();
  return `EXS-${type.slice(0, 3)}-${entityId.slice(-6).toUpperCase()}-${token}`;
}
