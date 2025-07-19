import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

// todo 把所有的配置数据加密，避免用户改坏了
/**
 * AES 加密解密工具类
 */
class AESCrypto {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-cbc';

  /**
   * 创建 AES 加密实例
   * @param key - 加密密钥
   */
  constructor(key: string) {
    // 确保密钥为 32 字节，用于 AES-256
    this.key = createHash('sha256').update(key).digest();
  }

  /**
   * ! **会有报错，请在使用的地方处理**
   *
   * 使用 AES 加密字符串
   * @param text - 要加密的明文
   * @returns 以 base64 格式返回加密后的字符串
   */
  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 将 IV 和加密数据组合
    const result = iv.toString('hex') + ':' + encrypted;
    return Buffer.from(result).toString('base64');
  }

  /**
   * ! **会有报错，请在使用的地方处理**
   *
   * 使用 AES 解密字符串
   * @param encryptedText - 以 base64 格式的加密文本
   * @returns 解密后的明文
   */
  decrypt(encryptedText: string): string {
    const combined = Buffer.from(encryptedText, 'base64').toString('utf8');
    const [ivHex, encrypted] = combined.split(':');

    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export default new AESCrypto('saitamasaikou! by Kasukabe Tsumugi');
