export const undefinedValue = undefined;
export const nullValue = null;
export const trueValue = true;
export const falseValue = false;

/**
 * 空函数，做兼容处理
 */
export const noop = () => {};

/**
 * 判断参数是否为函数
 * @param fn 任意参数
 * @returns 该参数是否为函数
 */
export const isFn = (arg: any): arg is (...args: any) => any => typeof arg === 'function';

// 判断是否为某个类的实例
export const instanceOf = <T>(arg: any, cls: new (...args: any[]) => T): arg is T => arg instanceof cls;

/**
 * 判断参数是否为数字
 * @param arg 任意参数
 * @returns 该参数是否为数字
 */
export const isNumber = (arg: any): arg is number => typeof arg === 'number' && !isNaN(arg);

/**
 * 判断参数是否为字符串
 * @param arg 任意参数
 * @returns 该参数是否为字符串
 */
export const isString = (arg: any): arg is string => typeof arg === 'string';
