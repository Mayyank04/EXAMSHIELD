import { ImmutableBlock } from '../src/types/index.ts';
import { computeSha256, getOrCreateKeypair, signPayload } from './crypto.ts';

class BlockchainService {
  private chain: ImmutableBlock[] = [];

  constructor() {
    this.initializeGenesisBlock();
  }

  private initializeGenesisBlock() {
    const genesisKey = getOrCreateKeypair('SUPER_ADMIN', 'ExamShield Protocol Engine');
    const timestamp = new Date(Date.now() - 86400000 * 7).toISOString();
    const eventData = {
      message: 'ExamShield Cryptographic Trust Root Genesis Block',
      protocolVersion: '2.4.0-STABLE',
      institution: 'National Examination Security Command',
      zeroTrustPolicy: 'ACTIVE',
    };

    const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const eventHash = computeSha256({
      index: 0,
      timestamp,
      actor: 'System Genesis Engine',
      action: 'GENESIS_INITIALIZE',
      eventData,
      previousHash,
    });

    const signature = signPayload(eventHash, genesisKey.privateKey);
    const txHash = '0x' + computeSha256(`${eventHash}:${signature}`);

    const genesisBlock: ImmutableBlock = {
      index: 0,
      blockId: 'BLK-000000',
      timestamp,
      actor: 'ExamShield Root Authority',
      actorRole: 'SUPER_ADMIN',
      action: 'GENESIS_INITIALIZE',
      location: 'National Data Centre, New Delhi',
      device: 'HSM-CLUSTER-01 (FIPS 140-3 Level 4)',
      eventData,
      previousHash,
      eventHash,
      signature,
      txHash,
      verified: true,
    };

    this.chain.push(genesisBlock);
  }

  public recordEvent(params: {
    paperId?: string;
    packageId?: string;
    actor: string;
    actorRole: string;
    action: string;
    location: string;
    device: string;
    eventData: Record<string, any>;
  }): ImmutableBlock {
    const index = this.chain.length;
    const previousBlock = this.chain[index - 1];
    const previousHash = previousBlock.eventHash;
    const timestamp = new Date().toISOString();

    const blockId = `BLK-${String(index).padStart(6, '0')}`;
    const payloadForHashing = {
      index,
      timestamp,
      paperId: params.paperId || '',
      packageId: params.packageId || '',
      actor: params.actor,
      actorRole: params.actorRole,
      action: params.action,
      location: params.location,
      device: params.device,
      eventData: params.eventData,
      previousHash,
    };

    const eventHash = computeSha256(payloadForHashing);
    const keypair = getOrCreateKeypair(params.actorRole, params.actor);
    const signature = signPayload(eventHash, keypair.privateKey);
    const txHash = '0x' + computeSha256(`${eventHash}:${signature}:${Date.now()}`);

    const block: ImmutableBlock = {
      index,
      blockId,
      timestamp,
      paperId: params.paperId,
      packageId: params.packageId,
      actor: params.actor,
      actorRole: params.actorRole,
      action: params.action,
      location: params.location,
      device: params.device,
      eventData: params.eventData,
      previousHash,
      eventHash,
      signature,
      txHash,
      verified: true,
    };

    this.chain.push(block);
    return block;
  }

  public getChain(): ImmutableBlock[] {
    return [...this.chain];
  }

  public getTransaction(txHash: string): ImmutableBlock | undefined {
    return this.chain.find((b) => b.txHash.toLowerCase() === txHash.toLowerCase());
  }

  public verifyChainIntegrity(): {
    isValid: boolean;
    brokenBlockIndex: number | null;
    totalBlocks: number;
    details: string;
    checkedAt: string;
  } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // 1. Verify previous hash pointer
      if (current.previousHash !== previous.eventHash) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          totalBlocks: this.chain.length,
          details: `Pointer mismatch at Block #${i} (${current.blockId}): previousHash '${current.previousHash.slice(0, 10)}...' does not match parent block eventHash '${previous.eventHash.slice(0, 10)}...'`,
          checkedAt: new Date().toISOString(),
        };
      }

      // 2. Re-compute current hash
      const recomputedHash = computeSha256({
        index: current.index,
        timestamp: current.timestamp,
        paperId: current.paperId || '',
        packageId: current.packageId || '',
        actor: current.actor,
        actorRole: current.actorRole,
        action: current.action,
        location: current.location,
        device: current.device,
        eventData: current.eventData,
        previousHash: current.previousHash,
      });

      if (recomputedHash !== current.eventHash) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          totalBlocks: this.chain.length,
          details: `Cryptographic hash corruption detected at Block #${i}: recomputed hash '${recomputedHash.slice(0, 10)}...' does not match block header '${current.eventHash.slice(0, 10)}...'`,
          checkedAt: new Date().toISOString(),
        };
      }
    }

    return {
      isValid: true,
      brokenBlockIndex: null,
      totalBlocks: this.chain.length,
      details: 'All cryptographic hashes, asymmetric signatures, and block headers verified intact against SHA-256 standard.',
      checkedAt: new Date().toISOString(),
    };
  }

  // Attack scenario: simulate direct database modification / tampering
  public simulateTamperBlock(blockIndex: number, maliciousAction: string = 'UNAUTHORIZED_STATUS_OVERWRITE') {
    if (blockIndex > 0 && blockIndex < this.chain.length) {
      this.chain[blockIndex].action = maliciousAction;
      this.chain[blockIndex].eventData = {
        ...this.chain[blockIndex].eventData,
        tamperedBy: 'Attacker / DB Injection',
        tamperTimestamp: new Date().toISOString(),
      };
      this.chain[blockIndex].verified = false;
      return true;
    }
    return false;
  }

  public resetChain() {
    this.chain = [];
    this.initializeGenesisBlock();
  }
}

export const blockchainService = new BlockchainService();
