/**
 * tool.js 工具函数 - 单元测试
 * 
 * 测试目标：src/tool/tool.js
 * 包含模块：tool.dateFormat, tool.groupSeparator, tool.objCopy,
 *           tool.crypto (MD5, BASE64, AES), tool.sleep, tool.data
 */

import tool from '../../src/tool/tool';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// tool.dateFormat 日期格式化
// ============================================================
describe('tool.dateFormat - 日期格式化', () => {

  // 固定一个日期来测试，避免时区问题
  const testDate = new Date(2026, 2, 6, 14, 30, 45, 123); // 2026-03-06 14:30:45.123

  it('应使用默认格式 "yyyy-MM-dd hh:mm:ss"', () => {
    const result = tool.dateFormat(testDate);
    expect(result).toBe('2026-03-06 14:30:45');
  });

  it('应支持自定义格式 "yyyy/MM/dd"', () => {
    const result = tool.dateFormat(testDate, 'yyyy/MM/dd');
    expect(result).toBe('2026/03/06');
  });

  it('应支持只显示时间 "hh:mm:ss"', () => {
    const result = tool.dateFormat(testDate, 'hh:mm:ss');
    expect(result).toBe('14:30:45');
  });

  it('应支持毫秒显示 "yyyy-MM-dd hh:mm:ss.S"', () => {
    const result = tool.dateFormat(testDate, 'yyyy-MM-dd hh:mm:ss.S');
    expect(result).toBe('2026-03-06 14:30:45.123');
  });

  it('应能处理字符串格式的日期', () => {
    const result = tool.dateFormat('2026-01-15T10:00:00', 'yyyy-MM-dd');
    expect(result).toBe('2026-01-15');
  });

  it('应能处理时间戳', () => {
    const timestamp = new Date(2026, 0, 1).getTime(); // 2026-01-01
    const result = tool.dateFormat(timestamp, 'yyyy-MM-dd');
    expect(result).toBe('2026-01-01');
  });
});

// ============================================================
// tool.groupSeparator 千分符
// ============================================================
describe('tool.groupSeparator - 千分符格式化', () => {

  it('应格式化整数 1000 -> "1,000"', () => {
    expect(tool.groupSeparator(1000)).toBe('1,000');
  });

  it('应格式化大数字 1234567 -> "1,234,567"', () => {
    expect(tool.groupSeparator(1234567)).toBe('1,234,567');
  });

  it('应保留小数部分 1234567.89 -> "1,234,567.89"', () => {
    expect(tool.groupSeparator(1234567.89)).toBe('1,234,567.89');
  });

  it('应处理小于 1000 的数字 999 -> "999"', () => {
    expect(tool.groupSeparator(999)).toBe('999');
  });

  it('应处理数字 0 -> "0"', () => {
    expect(tool.groupSeparator(0)).toBe('0');
  });

  it('应处理字符串输入 "5000" -> "5,000"', () => {
    expect(tool.groupSeparator('5000')).toBe('5,000');
  });
});

// ============================================================
// tool.objCopy 深拷贝
// ============================================================
describe('tool.objCopy - 对象深拷贝', () => {

  it('应返回一个新对象（引用不同）', () => {
    const original = { name: '工位A', code: 'WS001' };
    const copied = tool.objCopy(original);
    expect(copied).toEqual(original);
    expect(copied).not.toBe(original); // 引用不同
  });

  it('应深拷贝嵌套对象', () => {
    const original = {
      station: { name: '工位A', valve: { id: 'V001' } }
    };
    const copied = tool.objCopy(original);
    expect(copied).toEqual(original);
    // 修改拷贝不应影响原对象
    copied.station.valve.id = 'V002';
    expect(original.station.valve.id).toBe('V001');
  });

  it('应深拷贝数组', () => {
    const original = [1, 2, { nested: true }];
    const copied = tool.objCopy(original);
    expect(copied).toEqual(original);
    expect(copied).not.toBe(original);
  });
});

