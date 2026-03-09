/**
 * axios-utils.ts - 单元测试
 * 
 * 测试目标：src/tool/axios-utils.ts
 * 包含函数：feature, throwError, changeServerUrl, getJWTDate,
 *           clearAccessTokens, serverConfig
 */

import {
  feature,
  throwError,
  changeServerUrl,
  serverConfig,
  getJWTDate,
  clearAccessTokens,
  accessTokenKey,
  refreshAccessTokenKey,
} from '../../src/tool/axios-utils';
import tool from '../../src/tool/tool';

// Mock tool.data 方法
jest.mock('../../src/tool/tool', () => ({
  __esModule: true,
  default: {
    data: {
      remove: jest.fn(() => Promise.resolve()),
      get: jest.fn(() => Promise.resolve(null)),
      set: jest.fn(() => Promise.resolve()),
    },
  },
}));

// ============================================================
// feature 函数 — Promise 包装器 [err, data] 模式
// ============================================================
describe('feature - Promise 包装器', () => {

  it('成功时应返回 [null, data]', async () => {
    const mockPromise = Promise.resolve({ id: 'station-001', name: '工位A' });
    const [err, data] = await feature(mockPromise);

    expect(err).toBeNull();
    expect(data).toEqual({ id: 'station-001', name: '工位A' });
  });

  it('失败时应返回 [error, undefined]', async () => {
    const mockError = new Error('Network Error');
    const mockPromise = Promise.reject(mockError);
    const [err, data] = await feature(mockPromise);

    expect(err).toBe(mockError);
    expect(data).toBeUndefined();
  });

  it('失败时应合并 errorExt 到错误对象', async () => {
    const mockError = new Error('API Error');
    const mockPromise = Promise.reject(mockError);
    const errorExt = { code: 500, source: 'valve-api' };

    const [err, data] = await feature(mockPromise, errorExt);

    // Object.assign({}, err, errorExt) 合并了 errorExt 的属性
    expect(err).toHaveProperty('code', 500);
    expect(err).toHaveProperty('source', 'valve-api');
    expect(data).toBeUndefined();
  });

  it('成功时应处理各种数据类型', async () => {
    // 字符串
    const [err1, data1] = await feature(Promise.resolve('hello'));
    expect(err1).toBeNull();
    expect(data1).toBe('hello');

    // 数字
    const [err2, data2] = await feature(Promise.resolve(42));
    expect(err2).toBeNull();
    expect(data2).toBe(42);

    // null
    const [err3, data3] = await feature(Promise.resolve(null));
    expect(err3).toBeNull();
    expect(data3).toBeNull();
  });
});

// ============================================================
// throwError 测试
// ============================================================
describe('throwError - 错误抛出', () => {

  it('应抛出指定消息的 Error', () => {
    expect(() => throwError('测试错误')).toThrow('测试错误');
  });

  it('应抛出 Error 实例', () => {
    expect(() => throwError('test')).toThrow(Error);
  });
});

// ============================================================
// changeServerUrl 测试
// ============================================================
describe('changeServerUrl - 动态修改服务器地址', () => {

  it('应能修改 serverConfig.baseURL', () => {
    const newUrl = 'http://192.168.1.100:5000/api';
    changeServerUrl(newUrl);
    expect(serverConfig.baseURL).toBe(newUrl);
  });

  it('应能多次修改', () => {
    changeServerUrl('http://url1.com/api');
    expect(serverConfig.baseURL).toBe('http://url1.com/api');

    changeServerUrl('http://url2.com/api');
    expect(serverConfig.baseURL).toBe('http://url2.com/api');
  });
});

// ============================================================
// getJWTDate 测试
// ============================================================
describe('getJWTDate - JWT 时间戳转 Date', () => {

  it('应将 Unix 时间戳(秒)转为 Date 对象', () => {
    // 1709712000 = 2024-03-06T08:00:00.000Z
    const timestamp = 1709712000;
    const result = getJWTDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1709712000 * 1000);
  });

  it('应正确转换时间戳 0（Unix 纪元）', () => {
    const result = getJWTDate(0);
    expect(result.getTime()).toBe(0);
  });
});

// ============================================================
// clearAccessTokens 测试
// ============================================================
describe('clearAccessTokens - 清除 Token', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应调用 tool.data.remove 清除 accessToken 和 refreshToken', async () => {
    await clearAccessTokens();

    expect(tool.data.remove).toHaveBeenCalledTimes(2);
    expect(tool.data.remove).toHaveBeenCalledWith(accessTokenKey);
    expect(tool.data.remove).toHaveBeenCalledWith(refreshAccessTokenKey);
  });
});

// ============================================================
// Token Key 常量测试
// ============================================================
describe('Token 常量定义', () => {

  it('accessTokenKey 应为 "TOKEN"', () => {
    expect(accessTokenKey).toBe('TOKEN');
  });

  it('refreshAccessTokenKey 应以 "x-" 为前缀', () => {
    expect(refreshAccessTokenKey).toBe(`x-${accessTokenKey}`);
    expect(refreshAccessTokenKey).toBe('x-TOKEN');
  });
});
