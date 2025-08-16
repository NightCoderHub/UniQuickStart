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
export function formattedTime(
  dateObj = new Date(),
  formatStr = "YYYY-MM-DD HH:mm",
) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 月份从0开始，所以要加1
  const date = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();

  const replacements = {
    YYYY: year,
    MM: String(month).padStart(2, "0"),
    DD: String(date).padStart(2, "0"),
    HH: String(hours).padStart(2, "0"),
    mm: String(minutes).padStart(2, "0"),
    ss: String(seconds).padStart(2, "0"),
  };

  let formattedString = formatStr;
  for (const key in replacements) {
    // 使用全局替换，确保所有匹配项都被替换
    formattedString = formattedString.replace(
      new RegExp(key, "g"),
      replacements[key],
    );
  }

  return formattedString;
}

/**
 * 导航方法，封装uni.navigateTo, uni.redirectTo, uni.reLaunch, uni.switchTab
 * @param {object} options 导航选项
 * @param {string} options.url 目标页面路径
 * @param {object} [options.params] 传递给目标页面的参数对象，会自动转换为查询字符串
 * @param {'navigateTo'|'redirectTo'|'reLaunch'|'switchTab'} [options.type='navigateTo'] 导航类型
 */
export function navigateTo(options) {
  const { url, params, type = "navigateTo" } = options;

  let targetUrl = url;
  if (params) {
    const queryString = Object.keys(params)
      .map((key) => {
        let value;
        if (typeof params[key] === "object" || Array.isArray(params[key])) {
          value = encodeURIComponent(JSON.stringify(params[key]));
        } else {
          value = encodeURIComponent(params[key]);
        }
        return `${encodeURIComponent(key)}=${value}`;
      })
      .join("&");
    targetUrl = `${url}?${queryString}`;
  }
  switch (type) {
    case "redirectTo":
      uni.redirectTo({ url: targetUrl });
      break;
    case "reLaunch":
      uni.reLaunch({ url: targetUrl });
      break;
    case "switchTab":
      uni.switchTab({ url: targetUrl });
      break;
    case "navigateTo":
    default:
      uni.navigateTo({ url: targetUrl });
      break;
  }
}

/**
 * @class PreciseMoney
 * @description 一个用于高精度金额计算的工具库
 */
class PreciseMoney {
  // 内部存储值，以最小单位（分）的整数形式
  #amount = 0;
  // 精度，即小数点后的位数，默认为2（元 -> 分）
  #precision = 2;
  // 精度因子，用于在元和分之间转换
  #factor = 100;

  /**
   * 构造函数
   * @param {number|string|PreciseMoney} initialValue - 初始金额
   * @param {object} [options] - 配置项
   * @param {number} [options.precision=2] - 精度，小数点后的位数
   */
  constructor(initialValue, options = {}) {
    this.#precision = options.precision ?? 2;
    this.#factor = Math.pow(10, this.#precision);

    if (initialValue instanceof PreciseMoney) {
      // 如果传入的是另一个 PreciseMoney 实例，直接拷贝其内部值
      // 注意：如果精度不同，需要进行转换，这里简化为假设精度一致
      if (this.#precision !== initialValue.#precision) {
        console.warn(
          "Creating PreciseMoney from another instance with different precision. This may lead to unexpected results.",
        );
      }
      this.#amount = initialValue.#amount;
      return;
    }

    this.#amount = this._parse(initialValue);
  }