// ============================================================
// tool.crypto 加解密
// ============================================================
describe('tool.crypto - 加解密工具', () => {

  describe('MD5', () => {
    it('应返回 32 位的 MD5 哈希值', () => {
      const hash = tool.crypto.MD5('hello');
      expect(hash).toHaveLength(32);
      expect(hash).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('应对不同输入生成不同哈希', () => {
      const hash1 = tool.crypto.MD5('hello');
      const hash2 = tool.crypto.MD5('world');
      expect(hash1).not.toBe(hash2);
    });

    it('应对相同输入生成相同哈希', () => {
      const hash1 = tool.crypto.MD5('test123');
      const hash2 = tool.crypto.MD5('test123');
      expect(hash1).toBe(hash2);
    });
  });

  describe('BASE64', () => {
    it('应能加密并解密回原文', () => {
      const original = 'Hello, 工位测试!';
      const encrypted = tool.crypto.BASE64.encrypt(original);
      const decrypted = tool.crypto.BASE64.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it('应能处理空字符串', () => {
      const encrypted = tool.crypto.BASE64.encrypt('');
      const decrypted = tool.crypto.BASE64.decrypt(encrypted);
      expect(decrypted).toBe('');
    });
  });

  describe('AES', () => {
    const secretKey = '12345678'; // 8 的倍数

    it('应能加密并解密回原文', () => {
      const original = '敏感数据：token123';
      const encrypted = tool.crypto.AES.encrypt(original, secretKey);
      expect(encrypted).not.toBe(original);

      const decrypted = tool.crypto.AES.decrypt(encrypted, secretKey);
      expect(decrypted).toBe(original);
    });

    it('应使用不同密钥无法解密', () => {
      const original = 'secret';
      const encrypted = tool.crypto.AES.encrypt(original, secretKey);
      // 用错误密钥解密，结果应不等于原文
      const wrongDecrypt = tool.crypto.AES.decrypt(encrypted, '87654321');
      expect(wrongDecrypt).not.toBe(original);
    });
  });
});

// ============================================================
// tool.sleep 延时
// ============================================================
describe('tool.sleep - 延时函数', () => {

  it('应返回 Promise', () => {
    const result = tool.sleep(10);
    expect(result).toBeInstanceOf(Promise);
  });

  it('应在指定时间后 resolve', async () => {
    const start = Date.now();
    await tool.sleep(50);
    const elapsed = Date.now() - start;
    // 允许 ±30ms 误差
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

// ============================================================
// tool.data (AsyncStorage 封装) 测试
// ============================================================
describe('tool.data - AsyncStorage 封装', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('set 应调用 AsyncStorage.setItem', async () => {
    await tool.data.set('testKey', { name: '工位A' });
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      expect.any(String)
    );
  });

  it('get 应调用 AsyncStorage.getItem', async () => {
    // 模拟存储的数据格式
    const storedValue = JSON.stringify({
      content: { name: '工位A' },
      datetime: 0, // 永不过期
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(storedValue);

    const result = await tool.data.get('testKey');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(result).toEqual({ name: '工位A' });
  });

  it('get 应返回 null — 当 key 不存在时', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await tool.data.get('nonExistentKey');
    expect(result).toBeNull();
  });

  it('get 应返回 null — 当数据已过期时', async () => {
    const expiredValue = JSON.stringify({
      content: 'old data',
      datetime: Date.now() - 10000, // 已过期 10 秒
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(expiredValue);

    const result = await tool.data.get('expiredKey');
    expect(result).toBeNull();
    // 过期数据应被自动删除
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('expiredKey');
  });

  it('remove 应调用 AsyncStorage.removeItem', async () => {
    await tool.data.remove('testKey');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
  });

  it('clear 应调用 AsyncStorage.clear', async () => {
    await tool.data.clear();
    expect(AsyncStorage.clear).toHaveBeenCalledTimes(1);
  });
});
