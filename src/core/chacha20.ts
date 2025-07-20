import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

/**
 * ChaCha20 加密解密工具类
 */
class ChaCha20Crypto {
  private readonly key: Buffer;
  private readonly algorithm = 'chacha20-poly1305';

  /**
   * 创建 ChaCha20 加密实例
   * @param key - 加密密钥
   */
  constructor(key: string) {
    // ChaCha20 需要 32 字节密钥
    this.key = createHash('sha256').update(key).digest();
  }

  /**
   * ! **会有报错，请在使用的地方处理**
   *
   * 使用 ChaCha20 加密字符串
   * @param buffer - 要加密的buffer
   * @returns 以 base64 格式返回加密后的字符串
   */
  encrypt(buffer: Buffer): string {
    const nonce = randomBytes(12); // ChaCha20 使用 12 字节 nonce
    const cipher = createCipheriv(this.algorithm, this.key, nonce);

    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // 获取认证标签
    const authTag = cipher.getAuthTag();

    // 将 nonce + authTag + 加密数据组合
    const result = Buffer.concat([nonce, authTag, encrypted]);
    return result.toString('base64');
  }

  /**
   * ! **会有报错，请在使用的地方处理**
   *
   * 使用 ChaCha20 解密字符串
   * @param encryptedText - 以 base64 格式的加密文本
   * @returns 解密后的Buffer
   */
  decrypt(encryptedText: string): Buffer {
    const combined = Buffer.from(encryptedText, 'base64');

    if (combined.length < 28) {
      // 12(nonce) + 16(authTag) = 28 最小长度
      throw new Error('Invalid encrypted data format');
    }

    const nonce = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);

    const decipher = createDecipheriv(this.algorithm, this.key, nonce);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }
}
const chacha20 = new ChaCha20Crypto('saitamasaikou! by Kasukabe Tsumugi');
export default chacha20;
