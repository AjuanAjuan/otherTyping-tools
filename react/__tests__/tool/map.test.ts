/**
 * map.ts 工具函数 - 单元测试
 * 
 * 测试目标：src/tool/map.ts
 * 包含函数/常量：mapValveJobType, StorageKey, stationTypeSeedData
 */

import { mapValveJobType, StorageKey, stationTypeSeedData } from '../../src/tool/map';

// ============================================================
// mapValveJobType 测试
// ============================================================
describe('mapValveJobType - 阀门作业类型映射', () => {

  // 测试每一个有效的枚举值
  const validCases = [
    { input: 0, expectedName: '传感器校准', expectedInputKey: 'calibrationInput' },
    { input: 10, expectedName: '动态测试', expectedInputKey: 'rampTestInput' },
    { input: 20, expectedName: '阶跃响应测试', expectedInputKey: 'stepRespTestInput' },
    { input: 30, expectedName: '始终点偏差测试', expectedInputKey: 'startingAndEndingTestInput' },
    { input: 40, expectedName: '死区测试', expectedInputKey: 'deadZoneTestInput' },
    { input: 50, expectedName: '泄漏量测试', expectedInputKey: 'leakageTestStartJobInput' },
    { input: 60, expectedName: '始终点压力测试', expectedInputKey: 'startToEndPressureTestInput' },
    { input: 130, expectedName: '气密性测试', expectedInputKey: '' },
    { input: 160, expectedName: '动作寿命测试', expectedInputKey: 'actionLifeTestStartJobInput' },
  ];

  it.each(validCases)(
    '应返回 { name: "$expectedName" } — 当 valveJobType = $input',
    ({ input, expectedName, expectedInputKey }) => {
      const result = mapValveJobType(input as any);
      expect(result).toBeDefined();
      expect(result!.name).toBe(expectedName);
      expect(result!.inputKey).toBe(expectedInputKey);
    }
  );

  it('应返回 undefined — 当传入未定义的枚举值 (如 999)', () => {
    const result = mapValveJobType(999 as any);
    expect(result).toBeUndefined();
  });

  it('应返回 undefined — 当传入负数 (如 -1)', () => {
    const result = mapValveJobType(-1 as any);
    expect(result).toBeUndefined();
  });
});

// ============================================================
// StorageKey 常量测试
// ============================================================
describe('StorageKey - 存储键常量', () => {

  it('应包含所有必需的存储键', () => {
    expect(StorageKey.AUTO_UPLOAD).toBe('autoUpload');
    expect(StorageKey.AUTO_UPLOAD_URL).toBe('autoUploadUrl');
    expect(StorageKey.STATION_TYPE).toBe('stationType');
    expect(StorageKey.KEEP_TIME).toBe('keepTime');
    expect(StorageKey.INTERVAL_TIME).toBe('intervalTime');
    expect(StorageKey.API_BASE_URL).toBe('apiBaseUrl');
    expect(StorageKey.STATION_TYPE_SEED_DATA).toBe('stationTypeSeedData');
  });

  it('应包含 7 个存储键', () => {
    expect(Object.keys(StorageKey)).toHaveLength(7);
  });
});

// ============================================================
// stationTypeSeedData 测试
// ============================================================
describe('stationTypeSeedData - 工位种子数据', () => {

  it('应为非空数组', () => {
    expect(Array.isArray(stationTypeSeedData)).toBe(true);
    expect(stationTypeSeedData.length).toBeGreaterThan(0);
  });

  it('每条数据应包含必要字段 (label, value, apiBaseUrl)', () => {
    stationTypeSeedData.forEach((item) => {
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('apiBaseUrl');
      expect(typeof item.label).toBe('string');
      expect(typeof item.value).toBe('string');
      expect(item.apiBaseUrl).toMatch(/^http/);
    });
  });

  it('每个 value 字段应该唯一', () => {
    const values = stationTypeSeedData.map((item) => item.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('每个 apiBaseUrl 应该是有效的 URL 格式', () => {
    stationTypeSeedData.forEach((item) => {
      expect(item.apiBaseUrl).toMatch(/^https?:\/\/.+/);
    });
  });
});
