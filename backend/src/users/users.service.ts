import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { webcrypto } from 'crypto';

const { subtle } = webcrypto;

@Injectable()
export class UsersService {
  private privateKey: webcrypto.CryptoKey;
  private publicKey: webcrypto.CryptoKey;
  private publicKeyDer: Buffer;

  constructor(
    @InjectRepository(UserEntity)
    private usersRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    // ✅ Use WebCrypto API instead of native crypto
    const keyPair = await subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-384',
      },
      true,
      ['sign', 'verify'],
    );

    this.privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;

    // Export public key as DER for storage
    const publicKeyArrayBuffer = await subtle.exportKey('spki', this.publicKey);
    this.publicKeyDer = Buffer.from(publicKeyArrayBuffer);

    console.log('RSA-PSS keypair generated using WebCrypto API.');
  }

  async createUser(email: string, role = 'user') {
    const createdAt = Date.now();

    console.log('=== Creating user:', email, '===');

    // ✅ Hash the email using WebCrypto
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(email);
    const emailHashArrayBuffer = await subtle.digest('SHA-384', emailBytes);
    const emailHash = Buffer.from(emailHashArrayBuffer);

    console.log('Email hash (hex):', emailHash.toString('hex'));
    console.log('Email hash length:', emailHash.length, 'bytes');

    // ✅ Sign using WebCrypto API
    const signatureArrayBuffer = await subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 48, // SHA-384 digest length
      },
      this.privateKey,
      emailBytes, // Sign the original email, not the hash
    );
    const signature = Buffer.from(signatureArrayBuffer);

    console.log('Signature length:', signature.length, 'bytes');
    console.log('Public key DER length:', this.publicKeyDer.length, 'bytes');

    // ✅ Verify on backend using WebCrypto
    const backendVerify = await subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 48,
      },
      this.publicKey,
      signature,
      emailBytes,
    );
    console.log(
      'Backend self-verification:',
      backendVerify,
      backendVerify ? '✅' : '❌',
    );
    console.log('==================');

    const user = this.usersRepo.create({
      email,
      role,
      status: true,
      createdAt,
      signature,
      publicKeySpki: this.publicKeyDer,
    });
    return this.usersRepo.save(user);
  }

  async updateUser(id: string, changes: Partial<UserEntity>) {
    await this.usersRepo.update(id, changes);
    return this.usersRepo.findOneBy({ id });
  }

  async deleteUser(id: string) {
    return this.usersRepo.delete(id);
  }

  async listUsers() {
    return this.usersRepo.find();
  }

  async getAllUsersForExport() {
    return this.listUsers();
  }
  async deleteAllUsers() {
    await this.usersRepo.clear();
    return { message: 'all users deleted successfully' };
  }
}
