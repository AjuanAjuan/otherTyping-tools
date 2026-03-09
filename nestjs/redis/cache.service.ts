import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';


@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private redisClient: RedisClientType) { }

  private matchPool;

  //获取值
  async get(key) {
    let value = await this.redisClient.get(key);
    try {
      value = JSON.parse(value);
    } catch (error) { }
    return value;
  }
  /**
   * 设置值
   * @param key {string} key
   * @param value 值
   * @param second 过期时间 秒
   * @returns Promise<any>
   */
  async set(key: string, value: any, second?: number | null) {
    value = JSON.stringify(value);
    return await this.redisClient.set(key, value, { EX: second });
  }
  //删除值
  async del(key: string) {
    return await this.redisClient.del(key);
  }
  //清除缓存
  async flushall() {
    return await this.redisClient.flushAll();
  }

  /**
   * 加入 Set
   * @param key 
   * @param value 
   */
  async sAdd(key: string, value: string): Promise<void> {
    await this.redisClient.sAdd(key, value);
  }

  /**
 * 从 Set中移除
 * @param key 
 * @param value 
 */
  async sRem(key: string, value: string): Promise<void> {
    await this.redisClient.sRem(key, value);
  }

  // 获取 Set 中的所有元素
  async sMembers(key: string): Promise<string[]> {
    return await this.redisClient.sMembers(key);
  }

  // 从 Set 中随机移除并返回指定数量的元素
  async sPop(key: string, count: number): Promise<string[]> {
    return await this.redisClient.sPop(key, count);
  }

  /**
   * 根据模式删除匹配的键（使用 SCAN 命令，安全迭代）
   * @param pattern 匹配模式（如 "user:*"）
   * @returns 被删除的键的数量
   */
  async deleteKeysByPattern(pattern: string): Promise<number> {
    const keys = [];
    let cursor = 0;

    // 使用 SCAN 命令迭代获取所有匹配的键
    do {
      const result = await this.redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100 // 每次迭代返回的键数量，可调整以平衡性能
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== 0);

    // 如果没有匹配的键，直接返回
    if (keys.length === 0) {
      return 0;
    }

    // 批量删除所有匹配的键（DEL 命令接受多个参数）
    const deletedCount = await this.redisClient.del(keys);
    return deletedCount;
  }

  getRedis() {
    return this.redisClient
  }


}