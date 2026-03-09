/**
 * valveOperationMap.ts (Zustand Store) - 单元测试
 * 
 * 测试目标：src/store/valveOperationMap.ts
 * 重点测试：同步 actions (bindValve, unbindValve, clearAllBindings)
 *          和 getters (getStationById, getRunningStations, getIdleStations)
 * 
 * 注意：异步 actions (init, refresh, refreshRunningStatus) 因依赖
 *       外部 API 需要更深层次的 Mock，此处先跳过，后续可扩展
 */

import { useValveStationStore, StationInfo } from '../../src/store/valveOperationMap';

// Mock 掉所有 API 调用，仅测试 Store 的同步逻辑
jest.mock('../../app_source/valve_operation_station_list/common/api', () => ({
  getValveJobView_runningList: jest.fn(() => Promise.resolve([])),
  getValveOperatorStationManagePageList: jest.fn(() =>
    Promise.resolve(() =>
      Promise.resolve({ data: { result: { items: [] } } })
    )
  ),
}));

// ============================================================
// 辅助数据
// ============================================================
const mockStations: StationInfo[] = [
  {
    id: 'station-001',
    name: '工位A',
    isTesting: false,
    runningJobId: undefined,
    valve: undefined,
  } as StationInfo,
  {
    id: 'station-002',
    name: '工位B',
    isTesting: true,
    runningJobId: 'job-123',
    valve: { valveCode: 'V-001' } as any,
  } as StationInfo,
  {
    id: 'station-003',
    name: '工位C',
    isTesting: false,
    runningJobId: undefined,
    valve: undefined,
  } as StationInfo,
];

// ============================================================
// 测试
// ============================================================
describe('useValveStationStore - Zustand Store', () => {

  // 每个测试前预设 Store 的 stations 状态
  beforeEach(() => {
    useValveStationStore.setState({
      stations: JSON.parse(JSON.stringify(mockStations)), // 深拷贝避免互相影响
      loading: false,
      refreshing: false,
      inited: true,
    });
  });

  // ---------- 初始状态 ----------
  describe('初始状态', () => {
    it('应加载 3 个工位', () => {
      const { stations } = useValveStationStore.getState();
      expect(stations).toHaveLength(3);
    });
  });

  // ---------- getStationById ----------
  describe('getStationById - 根据 ID 获取工位', () => {
    it('应返回正确的工位信息', () => {
      const { getStationById } = useValveStationStore.getState();
      const station = getStationById('station-001');
      expect(station).toBeDefined();
      expect(station!.name).toBe('工位A');
    });

    it('应返回 undefined  — 当 ID 不存在时', () => {
      const { getStationById } = useValveStationStore.getState();
      const station = getStationById('non-existent');
      expect(station).toBeUndefined();
    });
  });

  // ---------- getRunningStations ----------
  describe('getRunningStations - 获取运行中的工位', () => {
    it('应返回所有 isTesting=true 的工位', () => {
      const { getRunningStations } = useValveStationStore.getState();
      const running = getRunningStations();
      expect(running).toHaveLength(1);
      expect(running[0].id).toBe('station-002');
    });
  });

  // ---------- getIdleStations ----------
  describe('getIdleStations - 获取空闲的工位', () => {
    it('应返回所有 isTesting=false 的工位', () => {
      const { getIdleStations } = useValveStationStore.getState();
      const idle = getIdleStations();
      expect(idle).toHaveLength(2);
      const ids = idle.map((s) => s.id);
      expect(ids).toContain('station-001');
      expect(ids).toContain('station-003');
    });
  });

  // ---------- bindValve ----------
  describe('bindValve - 绑定阀门到工位', () => {
    it('应将阀门绑定到指定工位', () => {
      const mockValve = { valveCode: 'V-NEW-001', valveName: '测试阀门' } as any;
      useValveStationStore.getState().bindValve('station-001', mockValve);

      const station = useValveStationStore.getState().getStationById('station-001');
      expect(station!.valve).toEqual(mockValve);
    });

    it('绑定不应影响其他工位', () => {
      const mockValve = { valveCode: 'V-NEW-001' } as any;
      useValveStationStore.getState().bindValve('station-001', mockValve);

      const station002 = useValveStationStore.getState().getStationById('station-002');
      // 工位B 的阀门应不受影响
      expect(station002!.valve).toEqual({ valveCode: 'V-001' });
    });

    it('应能覆盖已有的阀门绑定', () => {
      const valve1 = { valveCode: 'V-001' } as any;
      const valve2 = { valveCode: 'V-002' } as any;

      useValveStationStore.getState().bindValve('station-001', valve1);
      useValveStationStore.getState().bindValve('station-001', valve2);

      const station = useValveStationStore.getState().getStationById('station-001');
      expect(station!.valve).toEqual(valve2);
    });
  });

  // ---------- unbindValve ----------
  describe('unbindValve - 解绑阀门', () => {
    it('应清除指定工位的阀门绑定', () => {
      // 先绑定
      useValveStationStore.getState().bindValve('station-001', { valveCode: 'V-001' } as any);
      // 再解绑
      useValveStationStore.getState().unbindValve('station-001');

      const station = useValveStationStore.getState().getStationById('station-001');
      expect(station!.valve).toBeUndefined();
    });

    it('解绑不应影响其他工位', () => {
      useValveStationStore.getState().unbindValve('station-001');

      const station002 = useValveStationStore.getState().getStationById('station-002');
      expect(station002!.valve).toBeDefined(); // 工位B 的阀门仍在
    });
  });

  // ---------- clearAllBindings ----------
  describe('clearAllBindings - 清除所有绑定', () => {
    it('应清除所有工位的阀门绑定', () => {
      useValveStationStore.getState().clearAllBindings();

      const { stations } = useValveStationStore.getState();
      stations.forEach((station) => {
        expect(station.valve).toBeUndefined();
      });
    });

    it('清除后工位数量不变', () => {
      useValveStationStore.getState().clearAllBindings();

      const { stations } = useValveStationStore.getState();
      expect(stations).toHaveLength(3);
    });

    it('清除后工位其他信息应保留', () => {
      useValveStationStore.getState().clearAllBindings();

      const station = useValveStationStore.getState().getStationById('station-001');
      expect(station!.name).toBe('工位A');
      expect(station!.id).toBe('station-001');
    });
  });
});
