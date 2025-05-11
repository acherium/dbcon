// methods - 기능성 함수들 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 변수
export const alphanumeric = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// 함수
/**
 * 최댓값과 최솟값을 포함하는 범위 안에서 무작위의 정수를 생성합니다.
 * @param {number} max 최댓값.
 * @param {number} [min] 최솟값. 지정하지 않을 시 0으로 합니다.
 * @returns {number} 생성된 무작위 정수.
 */
export const random = (max, min = 0) => {
  if (min > max) return null;
  const diff = Math.abs(max - min);
  return Math.floor(Math.random() * ( diff + 1 )) + min;
};

/**
 * 제공된 배열에서 무작위의 항목을 선택하여 반환합니다.
 * @param {array<*>} [array] 대상 배열.
 * @returns {*} 선택된 항목.
 */
export const ransel = (array = []) => array[random(array.length - 1)];

/**
 * 무작위 문자열을 출력합니다.
 * @param {number} [length] 문자열 길이. 기본값은 10입니다.
 * @param {*} [sheet] 기준 시트(배열). 배열이 아닌 경우 문자열로 변환 후 새로운 배열로 만듭니다.
 * @returns {string} 생성된 문자열.
 */
export const ranchar = (length = 10, sheet = alphanumeric) => {
  if (sheet.constructor !== Array) sheet = `${sheet}`.trim().replace(/\s/g, "").split("");
  let result = "";
  for (let i = 0; i < length; i++) result += `${ransel(sheet)}`;
  return result;
};

/**
 * 주어진 RGBA 값을 HEX 문자열로 변환합니다.
 * @param {number} r R 값.
 * @param {number} g G 값.
 * @param {number} b B 값.
 * @param {number} a 투명도 값.
 * @returns {string} 변환된 HEX 값.
 */
export const RGBAtoHEX = (r, g, b, a = 100) => {
  r = r.toString(16).toUpperCase();
  g = g.toString(16).toUpperCase();
  b = b.toString(16).toUpperCase();
  a = Math.floor(a / 100 * 255).toString(16).toUpperCase();

  r = r.padStart(2, "0");
  g = g.padStart(2, "0");
  b = b.padStart(2, "0");
  a = a.padStart(2, "0");

  return `${r}${g}${b}${a}`;
};

/**
 * RGBA 개체.
 * @typedef {object} RGBAObject
 * @param {number} r R 값.
 * @param {number} g G 값.
 * @param {number} b B 값.
 * @param {number} a 투명도 값.
 */
/**
 * 주어진 HEX 문자열을 RGBA 값으로 변환합니다.
 * @param {string} hex HEX 값.
 * @returns {RGBAObject} 변환된 RGBA값.
 */
export const HEXtoRGBA = (hex) => {
  return {
    r: Number(`0x${hex.substring(0, 2)}`),
    g: Number(`0x${hex.substring(2, 4)}`),
    b: Number(`0x${hex.substring(4, 6)}`),
    a: Number(`0x${hex.substring(6, 8)}`) / 255 * 100
  };
};

/**
 * HSL 개체.
 * @typedef {object} HSLObject
 * @param {number} h H 값.
 * @param {number} s S 값.
 * @param {number} l L 값.
 */
/**
 * 주어진 RGB 값을 HSL 값으로 변환합니다.
 * @param {number} r R 값.
 * @param {number} g G 값.
 * @param {number} b B 값.
 * @returns {HSLObject} 변환된 HSL 값.
 */
export const RGBtoHSL = (r, g, b) => {
  const result = {
    h: 0,
    s: 0,
    l: 0
  };

  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;

  if (chroma > 0) {
    if (max === r) {
      const segment = (g - b) / chroma;
      const shift = (segment < 0 ? 360 : 0) / 60;
      result.h = segment + shift;
    } else if (max === g) {
      const segment = (b - r) / chroma;
      const shift = 120 / 60;
      result.h = segment + shift;
    } else if (max === b) {
      const segment = (r - g) / chroma;
      const shift = 240 / 60;
      result.h = segment + shift;
    };
  };
  result.h *= 60;

  result.l = (max + min) / 2;
  result.s = chroma === 0 ? 0 : chroma / (1 - Math.abs(result.l * 2 - 1));

  result.l *= 100;
  result.s *= 100;

  return result;
};

/**
 * RGB 개체.
 * @typedef {object} RGBObject
 * @param {number} r R 값.
 * @param {number} g G 값.
 * @param {number} b B 값.
 */
/**
 * 주어진 HSL 값을 RGB 값으로 변환합니다.
 * @param {number} h H 값.
 * @param {number} s S 값.
 * @param {number} l L 값.
 * @returns {RGBObject} 변환된 RGB 값.
 */
export const HSLtoRGB = (h, s, l) => {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const k = (n) => (n + h / 30) % 12;
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const result = {
    r: 255 * f(0),
    g: 255 * f(8),
    b: 255 * f(4)
  };

  return result;
};