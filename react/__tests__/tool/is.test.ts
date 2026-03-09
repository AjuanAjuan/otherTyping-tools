/**
 * is.ts 工具函数 - 单元测试
 * 
 * 测试目标：src/tool/is.ts
 * 包含函数：isPromise, isFunction, isNumber
 */

import { isPromise, isFunction, isNumber } from '../../src/tool/is';

// ============================================================
// isPromise 测试
// ============================================================
describe('isPromise - Promise 类型判断', () => {

  it('应返回 true — 传入标准 Promise 对象', () => {
    const p = new Promise(() => { });
    expect(isPromise(p)).toBe(true);
  });

  it('应返回 true — 传入 async 函数的返回值', () => {
    const asyncFn = async () => 'hello';
    expect(isPromise(asyncFn())).toBe(true);
  });

  it('应返回 true — 传入带有 then 方法的类 Promise 对象 (thenable)', () => {
    const thenable = { then: () => { } };
    expect(isPromise(thenable)).toBe(true);
  });

  it('应返回 false — 传入普通对象', () => {
    expect(isPromise({ name: '工位A' })).toBe(false);
  });

  it('应返回 false — 传入字符串', () => {
    expect(isPromise('hello')).toBe(false);
  });

  it('应返回 false — 传入数字', () => {
    expect(isPromise(123)).toBe(false);
  });

  it('应返回 falsy — 传入 null', () => {
    // 注意：isPromise 使用 val && ... 短路逻辑，传入 null 时返回 null（falsy），而非 false
    expect(isPromise(null)).toBeFalsy();
  });

  it('应返回 falsy — 传入 undefined', () => {
    // 注意：isPromise 使用 val && ... 短路逻辑，传入 undefined 时返回 undefined（falsy），而非 false
    expect(isPromise(undefined)).toBeFalsy();
  });

  it('应返回 false — 传入空数组', () => {
    expect(isPromise([])).toBe(false);
  });
});

// ============================================================
// isFunction 测试
// ============================================================
describe('isFunction - 函数类型判断', () => {

  it('应返回 true — 传入普通函数', () => {
    expect(isFunction(function () { })).toBe(true);
  });

  it('应返回 true — 传入箭头函数', () => {
    expect(isFunction(() => { })).toBe(true);
  });

  it('应返回 true — 传入 async 函数', () => {
    expect(isFunction(async () => { })).toBe(true);
  });

  it('应返回 true — 传入类构造函数', () => {
    class MyClass { }
    expect(isFunction(MyClass)).toBe(true);
  });

  it('应返回 false — 传入普通对象', () => {
    expect(isFunction({})).toBe(false);
  });

  it('应返回 false — 传入字符串', () => {
    expect(isFunction('function')).toBe(false);
  });

  it('应返回 false — 传入 null', () => {
    expect(isFunction(null)).toBe(false);
  });

  it('应返回 false — 传入 undefined', () => {
    expect(isFunction(undefined)).toBe(false);
  });

  it('应返回 false — 传入数字', () => {
    expect(isFunction(42)).toBe(false);
  });
});

// ============================================================
// isNumber 测试
// ============================================================
describe('isNumber - 数字字符串校验', () => {

  // ----- 默认模式 (isDigit=true, 允许小数) -----
  describe('默认模式 (允许小数)', () => {
    it('应返回 true — 正整数字符串 "123"', () => {
      expect(isNumber('123')).toBe(true);
    });

    it('应返回 true — 负整数字符串 "-456"', () => {
      expect(isNumber('-456')).toBe(true);
    });

    it('应返回 true — 正小数 "3.14"', () => {
      expect(isNumber('3.14')).toBe(true);
    });

    it('应返回 true — 负小数 "-0.5"', () => {
      expect(isNumber('-0.5')).toBe(true);
    });

    it('应返回 true — 零 "0"', () => {
      expect(isNumber('0')).toBe(true);
    });

    it('应返回 false — 空字符串', () => {
      expect(isNumber('')).toBe(false);
    });

    it('应返回 false — 包含字母 "12a3"', () => {
      expect(isNumber('12a3')).toBe(false);
    });

    it('应返回 false — 纯字母 "abc"', () => {
      expect(isNumber('abc')).toBe(false);
    });

    it('应返回 false — 包含空格 "1 23"', () => {
      expect(isNumber('1 23')).toBe(false);
    });

    it('应返回 false — 多个小数点 "1.2.3"', () => {
      expect(isNumber('1.2.3')).toBe(false);
    });

    it('应返回 false — 以小数点开头 ".5"', () => {
      expect(isNumber('.5')).toBe(false);
    });
  });

  // ----- 整数模式 (isDigit=false, 仅允许整数) -----
  describe('整数模式 (isDigit=false)', () => {
    it('应返回 true — 正整数 "42"', () => {
      expect(isNumber('42', false)).toBe(true);
    });

    it('应返回 true — 负整数 "-10"', () => {
      expect(isNumber('-10', false)).toBe(true);
    });

    it('应返回 true — 零 "0"', () => {
      expect(isNumber('0', false)).toBe(true);
    });

    it('应返回 false — 小数 "3.14"（整数模式不允许小数）', () => {
      expect(isNumber('3.14', false)).toBe(false);
    });

    it('应返回 false — 空字符串', () => {
      expect(isNumber('', false)).toBe(false);
    });

    it('应返回 false — 包含字母 "abc"', () => {
      expect(isNumber('abc', false)).toBe(false);
    });
  });
});