  /**
   * @private
   * 将输入值解析为内部的整数表示（分）
   * @param {number|string} value - 要解析的金额
   * @returns {number}
   */
  _parse(value) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error("Invalid number provided. Must be a finite number.");
    }
    if (typeof value === "string") {
      value = value.trim();
      if (value === "") {
        return 0;
      }
      // 移除非法字符，除了数字、小数点和负号
      const cleanValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
      if (isNaN(cleanValue)) {
        throw new Error(`Invalid money string provided: "${value}"`);
      }
      value = cleanValue;
    }
    if (typeof value !== "number") {
      throw new Error(
        "Invalid input type. Must be a number, string, or PreciseMoney instance.",
      );
    }

    // 将浮点数乘以精度因子并四舍五入，避免浮点数乘法误差
    return Math.round(value * this.#factor);
  }

  /**
   * @private
   * 创建一个新的 PreciseMoney 实例（用于链式调用）
   * @param {number} amount - 内部整数值
   * @returns {PreciseMoney}
   */
  _newInstance(amount) {
    const newInstance = new PreciseMoney(0, { precision: this.#precision });
    newInstance.#amount = amount;
    return newInstance;
  }

  /**
   * 加法
   * @param {number|string|PreciseMoney} value - 要加上的金额
   * @returns {PreciseMoney} - 返回一个新的 PreciseMoney 实例
   */
  add(value) {
    const other = new PreciseMoney(value, { precision: this.#precision });
    return this._newInstance(this.#amount + other.#amount);
  }

  /**
   * 减法
   * @param {number|string|PreciseMoney} value - 要减去的金额
   * @returns {PreciseMoney} - 返回一个新的 PreciseMoney 实例
   */
  subtract(value) {
    const other = new PreciseMoney(value, { precision: this.#precision });
    return this._newInstance(this.#amount - other.#amount);
  }

  /**
   * 乘法
   * @param {number|string} factor - 乘数
   * @returns {PreciseMoney} - 返回一个新的 PreciseMoney 实例
   */
  multiply(factor) {
    if (typeof factor !== "number" && typeof factor !== "string") {
      throw new Error("Multiplier must be a number or a string.");
    }
    const multiplier = parseFloat(factor);
    if (isNaN(multiplier)) {
      throw new Error(`Invalid multiplier: "${factor}"`);
    }
    // (a * 100) * b = (a * b) * 100
    const newAmount = Math.round(this.#amount * multiplier);
    return this._newInstance(newAmount);
  }

  /**
   * 除法
   * @param {number|string} divisor - 除数
   * @returns {PreciseMoney} - 返回一个新的 PreciseMoney 实例
   */
  divide(divisor) {
    if (typeof divisor !== "number" && typeof divisor !== "string") {
      throw new Error("Divisor must be a number or a string.");
    }
    const divider = parseFloat(divisor);
    if (isNaN(divider) || divider === 0) {
      throw new Error(`Invalid divisor: "${divisor}". Cannot be zero.`);
    }
    // (a * 100) / b = (a / b) * 100
    const newAmount = Math.round(this.#amount / divider);
    return this._newInstance(newAmount);
  }

  /**
   * 分配/均分
   * 将当前金额均分为 N 份。处理无法整除的情况，将余数分配给第一份。
   * @param {number} n - 份数
   * @returns {PreciseMoney[]} - 返回一个包含 N 个 PreciseMoney 实例的数组
   */
  allocate(n) {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("Allocate count must be a positive integer.");
    }
    const base = Math.floor(this.#amount / n);
    const remainder = this.#amount % n;
    const result = [];
    for (let i = 0; i < n; i++) {
      let amount = base;
      if (i < remainder) {
        amount++; // 将余数逐一分配给前面的部分
      }
      result.push(this._newInstance(amount));
    }
    return result;
  }

  /**
   * 获取金额的数字形式（元）
   * @returns {number}
   */
  getValue() {
    return this.#amount / this.#factor;
  }

  /**
   * 获取格式化后的金额字符串
   * @param {object} [options] - 格式化选项
   * @param {boolean} [options.thousands=false] - 是否使用千分位分隔符
   * @param {string} [options.symbol=''] - 货币符号
   * @returns {string}
   */
  getFormatted(options = {}) {
    const { thousands = false, symbol = "" } = options;
    const value = this.getValue().toFixed(this.#precision);

    let [integerPart, decimalPart] = value.split(".");

    if (thousands) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return `${symbol}${integerPart}.${decimalPart}`;
  }

  /**
   * 比较两个金额
   * @param {number|string|PreciseMoney} otherValue
   * @returns {-1 | 0 | 1} - -1: 小于, 0: 等于, 1: 大于
   */
  compare(otherValue) {
    const other = new PreciseMoney(otherValue, { precision: this.#precision });
    if (this.#amount < other.#amount) return -1;
    if (this.#amount > other.#amount) return 1;
    return 0;
  }

  isGreaterThan(otherValue) {
    return this.compare(otherValue) > 0;
  }

  isLessThan(otherValue) {
    return this.compare(otherValue) < 0;
  }

  isEqualTo(otherValue) {
    return this.compare(otherValue) === 0;
  }
}

// 工厂函数，方便使用，无需 new
export function PreciseMoneyFactory(initialValue, options) {
  return new PreciseMoney(initialValue, options);
}
