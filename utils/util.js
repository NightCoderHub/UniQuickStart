/**
 * 格式化时间为指定格式
 * 支持的占位符：
 * YYYY: 四位数年份
 * MM: 两位数月份 (01-12)
 * DD: 两位数日期 (01-31)
 * HH: 两位数小时 (00-23)
 * mm: 两位数分钟 (00-59)
 * ss: 两位数秒 (00-59)
 *
 * @param {Date} dateObj 要格式化的 Date 对象，默认为当前时间
 * @param {string} formatStr 格式字符串，如 'YYYY-MM-DD HH:mm:ss'，默认为 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的时间字符串
 */
export function formattedTime(timestamp = new Date(), formatStr = "YYYY-MM-DD HH:mm") {
  // 如果传入的是时间戳字符串，转换为 Date 对象
  let dateObj;
  if (typeof timestamp === "string" || typeof timestamp === "number") {
    dateObj = new Date(timestamp);
  } else {
    dateObj = timestamp;
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 月份从0开始，所以要加1
  const date = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();

  const replacements = {
    YYYY: year,
    YY: String(year).slice(-2),
    MM: String(month).padStart(2, "0"),
    DD: String(date).padStart(2, "0"),
    HH: String(hours).padStart(2, "0"),
    mm: String(minutes).padStart(2, "0"),
    ss: String(seconds).padStart(2, "0"),
  };

  let formattedString = formatStr;
  for (const key in replacements) {
    // 使用全局替换，确保所有匹配项都被替换
    formattedString = formattedString.replace(new RegExp(key, "g"), replacements[key]);
  }

  return formattedString;
}

/**
 * 格式化时间为ISO 8601标准格式 (UTC)
 * 生成符合java.time.Instant要求的UTC格式时间戳
 *
 * @param {Date} dateObj 要格式化的 Date 对象，默认为当前时间
 * @returns {string} 格式化后的ISO时间字符串，如 '2023-01-01T12:30:45.123Z'
 */
export function formatISOTime(dateObj = new Date()) {
  // 直接使用Date对象的toISOString方法获取UTC格式的时间字符串
  // 这会自动转换为UTC时间并添加Z后缀，完全符合Instant格式要求
  return dateObj.toISOString();
}

/**
 * @description 四则算术运算
 * */
export const calculate = {
  /**
   * 处理传入的参数，不管传入的是数组还是以逗号分隔的参数都处理为数组
   * @param args
   * @returns {*}
   */
  getParam(args) {
    return Array.prototype.concat.apply([], args);
  },

  /**
   * 获取每个数的乘数因子，根据小数位数计算
   * 1.首先判断是否有小数点，如果没有，则返回1；
   * 2.有小数点时，将小数位数的长度作为Math.pow()函数的参数进行计算
   * 例如2的乘数因子为1，2.01的乘数因子为100
   * @param x
   * @returns {number}
   */
  multiplier(x) {
    let parts = x.toString().split(".");
    return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
  },

  /**
   * 获取多个数据中最大的乘数因子
   * 例如1.3的乘数因子为10，2.13的乘数因子为100
   * 则1.3和2.13的最大乘数因子为100
   * @returns {*}
   */
  correctionFactor() {
    let args = Array.prototype.slice.call(arguments);
    let argArr = this.getParam(args);
    return argArr.reduce((accum, next) => {
      let num = this.multiplier(next);
      return Math.max(accum, num);
    }, 1);
  },

  /**
   * 加法运算
   * @param args*
   * @returns {number}
   */
  add(...args) {
    let calArr = this.getParam(args);
    // 获取参与运算值的最大乘数因子
    let corrFactor = this.correctionFactor(calArr);
    let sum = calArr.reduce((accum, curr) => {
      // 将浮点数乘以最大乘数因子，转换为整数参与运算
      return accum + Math.round(curr * corrFactor);
    }, 0);
    // 除以最大乘数因子
    return sum / corrFactor;
  },

  /**
   * 减法运算
   * @param args
   * @returns {number}
   */
  subtract(...args) {
    let calArr = this.getParam(args);
    let corrFactor = this.correctionFactor(calArr);
    let diﬀ = calArr.reduce((accum, curr, curIndex) => {
      // reduce()函数在未传入初始值时，curIndex从1开始，第一位参与运算的值需要
      // 乘以最大乘数因子
      if (curIndex === 1) {
        return Math.round(accum * corrFactor) - Math.round(curr * corrFactor);
      }
      // accum作为上一次运算的结果，就无须再乘以最大因子
      return Math.round(accum) - Math.round(curr * corrFactor);
    });
    // 除以最大乘数因子
    return diﬀ / corrFactor;
  },

  /**
   * 乘法运算
   * @param args
   * @returns {*}
   */
  multiply(...args) {
    let calArr = this.getParam(args);
    let corrFactor = this.correctionFactor(calArr);
    calArr = calArr.map((item) => {
      // 乘以最大乘数因子
      return item * corrFactor;
    });
    let multi = calArr.reduce((accum, curr) => {
      return Math.round(accum) * Math.round(curr);
    }, 1);
    // 除以最大乘数因子
    return multi / Math.pow(corrFactor, calArr.length);
  },

  /**
   * 除法运算
   * @param args
   * @returns {*}
   */
  divide(...args) {
    let calArr = this.getParam(args);
    let quotient = calArr.reduce((accum, curr) => {
      let corrFactor = this.correctionFactor(accum, curr);
      // 同时转换为整数参与运算
      return Math.round(accum * corrFactor) / Math.round(curr * corrFactor);
    });
    return quotient;
  },
};
